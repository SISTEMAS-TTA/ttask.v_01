"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import useUser from "@/modules/auth/hooks/useUser";
import { Card } from "@/components/ui/card";
import type { ProjectDoc, UserRole, ProjectTask } from "@/modules/types";
import { subscribeToProjectsByRole } from "@/lib/firebase/projects";
import {
  Loader2,
  FolderOpen,
  Circle,
  Star,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

interface AreaProjectsPageProps {
  areaRole: UserRole;
  areaName: string;
}

export default function AreaProjectsPage({
  areaRole,
  areaName,
}: AreaProjectsPageProps) {
  const { user, profile, loading: userLoading } = useUser();
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil (portrait)
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsub = subscribeToProjectsByRole(
      areaRole,
      (projs) => {
        setProjects(projs);
        setLoading(false);
        // En desktop, seleccionar el primer proyecto automáticamente
        if (!isMobile) {
          setSelectedProjectId((current) => {
            if (projs.length > 0 && !current) {
              return projs[0].id;
            }
            return current;
          });
        }
      },
      (err) => {
        console.error("Error al cargar proyectos:", err);
        setError("Error al cargar los proyectos. Intenta recargar la página.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user, areaRole, isMobile]);

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Calcular progreso del proyecto seleccionado
  const progress = useMemo(() => {
    if (!selectedProject) return 0;
    const tasks = selectedProject.tasks || [];
    const effective = tasks.filter((t) => !t.na);
    if (!effective.length) return 0;
    const done = effective.filter((t) => t.completed).length;
    return Math.round((done / effective.length) * 100);
  }, [selectedProject]);

  // Agrupar tareas por sección
  const sections = useMemo(
    () =>
      selectedProject?.sections
        ?.slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) || [],
    [selectedProject]
  );

  const tasksBySection = useMemo(() => {
    const map: Record<string, ProjectTask[]> = {};
    (selectedProject?.tasks || []).forEach((t) => {
      map[t.sectionId] ||= [];
      map[t.sectionId].push(t);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    );
    return map;
  }, [selectedProject]);

  // Funciones para modificar tareas
  const toggleCompleted = async (taskId: string) => {
    if (!selectedProject) return;
    const updated = selectedProject.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProject.id ? { ...p, tasks: updated } : p
      )
    );
    await updateDoc(doc(db, "projects", selectedProject.id), {
      tasks: updated,
    });
  };

  const toggleNA = async (taskId: string) => {
    if (!selectedProject) return;
    const updated = selectedProject.tasks.map((t) =>
      t.id === taskId
        ? { ...t, na: !t.na, completed: t.na ? t.completed : false }
        : t
    );
    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProject.id ? { ...p, tasks: updated } : p
      )
    );
    await updateDoc(doc(db, "projects", selectedProject.id), {
      tasks: updated,
    });
  };

  const toggleFavorite = async (taskId: string) => {
    if (!selectedProject) return;
    const updated = selectedProject.tasks.map((t) =>
      t.id === taskId ? { ...t, favorite: !t.favorite } : t
    );
    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProject.id ? { ...p, tasks: updated } : p
      )
    );
    await updateDoc(doc(db, "projects", selectedProject.id), {
      tasks: updated,
    });
  };

  // Calcular progreso individual de cada proyecto para la lista
  const getProjectProgress = (project: ProjectDoc) => {
    const tasks = project.tasks || [];
    const effective = tasks.filter((t) => !t.na);
    if (!effective.length) return 0;
    const done = effective.filter((t) => t.completed).length;
    return Math.round((done / effective.length) * 100);
  };

  const canAccess =
    profile?.role === areaRole ||
    profile?.role === "Director" ||
    profile?.role === "Administrador" ||
    profile?.role === "Aux. Admin";

  if (userLoading || loading) {
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

  // Componente de lista de proyectos (reutilizable)
  const ProjectsList = () => (
    <>
      <div className="p-3 border-b bg-white">
        <h2 className="text-sm font-medium text-gray-700">Proyectos</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No hay proyectos asignados
          </div>
        ) : (
          <div className="divide-y">
            {projects.map((project) => {
              const projectProgress = getProjectProgress(project);
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
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          projectProgress === 100
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${projectProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">
                      {projectProgress}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  // Componente de detalle del proyecto (reutilizable)
  const ProjectDetail = () => (
    <>
      {selectedProject ? (
        <div className="p-4 md:p-6 space-y-4">
          {/* Encabezado del proyecto */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Avance
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {progress}%
                </div>
              </div>
              <div className="w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={progress === 100 ? "#22c55e" : "#3b82f6"}
                    strokeWidth="3"
                    strokeDasharray={`${progress}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Checklist por secciones */}
          <div className="space-y-4">
            {sections.map((sec) => (
              <Card key={sec.id} className="p-4">
                <h3 className="text-base font-medium text-gray-800 mb-3 pb-2 border-b">
                  {sec.title}
                </h3>
                <ul className="space-y-2">
                  {(tasksBySection[sec.id] || []).map((t) => (
                    <li
                      key={t.id}
                      className={`flex items-center justify-between rounded-md border p-2.5 transition-colors ${
                        t.na
                          ? "bg-red-50 border-red-200 text-red-600 opacity-60"
                          : t.completed
                          ? "bg-green-50 border-green-200 text-green-700"
                          : t.favorite
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={t.completed}
                          disabled={t.na}
                          onChange={() => toggleCompleted(t.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span
                          className={`text-sm ${
                            t.completed
                              ? "line-through text-gray-500"
                              : "text-gray-700"
                          }`}
                        >
                          {t.title}
                        </span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleFavorite(t.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              t.favorite
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => toggleNA(t.id)}
                          className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                            t.na
                              ? "bg-red-100 border-red-300 text-red-600"
                              : "bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </li>
                  ))}
                  {(!tasksBySection[sec.id] ||
                    tasksBySection[sec.id].length === 0) && (
                    <li className="text-sm text-gray-400 italic py-2">
                      Sin tareas en esta sección
                    </li>
                  )}
                </ul>
              </Card>
            ))}

            {sections.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Circle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Este proyecto no tiene secciones configuradas</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Selecciona un proyecto</p>
            <p className="text-sm text-gray-400 mt-1">
              para ver el checklist y avance
            </p>
          </div>
        </div>
      )}
    </>
  );

  // VISTA MÓVIL (Portrait) - Tipo App Nativa
  if (isMobile) {
    return (
      <AuthGuard>
        <div className="h-screen flex flex-col bg-gray-50">
          {/* Header fijo */}
          <div className="px-4 py-3 border-b bg-white flex-shrink-0">
            <h1 className="text-xl font-semibold text-gray-900">{areaName}</h1>
            <p className="text-sm text-gray-500">
              {projects.length} proyecto{projects.length !== 1 ? "s" : ""}{" "}
              asignado{projects.length !== 1 ? "s" : ""}
            </p>
          </div>

          {error && (
            <div className="mx-4 mt-3 bg-red-50 text-red-700 p-3 rounded-md text-sm flex-shrink-0">
              {error}
            </div>
          )}

          {/* Lista de proyectos */}
          <div
            className={`flex-1 overflow-hidden transition-transform duration-300 ${
              selectedProjectId ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            <div className="h-full flex flex-col bg-white border-r">
              <ProjectsList />
            </div>
          </div>

          {/* Panel de detalle (overlay) */}
          <div
            className={`absolute inset-0 bg-white transition-transform duration-300 ${
              selectedProjectId ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="h-full flex flex-col">
              {/* Header con botón atrás */}
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

              {/* Contenido del detalle */}
              <div className="flex-1 overflow-y-auto">
                <ProjectDetail />
              </div>

              {/* Botón flotante para volver - Esquina inferior izquierda */}
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

  // VISTA DESKTOP/TABLET (Landscape) - Split View
  return (
    <AuthGuard>
      <div className="h-[calc(100vh-5rem)] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-white flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-900">{areaName}</h1>
          <p className="text-sm text-gray-500">
            {projects.length} proyecto{projects.length !== 1 ? "s" : ""}{" "}
            asignado{projects.length !== 1 ? "s" : ""}
          </p>
        </div>

        {error && (
          <div className="mx-4 mt-3 bg-red-50 text-red-700 p-3 rounded-md text-sm flex-shrink-0">
            {error}
          </div>
        )}

        {/* Main content - Master Detail */}
        <div className="flex-1 flex overflow-hidden">
          {/* Lista de proyectos (Master) */}
          <div className="w-72 lg:w-80 border-r bg-gray-50 flex flex-col overflow-hidden">
            <ProjectsList />
          </div>

          {/* Detalle del proyecto (Detail) */}
          <div className="flex-1 overflow-y-auto bg-white">
            <ProjectDetail />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
