"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import useUser from "@/modules/auth/hooks/useUser";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import {
  Loader2,
  Plus,
  FileText,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";

// Firestore-backed projects for current user
function useProjects(userId?: string, role?: UserRole) {
  const [projects, setProjects] = useState<ProjectDoc[]>([]);

  useEffect(() => {
    if (!userId || !role) return;
    const unsub = subscribeToProjectsForUser(userId, role, setProjects);
    return () => unsub();
  }, [userId, role]);

  return { projects, setProjects } as const;
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

// Definimos el tipo aquí para reusarlo
type Asignacion =
  | { tipo: "area"; id: string }
  | { tipo: "usuario"; id: string };

export default function DirectorPage() {
  const { user, profile, loading: userLoading } = useUser();
  const { projects, setProjects } = useProjects(user?.uid, profile?.role);

  // --- ESTADOS DEL MODAL DE PROYECTO (CREAR) ---
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);

  // Estados para manejar áreas, usuarios y la selección
  const [allAreas, setAllAreas] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<
    Array<{ id: string; name: string; role: string }>
  >([]);

  // Estado para controlar qué área está expandida (acordeón)
  const [areaAbierta, setAreaAbierta] = useState<string | null>(null);

  // Estados para cotización simulada
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteTitle, setQuoteTitle] = useState("");
  const [quoteClient, setQuoteClient] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");

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

  // Verificar permisos
  const canAccess = profile?.role === "Director";

  const canCreate = profile?.role === "Director";

  const canRegister = profile?.role === "Director";

  // --- FUNCIÓN PARA ABRIR EL MODAL ---

  const openCreateModal = () => {
    setTitle("");
    setDescription("");
    setAsignaciones([]);
    setIsProjectModalOpen(true);
  };

  // --- FUNCIÓN DE GUARDAR (CREAR) ---
  const handleSaveProject = async () => {
    if (!user) return;

    // MODO CREAR
    const base = buildTemplate();
    await createProject(user.uid, {
      title: title.trim(),
      description: description.trim() || undefined,
      asignaciones: asignaciones,
      sections: base.sections,
      tasks: base.tasks,
    });

    // Limpiar y cerrar
    setIsProjectModalOpen(false);
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
 feature/cargar-checklist
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">Dirección</h1>
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

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* --- TÍTULO PRINCIPAL --- */}
        <div className="flex flex-col items-center justify-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 text-center">
            Dirección - Gestión de Proyectos
          </h1>
          <p className="text-gray-500 text-center"></p>
        </div>

        {/* LAYOUT PRINCIPAL: FLEXIBLE */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* --- IZQUIERDA: BARRA LATERAL DE ACCIONES --- */}
          <aside className="w-full md:w-64 shrink-0 space-y-4">
            {/* Tarjeta de Acciones Principales */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Acciones</CardTitle>
                <CardDescription>Gestión rápida</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {canCreate && (
                  <Button
                    onClick={openCreateModal}
                    className="w-full justify-start font-medium"
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Nuevo Proyecto
                  </Button>
                )}

                <Button
                  onClick={() => setIsQuoteOpen(true)}
                  variant="secondary"
                  className="w-full justify-start"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Cotización
                </Button>

                {canRegister && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/register")}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrar Usuario
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* --- DERECHA: CONTENIDO PRINCIPAL (GRID) --- */}
          <main className="flex-1">
            {/* Grid de proyectos */}
            <div className="grid grid-cols-3 lg:grid-cols-3 gap-3">
              {projects.map((p) => (
                <Card
                  key={p.id}
                  className="relative flex flex-col justify-between min-h-[200px] group hover:shadow-lg transition-all duration-300 border-gray-200"
                >
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-2">
                      {p.title}
                    </h3>
                    {p.description ? (
                      <p className="text-sm text-gray-500 line-clamp-2 px-2">
                        {p.description}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        Sin descripción
                      </p>
                    )}
                  </div>

                  {/* --- BOTÓN INFERIOR: VER DETALLES (Solo lectura) --- */}
                  <div className="w-full border-t border-gray-100">
                    <Link href={`/direccion/${p.id}`}>
                      <Button
                        variant="ghost"
                        className="w-full h-auto py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors rounded-none rounded-b-xl"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}

              {/* Estado vacío con diseño amigable */}
              {projects.length === 0 && (
                <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                  <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                    <LayoutDashboard className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    No hay proyectos
                  </h3>
                  <p className="text-gray-500 max-w-sm mt-1 mb-4">
                    Comienza creando un nuevo proyecto desde el menú lateral.
                  </p>
                  <Button variant="outline" onClick={openCreateModal}>
                    Crear mi primer proyecto
                  </Button>
                </div>
              )}
            </div>
          </main>

        </div>

        {/* --- MODALES (Fuera del layout para evitar z-index issues) --- */}

        {/* Modal: Crear Proyecto */}
        <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo Proyecto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Título del Proyecto
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Casa Gómez - Remodelación"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Descripción (opcional)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles clave del proyecto..."
                  rows={3}
                />
              </div>

              {/* Selector de Integrantes y Áreas */}
              <div className="pt-2">
                <label className="block text-sm font-medium mb-1">
                  Asignar Equipo
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Selecciona áreas completas o usuarios específicos.
                </p>

                <div className="max-h-52 overflow-y-auto border rounded-md bg-gray-50/50">
                  {allAreas.map((area) => {
                    const areaSeleccionada = asignaciones.some(
                      (a) => a.tipo === "area" && a.id === area
                    );
                    const usuariosDelArea = allUsers.filter(
                      (u) => u.role === area
                    );

                    return (
                      <div
                        key={area}
                        className="border-b last:border-b-0 bg-white"
                      >
                        <div className="flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors">
                          <label className="flex items-center gap-3 text-sm font-medium grow cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                            <span className="capitalize">Área: {area}</span>
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setAreaAbierta(areaAbierta === area ? null : area)
                            }
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                          >
                            {areaAbierta === area ? "Ocultar" : "Ver usuarios"}
                          </button>
                        </div>

                        {areaAbierta === area && (
                          <div className="pl-9 pr-3 pb-2 bg-gray-50/50 border-t border-dashed">
                            {usuariosDelArea.map((u) => {
                              const usuarioSeleccionado = asignaciones.some(
                                (a) => a.tipo === "usuario" && a.id === u.id
                              );

                              return (
                                <label
                                  key={u.id}
                                  className="flex items-center gap-2 py-2 text-sm hover:text-blue-600 cursor-pointer select-none"
                                >
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                              <span className="block py-2 text-xs text-gray-400 italic">
                                No hay usuarios registrados en esta área.
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsProjectModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveProject} disabled={!title.trim()}>
                  Crear Proyecto
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <Input
                  value={quoteTitle}
                  onChange={(e) => setQuoteTitle(e.target.value)}
                  placeholder="Ej. Presupuesto Inicial"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cliente
                </label>
                <Input
                  value={quoteClient}
                  onChange={(e) => setQuoteClient(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Importe Total
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1.5 text-gray-500">
                    $
                  </span>
                  <Input
                    className="pl-7"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    placeholder="0.00"
                    type="number"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
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
                  Generar PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
