"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { updateDoc, doc, serverTimestamp, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import useUser from "@/modules/auth/hooks/useUser";
import { useUsersMap } from "@/hooks/useUsersMap";
import { addTaskComment, deleteTaskComment, markTaskCommentsSeenByAssigner, TaskDoc } from "@/lib/firebase/tasks";
import { getAllUserProfiles } from "@/lib/firebase/users";

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
  const { user } = useUser();
  const { getUserName } = useUsersMap();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [completed, setCompleted] = useState(false);
  const [comments, setComments] = useState<
    Array<{ id: string; authorId: string; text: string; createdAt?: Date }>
  >([]);
  const [assignedBy, setAssignedBy] = useState<string | null>(null);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [userNames, setUserNames] = useState<Record<string, string>>({});

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

  // Subscribe to comments and basic fields of this task
  useEffect(() => {
    if (!task?.id) return;
    const ref = doc(db, "tasks", task.id);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() as Partial<TaskDoc> | undefined;
      const raw = (data?.comments as TaskDoc["comments"]) || [];
      const mapped = raw.map((c) => {
        const createdTs = (c as { createdAt?: Timestamp | undefined }).createdAt;
        return {
          id: String((c as { id?: string }).id || ""),
          authorId: String((c as { authorId?: string }).authorId || ""),
          text: String((c as { text?: string }).text || ""),
          createdAt: createdTs instanceof Timestamp ? createdTs.toDate() : undefined,
        };
      });
      setComments(mapped);
      setAssignedBy((data?.assignedBy as string) || null);
      setAssigneeId((data?.assigneeId as string) || null);
    });
    return () => unsub();
  }, [task?.id]);

  // Load user profiles to resolve authorId -> display name
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profiles = await getAllUserProfiles();
        if (!mounted) return;
        const map: Record<string, string> = {};
        for (const u of profiles) {
          const name = (u.fullName && u.fullName.trim())
            || [u.firstName, u.lastName].filter(Boolean).join(" ")
            || u.email
            || u.id
            || "Usuario";
          if (u.id) map[u.id] = name;
        }
        setUserNames(map);
      } catch {
        // ignore and fallback to UID
      }
    })();
    return () => { mounted = false; };
  }, []);


  // If the current user is the assigner, mark comments as seen when opened
  useEffect(() => {
    if (!task?.id || !user?.uid) return;
    if (assignedBy && user.uid === assignedBy) {
      void markTaskCommentsSeenByAssigner(task.id);
    }
  }, [assignedBy, task?.id, user?.uid]);

  const canComment = useMemo(() => {
    if (!user?.uid) return false;
    return assigneeId === user.uid; // Solo el asignado puede comentar
  }, [assigneeId, user?.uid]);

  const handleAddComment = async () => {
    if (!task?.id || !user?.uid) return;
    const text = newComment.trim();
    if (!text) return;
    await addTaskComment(task.id, user.uid, text);
    setNewComment("");
  };

  // Nota: mantenemos authorId como UID para validar permisos de borrado

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

          {/* Comments */}
          <div className="space-y-2">
            <Label>Comentarios</Label>
            <div className="max-h-56 overflow-y-auto space-y-2 rounded-md border p-2 bg-gray-50">
              {comments.length === 0 && (
                <p className="text-xs text-gray-500">Aún no hay comentarios.</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="text-xs">
                  <span className="font-medium">{c.authorId === user?.uid ? "Tú" : getUserName(c.authorId)}</span>
                  : {c.text}
                  {c.createdAt && (
                    <span className="text-gray-400 ml-2">
                      {c.createdAt.toLocaleString()}
                    </span>
                  )}
                  {c.authorId === user?.uid && (
                    <button
                      className="ml-2 text-red-600 hover:underline"
                      onClick={async () => {
                        if (!task?.id || !user?.uid) return;
                        try {
                          await deleteTaskComment(task.id, user.uid, c.id);
                        } catch (e) {
                          console.warn("No se pudo borrar el comentario", e);
                        }
                      }}
                      title="Borrar comentario"
                    >
                      Borrar
                    </button>
                  )}
                </div>
              ))}
            </div>
            {canComment && (
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe un comentario"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleAddComment();
                    }
                  }}
                />
                <Button onClick={handleAddComment}>Enviar</Button>
              </div>
            )}
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
