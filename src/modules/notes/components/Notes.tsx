"use client";

import { useEffect, useMemo, useState } from "react";
import { Circle, CircleCheck, Loader2, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddNoteModal } from "@/modules/notes/components/AddNoteModal";
import { EditNoteModal } from "@/modules/notes/components/EditNoteModal";
import useUser from "@/modules/auth/hooks/useUser";
import type { Note } from "@/modules/types";
import {
  createNote,
  NewNoteInput,
  subscribeToUserNotes,
  updateNote,
  updateNoteFavorite,
} from "@/lib/firebase/notes";
import { initializeNotesOrder, updateNoteOrder } from "@/lib/firebase/notes";

// LÓGICA DE PERSISTENCIA DE COLOR EN SESSION STORAGE (PARA EDICIÓN)
// -----------------------------------------------------------------
const SESSION_KEY = "ttask-note-colors";
export const NOTE_COLOR_CLASSES = [
  "bg-yellow-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-red-200",
  "bg-purple-200",
  "bg-pink-200",
  "bg-orange-200",
  "bg-gray-200",
];

function loadNoteColors(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Error reading sessionStorage", e);
    return {};
  }
}

function saveNoteColor(noteId: string, colorClassName: string): void {
  if (typeof window === "undefined") return;
  try {
    const colors = loadNoteColors();
    colors[noteId] = colorClassName;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(colors));
  } catch (e) {
    console.error("Error writing to sessionStorage", e);
  }
}
// -----------------------------------------------------------------

export function NotesColumn() {
  const { user, loading: userLoading } = useUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [filterCompleted] = useState(false);
  const [filterFavorites] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [localNoteColors, setLocalNoteColors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    // [CAMBIO MANTENIDO]: Cargar colores persistidos en sessionStorage al inicio.
    setLocalNoteColors(loadNoteColors());

    if (userLoading) {
      return;
    }

    if (!user) {
      setNotes([]);
      setNotesLoading(false);
      return;
    }

    setNotesLoading(true);
    const unsubscribe = subscribeToUserNotes(
      user.uid,
      (userNotes) => {
        setNotes(userNotes);
        setNotesLoading(false);
      },
      () => {
        setNotes([]);
        setNotesLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, userLoading]);

  // Memoizar las notas filtradas
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (filterCompleted && !note.completed) return false;
      if (filterFavorites && !note.favorite) return false;
      return true;
    });
  }, [notes, filterCompleted, filterFavorites]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddNote = async (newNote: NewNoteInput) => {
    if (!user) return;

    try {
      // [CORRECCIÓN IMPLICADA]: Si createNote ahora guarda el campo 'color' en Firebase,
      // la nota se creará con el color correcto (no el amarillo por defecto).
      await createNote(user.uid, newNote);
    } catch (error) {
      console.error("Error al crear la nota", error);
    }
  };

  const toggleComplete = async (note: Note) => {
    try {
      await updateNote(note.id, { completed: !note.completed });
    } catch (error) {
      console.error("Error al actualizar la nota", error);
    }
  };

  const toggleFavorite = async (note: Note) => {
    try {
      if (!user) return;
      await updateNoteFavorite(note.id, user.uid, !note.favorite);
    } catch (error) {
      console.error("Error al actualizar la nota", error);
    }
  };

  const handleSaveEdit = async (
    id: string,
    updates: Partial<Omit<Note, "id" | "userId" | "createdAt">>
  ) => {
    try {
      // Importante: updateNote en firebase NO guarda el campo 'color'.
      // Solo guarda título/contenido, etc. El color se maneja localmente.
      await updateNote(id, updates);
    } catch (err) {
      console.error("Error al guardar edición de la nota", err);
    }
    setEditingNote(null);
  };

  const handleColorChange = (noteId: string, newColor: string) => {
    // [LÓGICA CENTRAL]: Al cambiar el color en el modal de edición,
    // solo se actualiza el sessionStorage y el estado local. NO SE TOCA FIREBASE.
    saveNoteColor(noteId, newColor);
    setLocalNoteColors((prev) => ({
      ...prev,
      [noteId]: newColor,
    }));
  };

  // Respetar orden manual (order) si existe; si no, favoritas primero y luego fecha desc
  const sortedNotes = useMemo(() => {
    return filteredNotes.slice().sort((a, b) => {
      const ao = typeof a.order === "number";
      const bo = typeof b.order === "number";
      if (ao && bo && a.order !== b.order)
        return (a.order as number) - (b.order as number);
      if (ao && !bo) return -1;
      if (!ao && bo) return 1;
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      const at =
        a.createdAt instanceof Date
          ? a.createdAt.getTime()
          : a.createdAt.toDate().getTime();
      const bt =
        b.createdAt instanceof Date
          ? b.createdAt.getTime()
          : b.createdAt.toDate().getTime();
      return bt - at;
    });
  }, [filteredNotes]);

  // Separar notas activas y completadas
  const { activeNotes, completedNotes } = useMemo(() => {
    const active = sortedNotes.filter((note) => !note.completed);
    const completed = sortedNotes.filter((note) => note.completed);
    return { activeNotes: active, completedNotes: completed };
  }, [sortedNotes]);

  // Drag & Drop state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingListType, setDraggingListType] = useState<
    "active" | "completed" | null
  >(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);

  const onDragStart = (id: string) => setDraggingId(id);
  const onDragEnd = () => {
    setDraggingId(null);
    setDraggingListType(null);
    setIsTouchDragging(false);
  };

  const handleReorder = async (
    listType: "active" | "completed",
    overId: string | null
  ) => {
    if (!draggingId || !overId) return;
    const sourceList = listType === "active" ? activeNotes : completedNotes;
    const ids = sourceList.map((n) => n.id);
    const fromIndex = ids.indexOf(draggingId);
    const toIndex = ids.indexOf(overId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    // Determinar orders base: si falta alguno, inicializar con huecos
    const hasMissingOrder = sourceList.some((n) => typeof n.order !== "number");

    try {
      if (hasMissingOrder) {
        await initializeNotesOrder(ids);
      }

      // Construir un mapa de order actual (usando valores existentes o el plan de inicialización)
      const step = 1024;
      const baseOrderById = new Map<string, number>();
      sourceList.forEach((n, i) => {
        const val =
          typeof n.order === "number" ? (n.order as number) : (i + 1) * step;
        baseOrderById.set(n.id, val);
      });

      // Reordenar localmente ids
      const newIds = ids.slice();
      const [moved] = newIds.splice(fromIndex, 1);
      newIds.splice(toIndex, 0, moved);

      // Calcular nuevo order para la nota movida usando vecinos
      const prevId = newIds[toIndex - 1] ?? null;
      const nextId = newIds[toIndex + 1] ?? null;
      const prevOrder = prevId ? baseOrderById.get(prevId) ?? null : null;
      const nextOrder = nextId ? baseOrderById.get(nextId) ?? null : null;

      let newOrder: number;
      if (prevOrder != null && nextOrder != null) {
        // Si no hay espacio entre vecinos, re-normalizar la lista con huecos
        if (Math.floor(nextOrder) - Math.floor(prevOrder) <= 1) {
          await initializeNotesOrder(newIds);
          return;
        }
        newOrder = Math.floor((prevOrder + nextOrder) / 2);
      } else if (prevOrder == null && nextOrder != null) {
        // Insertar al inicio: crear espacio antes del primero
        newOrder = Math.floor(nextOrder / 2);
        if (newOrder === nextOrder) {
          await initializeNotesOrder(newIds);
          return;
        }
      } else if (prevOrder != null && nextOrder == null) {
        // Insertar al final: empujar más allá del último
        newOrder = Math.floor(prevOrder + step);
      } else {
        // Lista de un solo elemento
        newOrder = step;
      }

      await updateNoteOrder(draggingId, newOrder);
    } catch (e) {
      console.error("Error al reordenar notas", e);
    }
  };

  return (
    <div className="w-full bg-yellow-100 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-yellow-200 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          Notas
        </h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsModalOpen(true)}
          className="h-8 w-8 p-0 hover:bg-yellow-200"
          disabled={userLoading || !user}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
        {notesLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-yellow-600" />
          </div>
        ) : (
          <>
            {/* Active Notes */}
            {activeNotes.map((note) => {
              // [CORRECCIÓN CLAVE]: Usa el color de sessionStorage si existe, si no, usa el color de Firebase (que es el color guardado en la creación).
              const currentNoteColor = localNoteColors[note.id] || note.color;
              return (
                <Card
                  key={note.id}
                  data-note-id={note.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    onDragStart(note.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    void handleReorder("active", note.id);
                    onDragEnd();
                  }}
                  onTouchStart={() => {
                    setDraggingId(note.id);
                    setDraggingListType("active");
                    setIsTouchDragging(true);
                  }}
                  onTouchMove={(e) => {
                    // Evitar scroll mientras se arrastra con touch
                    if (isTouchDragging) {
                      e.preventDefault();
                    }
                  }}
                  onTouchEnd={(e) => {
                    const t = e.changedTouches?.[0];
                    if (t && draggingId && draggingListType === "active") {
                      const el = document.elementFromPoint(
                        t.clientX,
                        t.clientY
                      ) as HTMLElement | null;
                      let cursor: HTMLElement | null = el;
                      let overId: string | null = null;
                      while (cursor) {
                        const id = cursor.getAttribute?.("data-note-id");
                        if (id) {
                          overId = id;
                          break;
                        }
                        cursor = cursor.parentElement;
                      }
                      if (overId) void handleReorder("active", overId);
                    }
                    onDragEnd();
                  }}
                  className={`p-3 ${currentNoteColor} border-none shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                  onClick={() => setEditingNote(note)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setEditingNote(note);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-800">
                      {note.title}
                    </h3>
                    <div className="flex space-x-1">
                      <Star
                        className={`h-5 w-5 ${
                          note.favorite
                            ? "text-yellow-600 fill-current"
                            : "text-gray-400"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          void toggleFavorite(note);
                        }}
                        style={{ cursor: "pointer" }}
                      />
                      {note.completed ? (
                        <CircleCheck
                          className="h-5 w-5 text-green-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            void toggleComplete(note);
                          }}
                          style={{ cursor: "pointer" }}
                        />
                      ) : (
                        <Circle
                          className="h-5 w-5 text-gray-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            void toggleComplete(note);
                          }}
                          style={{ cursor: "pointer" }}
                        />
                      )}
                    </div>
                  </div>
                  {note.content && (
                    <p className="text-sm text-gray-600">{note.content}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Creada:{" "}
                    {note.createdAt.toDate().toLocaleString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Card>
              );
            })}
            {/* Completed Notes */}
            {completedNotes.map((note) => {
              // [CORRECCIÓN CLAVE]: Usa el color de sessionStorage si existe, si no, usa el color de Firebase.
              const currentNoteColor = localNoteColors[note.id] || note.color;
              return (
                <Card
                  key={note.id}
                  data-note-id={note.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    onDragStart(note.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    void handleReorder("completed", note.id);
                    onDragEnd();
                  }}
                  onTouchStart={() => {
                    setDraggingId(note.id);
                    setDraggingListType("completed");
                    setIsTouchDragging(true);
                  }}
                  onTouchMove={(e) => {
                    if (isTouchDragging) {
                      e.preventDefault();
                    }
                  }}
                  onTouchEnd={(e) => {
                    const t = e.changedTouches?.[0];
                    if (t && draggingId && draggingListType === "completed") {
                      const el = document.elementFromPoint(
                        t.clientX,
                        t.clientY
                      ) as HTMLElement | null;
                      let cursor: HTMLElement | null = el;
                      let overId: string | null = null;
                      while (cursor) {
                        const id = cursor.getAttribute?.("data-note-id");
                        if (id) {
                          overId = id;
                          break;
                        }
                        cursor = cursor.parentElement;
                      }
                      if (overId) void handleReorder("completed", overId);
                    }
                    onDragEnd();
                  }}
                  className={`p-3 ${currentNoteColor} border-none shadow-sm opacity-60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                  onClick={() => setEditingNote(note)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setEditingNote(note);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-800 line-through">
                      {note.title}
                    </h3>
                    <div className="flex space-x-1">
                      <Star
                        className={`h-5 w-5 ${
                          note.favorite
                            ? "text-yellow-600 fill-current"
                            : "text-gray-400"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          void toggleFavorite(note);
                        }}
                        style={{ cursor: "pointer" }}
                      />
                      <CircleCheck
                        className="h-5 w-5 text-green-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          void toggleComplete(note);
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  </div>
                  {note.content && (
                    <p className="text-sm text-gray-600">{note.content}</p>
                  )}
                </Card>
              );
            })}

            {!activeNotes.length && !completedNotes.length && (
              <p className="text-sm text-gray-500 text-center">
                Aún no tienes notas guardadas.
              </p>
            )}
          </>
        )}
      </div>

      <AddNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddNote={handleAddNote}
      />
      <EditNoteModal
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        note={editingNote}
        onSave={handleSaveEdit}
        // [CORRECCIÓN SINTÁCTICA]: Se mantiene para permitir la actualización de sessionStorage.
        onColorChange={handleColorChange}
        currentNoteColor={
          // [CORRECCIÓN CLAVE]: Pasa el color actual (sessionStorage > Firebase) al modal
          // para que el selector sepa qué color está "seleccionado".
          editingNote
            ? localNoteColors[editingNote.id] || editingNote.color
            : "bg-yellow-200"
        }
      />
    </div>
  );
}
