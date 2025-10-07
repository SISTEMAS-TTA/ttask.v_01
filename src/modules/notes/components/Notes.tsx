"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddNoteModal } from "@/modules/notes/components/AddNoteModal";
import useUser from "@/modules/auth/hooks/useUser";
import type { Note } from "@/modules/types";
import {
  createNote,
  NewNoteInput,
  subscribeToUserNotes,
  updateNote,
} from "@/lib/firebase/notes";

export function NotesColumn() {
  const { user, loading: userLoading } = useUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [filterCompleted] = useState(false);
  const [filterFavorites] = useState(false);

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
    try {
      await updateNote(note.id, { completed: !note.completed });
    } catch (error) {
      console.error("Error al actualizar la nota", error);
    }
  };

  const toggleFavorite = async (note: Note) => {
    try {
      await updateNote(note.id, { favorite: !note.favorite });
    } catch (error) {
      console.error("Error al actualizar la nota", error);
    }
  };
  // Memoizar la separación de notas activas y completadas
  const { activeNotes, completedNotes } = useMemo(() => {
    const active = filteredNotes.filter((note) => !note.completed);
    const completed = filteredNotes.filter((note) => note.completed);
    return { activeNotes: active, completedNotes: completed };
  }, [filteredNotes]);

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
                className={`p-3 ${note.color} border-none shadow-sm`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-800">
                    {note.title}
                  </h3>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void toggleComplete(note)}
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
                      onClick={() => void toggleFavorite(note)}
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
                className={`p-3 ${note.color} border-none shadow-sm opacity-60`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-800 line-through">
                    {note.title}
                  </h3>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void toggleComplete(note)}
                      className="h-8 w-8 p-0 hover:bg-black/10"
                    >
                      <Check className="h-5 w-5 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void toggleFavorite(note)}
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
    </div>
  );
}
