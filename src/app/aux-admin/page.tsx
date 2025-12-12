"use client";

import { useEffect, useState, useMemo } from "react";
import AuthGuard from "@/components/AuthGuard";
import useUser from "@/modules/auth/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  ProjectDoc,
  UserRole,
  ProjectSection,
  ProjectTask,
} from "@/modules/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { listAllUsers } from "@/lib/firebase/firestore";
import {
  createProject,
  updateProject,
  subscribeToProjectsForUser,
  deleteProject,
} from "@/lib/firebase/projects";
import { useRouter } from "next/navigation";
import {
  Loader2,
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  Plus,
  UserPlus,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";

type Asignacion =
  | { tipo: "area"; id: string }
  | { tipo: "usuario"; id: string };

function useProjects(userId?: string, role?: UserRole) {
  const [projects, setProjects] = useState<ProjectDoc[]>([]);

  useEffect(() => {
    if (!userId || !role) return;
    const unsub = subscribeToProjectsForUser(userId, role, setProjects);
    return () => unsub();
  }, [userId, role]);

  return { projects, setProjects } as const;
}

function buildTemplate() {
  const sections = [
    { id: "sec-arq", title: "Proyecto Arquitectónico", order: 1 },
    { id: "sec-eje", title: "Proyecto Ejecutivo Arquitectónico", order: 2 },
    { id: "sec-est", title: "Diseño Estructural", order: 3 },
    { id: "sec-ing", title: "Ingenierías", order: 4 },
    { id: "sec-esp", title: "Instalaciones Especiales", order: 5 },
    { id: "sec-tab", title: "Tablaroca", order: 6 },
  ];

  const tasks = [
    // --- PROYECTO ARQUITECTÓNICO ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "Planta de conjunto",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "Plantas arquitectónicas",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "Fachadas arquitectónicas",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "Secciones longitudinales",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "Secciones transversales",
      completed: false,
      favorite: false,
      order: 500,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "Visualización digital (Vista exterior e interior)",
      completed: false,
      favorite: false,
      order: 600,
    },

    // --- PROYECTO EJECUTIVO ARQUITECTÓNICO ---
    // Información Constructiva
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "Detalles de cancelería",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "Detalles de carpintería",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "Detalles de herrería",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "Detalles constructivos arquitectónicos",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "Plano de albañilería",
      completed: false,
      favorite: false,
      order: 500,
    },
    // Acabados
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "Plano de referencias de acabados",
      completed: false,
      favorite: false,
      order: 600,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "Plantas de acabados",
      completed: false,
      favorite: false,
      order: 700,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "Despiece de pisos y lambrines",
      completed: false,
      favorite: false,
      order: 800,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "Accesorios y equipos (incluye detalles)",
      completed: false,
      favorite: false,
      order: 900,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "Plano de mármol",
      completed: false,
      favorite: false,
      order: 1000,
    },

    // --- DISEÑO ESTRUCTURAL ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "Planos de especificaciones generales",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "Planta estructural de cimentación",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "Plantas estructuradas de losas por nivel",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "Secciones estructurales de refuerzo",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "Secciones esquemáticas de niveles",
      completed: false,
      favorite: false,
      order: 500,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "Memoria de cálculo",
      completed: false,
      favorite: false,
      order: 600,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "Mecánica de suelos",
      completed: false,
      favorite: false,
      order: 700,
    },

    // --- INGENIERÍAS ---
    // Hidráulica
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Hidráulica: Acometida general, cisterna y líneas",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Hidráulica: Instalación de líneas por nivel",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Hidráulica: Isométricos generales",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Hidráulica: Especificaciones y detalles",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Hidráulica: Memoria descriptiva",
      completed: false,
      favorite: false,
      order: 500,
    },
    // Sanitaria
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Sanitaria: Descargas generales y drenajes",
      completed: false,
      favorite: false,
      order: 600,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Sanitaria: Sistema de captación pluvial",
      completed: false,
      favorite: false,
      order: 700,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Sanitaria: Plantas e isométricos de instalación",
      completed: false,
      favorite: false,
      order: 800,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Sanitaria: Especificaciones y detalles",
      completed: false,
      favorite: false,
      order: 900,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Sanitaria: Memoria descriptiva",
      completed: false,
      favorite: false,
      order: 1000,
    },
    // Gas
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Gas: Diseño de red de conducción",
      completed: false,
      favorite: false,
      order: 1100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Gas: Líneas de alimentación",
      completed: false,
      favorite: false,
      order: 1200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Gas: Equipos de consumo",
      completed: false,
      favorite: false,
      order: 1300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Gas: Conjunto de abastecimiento",
      completed: false,
      favorite: false,
      order: 1400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Gas: Memoria descriptiva",
      completed: false,
      favorite: false,
      order: 1500,
    },
    // Eléctrica
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Eléctrica: Iluminación por nivel",
      completed: false,
      favorite: false,
      order: 1600,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Eléctrica: Contactos por nivel",
      completed: false,
      favorite: false,
      order: 1700,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Eléctrica: Diagrama unifilar",
      completed: false,
      favorite: false,
      order: 1800,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Eléctrica: Cuadros y resúmenes de cargas",
      completed: false,
      favorite: false,
      order: 1900,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Eléctrica: Especificaciones y detalles",
      completed: false,
      favorite: false,
      order: 2000,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "Eléctrica: Memoria descriptiva",
      completed: false,
      favorite: false,
      order: 2100,
    },

    // --- INSTALACIONES ESPECIALES ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "Domótica",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "Aire acondicionado",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "Voz y datos",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "Sistema de riego",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "CCTV",
      completed: false,
      favorite: false,
      order: 500,
    },

    // --- TABLAROCA ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-tab",
      title: "Plano de plafones",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-tab",
      title: "Plano muros de tablaroca",
      completed: false,
      favorite: false,
      order: 200,
    },
  ];

  return { sections, tasks };
}

export default function AuxAdminPage() {
  const { user, profile, loading: userLoading } = useUser();
  const { projects, setProjects } = useProjects(user?.uid, profile?.role);
  const router = useRouter();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [isMobile, setIsMobile] = useState(false);

  // Estados del modal de proyecto
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectDoc | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);

  // Estados para eliminación
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para cotización
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteTitle, setQuoteTitle] = useState("");
  const [quoteClient, setQuoteClient] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");

  // Estados para áreas y usuarios
  const [allAreas, setAllAreas] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<
    Array<{ id: string; name: string; role: string }>
  >([]);
  const [areaAbierta, setAreaAbierta] = useState<string | null>(null);

  // Detectar móvil
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

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

  // Seleccionar primer proyecto en desktop
  useEffect(() => {
    if (!isMobile && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, isMobile, selectedProjectId]);

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  const canAccess =
    profile?.role === "Director" ||
    profile?.role === "Administrador" ||
    profile?.role === "Aux. Admin";

  // Funciones para modales
  const openCreateModal = () => {
    setEditingProject(null);
    setTitle("");
    setDescription("");
    setAsignaciones([]);
    setIsProjectModalOpen(true);
  };

  const openEditModal = (project: ProjectDoc) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description || "");
    setAsignaciones((project.asignaciones as Asignacion[]) || []);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!user || !title.trim()) return;

    if (editingProject) {
      await updateProject(editingProject.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        asignaciones: asignaciones,
        sections: editingProject.sections,
        tasks: editingProject.tasks,
      });
    } else {
      const base = buildTemplate();
      await createProject(user.uid, {
        title: title.trim(),
        description: description.trim() || undefined,
        asignaciones: asignaciones,
        sections: base.sections,
        tasks: base.tasks,
      });
    }

    setIsProjectModalOpen(false);
    setEditingProject(null);
    setTitle("");
    setDescription("");
    setAsignaciones([]);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProject(projectToDelete);
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete));
      if (selectedProjectId === projectToDelete) {
        setSelectedProjectId(null);
      }
      setProjectToDelete(null);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al eliminar el proyecto");
    } finally {
      setIsDeleting(false);
    }
  };

  if (userLoading) {
    return (
      <AuthGuard>
        <div className="min-h-[60vh] flex items-center justify-center">
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

  // Componente de lista de proyectos
  const ProjectsList = () => (
    <>
      <div className="p-3 border-b bg-white">
        <h2 className="text-sm font-medium text-gray-700">Proyectos</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No hay proyectos creados
          </div>
        ) : (
          <div className="divide-y">
            {projects.map((project) => {
              const isSelected = selectedProjectId === project.id;
              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`w-full text-left p-3 hover:bg-gray-100 transition-colors ${
                    isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen
                        className={`h-4 w-4 flex-shrink-0 ${
                          isSelected ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium truncate ${
                          isSelected ? "text-blue-700" : "text-gray-800"
                        }`}
                      >
                        {project.title}
                      </span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 flex-shrink-0 ${
                        isSelected ? "text-blue-500" : "text-gray-300"
                      }`}
                    />
                  </div>
                  {project.description && (
                    <p className="text-xs text-gray-500 mt-1 truncate pl-6">
                      {project.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  // Componente de detalle del proyecto
  const ProjectDetail = () => (
    <>
      {selectedProject ? (
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedProject.title}
              </h2>
              {selectedProject.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {selectedProject.description}
                </p>
              )}
            </div>

            <Card className="p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Opciones del Proyecto
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={() => openEditModal(selectedProject)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Actualizar Proyecto
                </Button>
                <Button
                  onClick={() => setProjectToDelete(selectedProject.id)}
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Proyecto
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Selecciona un proyecto</p>
            <p className="text-sm text-gray-400 mt-1">para ver sus opciones</p>
          </div>
        </div>
      )}
    </>
  );

  // VISTA MÓVIL
  if (isMobile) {
    return (
      <AuthGuard>
        <div className="h-screen flex flex-col bg-gray-50">
          <div className="px-4 py-3 border-b bg-white flex-shrink-0">
            <h1 className="text-xl font-semibold text-gray-900">
              {profile?.role === "Director" ? "Director" : "Aux. Admin"}
            </h1>
            <p className="text-sm text-gray-500">
              {projects.length} proyecto{projects.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="px-4 py-3 bg-white border-b flex gap-2 flex-shrink-0">
            <Button onClick={openCreateModal} size="sm" className="flex-1">
              <Plus className="mr-1 h-4 w-4" />
              Nuevo Proyecto
            </Button>
            <Button
              onClick={() => router.push("/register")}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <UserPlus className="mr-1 h-4 w-4" />
              Registrar Usuario
            </Button>
          </div>

          <div
            className={`flex-1 overflow-hidden transition-transform duration-300 ${
              selectedProjectId ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            <div className="h-full flex flex-col bg-white border-r">
              <ProjectsList />
            </div>
          </div>

          <div
            className={`absolute inset-0 bg-white transition-transform duration-300 ${
              selectedProjectId ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-3 px-4 py-3 border-b bg-white flex-shrink-0">
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold truncate">
                  {selectedProject?.title || "Detalle"}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                <ProjectDetail />
              </div>

              <button
                onClick={() => setSelectedProjectId(null)}
                className="fixed bottom-6 left-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 z-50"
                aria-label="Volver a la lista"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // VISTA DESKTOP
  return (
    <AuthGuard>
      <div className="h-[calc(100vh-5rem)] flex flex-col">
        <div className="px-4 py-5 border-b bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {profile?.role === "Director" ? "Director" : "Aux. Admin"}
              </h1>
              <p className="text-sm text-gray-500">
                {projects.length} proyecto{projects.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={openCreateModal} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Proyecto
              </Button>
              <Button
                onClick={() => router.push("/register")}
                size="sm"
                variant="outline"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Registrar Usuario
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-72 lg:w-80 border-r bg-gray-50 flex flex-col overflow-hidden">
            <ProjectsList />
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            <ProjectDetail />
          </div>
        </div>
      </div>

      {/* Modal de Proyecto */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Editar Proyecto" : "Nuevo Proyecto"}
            </DialogTitle>
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
                      <div className="flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-gray-50">
                        <label className="flex items-center gap-3 text-sm font-medium flex-grow cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                            checked={areaSeleccionada}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setAsignaciones((prev) => {
                                const filtrados = prev.filter(
                                  (a) =>
                                    !(a.tipo === "area" && a.id === area) &&
                                    !(
                                      a.tipo === "usuario" &&
                                      usuariosDelArea.some((u) => u.id === a.id)
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
                                className="flex items-center gap-2 py-2 text-sm hover:text-blue-600 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
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

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsProjectModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveProject} disabled={!title.trim()}>
                {editingProject ? "Guardar Cambios" : "Crear Proyecto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Cotización */}
      <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Cotización</DialogTitle>
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
              <label className="block text-sm font-medium mb-1">Cliente</label>
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
                <span className="absolute left-3 top-1.5 text-gray-500">$</span>
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
                    `Cotización creada:\n${quoteTitle}\n${quoteClient}\n$${quoteAmount}`
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

      {/* Alert de Eliminación */}
      <AlertDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. Se eliminará el proyecto y todo su
              contenido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthGuard>
  );
}
