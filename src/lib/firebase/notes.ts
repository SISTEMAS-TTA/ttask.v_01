import { db } from "./config";
import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  limit as fsLimit,
  writeBatch,
} from "firebase/firestore";
import type { QueryDocumentSnapshot } from "firebase/firestore";

import { Note } from "@/modules/types";

const NOTES_COLLECTION = "notes";

export type NewNoteInput = Omit<Note, "id" | "userId" | "createdAt">;

export const subscribeToUserNotes = (
  userId: string,
  onNotes: (notes: Note[]) => void,
  onError?: (error: unknown) => void
) => {
  const notesRef = collection(db, NOTES_COLLECTION);
  const notesQuery = query(
    notesRef,
    where("userId", "==", userId)
    // Removemos orderBy para evitar la necesidad de índice compuesto
  );

  return onSnapshot(
    notesQuery,
    (snapshot) => {
      const notes = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        const favoritesMap: Record<string, boolean> | undefined =
          (data.favorites as Record<string, boolean> | undefined) ?? undefined;

        const note: Note = {
          id: docSnap.id,
          userId: (data.userId as string) ?? userId,
          title: (data.title as string) ?? "",
          content: (data.content as string) ?? "",
          color: (data.color as string) ?? "bg-yellow-200",
          completed: Boolean(data.completed),
          // favorite individual: primero revisamos favorites[userId], si no existe usamos el campo legacy `favorite`
          favorite: Boolean(favoritesMap?.[userId]) || Boolean(data.favorite),
          favorites: favoritesMap,
          project: (data.project as string) ?? "General",
          order: typeof data.order === "number" ? (data.order as number) : undefined,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt
              : Timestamp.now(),
        } as Note;
        return note;
      });

      // Ordenar por `order` si está definido (drag & drop),
      // si no, mantener comportamiento previo: favoritas primero y luego por fecha desc
      const sortedNotes = notes.sort((a: Note, b: Note) => {
        const ao = typeof a.order === "number";
        const bo = typeof b.order === "number";
        if (ao && bo && a.order !== b.order) return (a.order as number) - (b.order as number);
        if (ao && !bo) return -1; // los que tienen order van primero
        if (!ao && bo) return 1;
        if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });

      onNotes(sortedNotes);
    },
    (error) => {
      console.error("Error al suscribirse a las notas", error);
      onError?.(error);
    }
  );
};

// Server-side paginated subscription: solo escucha una página (limit) de notas ordenadas por createdAt desc

// Lectura puntual de una página (getDocs) — útil si prefieres no realtime
export const getNotesPage = async (
  userId: string,
  pageSize: number,
  startAfterDoc: QueryDocumentSnapshot | null
) => {
  const notesRef = collection(db, NOTES_COLLECTION);
  let notesQuery;
  if (startAfterDoc) {
    notesQuery = query(
      notesRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      startAfter(startAfterDoc),
      fsLimit(pageSize)
    );
  } else {
    notesQuery = query(
      notesRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      fsLimit(pageSize)
    );
  }
  const snap = await getDocs(notesQuery);
  const notes = snap.docs.map((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>;
    const favoritesMap: Record<string, boolean> | undefined =
      (data.favorites as Record<string, boolean> | undefined) ?? undefined;
    const note: Note = {
      id: docSnap.id,
      userId: (data.userId as string) ?? userId,
      title: (data.title as string) ?? "",
      content: (data.content as string) ?? "",
      color: (data.color as string) ?? "bg-yellow-200",
      completed: Boolean(data.completed),
      favorite: Boolean(favoritesMap?.[userId]) || Boolean(data.favorite),
      favorites: favoritesMap,
      project: (data.project as string) ?? "General",
      createdAt:
        data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
    } as Note;
    return note;
  });
  const lastDoc = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;
  // ordenar localmente para tener favoritas arriba dentro de la página
  const sorted = notes.sort((a, b) => {
    if (a.favorite === b.favorite)
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    return a.favorite ? -1 : 1;
  });
  return { notes: sorted, lastDoc };
};

export async function updateNoteFavorite(
  noteId: string,
  userId: string,
  value: boolean
) {
  const noteRef = doc(db, NOTES_COLLECTION, noteId);
  await updateDoc(noteRef, {
    [`favorites.${userId}`]: value,
  });
}

export async function deleteNote(noteId: string) {
  const noteRef = doc(db, NOTES_COLLECTION, noteId);
  await deleteDoc(noteRef);
}

export const createNote = async (userId: string, note: NewNoteInput) => {
  const notesRef = collection(db, NOTES_COLLECTION);
  // Excluir `color` antes de persistir en la base de datos
  const noteWithoutColor = Object.fromEntries(
    Object.entries(note).filter(([k]) => k !== "color")
  ) as Omit<NewNoteInput, "color">;

  await addDoc(notesRef, {
    ...noteWithoutColor,
    userId,
    // Por defecto colocamos la nota arriba: números menores aparecen primero
    order: -Date.now(),
    createdAt: Timestamp.now(),
  });
};

export const updateNote = async (
  noteId: string,
  updates: Partial<Omit<Note, "id" | "userId" | "createdAt">>
) => {
  const noteRef = doc(db, NOTES_COLLECTION, noteId);
  // Sanitizar actualizaciones para no guardar el campo `color`
  const sanitizedUpdates = Object.fromEntries(
    Object.entries(updates || {}).filter(([k]) => k !== "color")
  ) as Partial<Omit<Note, "id" | "userId" | "createdAt">>;

  // Si no hay cambios restantes (por ejemplo solo se pidió cambiar color), no hacemos la llamada a la DB
  if (Object.keys(sanitizedUpdates).length === 0) return;

  await updateDoc(noteRef, sanitizedUpdates);
};

// Reordenar un subconjunto de notas (batch): aplica order = índice basado en el array recibido
export async function updateNotesOrder(noteIdsInDesiredOrder: string[]) {
  if (!noteIdsInDesiredOrder?.length) return;
  const batch = writeBatch(db);
  noteIdsInDesiredOrder.forEach((id, index) => {
    const ref = doc(db, NOTES_COLLECTION, id);
    batch.update(ref, { order: index });
  });
  await batch.commit();
}

// Inicializa `order` para una lista de notas con espacios (step) para reducir reordenamientos masivos
export async function initializeNotesOrder(
  noteIdsInOrder: string[],
  step = 1024,
) {
  if (!noteIdsInOrder?.length) return;
  const batch = writeBatch(db);
  noteIdsInOrder.forEach((id, index) => {
    const ref = doc(db, NOTES_COLLECTION, id);
    const order = (index + 1) * step;
    batch.update(ref, { order });
  });
  await batch.commit();
}

// Actualiza el `order` de una sola nota
export async function updateNoteOrder(noteId: string, order: number) {
  const ref = doc(db, NOTES_COLLECTION, noteId);
  await updateDoc(ref, { order });
}
