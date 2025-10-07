"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { NewNoteInput } from "@/lib/firebase/notes";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote: (note: NewNoteInput) => Promise<void> | void;
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

export function AddNoteModal({
  isOpen,
  onClose,
  onAddNote,
}: AddNoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState(pastelColors[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedColor(pastelColors[0].value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddNote({
        title: title.trim(),
        content: content.trim(),
        color: selectedColor,
        completed: false,
        favorite: false,
        project: "General",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error al guardar la nota", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Nota</DialogTitle>
          {/* <DialogDescription>
            Completa los campos para crear una nueva nota personalizada.
          </DialogDescription> */}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título de la nota</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ingresa el contenido de la nota..."
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
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Agregar Nota"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
