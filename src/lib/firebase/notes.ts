import { db } from "./config";
import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

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
      const sortedNotes = notes.sort((a, b) => {
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
