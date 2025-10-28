"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import useUser from "@/modules/auth/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectDoc, ProjectSection, ProjectTask } from "@/modules/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function useLocalProjects() {
  const key = "ttask.projects.v1";
  const [projects, setProjects] = useState<ProjectDoc[]>([] as ProjectDoc[]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setProjects(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(projects));
    } catch {}
  }, [projects]);
  return { projects, setProjects } as const;
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
    { id: crypto.randomUUID(), sectionId: "sec-2", title: "Plantas arquitectónicas", completed: false, favorite: false, order: 1024 },
    { id: crypto.randomUUID(), sectionId: "sec-2", title: "Fachadas arquitectónicas", completed: false, favorite: false, order: 2048 },
    { id: crypto.randomUUID(), sectionId: "sec-3", title: "Detalles de carpintería", completed: false, favorite: false, order: 1024 },
    { id: crypto.randomUUID(), sectionId: "sec-3", title: "Detalles de herrería", completed: false, favorite: false, order: 2048 },
    { id: crypto.randomUUID(), sectionId: "sec-4", title: "Planos de especificaciones generales", completed: false, favorite: false, order: 1024 },
    { id: crypto.randomUUID(), sectionId: "sec-5", title: "Hidráulica: acometida general", completed: false, favorite: false, order: 1024 },
    { id: crypto.randomUUID(), sectionId: "sec-6", title: "Domótica", completed: false, favorite: false, order: 1024 },
    { id: crypto.randomUUID(), sectionId: "sec-7", title: "Plano de plafones", completed: false, favorite: false, order: 1024 },
  ];
  return { sections, tasks };
}

export default function ProjectsPage() {
  const { user, profile } = useUser();
  const { projects, setProjects } = useLocalProjects();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<string[]>([]);

  const canCreate = profile?.role === "Director";

  const visible = useMemo(() => {
    return projects.filter((p) => {
      if (profile?.role === "Director") return true;
      if (p.members?.includes(user?.uid || "")) return true;
      if (p.rolesAllowed?.includes(profile?.role as any)) return true;
      return false;
    });
  }, [projects, user?.uid, profile?.role]);

  const createProject = () => {
    if (!user) return;
    const base = buildTemplate();
    const newProj: ProjectDoc = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      createdBy: user.uid,
      createdAt: ({} as any), // front-only: placeholder
      members,
      rolesAllowed: ["Diseno"],
      sections: base.sections,
      tasks: base.tasks,
    };
    setProjects((prev) => [newProj, ...prev]);
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
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Casa Gómez" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Integrantes (solo rol Diseno)</label>
                <Input
                  placeholder="Ingresa userIds separados por coma (sólo Diseno)"
                  value={members.join(", ")}
                  onChange={(e) => setMembers(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                />
                <p className="text-xs text-gray-500 mt-1">Más adelante cargaremos usuarios reales y deshabilitaremos roles no permitidos.</p>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
                <Button onClick={createProject} disabled={!title.trim()}>Crear</Button>
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
              <Link href={`/projects/${p.id}`} className="text-blue-600 hover:underline text-sm">
                Ver
              </Link>
            </Card>
          ))}
          {visible.length === 0 && (
            <p className="text-sm text-gray-600">No hay proyectos disponibles.</p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
