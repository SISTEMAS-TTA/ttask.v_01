"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Note } from "@/modules/types";
import type { NewNoteInput } from "@/lib/firebase/notes";
import { Trash2 } from "lucide-react";
import useUser from "@/modules/auth/hooks/useUser";

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note | null;
  onSave: (id: string, updates: Partial<NewNoteInput>) => Promise<void> | void;
}

const pastelColors = [
  { name: "Amarillo", value: "bg-yellow-200", class: "bg-yellow-200" },
  { name: "Rosa", value: "bg-pink-200", class: "bg-pink-200" },
  { name: "Azul", value: "bg-blue-200", class: "bg-blue-200" },
  { name: "Verde", value: "bg-green-200", class: "bg-green-200" },
  { name: "Púrpura", value: "bg-purple-200", class: "bg-purple-200" },
  { name: "Naranja", value: "bg-orange-200", class: "bg-orange-200" },
  { name: "Índigo", value: "bg-indigo-200", class: "bg-indigo-200" },
  { name: "Gris", value: "bg-gray-200", class: "bg-gray-200" },
];

export function EditNoteModal({
  isOpen,
  onClose,
  note,
  onSave,
}: EditNoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState(pastelColors[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    if (note) {
      setTitle(note.title ?? "");
      setContent(note.content ?? "");
      setSelectedColor(note.color ?? pastelColors[0].value);
    } else {
      setTitle("");
      setContent("");
      setSelectedColor(pastelColors[0].value);
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;
    if (!title.trim() || !content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSave(note.id, {
        title: title.trim(),
        content: content.trim(),
        color: selectedColor,
      });
      onClose();
    } catch (err) {
      console.error("Error al guardar cambios de la nota", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    // optimista: remover del estado local inmediatamente
    setNotes((prev) => prev.filter((n) => n.id !== noteId));

    try {
      await (await import("@/lib/firebase/notes")).deleteNote(noteId);
    } catch (err) {
      console.error("Error al eliminar la nota", err);
      // Revertir: recargar las notas (simple) -- la suscripción los recuperará pronto
      if (user) {
        // no forzamos una recarga aquí; la suscripción onSnapshot se encargará
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Nota</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {pastelColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full h-8 rounded-md border-2 transition-all ${
                    color.class
                  } ${
                    selectedColor === color.value
                      ? "border-gray-800 scale-105"
                      : "border-gray-300 hover:border-gray-500"
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (!note) return;
                // Confirmación simple
                if (confirm("¿Eliminar nota?")) {
                  void handleDelete(note.id);
                  onClose();
                }
              }}
              disabled={!note || isSubmitting}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">Eliminar</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
