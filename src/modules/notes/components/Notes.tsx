"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Plus, Star } from "lucide-react";
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

export function NotesColumn() {
  const { user, loading: userLoading } = useUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [filterCompleted] = useState(false);
  const [filterFavorites] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
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
      await createNote(user.uid, newNote);
    } catch (error) {
      console.error("Error al crear la nota", error);
    }
  };

  const toggleComplete = async (note: Note) => {
    // Optimista: actualizar estado local y reequilibrar páginas
    const toggled = { ...note, completed: !note.completed };
    setNotes((prev) => prev.map((n) => (n.id === note.id ? toggled : n)));

    // Actualizar completedOrder localmente
    setCompletedOrder((prev) => {
      const exists = prev.includes(note.id);
      if (!toggled.completed) {
        // se desmarca: quitar del orden de completadas
        return prev.filter((id) => id !== note.id);
      }
      // se marca como completa: poner al final del arreglo (LIFO en sentido de que las últimas completadas se colocan en el tope de las completadas dentro de la pagina inferior)
      if (exists) return prev; // ya estaba
      return [...prev, note.id];
    });

    // Rebalanceo simple: si la página quedó con demasiadas completadas, tirar la primera completada de la página actual a la siguiente página
    setDisplayOrder((prev) => {
      const newOrder = prev.slice();
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const pageSlice = newOrder.slice(start, end);
      // Si toda la página está completa y hay notas no completadas en páginas siguientes, rotar
      const activeInPage = pageSlice.filter((id) => {
        const n =
          notes.find((x) => x.id === id) ||
          sortedNotes.find((x) => x.id === id);
        return n && !n.completed;
      });
      if (activeInPage.length === 0) {
        // buscar una nota no completada más adelante
        const laterIndex = newOrder.findIndex(
          (id, idx) =>
            idx >= end &&
            (() => {
              const n =
                notes.find((x) => x.id === id) ||
                sortedNotes.find((x) => x.id === id);
              return n && !n.completed;
            })()
        );
        if (laterIndex !== -1) {
          // mover esa nota al final de la página actual (preservando orden dentro de la pagina siguiente)
          const [moved] = newOrder.splice(laterIndex, 1);
          newOrder.splice(end, 0, moved); // insert right after current page
        }
      }
      return newOrder;
    });

    try {
      await updateNote(note.id, { completed: !note.completed });
    } catch (error) {
      console.error("Error al actualizar la nota", error);
      // la suscripción onSnapshot corregirá el estado
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
    // optimista: aplicar cambios en cliente
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
    try {
      await updateNote(id, updates);
    } catch (err) {
      console.error("Error al guardar edición de la nota", err);
      // la suscripción corregirá el estado en breve
    }
    setEditingNote(null);
  };
  // Memoizar la separación de notas activas y completadas
  // Ordenar por fecha (más recientes primero)
  const sortedNotes = useMemo(() => {
    return filteredNotes.slice().sort((a, b) => {
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

  // Calcular tamaño de página adaptativo según tamaño medio de las notas
  const pageSize = useMemo(() => {
    if (!sortedNotes.length) return 4;
    const avg =
      sortedNotes.reduce((s, n) => s + (n.content ? n.content.length : 0), 0) /
      sortedNotes.length;
    return avg > 300 ? 3 : 4;
  }, [sortedNotes]);

  const [page, setPage] = useState(1);

  // Estados para controlar orden de completadas y display
  const [completedOrder, setCompletedOrder] = useState<string[]>([]);
  const [displayOrder, setDisplayOrder] = useState<string[]>([]);

  // Reconstruir displayOrder a partir de sortedNotes y completedOrder
  const rebuildDisplayOrder = (notesList: Note[], compOrder: string[]) => {
    const idSet = new Set(notesList.map((n) => n.id));
    const active = notesList.filter((n) => !n.completed).map((n) => n.id);
    const completedInOrder = compOrder.filter(
      (id) => idSet.has(id) && notesList.find((n) => n.id === id)?.completed
    );
    const remainingCompleted = notesList
      .filter((n) => n.completed && !completedInOrder.includes(n.id))
      .map((n) => n.id);
    return [...active, ...completedInOrder, ...remainingCompleted];
  };

  // Inicializar y sincronizar displayOrder cuando cambian las notas
  useEffect(() => {
    // Filtrar completedOrder para ids existentes y completados
    const existingIds = new Set(sortedNotes.map((n) => n.id));
    const filteredComp = completedOrder.filter(
      (id) =>
        existingIds.has(id) && sortedNotes.find((n) => n.id === id)?.completed
    );
    // agregar completados no presentes en filteredComp
    const extra = sortedNotes
      .filter((n) => n.completed && !filteredComp.includes(n.id))
      .map((n) => n.id);
    const newCompOrder = [...filteredComp, ...extra];
    setCompletedOrder(newCompOrder);
    const newDisplay = rebuildDisplayOrder(sortedNotes, newCompOrder);
    setDisplayOrder(newDisplay);
    // ajustar página si es necesario
    const totalPages = Math.max(1, Math.ceil(newDisplay.length / pageSize));
    setPage((p) => Math.min(p, totalPages));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedNotes]);

  const totalPages = Math.max(1, Math.ceil(displayOrder.length / pageSize));

  // Obtener notas visibles en la página actual con el orden de displayOrder
  const paginatedNotes = useMemo(() => {
    const start = (page - 1) * pageSize;
    const ids = displayOrder.slice(start, start + pageSize);
    return ids
      .map((id) => sortedNotes.find((n) => n.id === id)!)
      .filter(Boolean);
  }, [displayOrder, page, pageSize, sortedNotes]);

  const { activeNotes, completedNotes } = useMemo(() => {
    const active = paginatedNotes.filter((note) => !note.completed);
    const completed = paginatedNotes.filter((note) => note.completed);
    return { activeNotes: active, completedNotes: completed };
  }, [paginatedNotes]);

  return (
    <div className="w-full bg-yellow-100 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-yellow-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Notas</h2>
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

      {/* Pagination controls */}
      {sortedNotes.length > pageSize && (
        <div className="p-3 border-t border-yellow-200 flex items-center justify-center space-x-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <div className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notesLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-yellow-600" />
          </div>
        ) : (
          <>
            {/* Active Notes */}
            {activeNotes.map((note) => (
              <Card
                key={note.id}
                className={`p-3 ${note.color} border-none shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400`}
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
                  <h3 className="font-semibold text-sm text-gray-800">
                    {note.title}
                  </h3>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        void toggleComplete(note);
                      }}
                      className="h-8 w-8 p-0 hover:bg-black/10"
                    >
                      <Check
                        className={`h-5 w-5 ${
                          note.completed ? "text-green-600" : "text-gray-400"
                        }`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        void toggleFavorite(note);
                      }}
                      className="h-8 w-8 p-0 hover:bg-black/10"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          note.favorite
                            ? "text-yellow-600 fill-current"
                            : "text-gray-400"
                        }`}
                      />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{note.content}</p>
              </Card>
            ))}

            {/* Completed Notes */}
            {completedNotes.map((note) => (
              <Card
                key={note.id}
                className={`p-3 ${note.color} border-none shadow-sm opacity-60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400`}
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
                  <h3 className="font-semibold text-sm text-gray-800 line-through">
                    {note.title}
                  </h3>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        void toggleComplete(note);
                      }}
                      className="h-8 w-8 p-0 hover:bg-black/10"
                    >
                      <Check className="h-5 w-5 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        void toggleFavorite(note);
                      }}
                      className="h-8 w-8 p-0 hover:bg-black/10"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          note.favorite
                            ? "text-yellow-600 fill-current"
                            : "text-gray-400"
                        }`}
                      />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{note.content}</p>
              </Card>
            ))}

            {!activeNotes.length && !completedNotes.length && (
              <p className="text-xs text-gray-500 text-center">
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
      />
    </div>
  );
}
