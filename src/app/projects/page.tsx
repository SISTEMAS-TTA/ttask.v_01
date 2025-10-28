"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import useUser from "@/modules/auth/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  ProjectDoc,
  ProjectSection,
  ProjectTask,
  UserRole,
} from "@/modules/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listAllUsers } from "@/lib/firebase/firestore";
import {
  createProject,
  subscribeToProjectsForUser,
} from "@/lib/firebase/projects";

// Firestore-backed projects for current user (owner, member, role allowed)
function useProjects(userId?: string, role?: UserRole) {
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  useEffect(() => {
    if (!userId || !role) return;
    const unsub = subscribeToProjectsForUser(userId, role, setProjects);
    return () => unsub();
  }, [userId, role]);
  return { projects } as const;
}

// Plantilla resumida (puedes expandirla luego 1:1 con tu checklist)
function buildTemplate() {
  const sections: ProjectSection[] = [
    { id: "sec-2", title: "Proyecto Arquitectónico", order: 1 },
    { id: "sec-3", title: "Proyecto Ejecutivo Arquitectónico", order: 2 },
    { id: "sec-4", title: "Diseño Estructural", order: 3 },
    { id: "sec-5", title: "Ingenierías", order: 4 },
    { id: "sec-6", title: "Instalaciones Especiales", order: 5 },
    { id: "sec-7", title: "Tablaroca", order: 6 },
  ];
  const tasks: ProjectTask[] = [
    {
      id: crypto.randomUUID(),
      sectionId: "sec-2",
      title: "Plantas arquitectónicas",
      completed: false,
      favorite: false,
      order: 1024,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-2",
      title: "Fachadas arquitectónicas",
      completed: false,
      favorite: false,
      order: 2048,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-3",
      title: "Detalles de carpintería",
      completed: false,
      favorite: false,
      order: 1024,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-3",
      title: "Detalles de herrería",
      completed: false,
      favorite: false,
      order: 2048,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-4",
      title: "Planos de especificaciones generales",
      completed: false,
      favorite: false,
      order: 1024,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-5",
      title: "Hidráulica: acometida general",
      completed: false,
      favorite: false,
      order: 1024,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-6",
      title: "Domótica",
      completed: false,
      favorite: false,
      order: 1024,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-7",
      title: "Plano de plafones",
      completed: false,
      favorite: false,
      order: 1024,
    },
  ];
  return { sections, tasks };
}

export default function ProjectsPage() {
  const { user, profile } = useUser();
  const { projects } = useProjects(user?.uid, profile?.role);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [allDesignUsers, setAllDesignUsers] = useState<
    Array<{ id: string; name: string }>
  >([]);

  useEffect(() => {
    // Load users with role Diseno for member picker
    (async () => {
      try {
        const users = await listAllUsers();
        const disenos = users
          .filter((u) => u.role === "Diseno")
          .map((u) => ({
            id: u.id,
            name:
              u.fullName || `${u.firstName} ${u.lastName}`.trim() || u.email,
          }));
        setAllDesignUsers(disenos);
      } catch (e) {
        console.warn("No se pudieron cargar usuarios", e);
      }
    })();
  }, []);

  const canCreate = profile?.role === "Director";

  const visible = projects; // ya vienen filtrados por la suscripción

  const createProjectAction = async () => {
    if (!user) return;
    const base = buildTemplate();
    await createProject(user.uid, {
      title: title.trim(),
      description: description.trim() || undefined,
      members,
      rolesAllowed: ["Diseno"],
      sections: base.sections,
      tasks: base.tasks,
    });
    setIsCreating(false);
    setTitle("");
    setDescription("");
    setMembers([]);
  };

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Proyectos</h1>
          {canCreate && (
            <Button onClick={() => setIsCreating(true)}>Nuevo Proyecto</Button>
          )}
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo proyecto</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Casa Gómez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Descripción (opcional)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Integrantes (solo rol Diseno)
                </label>
                {/* Selector simple multi-usuario (rol Diseno) */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {members.map((id) => {
                    const u = allDesignUsers.find((x) => x.id === id);
                    return (
                      <span
                        key={id}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                      >
                        {u?.name || id}
                      </span>
                    );
                  })}
                </div>
                <div className="max-h-48 overflow-y-auto border rounded">
                  {allDesignUsers.map((u) => {
                    const checked = members.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setMembers((prev) =>
                              e.target.checked
                                ? [...prev, u.id]
                                : prev.filter((x) => x !== u.id)
                            );
                          }}
                        />
                        {u.name}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button onClick={createProjectAction} disabled={!title.trim()}>
                  Crear
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Grid móvil con mínimo 2 columnas */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {visible.map((p) => (
            <Card key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{p.title}</h3>
                {p.description && (
                  <p className="text-sm text-gray-600">{p.description}</p>
                )}
              </div>
              <Link
                href={`/projects/${p.id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                Ver
              </Link>
            </Card>
          ))}
          {visible.length === 0 && (
            <p className="text-sm text-gray-600">
              No hay proyectos disponibles.
            </p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
