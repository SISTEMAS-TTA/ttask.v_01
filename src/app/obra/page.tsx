"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import useUser from "@/modules/auth/hooks/useUser";
import type { ProjectDoc, UserRole } from "@/modules/types";
import { subscribeToProjectsByRole } from "@/lib/firebase/projects";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Loader2,
  FolderOpen,
  ArrowLeft,
  Clipboard,
  CheckCircle2,
  ChevronRight,
  FileText,
  CalendarDays,
  Package,
} from "lucide-react";

const OBRA_ROLE: UserRole = "Obra";
const OBRA_NAME = "Obra";

type ObraOption = "caratula" | "bitacora" | "requisicion" | "levantamiento" | null;

export default function ObraPage() {
  const { user, profile, loading: userLoading } = useUser();
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ObraOption>(null);
  const [simulation, setSimulation] = useState<{
    projectTitle: string;
    timestamp: number;
  } | null>(null);
  const [bitacoraDates, setBitacoraDates] = useState<
    Record<string, { start: string; end: string }>
  >({});
  const [bitacoraMonth, setBitacoraMonth] = useState<Date>(new Date());

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setSelectedProjectId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsub = subscribeToProjectsByRole(
      OBRA_ROLE,
      (projs) => {
        setProjects(projs);
        setLoading(false);
        setSelectedProjectId((current) => {
          if (current && projs.some((p) => p.id === current)) {
            return current;
          }
          if (isMobile) {
            return current ?? null;
          }
          return projs[0]?.id || null;
        });
      },
      (err) => {
        console.error("Error al cargar proyectos de Obra:", err);
        setError("No pudimos cargar tus proyectos. Intenta más tarde.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user, isMobile]);

  useEffect(() => {
    if (!simulation) return;
    const timeout = window.setTimeout(() => setSimulation(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [simulation]);

  useEffect(() => {
    setSelectedOption(null);
    setSimulation(null);
  }, [selectedProjectId]);

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) =>
        a.title.localeCompare(b.title, "es", { sensitivity: "base" })
      ),
    [projects]
  );

  const selectedProject = useMemo(
    () => sortedProjects.find((p) => p.id === selectedProjectId) || null,
    [sortedProjects, selectedProjectId]
  );

  const canAccess =
    profile?.role === OBRA_ROLE ||
    profile?.role === "Director" ||
    profile?.role === "Administrador" ||
    profile?.role === "Aux. Admin";

  const handleLevantamiento = () => {
    if (!selectedProject) return;
    setSelectedOption("levantamiento");
    setSimulation({
      projectTitle: selectedProject.title,
      timestamp: Date.now(),
    });
  };

  const handleSelectOption = (option: ObraOption) => {
    if (!selectedProject) return;
    setSelectedOption(option);
    if (option !== "levantamiento") {
      setSimulation(null);
    }
  };

  const getDateOnly = (value: string) => {
    if (!value) return null;
    return new Date(`${value}T00:00:00`);
  };

  const getMonday = (date: Date) => {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const getFullWeeksBetween = (start: string, end: string) => {
    const startDate = getDateOnly(start);
    const endDate = getDateOnly(end);
    if (!startDate || !endDate || endDate <= startDate) return 0;
    const startWeekMonday = getMonday(startDate);
    const nextMonday = new Date(startWeekMonday);
    nextMonday.setDate(startWeekMonday.getDate() + 7);
    const endWeekMonday = getMonday(endDate);
    if (endWeekMonday <= nextMonday) return 0;
    const diffMs = endWeekMonday.getTime() - nextMonday.getTime();
    return Math.max(0, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)));
  };

  const getDatesInRange = (start: string, end: string) => {
    const startDate = getDateOnly(start);
    const endDate = getDateOnly(end);
    if (!startDate || !endDate || endDate < startDate) return [];
    const days: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const ProjectsList = () => (
    <>
      <div className="flex items-center justify-between border-b bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span>Proyectos</span>
        <span>{projects.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sortedProjects.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            No hay proyectos asignados para Obra.
          </div>
        ) : (
          sortedProjects.map((project) => {
            const isSelected = selectedProjectId === project.id;
            return (
              <button
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setSelectedOption(null);
                }}
                className={`flex w-full flex-col gap-1 border-b px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "bg-blue-50 text-blue-700"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <span className="text-sm font-medium">{project.title}</span>
                {project.description && (
                  <span className="text-xs text-gray-500 line-clamp-1">
                    {project.description}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </>
  );

  const OptionsPanel = () => (
    <>
      {selectedProject ? (
        <div className="p-4 space-y-3">
          <div className="border-b pb-3">
            <p className="text-[11px] font-semibold uppercase text-gray-400">
              Proyecto activo
            </p>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedProject.title}
            </h2>
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
              {selectedProject.description ||
                "Sin notas adicionales para este proyecto."}
            </p>
          </div>

          <button
            onClick={() => handleSelectOption("caratula")}
            className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              selectedOption === "caratula"
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            <div
              className={`rounded-lg p-2 ${
                selectedOption === "caratula" ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <FileText
                className={`h-5 w-5 ${
                  selectedOption === "caratula"
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Carátula</p>
              <p className="text-xs text-gray-500">
                Datos del registro del proyecto.
              </p>
            </div>
            {isMobile && <ChevronRight className="h-4 w-4 text-gray-300" />}
          </button>

          <button
            onClick={() => handleSelectOption("bitacora")}
            className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              selectedOption === "bitacora"
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            <div
              className={`rounded-lg p-2 ${
                selectedOption === "bitacora" ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <CalendarDays
                className={`h-5 w-5 ${
                  selectedOption === "bitacora"
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Bitácora de Obra
              </p>
              <p className="text-xs text-gray-500">
                Fechas y semanas de ejecución.
              </p>
            </div>
            {isMobile && <ChevronRight className="h-4 w-4 text-gray-300" />}
          </button>

          <button
            onClick={() => handleSelectOption("requisicion")}
            className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              selectedOption === "requisicion"
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            <div
              className={`rounded-lg p-2 ${
                selectedOption === "requisicion" ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <Package
                className={`h-5 w-5 ${
                  selectedOption === "requisicion"
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Requisición de Materiales
              </p>
              <p className="text-xs text-gray-500">
                Solicitudes de insumos.
              </p>
            </div>
            {isMobile && <ChevronRight className="h-4 w-4 text-gray-300" />}
          </button>

          <button
            onClick={handleLevantamiento}
            className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              selectedOption === "levantamiento"
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            <div
              className={`rounded-lg p-2 ${
                selectedOption === "levantamiento"
                  ? "bg-blue-100"
                  : "bg-gray-100"
              }`}
            >
              <Clipboard
                className={`h-5 w-5 ${
                  selectedOption === "levantamiento"
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Levantamiento
              </p>
              <p className="text-xs text-gray-500">
                Registrar hallazgos (simulado).
              </p>
            </div>
            {isMobile && <ChevronRight className="h-4 w-4 text-gray-300" />}
          </button>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center p-6 text-center text-gray-400">
          <div>
            <FolderOpen className="mx-auto mb-2 h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium">Selecciona un proyecto</p>
            <p className="text-xs">Las opciones aparecerán aquí.</p>
          </div>
        </div>
      )}
    </>
  );

  const SimulationBanner = () =>
    simulation ? (
      <div className="flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Levantamiento simulado</p>
          <p>
            {simulation.projectTitle} •{" "}
            {new Date(simulation.timestamp).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    ) : null;

  const MainContent = () => {
    if (!selectedProject) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
          <FolderOpen className="mb-3 h-12 w-12" />
          <p className="text-sm font-medium">Sin proyecto seleccionado</p>
          <p className="text-xs">Elige uno desde la columna izquierda.</p>
        </div>
      );
    }

    const projectBitacora =
      (selectedProjectId && bitacoraDates[selectedProjectId]) || {
        start: "",
        end: "",
      };
    const semanas = getFullWeeksBetween(
      projectBitacora.start,
      projectBitacora.end
    );
    const diasDiferencia = getDatesInRange(
      projectBitacora.start,
      projectBitacora.end
    );

    return (
      <div className="flex h-full flex-col gap-4 p-4 md:p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase text-gray-400">
            Proyecto seleccionado
          </p>
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedProject.title}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {selectedProject.description ||
              "Selecciona una opción desde la columna central."}
          </p>
        </div>

        {selectedOption === "caratula" ? (
          <Card className="p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Carátula</p>
                <p className="text-xs text-gray-500">
                  Información registrada por Aux Admin.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 text-sm text-gray-700 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase text-gray-400">
                  Título del Proyecto
                </p>
                <p className="mt-1 font-medium text-gray-900">
                  {selectedProject.title}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-gray-400">
                  Nombre del Cliente
                </p>
                <p className="mt-1 font-medium text-gray-900">
                  {selectedProject.clientName || "No registrado"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-gray-400">
                  Tipo de Obra
                </p>
                <p className="mt-1 font-medium text-gray-900">
                  {selectedProject.workType || "No registrado"}
                </p>
              </div>
              {selectedProject.workType === "Habitacional" && (
                <div>
                  <p className="text-[11px] font-semibold uppercase text-gray-400">
                    Tipo de Obra Habitacional
                  </p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedProject.habitationalType || "No registrado"}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[11px] font-semibold uppercase text-gray-400">
                  Dirección del Inmueble
                </p>
                <p className="mt-1 font-medium text-gray-900">
                  {selectedProject.propertyAddress || "No registrada"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-gray-400">
                  Ciudad
                </p>
                <p className="mt-1 font-medium text-gray-900">
                  {selectedProject.city || "No registrada"}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase text-gray-400">
                Notas
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {selectedProject.description || "Sin notas adicionales."}
              </p>
            </div>
          </Card>
        ) : selectedOption === "bitacora" ? (
          <Card className="p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Bitácora de Obra
                </p>
                <p className="text-xs text-gray-500">
                  Ingresa fechas para calcular semanas (lunes a domingo).
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={projectBitacora.start}
                  onChange={(e) => {
                    if (!selectedProjectId) return;
                    const value = e.target.value;
                    if (value) {
                      setBitacoraMonth(new Date(`${value}T00:00:00`));
                    }
                    setBitacoraDates((prev) => ({
                      ...prev,
                      [selectedProjectId]: {
                        start: value,
                        end: prev[selectedProjectId]?.end || "",
                      },
                    }));
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">
                  Fecha de término
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={projectBitacora.end}
                  onChange={(e) => {
                    if (!selectedProjectId) return;
                    const value = e.target.value;
                    if (value && !projectBitacora.start) {
                      setBitacoraMonth(new Date(`${value}T00:00:00`));
                    }
                    setBitacoraDates((prev) => ({
                      ...prev,
                      [selectedProjectId]: {
                        start: prev[selectedProjectId]?.start || "",
                        end: value,
                      },
                    }));
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">
                  Semanas
                </label>
                <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-900">
                  {semanas}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Calendario (días marcados)
              </p>
              <div className="flex justify-center px-0 sm:px-2">
                <Calendar
                  mode="multiple"
                  selected={diasDiferencia}
                  month={bitacoraMonth}
                  onMonthChange={setBitacoraMonth}
                  className="w-full max-w-xs sm:max-w-sm rounded-md border"
                />
              </div>
            </div>
          </Card>
        ) : selectedOption === "requisicion" ? (
          <Card className="p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Requisición de Materiales
                </p>
                <p className="text-xs text-gray-500">
                  Aquí se concentrarán las solicitudes de insumos.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white py-10 text-sm text-gray-400">
              Próximamente.
            </div>
          </Card>
        ) : selectedOption === "levantamiento" ? (
          <>
            <Card className="p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Clipboard className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Levantamiento en curso (simulado)
                  </p>
                  <p className="text-xs text-gray-500">
                    Se registran notas rápidas sin checklist.
                  </p>
                </div>
              </div>
            </Card>
            <SimulationBanner />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white text-center text-sm text-gray-400">
            El contenido del área de Obra se mostrará aquí.
          </div>
        )}
      </div>
    );
  };

  if (userLoading || loading) {
    return (
      <AuthGuard>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AuthGuard>
    );
  }

  if (!canAccess) {
    return (
      <AuthGuard>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Acceso restringido
          </h1>
          <p className="mt-2 text-gray-600">
            No cuentas con permisos para entrar al área de Obra.
          </p>
        </div>
      </AuthGuard>
    );
  }

  if (isMobile) {
    return (
      <AuthGuard>
        <div className="relative h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">
          <div
            className={`absolute inset-0 flex flex-col transition-transform duration-300 ${
              selectedProjectId ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            <div className="flex items-center justify-between border-b bg-white px-4 py-4 shadow-sm">
              <div>
                <h1 className="text-lg font-bold text-gray-900">{OBRA_NAME}</h1>
                <p className="text-xs text-gray-500">
                  {projects.length} proyecto{projects.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            {error && (
              <div className="mx-4 my-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}
            <div className="flex-1 overflow-hidden bg-white">
              <ProjectsList />
            </div>
          </div>

          <div
            className={`absolute inset-0 flex flex-col bg-white transition-transform duration-300 ${
              selectedProjectId && !selectedOption
                ? "translate-x-0"
                : "translate-x-full"
            }`}
          >
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <button
                onClick={() => setSelectedProjectId(null)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <p className="font-semibold text-gray-900">Opciones</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <OptionsPanel />
            </div>
          </div>

          <div
            className={`absolute inset-0 flex flex-col bg-white transition-transform duration-300 ${
              selectedOption ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <button
                onClick={() => setSelectedOption(null)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <p className="font-semibold text-gray-900">
                {selectedOption === "caratula"
                  ? "Carátula"
                  : selectedOption === "bitacora"
                  ? "Bitácora"
                  : selectedOption === "requisicion"
                  ? "Requisición"
                  : "Levantamiento"}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50/40">
              <MainContent />
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex h-[calc(100vh-4rem)] flex-col bg-white">
        <div className="flex items-center justify-between border-b px-6 py-4 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {OBRA_NAME}
            </h1>
            <p className="text-xs uppercase text-gray-500">
              Operación basada en levantamientos
            </p>
          </div>
        </div>

        {error && (
          <div className="mx-6 my-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <div className="w-72 flex flex-col overflow-hidden border-r bg-gray-50">
            <ProjectsList />
          </div>
          <div className="w-80 flex flex-col overflow-hidden border-r bg-white">
            <div className="flex-1 overflow-y-auto">
              <OptionsPanel />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50/30">
            <MainContent />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
