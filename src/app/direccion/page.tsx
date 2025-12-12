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
  ProjectRole,
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
  updateProjectAssignments,
} from "@/lib/firebase/projects";
import { useRouter } from "next/navigation";

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

export default function DirectorPage() {
  const { user, profile } = useUser();
  const { projects } = useProjects(user?.uid, profile?.role);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Nuevos estados para manejar áreas, usuarios y la selección
  const [allAreas, setAllAreas] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<
    Array<{ id: string; name: string; role: string }>
  >([]);
  type Asignacion =
    | { tipo: "area"; id: string }
    | { tipo: "usuario"; id: string };
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);

  // Nuevo estado para controlar qué área está expandida (el acordeón)
  const [areaAbierta, setAreaAbierta] = useState<string | null>(null);
  // --- FIN Bloque 1 ---

  // --- INICIO Bloque 2: Carga de Datos ---
  useEffect(() => {
    // Cargar TODOS los usuarios y TODAS las áreas
    (async () => {
      try {
        // 1. listAllUsers() ya nos da todos los usuarios
        const users = await listAllUsers();

        // 2. Guardamos todos los usuarios formateados (no solo 'Diseno')
        const formattedUsers = users.map((u) => ({
          id: u.id,
          name: u.fullName || `${u.firstName} ${u.lastName}`.trim() || u.email,
          role: u.role, // Guardamos el rol para poder agruparlos
        }));
        setAllUsers(formattedUsers);

        // 3. Creamos una lista única de todas las "Areas" (roles)
        // Usamos Set para eliminar duplicados
        const areas = [...new Set(users.map((u) => u.role))].filter(Boolean); // filter(Boolean) elimina roles vacíos
        setAllAreas(areas);
      } catch (e) {
        console.warn("No se pudieron cargar usuarios o areas", e);
      }
    })();
  }, []);
  // --- FIN Bloque 2 ---

  const canCreate = profile?.role === "Director";
  const canRegister =
    profile?.role === "Director" || profile?.role === "Administrador";

  const visible = projects; // ya vienen filtrados por la suscripción
  // Estados para cotización simulada
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteTitle, setQuoteTitle] = useState("");
  const [quoteClient, setQuoteClient] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");

  // Estados para editar proyecto
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectDoc | null>(null);
  const [editAsignaciones, setEditAsignaciones] = useState<Asignacion[]>([]);
  const [editAreaAbierta, setEditAreaAbierta] = useState<string | null>(null);

  const router = useRouter();

  // --- INICIO Bloque 3: Función de Guardar ---
  const createProjectAction = async () => {
    if (!user) return;
    const base = buildTemplate();
    await createProject(user.uid, {
      title: title.trim(),
      description: description.trim() || undefined,

      // members, // BORRADO
      // rolesAllowed: ["Diseno"], // BORRADO
      asignaciones: asignaciones, // NUEVO: Pasamos nuestro nuevo array

      sections: base.sections,
      tasks: base.tasks,
    });
    setIsCreating(false);
    setTitle("");
    setDescription("");
    // setMembers([]); // BORRADO
    setAsignaciones([]); // NUEVO: Limpiamos el nuevo estado
  };
  // --- FIN Bloque 3 ---

  // --- Funciones para editar proyecto ---
  const openEditModal = (project: ProjectDoc) => {
    setEditingProject(project);
    // Reconstruir asignaciones desde rolesAllowed y members
    const asig: Asignacion[] = [];
    // Agregar áreas (roles)
    project.rolesAllowed.forEach((role) => {
      asig.push({ tipo: "area", id: role });
    });
    // Agregar usuarios individuales que no pertenezcan a un área ya asignada
    project.members.forEach((memberId) => {
      const memberUser = allUsers.find((u) => u.id === memberId);
      if (memberUser && !project.rolesAllowed.includes(memberUser.role as ProjectRole)) {
        asig.push({ tipo: "usuario", id: memberId });
      }
    });
    setEditAsignaciones(asig);
    setIsEditing(true);
  };

  const saveEditedProject = async () => {
    if (!editingProject) return;
    await updateProjectAssignments(editingProject.id, editAsignaciones);
    setIsEditing(false);
    setEditingProject(null);
    setEditAsignaciones([]);
    setEditAreaAbierta(null);
  };
  // --- FIN Funciones para editar proyecto ---

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">Panel de Dirección</h1>
        </div>

        {/* Acciones rápidas en formato lista horizontal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card 
            className="p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-amber-500"
            onClick={() => setIsQuoteOpen(true)}
          >
            <div className="flex flex-col">
              <h3 className="font-medium text-gray-900">Cotización</h3>
              <p className="text-sm text-gray-500">Crear nueva cotización</p>
            </div>
          </Card>

          {canRegister && (
            <Card 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-green-500"
              onClick={() => router.push("/register")}
            >
              <div className="flex flex-col">
                <h3 className="font-medium text-gray-900">Registrar Usuario</h3>
                <p className="text-sm text-gray-500">Agregar nuevo usuario al sistema</p>
              </div>
            </Card>
          )}

          {canCreate && (
            <Card 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
              onClick={() => setIsCreating(true)}
            >
              <div className="flex flex-col">
                <h3 className="font-medium text-gray-900">Nuevo Proyecto</h3>
                <p className="text-sm text-gray-500">Iniciar un proyecto nuevo</p>
              </div>
            </Card>
          )}
        </div>

        {/* Título de sección de proyectos */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <h2 className="text-xl font-semibold text-gray-800">Mis Proyectos</h2>
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
              {/* --- INICIO Bloque 4: Interfaz de Integrantes --- */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Integrantes y Áreas
                </label>

                <div className="max-h-60 overflow-y-auto border rounded">
                  {allAreas.map((area) => {
                    // Comprobamos si el ÁREA ENTERA está seleccionada
                    const areaSeleccionada = asignaciones.some(
                      (a) => a.tipo === "area" && a.id === area
                    );

                    // Obtenemos los usuarios que pertenecen a esta área
                    const usuariosDelArea = allUsers.filter(
                      (u) => u.role === area
                    );

                    return (
                      <div key={area} className="border-b last:border-b-0">
                        {/* Fila del Área (para seleccionar TODA el área) */}
                        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100">
                          <label className="flex items-center gap-2 text-sm font-medium flex-grow">
                            <input
                              type="checkbox"
                              checked={areaSeleccionada}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setAsignaciones((prev) => {
                                  // Primero, quitamos esta área y todos sus usuarios individuales
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
                                  // Si se marcó, agregamos el área
                                  if (checked) {
                                    return [
                                      ...filtrados,
                                      { tipo: "area", id: area },
                                    ];
                                  }
                                  // Si se desmarcó, solo devolvemos los filtrados
                                  return filtrados;
                                });
                              }}
                            />
                            Toda el área: {area}
                          </label>

                          {/* Botón para expandir/colapsar y ver usuarios */}
                          <button
                            type="button"
                            onClick={() =>
                              setAreaAbierta(areaAbierta === area ? null : area)
                            }
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {areaAbierta === area ? "Ocultar" : "Ver"}
                          </button>
                        </div>

                        {/* Lista de Usuarios (si está expandida) */}
                        {areaAbierta === area && (
                          <div className="pl-6 bg-white">
                            {usuariosDelArea.map((user) => {
                              const usuarioSeleccionado = asignaciones.some(
                                (a) => a.tipo === "usuario" && a.id === user.id
                              );

                              return (
                                <label
                                  key={user.id}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                                >
                                  <input
                                    type="checkbox"
                                    // Deshabilitado si el área entera ya está seleccionada
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
                                              a.id === user.id
                                            )
                                        );
                                        if (checked) {
                                          return [
                                            ...filtrados,
                                            { tipo: "usuario", id: user.id },
                                          ];
                                        }
                                        return filtrados;
                                      });
                                    }}
                                  />
                                  {user.name}
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
              {/* --- FIN Bloque 4 --- */}
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
                    // Simulación: mostramos alerta y cerramos modal
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

        {/* Modal: Editar Proyecto */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Editar integrantes: {editingProject?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Integrantes y Áreas
                </label>

                <div className="max-h-60 overflow-y-auto border rounded">
                  {allAreas.map((area) => {
                    const areaSeleccionada = editAsignaciones.some(
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
                                setEditAsignaciones((prev) => {
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
                            Toda el área: {area}
                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              setEditAreaAbierta(
                                editAreaAbierta === area ? null : area
                              )
                            }
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {editAreaAbierta === area ? "Ocultar" : "Ver"}
                          </button>
                        </div>

                        {editAreaAbierta === area && (
                          <div className="pl-6 bg-white">
                            {usuariosDelArea.map((user) => {
                              const usuarioSeleccionado = editAsignaciones.some(
                                (a) => a.tipo === "usuario" && a.id === user.id
                              );

                              return (
                                <label
                                  key={user.id}
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
                                      setEditAsignaciones((prev) => {
                                        const filtrados = prev.filter(
                                          (a) =>
                                            !(
                                              a.tipo === "usuario" &&
                                              a.id === user.id
                                            )
                                        );
                                        if (checked) {
                                          return [
                                            ...filtrados,
                                            { tipo: "usuario", id: user.id },
                                          ];
                                        }
                                        return filtrados;
                                      });
                                    }}
                                  />
                                  {user.name}
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
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingProject(null);
                    setEditAsignaciones([]);
                    setEditAreaAbierta(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={saveEditedProject}>Guardar cambios</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Grid de proyectos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {visible.map((p) => {
            // Calcular progreso del proyecto
            const tasks = p.tasks || [];
            const effective = tasks.filter((t) => !t.na);
            const progress = effective.length
              ? Math.round(
                  (effective.filter((t) => t.completed).length /
                    effective.length) *
                    100
                )
              : 0;

            return (
              <Card key={p.id} className="p-4 space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900">{p.title}</h3>
                  {p.description && (
                    <p className="text-sm text-gray-500">{p.description}</p>
                  )}
                </div>

                {/* Barra de progreso */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Avance</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        progress === 100
                          ? "bg-green-500"
                          : progress > 50
                          ? "bg-blue-500"
                          : progress > 0
                          ? "bg-amber-500"
                          : "bg-gray-300"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Áreas asignadas */}
                {p.rolesAllowed.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.rolesAllowed.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2 border-t">
                  <Link
                    href={`/projects/${p.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver detalles
                  </Link>
                  {canCreate && (
                    <button
                      onClick={() => openEditModal(p)}
                      className="text-gray-600 hover:underline text-sm ml-auto"
                    >
                      Editar integrantes
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
          {visible.length === 0 && (
            <p className="text-sm text-gray-600 col-span-full">
              No hay proyectos disponibles.
            </p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
