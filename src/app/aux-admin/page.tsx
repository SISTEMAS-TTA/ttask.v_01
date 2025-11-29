"use client";

import { useEffect, useState } from "react";
import { AuthWrapper } from "@/modules/auth/components/AuhWrapper";
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
  updateProject, // <--- IMPORTANTE: Importamos la nueva función
  subscribeToProjectsForUser,
} from "@/lib/firebase/projects";
import { ALL_USER_ROLES } from "@/modules/types"; // Importamos los roles maestros

// ... (Misma función buildTemplate de antes) ...
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
    // ... (Tus tareas predeterminadas, puedes dejarlas vacías o copiarlas de tu archivo anterior)
  ];
  return { sections, tasks };
}

// Hook para obtener proyectos
function useProjects(userId?: string, role?: UserRole) {
    const [projects, setProjects] = useState<ProjectDoc[]>([]);
  useEffect(() => {
    if (!userId || !role) return;
    const unsub = subscribeToProjectsForUser(userId, role, setProjects);
    return () => unsub();
  }, [userId, role]);
  return { projects } as const;
}

export default function AuxAdminPage() {
  const { user, profile } = useUser();
  const { projects } = useProjects(user?.uid, profile?.role);
  
  // Estados del Modal y Datos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectDoc | null>(null); // <--- Nuevo estado para saber si editamos

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Estados para la selección múltiple (Igual que en ProjectsPage)
  const [allAreas, setAllAreas] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<
    Array<{ id: string; name: string; role: string }>
  >([]);
  
  type Asignacion = { tipo: "area"; id: string } | { tipo: "usuario"; id: string };
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [areaAbierta, setAreaAbierta] = useState<string | null>(null);

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
        setAllAreas(ALL_USER_ROLES as unknown as string[]);
      } catch (e) {
        console.warn("Error cargando usuarios", e);
      }
    })();
  }, []);

  // Función para abrir el modal en modo CREAR
  const openCreateModal = () => {
    setEditingProject(null);
    setTitle("");
    setDescription("");
    setAsignaciones([]);
    setIsModalOpen(true);
  };

  // Función para abrir el modal en modo EDITAR 
  const openEditModal = (project: ProjectDoc) => {
    console.log("Editando proyecto:", project.title);
    console.log("Asignaciones guardadas en DB:", project.asignaciones);
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description || "");
    // Cargamos las asignaciones existentes del proyecto
    setAsignaciones((project.asignaciones as Asignacion[]) || []); 
    setIsModalOpen(true);
  };

  // Acción de Guardar (Crear o Editar)
  const handleSave = async () => {
    if (!user) return;

    if (editingProject) {
      // --- MODO EDITAR ---
      await updateProject(editingProject.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        asignaciones: asignaciones,
        sections: editingProject.sections, // Mantenemos lo que ya tenía
        tasks: editingProject.tasks,       // Mantenemos lo que ya tenía
      });
    } else {
      // --- MODO CREAR ---
      const base = buildTemplate();
      await createProject(user.uid, {
        title: title.trim(),
        description: description.trim() || undefined,
        asignaciones: asignaciones,
        sections: base.sections,
        tasks: base.tasks,
      });
    }

    setIsModalOpen(false);
    setEditingProject(null);
    setTitle("");
    setDescription("");
    setAsignaciones([]);
  };

  const canAccess =
    profile?.role === "Director" ||
    profile?.role === "Aux. Admin";

  if (!canAccess) {
    return <div className="p-8">No tienes permiso para ver esta sección.</div>;
  }

  return (
    <AuthWrapper>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Administración de Proyectos
          </h1>
          <div className="flex gap-2">
            <Button variant="secondary">Cotización (simulado)</Button>
            <Button onClick={openCreateModal}>Nuevo Proyecto</Button>
          </div>
        </div>

        {/* LISTA DE PROYECTOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Card key={p.id} className="p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-1">{p.title}</h3>
                {p.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>
                )}
              </div>
              
              {/* --- AQUÍ AGREGAMOS EL BOTÓN DE EDITAR --- */}
              <div className="flex items-center justify-end gap-3 mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => openEditModal(p)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Editar
                </Button>
                
                <Link
                  href={`/projects/${p.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Ver
                </Link>
              </div>
            </Card>
          ))}
          {projects.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-10">
              No hay proyectos creados aún.
            </p>
          )}
        </div>

        {/* MODAL (CREAR / EDITAR) */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Editar Proyecto" : "Nuevo Proyecto"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Casa Gómez"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles del proyecto..."
                />
              </div>

              {/* LISTA DE INTEGRANTES Y ÁREAS (Lógica Reutilizada) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Integrantes y Áreas
                </label>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  {allAreas.map((area) => {
                    const areaSeleccionada = asignaciones.some(
                      (a) => a.tipo === "area" && a.id === area
                    );
                    const usuariosDelArea = allUsers.filter((u) => u.role === area);

                    return (
                      <div key={area} className="border-b last:border-b-0">
                        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100">
                          <label className="flex items-center gap-2 text-sm font-medium flex-grow cursor-pointer">
                            <input
                              type="checkbox"
                              checked={areaSeleccionada}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setAsignaciones((prev) => {
                                  const filtrados = prev.filter(
                                    (a) =>
                                      !(a.tipo === "area" && a.id === area) &&
                                      !(a.tipo === "usuario" && usuariosDelArea.some(u => u.id === a.id))
                                  );
                                  if (checked) return [...filtrados, { tipo: "area", id: area }];
                                  return filtrados;
                                });
                              }}
                              className="rounded border-gray-300"
                            />
                            {area}
                          </label>
                          <button
                            type="button"
                            onClick={() => setAreaAbierta(areaAbierta === area ? null : area)}
                            className="text-xs text-blue-600 hover:underline px-2 py-1"
                          >
                            {areaAbierta === area ? "Ocultar" : "Ver usuarios"}
                          </button>
                        </div>

                        {areaAbierta === area && (
                          <div className="pl-8 bg-white border-t border-gray-100">
                            {usuariosDelArea.map((user) => {
                              const usuarioSeleccionado = asignaciones.some(
                                (a) => a.tipo === "usuario" && a.id === user.id
                              );
                              return (
                                <label key={user.id} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    disabled={areaSeleccionada}
                                    checked={usuarioSeleccionado || areaSeleccionada}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setAsignaciones((prev) => {
                                        const filtrados = prev.filter(a => !(a.tipo === "usuario" && a.id === user.id));
                                        if (checked) return [...filtrados, { tipo: "usuario", id: user.id }];
                                        return filtrados;
                                      });
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                  {user.name}
                                </label>
                              );
                            })}
                            {usuariosDelArea.length === 0 && (
                              <p className="px-3 py-2 text-xs text-gray-400 italic">No hay usuarios en esta área</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!title.trim()}>
                  {editingProject ? "Guardar Cambios" : "Crear Proyecto"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthWrapper>
  );
}