"use client";

import type React from "react";
import { ChevronDown, Check } from "lucide-react";
import { UserRole, USER_ROLES } from "@/modules/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useMemo, useRef } from "react";
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
    assigneeId?: string;
    assigneeRole?: UserRole;
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
  const [assigneeId, setAssigneeId] = useState("");
  const [assigneeRole, setAssigneeRole] = useState<UserRole | null>(null);
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedRole, setExpandedRole] = useState<UserRole | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    USER_ROLES.forEach((r) => (groups[r] = []));

    users.forEach((u) => {
      // Intentar obtener el rol del usuario, con múltiples fallbacks
      const role = (u as any).role || (u as any).userRole || "Usuario";

      // Verificar si el rol existe en USER_ROLES
      if (USER_ROLES.includes(role as UserRole)) {
        groups[role as UserRole].push(u);
      } else {
        // Si no existe, agregar a "Usuario" por defecto
        groups["Usuario"].push(u);
      }
    });

    return groups;
  }, [users]);

  // Guardar tarea
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && (assigneeId || assigneeRole)) {
      const taskData: {
        title: string;
        project: string;
        description?: string;
        assigneeId?: string;
        assigneeRole?: UserRole;
      } = {
        title: title.trim(),
        project,
        description: content.trim() || undefined,
      };

      // Solo agregar los campos que tienen valor
      if (assigneeId) {
        taskData.assigneeId = assigneeId;
      }
      if (assigneeRole) {
        taskData.assigneeRole = assigneeRole;
      }

      onAddTask(taskData);

      setTitle("");
      setContent("");
      setProject("General");
      setAssigneeId("");
      setAssigneeRole(null);
      setSearchTerm("");
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
          <div className="space-y-2 relative" ref={dropdownRef}>
            <Label>Asignar a</Label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <Input
                placeholder="Buscar usuario o área..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="pl-10"
              />
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute z-50 w-full max-h-72 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                {/* Si hay texto, buscamos usuarios */}
                {searchTerm &&
                  users
                    .filter((u) =>
                      (u.fullName || u.email)
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setAssigneeId(u.id);
                          setAssigneeRole(null);
                          setSearchTerm(u.fullName || u.email);
                          setShowDropdown(false);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">👤</span>
                          <span>{u.fullName || u.email}</span>
                        </div>
                        {assigneeId === u.id && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    ))}

                {/* Si NO hay texto, mostramos checklist por área */}
                {!searchTerm &&
                  USER_ROLES.map((role) => (
                    <div key={role} className="border-b last:border-none">
                      <div
                        className="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          setExpandedRole((prev) =>
                            prev === role ? null : role
                          )
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-500">👥</span>
                          <span className="font-medium text-sm">{role}</span>
                          <span className="text-xs text-gray-500">
                            ({usersByRole[role]?.length || 0})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {assigneeRole === role && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedRole === role ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {expandedRole === role && (
                        <div className="ml-4 pb-2 space-y-1">
                          {/* Opción para seleccionar toda el área */}
                          <div
                            className="flex items-center space-x-2 p-1 cursor-pointer hover:bg-blue-50 rounded border-b border-gray-200 mb-2"
                            onClick={() => {
                              setAssigneeRole(role);
                              setAssigneeId("");
                              setSearchTerm(`Área: ${role}`);
                              setShowDropdown(false);
                            }}
                          >
                            <input
                              type="radio"
                              name="assignee"
                              checked={assigneeRole === role}
                              readOnly
                            />
                            <span className="text-sm font-medium text-blue-600">
                              ✓ Toda el área de {role}
                            </span>
                          </div>

                          {/* Lista de usuarios individuales */}
                          {usersByRole[role]?.map((usr) => (
                            <div
                              key={usr.id}
                              className="flex items-center space-x-2 p-1 cursor-pointer hover:bg-green-50 rounded"
                              onClick={() => {
                                setAssigneeId(usr.id);
                                setAssigneeRole(null);
                                setSearchTerm(usr.fullName || usr.email);
                                setShowDropdown(false);
                              }}
                            >
                              <input
                                type="radio"
                                name="assignee"
                                checked={assigneeId === usr.id}
                                readOnly
                              />
                              <span className="text-sm">
                                {usr.fullName || usr.email}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || (!assigneeId && !assigneeRole)}
            >
              Agregar Tarea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
