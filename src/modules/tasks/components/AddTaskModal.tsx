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
import { Textarea } from "@/components/ui/textarea";
import { listAllUsers, type UserWithId } from "@/lib/firebase/firestore";
import useUser from "@/modules/auth/hooks/useUser";
import { ALL_USER_ROLES } from "@/modules/types";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: {
    title: string;
    project: string;
    description?: string;
    assigneeIds: string[];
    assignedAreas: string[];
  }) => Promise<void> | void;
}

export function AddTaskModal({
  isOpen,
  onClose,
  onAddTask,
}: AddTaskModalProps) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // Estados de selección
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  
  // Estados para abrir/cerrar los desplegables
  const [usersOpen, setUsersOpen] = useState(false);
  const [areasOpen, setAreasOpen] = useState(false);

  const [users, setUsers] = useState<UserWithId[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    const load = async () => {
      try {
        setLoadingUsers(true);
        const list = await listAllUsers();
        const availableUsers = list.filter((u) => u.id !== user.uid);
        setUsers(availableUsers);
      } finally {
        setLoadingUsers(false);
      }
    };
    load();
  }, [isOpen, user]);

  // --- LÓGICA INTELIGENTE (Igual que antes) ---

  const toggleUser = (userId: string, userRole: string) => {
    let newSelectedIds: string[] = [];
    if (selectedUserIds.includes(userId)) {
      newSelectedIds = selectedUserIds.filter((id) => id !== userId);
    } else {
      newSelectedIds = [...selectedUserIds, userId];
    }
    setSelectedUserIds(newSelectedIds);

    const usersInThisRole = users.filter((u) => u.role === userRole);
    const allSelected = usersInThisRole.every((u) => newSelectedIds.includes(u.id));

    if (allSelected && usersInThisRole.length > 0) {
      if (!selectedAreas.includes(userRole)) {
        setSelectedAreas((prev) => [...prev, userRole]);
      }
    } else {
      setSelectedAreas((prev) => prev.filter((a) => a !== userRole));
    }
  };

  const toggleArea = (area: string) => {
    const isSelecting = !selectedAreas.includes(area);
    if (isSelecting) {
      setSelectedAreas((prev) => [...prev, area]);
    } else {
      setSelectedAreas((prev) => prev.filter((a) => a !== area));
    }

    const usersInThisRole = users.filter((u) => u.role === area);
    const idsInRole = usersInThisRole.map((u) => u.id);

    if (isSelecting) {
      setSelectedUserIds((prev) => {
        const combined = new Set([...prev, ...idsInRole]);
        return Array.from(combined);
      });
    } else {
      setSelectedUserIds((prev) => prev.filter((id) => !idsInRole.includes(id)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && (selectedUserIds.length > 0 || selectedAreas.length > 0)) {
      onAddTask({
        title: title.trim(),
        project: "General",
        description: content.trim(),
        assigneeIds: selectedUserIds,
        assignedAreas: selectedAreas,
      });
      setTitle("");
      setContent("");
      setSelectedUserIds([]);
      setSelectedAreas([]);
      setUsersOpen(false);
      setAreasOpen(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg"> {/* Ancho normal */}
        <DialogHeader>
          <DialogTitle>Agregar Nueva Tarea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título de la tarea</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título..."
              required
            />
          </div>

          {/* Contenido */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenido (opcional)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detalles de la tarea..."
            />
          </div>

          {/* SELECCIÓN DOBLE TIPO DROPDOWN */}
          <div className="space-y-2">
            <Label>Asignar a</Label>
            
            <div className="grid grid-cols-2 gap-4">
              
              {/* DROPDOWN 1: USUARIOS */}
              <div className="relative">
                <Label className="text-xs text-gray-500 mb-1.5 block">Usuarios</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between font-normal text-left"
                  onClick={() => {
                    setUsersOpen(!usersOpen);
                    setAreasOpen(false); // Cerrar el otro si abres este
                  }}
                >
                  <span className="truncate">
                    {selectedUserIds.length === 0 
                      ? "Seleccionar..." 
                      : `${selectedUserIds.length} seleccionados`}
                  </span>
                  <span className="ml-2 opacity-50">▼</span>
                </Button>
                
                {/* Lista desplegable de Usuarios */}
                {usersOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full z-50 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {loadingUsers ? (
                      <div className="p-2 text-xs text-gray-500">Cargando...</div>
                    ) : (
                      users.map((u) => {
                        const isChecked = selectedUserIds.includes(u.id);
                        return (
                          <label
                            key={u.id}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={isChecked}
                              onChange={() => toggleUser(u.id, u.role)}
                            />
                            <div className="flex flex-col leading-none">
                                <span>{u.fullName || u.email}</span>
                                <span className="text-[10px] text-gray-400">{u.role}</span>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* DROPDOWN 2: ÁREAS */}
              <div className="relative">
                <Label className="text-xs text-gray-500 mb-1.5 block">Áreas</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between font-normal text-left"
                  onClick={() => {
                    setAreasOpen(!areasOpen);
                    setUsersOpen(false); // Cerrar el otro si abres este
                  }}
                >
                  <span className="truncate">
                    {selectedAreas.length === 0 
                      ? "Seleccionar..." 
                      : `${selectedAreas.length} áreas`}
                  </span>
                  <span className="ml-2 opacity-50">▼</span>
                </Button>

                {/* Lista desplegable de Áreas */}
                {areasOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full z-50 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {ALL_USER_ROLES.map((role) => {
                      const isChecked = selectedAreas.includes(role);
                      return (
                        <label
                          key={role}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={isChecked}
                            onChange={() => toggleArea(role)}
                          />
                          <span>{role}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Agregar Tarea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}