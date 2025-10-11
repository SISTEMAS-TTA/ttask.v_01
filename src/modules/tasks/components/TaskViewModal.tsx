"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface TaskViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    title: string;
    project: string;
    assigneeId: string;
    viewed: boolean;
    completed: boolean;
    favorite: boolean;
    description?: string;
  } | null;
  onSave?: (
    updated: Partial<{
      title: string;
      description?: string;
      completed: boolean;
      updatedAt: unknown;
    }>
  ) => void;
  /** When true the modal is read-only and Save is hidden/disabled */
  readOnly?: boolean;
}

export function TaskViewModal({
  isOpen,
  onClose,
  task,
  onSave,
  readOnly = false,
}: TaskViewModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setCompleted(Boolean(task.completed));
    } else {
      setTitle("");
      setDescription("");
      setCompleted(false);
    }
  }, [task]);

  const handleSave = async () => {
    if (!task) return;
    if (readOnly) return;
    const ref = doc(db, "tasks", task.id);
    const updates: Partial<{
      title: string;
      description?: string;
      completed: boolean;
      updatedAt: unknown;
    }> = {
      title: title.trim(),
      description: description.trim(),
      completed,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(ref, updates);
    onSave?.(updates);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle de la tarea</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label> Título </Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {!readOnly && <Button onClick={handleSave}>Guardar</Button>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
