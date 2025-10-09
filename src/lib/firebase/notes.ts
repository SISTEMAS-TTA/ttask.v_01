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
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt
              : Timestamp.now(),
        } as Note;
        return note;
      });

      // Ordenamos: primero las favoritas del usuario, luego por createdAt desc
      const sortedNotes = notes.sort((a: Note, b: Note) => {
        if (a.favorite === b.favorite) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return a.favorite ? -1 : 1;
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
export const subscribeToUserNotesPage = (
  userId: string,
  pageSize: number,
  startAfterDoc: QueryDocumentSnapshot | null,
  onNotesPage: (notes: Note[], lastDoc: QueryDocumentSnapshot | null) => void,
  onError?: (error: unknown) => void
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

  return onSnapshot(
    notesQuery,
    (snapshot) => {
      const notes = snapshot.docs.map((docSnap: QueryDocumentSnapshot) => {
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
            data.createdAt instanceof Timestamp
              ? data.createdAt
              : Timestamp.now(),
        } as Note;
        return note;
      });

      const lastDoc = snapshot.docs.length
        ? snapshot.docs[snapshot.docs.length - 1]
        : null;
      // ordenar localmente para tener favoritas arriba dentro de la página
      const sorted = notes.sort((a: Note, b: Note) => {
        if (a.favorite === b.favorite)
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        return a.favorite ? -1 : 1;
      });
      onNotesPage(sorted, lastDoc);
    },
    (error) => {
      console.error("Error al suscribirse a la página de notas", error);
      onError?.(error);
    }
  );
};

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
