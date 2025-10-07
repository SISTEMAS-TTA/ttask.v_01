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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listAllUsers } from "@/lib/firebase/firestore";
import useUser from "@/modules/auth/hooks/useUser";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: {
    title: string;
    project: string;
    assigneeId: string;
    description?: string;
  }) => Promise<void> | void;
}

const projects = ["Casa 1", "Casa 2", "Casa 3", "Proyecto General"];

export function AddTaskModal({
  isOpen,
  onClose,
  onAddTask,
}: AddTaskModalProps) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [users, setUsers] = useState<
    Array<{
      id: string;
      fullName?: string;
      firstName?: string;
      lastName?: string;
      email: string;
    }>
  >([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    const load = async () => {
      try {
        setLoadingUsers(true);
        const list = await listAllUsers();
        // Excluir al usuario actual de la lista
        const availableUsers = list.filter((u) => u.id !== user.uid);
        setUsers(availableUsers as any);
      } finally {
        setLoadingUsers(false);
      }
    };
    load();
  }, [isOpen, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && project && assigneeId) {
      onAddTask({
        title: title.trim(),
        project,
        assigneeId,
      });
      setTitle("");
      setProject("");
      setAssigneeId("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Tarea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título de la tarea</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título de la tarea..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Proyecto</Label>
            <Select value={project} onValueChange={setProject} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((proj) => (
                  <SelectItem key={proj} value={proj}>
                    {proj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Asignar a</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId} required>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingUsers
                      ? "Cargando usuarios..."
                      : "Selecciona un usuario"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.fullName ||
                      `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
                      u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Agregar Tarea</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
