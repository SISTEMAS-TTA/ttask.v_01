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

  return (
    <AuthGuard>
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

        {/* Registrar redirige a la página de registro centralizada */}

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
