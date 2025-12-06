"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Note } from "@/modules/types";
import type { NewNoteInput } from "@/lib/firebase/notes";
import { Trash2 } from "lucide-react";

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note | null;
  // onSave ahora solo se usa para Title/Content. No se actualiza el color en Firebase.
  onSave: (id: string, updates: Partial<NewNoteInput>) => Promise<void> | void;
  // [CORRECCIÓN/REINSERCIÓN]: Necesario para persistir el cambio de color en sessionStorage (en el padre).
  onColorChange: (noteId: string, newColor: string) => void;
  // [CAMBIO CLAVE]: Prop para recibir el color actual (sessionStorage > Firebase) del padre.
  currentNoteColor: string;
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
  onColorChange,
  currentNoteColor, // Usado para inicializar y para el marcado visual
}: EditNoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // [CORRECCIÓN CLAVE 1]: Usamos currentNoteColor para inicializar el estado seleccionado.
  // Esto asegura que si el color cambió en sessionStorage, el selector refleje ese cambio.
  const [selectedColor, setSelectedColor] = useState(currentNoteColor);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title ?? "");
      setContent(note.content ?? "");
      // [CORRECCIÓN CLAVE 2]: Usar el color del prop (que ya considera sessionStorage) para la inicialización.
      setSelectedColor(currentNoteColor);
    } else {
      setTitle("");
      setContent("");
      setSelectedColor(pastelColors[0].value);
    }
  }, [note, currentNoteColor]); // Dependencia agregada: currentNoteColor

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSave(note.id, {
        title: title.trim(),
        content: content.trim(),
        // [AJUSTE CLAVE]: Eliminamos el envío de 'color' al onSave.
        // Ya que updateNote en Firebase lo filtra, esta línea causaba confusión.
        // El color se maneja exclusivamente con onColorChange.
        // color: selectedColor, <-- ELIMINADO para forzar la lógica de sessionStorage.
      });
      onClose();
    } catch (err) {
      console.error("Error al guardar cambios de la nota", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await (await import("@/lib/firebase/notes")).deleteNote(noteId);
    } catch (err) {
      console.error("Error al eliminar la nota", err);
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
            <Label htmlFor="content">Contenido (opcional)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {pastelColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => {
                    // [LÓGICA CLAVE]: Actualizar el estado local del modal para el marcado visual.
                    setSelectedColor(color.value);
                    // [LÓGICA CLAVE]: Llamar al padre para guardar el color en sessionStorage.
                    if (note) onColorChange(note.id, color.value);
                  }}
                  className={`w-full h-8 rounded-md border-2 transition-all ${
                    color.class
                  } ${
                    // Usa 'selectedColor' (el estado local) para mostrar el borde,
                    // ya que se actualiza inmediatamente en el onClick.
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
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!note || isSubmitting}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">Eliminar</span>
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar nota?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La nota será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!note) return;
                void handleDelete(note.id);
                setShowDeleteConfirm(false);
                onClose();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
