"use client";

import { useState, useMemo } from "react";
import { Plus, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddNoteModal } from "@/modules/notes/components/AddNoteModal";

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  completed: boolean;
  favorite: boolean;
  project: string;
}

const initialNotes: Note[] = [
  {
    id: "1",
    title: "TITULO DE LA NOTA",
    content: "Proyecto al que pertenece",
    color: "bg-yellow-200",
    completed: false,
    favorite: true,
    project: "Casa 1",
  },
  {
    id: "2",
    title: "TITULO DE LA NOTA",
    content: "Proyecto al que pertenece",
    color: "bg-yellow-200",
    completed: false,
    favorite: false,
    project: "Casa 2",
  },
  {
    id: "3",
    title: "TITULO DE LA NOTA",
    content: "Proyecto al que pertenece",
    color: "bg-yellow-200",
    completed: true,
    favorite: false,
    project: "Casa 3",
  },
];

export function NotesColumn() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [filterCompleted, setFilterCompleted] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Memoizar las notas filtradas
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (filterCompleted && !note.completed) return false;
      if (filterFavorites && !note.favorite) return false;
      return true;
    });
  }, [notes, filterCompleted, filterFavorites]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleComplete = (id: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, completed: !note.completed } : note
      )
    );
  };

  const toggleFavorite = (id: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, favorite: !note.favorite } : note
      )
    );
  };

  const addNote = (newNote: Omit<Note, "id">) => {
    const note: Note = {
      ...newNote,
      id: Date.now().toString(),
    };
    setNotes((prevNotes) => [note, ...prevNotes]);
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
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                  onClick={() => toggleComplete(note.id)}
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
                  onClick={() => toggleFavorite(note.id)}
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
                  onClick={() => toggleComplete(note.id)}
                  className="h-8 w-8 p-0 hover:bg-black/10"
                >
                  <Check className="h-5 w-5 text-green-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleFavorite(note.id)}
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
      </div>

      <AddNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddNote={addNote}
      />
    </div>
  );
}
