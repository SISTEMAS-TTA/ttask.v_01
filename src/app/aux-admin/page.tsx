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
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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

// Plantilla de secciones y tareas iniciales
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

export default function AuxAdminPage() {
  const { user, profile, loading: userLoading } = useUser();
  const { projects } = useProjects(user?.uid, profile?.role);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Estados para manejar áreas, usuarios y la selección
  const [allAreas, setAllAreas] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<
    Array<{ id: string; name: string; role: string }>
  >([]);
  type Asignacion =
    | { tipo: "area"; id: string }
    | { tipo: "usuario"; id: string };
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);

  // Estado para controlar qué área está expandida (acordeón)
  const [areaAbierta, setAreaAbierta] = useState<string | null>(null);

  const router = useRouter();

  // Cargar usuarios y áreas
  useEffect(() => {
    (async () => {
      try {
        const users = await listAllUsers();
        const formattedUsers = users.map((u) => ({
          id: u.id,
          name: u.fullName || `${u.firstName} ${u.lastName}`.trim() || u.email,
          role: u.role,
        }));
        setAllUsers(formattedUsers);
        const areas = [...new Set(users.map((u) => u.role))].filter(Boolean);
        setAllAreas(areas);
      } catch (e) {
        console.warn("No se pudieron cargar usuarios o areas", e);
      }
    })();
  }, []);

  // Verificar permisos: solo Director, Administrador y Aux. Admin
  const canAccess =
    profile?.role === "Director" ||
    profile?.role === "Aux. Admin";

  const canCreate =
    profile?.role === "Director" ||
    profile?.role === "Aux. Admin";

  const canRegister =
    profile?.role === "Director";

  // Estados para cotización simulada
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteTitle, setQuoteTitle] = useState("");
  const [quoteClient, setQuoteClient] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");

  const createProjectAction = async () => {
    if (!user) return;
    const base = buildTemplate();
    await createProject(user.uid, {
      title: title.trim(),
      description: description.trim() || undefined,
      asignaciones: asignaciones,
      sections: base.sections,
      tasks: base.tasks,
    });
    setIsCreating(false);
    setTitle("");
    setDescription("");
    setAsignaciones([]);
  };

  if (userLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AuthGuard>
    );
  }

  if (!canAccess) {
    return (
      <AuthGuard>
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Acceso restringido
            </h1>
            <p className="text-gray-600">
              No tienes permisos para ver esta página.
            </p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Administración de Proyectos
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsQuoteOpen(true)}>
              Cotización (simulado)
            </Button>
            {canRegister && (
              <Button
                variant="outline"
                onClick={() => router.push("/register")}
              >
                Registrar Usuario
              </Button>
            )}
            {canCreate && (
              <Button onClick={() => setIsCreating(true)}>
                Nuevo Proyecto
              </Button>
            )}
          </div>
        </div>

        {/* Modal: Crear Proyecto */}
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

              {/* Selector de Integrantes y Áreas */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Asignar a Áreas/Usuarios
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Selecciona las áreas que trabajarán en este proyecto
                </p>

                <div className="max-h-60 overflow-y-auto border rounded">
                  {allAreas.map((area) => {
                    const areaSeleccionada = asignaciones.some(
                      (a) => a.tipo === "area" && a.id === area
                    );
                    const usuariosDelArea = allUsers.filter(
                      (u) => u.role === area
                    );

                    return (
                      <div key={area} className="border-b last:border-b-0">
                        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100">
                          <label className="flex items-center gap-2 text-sm font-medium flex-grow">
                            <input
                              type="checkbox"
                              checked={areaSeleccionada}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setAsignaciones((prev) => {
                                  const filtrados = prev.filter(
                                    (a) =>
                                      !(a.tipo === "area" && a.id === area) &&
                                      !(
                                        a.tipo === "usuario" &&
                                        usuariosDelArea.some(
                                          (u) => u.id === a.id
                                        )
                                      )
                                  );
                                  if (checked) {
                                    return [
                                      ...filtrados,
                                      { tipo: "area", id: area },
                                    ];
                                  }
                                  return filtrados;
                                });
                              }}
                            />
                            Área: {area}
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setAreaAbierta(areaAbierta === area ? null : area)
                            }
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {areaAbierta === area ? "Ocultar" : "Ver usuarios"}
                          </button>
                        </div>

                        {areaAbierta === area && (
                          <div className="pl-6 bg-white">
                            {usuariosDelArea.map((u) => {
                              const usuarioSeleccionado = asignaciones.some(
                                (a) => a.tipo === "usuario" && a.id === u.id
                              );

                              return (
                                <label
                                  key={u.id}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                                >
                                  <input
                                    type="checkbox"
                                    disabled={areaSeleccionada}
                                    checked={
                                      usuarioSeleccionado || areaSeleccionada
                                    }
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setAsignaciones((prev) => {
                                        const filtrados = prev.filter(
                                          (a) =>
                                            !(
                                              a.tipo === "usuario" &&
                                              a.id === u.id
                                            )
                                        );
                                        if (checked) {
                                          return [
                                            ...filtrados,
                                            { tipo: "usuario", id: u.id },
                                          ];
                                        }
                                        return filtrados;
                                      });
                                    }}
                                  />
                                  {u.name}
                                </label>
                              );
                            })}
                            {usuariosDelArea.length === 0 && (
                              <span className="block px-3 py-2 text-sm text-gray-500">
                                No hay usuarios en esta área.
                              </span>
                            )}
                          </div>
                        )}
                      </div>
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

        {/* Modal: Cotización (Simulado) */}
        <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Cotización (simulado)</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <Input
                  value={quoteTitle}
                  onChange={(e) => setQuoteTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cliente
                </label>
                <Input
                  value={quoteClient}
                  onChange={(e) => setQuoteClient(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Importe
                </label>
                <Input
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Button variant="outline" onClick={() => setIsQuoteOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    alert(
                      `Cotización simulada creada:\nTítulo: ${quoteTitle}\nCliente: ${quoteClient}\nImporte: ${quoteAmount}`
                    );
                    setIsQuoteOpen(false);
                    setQuoteTitle("");
                    setQuoteClient("");
                    setQuoteAmount("");
                  }}
                  disabled={!quoteTitle.trim()}
                >
                  Crear (simulado)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Grid de proyectos */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {projects.map((p) => (
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
          {projects.length === 0 && (
            <p className="text-sm text-gray-600">
              No hay proyectos disponibles.
            </p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

