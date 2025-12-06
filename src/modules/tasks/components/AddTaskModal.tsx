"use client";

import type React from "react";
import { ChevronDown, Check, X, Users, User } from "lucide-react";
import { UserRole, ALL_USER_ROLES } from "@/modules/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { listAllUsers, type UserWithId } from "@/lib/firebase/firestore";
import useUser from "@/modules/auth/hooks/useUser";
import { Textarea } from "@/components/ui/textarea";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: {
    title: string;
    project: string;
    assigneeIds?: string[];
    assigneeRoles?: UserRole[];
    description?: string;
  }) => Promise<void> | void;
}

export function AddTaskModal({
  isOpen,
  onClose,
  onAddTask,
}: AddTaskModalProps) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("General");
  const [content, setContent] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [assigneeRoles, setAssigneeRoles] = useState<UserRole[]>([]);
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [expandedRole, setExpandedRole] = useState<UserRole | null>(null);

  // Helper para obtener nombre de usuario por ID
  const getUserName = (userId: string) => {
    const u = users.find((user) => user.id === userId);
    return u?.fullName || u?.email || userId;
  };

  // Toggle usuario individual
  const toggleUser = (userId: string) => {
    setAssigneeIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Toggle área completa
  const toggleRole = (role: UserRole) => {
    setAssigneeRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  // Remover usuario de la selección
  const removeUser = (userId: string) => {
    setAssigneeIds((prev) => prev.filter((id) => id !== userId));
  };

  // Remover área de la selección
  const removeRole = (role: UserRole) => {
    setAssigneeRoles((prev) => prev.filter((r) => r !== role));
  };

  // Cargar usuarios
  useEffect(() => {
    if (!isOpen || !user) return;

    const load = async () => {
      try {
        setLoadingUsers(true);
        const list = await listAllUsers();
        setUsers(list.filter((u) => u.id !== user.uid));
      } finally {
        setLoadingUsers(false);
      }
    };

    load();
  }, [isOpen, user]);

  // Agrupar usuarios por área (rol)
  const usersByRole = useMemo(() => {
    const groups: Record<UserRole, UserWithId[]> = {} as Record<
      UserRole,
      UserWithId[]
    >;

    ALL_USER_ROLES.forEach((r) => (groups[r] = []));

    users.forEach((u) => {
      const userData = u as UserWithId & { role?: string; userRole?: string };
      const role = userData.role || userData.userRole || "Usuario";

      if (ALL_USER_ROLES.includes(role as UserRole)) {
        groups[role as UserRole].push(u);
      } else {
        groups["Usuario"].push(u);
      }
    });

    return groups;
  }, [users]);

  // Contar selecciones
  const totalSelections = assigneeIds.length + assigneeRoles.length;

  // Guardar tarea
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasAssignees = assigneeIds.length > 0 || assigneeRoles.length > 0;

    if (title.trim() && hasAssignees) {
      const taskData: {
        title: string;
        project: string;
        description?: string;
        assigneeIds?: string[];
        assigneeRoles?: UserRole[];
      } = {
        title: title.trim(),
        project,
        description: content.trim() || undefined,
      };

      if (assigneeIds.length > 0) {
        taskData.assigneeIds = assigneeIds;
      }
      if (assigneeRoles.length > 0) {
        taskData.assigneeRoles = assigneeRoles;
      }

      onAddTask(taskData);

      setTitle("");
      setContent("");
      setProject("General");
      setAssigneeIds([]);
      setAssigneeRoles([]);
      setShowSelector(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Tarea</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ingresa el contenido"
            />
          </div>

          {/* Asignar */}
          <div className="space-y-2">
            <Label>Asignar a</Label>

            {/* Botón tipo Select */}
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between font-normal"
              onClick={() => setShowSelector(!showSelector)}
            >
              <span className="text-gray-500">
                {totalSelections === 0
                  ? "Seleccionar destinatarios..."
                  : `${totalSelections} seleccionado${
                      totalSelections > 1 ? "s" : ""
                    }`}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showSelector ? "rotate-180" : ""
                }`}
              />
            </Button>

            {/* Chips de selección */}
            {(assigneeIds.length > 0 || assigneeRoles.length > 0) && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {/* Chips de áreas */}
                {assigneeRoles.map((role) => (
                  <span
                    key={`role-${role}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                  >
                    <Users className="h-3 w-3" />
                    <span>{role}</span>
                    <button
                      type="button"
                      onClick={() => removeRole(role)}
                      className="hover:bg-blue-200 rounded p-0.5 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {/* Chips de usuarios */}
                {assigneeIds.map((userId) => (
                  <span
                    key={`user-${userId}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md"
                  >
                    <User className="h-3 w-3" />
                    <span>{getUserName(userId)}</span>
                    <button
                      type="button"
                      onClick={() => removeUser(userId)}
                      className="hover:bg-green-200 rounded p-0.5 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Panel de selección (dentro del flujo, no flotante) */}
            {showSelector && (
              <div className="border border-gray-200 rounded-md mt-2 bg-gray-50">
                <div className="max-h-48 overflow-y-auto">
                  {loadingUsers ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Cargando usuarios...
                    </div>
                  ) : (
                    ALL_USER_ROLES.map((role) => {
                      const usersInRole = usersByRole[role] || [];
                      if (usersInRole.length === 0) return null;

                      return (
                        <div
                          key={role}
                          className="border-b border-gray-200 last:border-none"
                        >
                          {/* Header del área */}
                          <div
                            className="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-100 bg-white"
                            onClick={() =>
                              setExpandedRole((prev) =>
                                prev === role ? null : role
                              )
                            }
                          >
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-sm">
                                {role}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({usersInRole.length})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {assigneeRoles.includes(role) && (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                              <ChevronDown
                                className={`h-4 w-4 text-gray-400 transition-transform ${
                                  expandedRole === role ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </div>

                          {/* Contenido expandido */}
                          {expandedRole === role && (
                            <div className="bg-white border-t border-gray-100">
                              {/* Seleccionar toda el área */}
                              <div
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRole(role);
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={assigneeRoles.includes(role)}
                                  readOnly
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm font-medium text-blue-700">
                                  Toda el área
                                </span>
                              </div>

                              {/* Lista de usuarios */}
                              {usersInRole.map((usr) => (
                                <div
                                  key={usr.id}
                                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-green-50 pl-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleUser(usr.id);
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={assigneeIds.includes(usr.id)}
                                    readOnly
                                    className="h-4 w-4 rounded border-gray-300 text-green-600"
                                  />
                                  <User className="h-3 w-3 text-gray-400" />
                                  <span className="text-sm text-gray-700">
                                    {usr.fullName || usr.email}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Botón para cerrar el selector */}
                <div className="p-2 border-t border-gray-200 bg-white">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowSelector(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                !title.trim() ||
                (assigneeIds.length === 0 && assigneeRoles.length === 0)
              }
            >
              Agregar Tarea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
