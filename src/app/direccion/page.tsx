"use client";

import { useEffect, useState, useMemo } from "react";
import AuthGuard from "@/components/AuthGuard";
import useUser from "@/modules/auth/hooks/useUser";
import useProjects from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import {
  Loader2,
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  FileText,
  Calculator,
  DollarSign,
  TrendingUp,
} from "lucide-react";

type DirectorOption = "cotizacion" | "corrida-financiera" | null;

export default function DirectorPage() {
  const { user, profile, loading: userLoading } = useUser();
  const { projects } = useProjects(user?.uid, profile?.role);
  const router = useRouter();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedOption, setSelectedOption] = useState<DirectorOption>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Estados para cotización
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteTitle, setQuoteTitle] = useState("");
  const [quoteClient, setQuoteClient] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");

  // Detectar móvil
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
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

  const canAccess = profile?.role === "Director";

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
            No hay proyectos asignados
          </div>
        ) : (
          <div className="divide-y">
            {projects.map((project) => {
              const isSelected = selectedProjectId === project.id;
              return (
                <button
                  key={project.id}
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setSelectedOption(null); // Reset opción al cambiar proyecto
                  }}
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

  // Menú intermedio con opciones de dirección
  const DirectorOptionsMenu = () => (
    <>
      {selectedProject ? (
        <div className="p-4 space-y-3">
          <div className="pb-3 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedProject.title}
            </h2>
            {selectedProject.description && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedProject.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Herramientas de Dirección
            </h3>

            <button
              onClick={() => setSelectedOption("cotizacion")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                selectedOption === "cotizacion"
                  ? "bg-blue-50 border-blue-500 shadow-sm"
                  : "bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  selectedOption === "cotizacion"
                    ? "bg-blue-100"
                    : "bg-gray-100"
                }`}
              >
                <FileText
                  className={`h-5 w-5 ${
                    selectedOption === "cotizacion"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm text-gray-900">
                  Cotización
                </div>
                <div className="text-xs text-gray-500">
                  Generar presupuestos
                </div>
              </div>
              <ChevronRight
                className={`h-4 w-4 ml-auto ${
                  selectedOption === "cotizacion"
                    ? "text-blue-500"
                    : "text-gray-400"
                }`}
              />
            </button>

            <button
              onClick={() => setSelectedOption("corrida-financiera")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                selectedOption === "corrida-financiera"
                  ? "bg-blue-50 border-blue-500 shadow-sm"
                  : "bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  selectedOption === "corrida-financiera"
                    ? "bg-blue-100"
                    : "bg-gray-100"
                }`}
              >
                <TrendingUp
                  className={`h-5 w-5 ${
                    selectedOption === "corrida-financiera"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm text-gray-900">
                  Corrida Financiera
                </div>
                <div className="text-xs text-gray-500">Análisis económico</div>
              </div>
              <ChevronRight
                className={`h-4 w-4 ml-auto ${
                  selectedOption === "corrida-financiera"
                    ? "text-blue-500"
                    : "text-gray-400"
                }`}
              />
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500 p-6">
          <div className="text-center">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Selecciona un proyecto</p>
            <p className="text-xs text-gray-400 mt-1">
              para ver las opciones disponibles
            </p>
          </div>
        </div>
      )}
    </>
  );

  // Contenido principal según la opción seleccionada
  const MainContent = () => {
    if (!selectedProject) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Calculator className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Selecciona un proyecto y una herramienta</p>
            <p className="text-sm text-gray-400 mt-1">
              para comenzar a trabajar
            </p>
          </div>
        </div>
      );
    }

    if (!selectedOption) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Calculator className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Selecciona una herramienta</p>
            <p className="text-sm text-gray-400 mt-1">
              del menú lateral para comenzar
            </p>
          </div>
        </div>
      );
    }

    if (selectedOption === "cotizacion") {
      return (
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Cotización
              </h2>
              <p className="text-sm text-gray-600">{selectedProject.title}</p>
            </div>
          </div>

          <Card className="p-6 bg-gray-50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Título de la Cotización
                </label>
                <Input placeholder="Ej. Presupuesto Fase 1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cliente
                </label>
                <Input placeholder="Nombre del cliente" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Monto Estimado
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input className="pl-10" type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="pt-2">
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Generar Cotización PDF
                </Button>
              </div>
            </div>
          </Card>

          <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
            <p className="font-medium text-blue-900 mb-1">💡 Información</p>
            <p>
              Aquí puedes generar cotizaciones y presupuestos para este
              proyecto.
            </p>
          </div>
        </div>
      );
    }

    if (selectedOption === "corrida-financiera") {
      return (
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Corrida Financiera
              </h2>
              <p className="text-sm text-gray-600">{selectedProject.title}</p>
            </div>
          </div>

          <Card className="p-6 bg-gray-50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Inversión Inicial
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input className="pl-10" type="number" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ingresos Proyectados
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input className="pl-10" type="number" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Gastos Estimados
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input className="pl-10" type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="pt-2">
                <Button className="w-full" variant="default">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular Viabilidad
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">--</div>
              <div className="text-xs text-gray-600 mt-1">ROI Estimado</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">--</div>
              <div className="text-xs text-gray-600 mt-1">Margen</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">--</div>
              <div className="text-xs text-gray-600 mt-1">TIR</div>
            </Card>
          </div>

          <div className="text-sm text-gray-500 bg-green-50 p-4 rounded-lg">
            <p className="font-medium text-green-900 mb-1">💡 Información</p>
            <p>
              Analiza la viabilidad financiera y proyecciones económicas del
              proyecto.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  // VISTA MÓVIL
  if (isMobile) {
    return (
      <AuthGuard>
        <div className="h-screen flex flex-col bg-gray-50">
          <div className="px-4 py-3 border-b bg-white flex-shrink-0">
            <h1 className="text-xl font-semibold text-gray-900">Director</h1>
            <p className="text-sm text-gray-500">
              {projects.length} proyecto{projects.length !== 1 ? "s" : ""}{" "}
              asignado{projects.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Lista de proyectos */}
          <div
            className={`flex-1 overflow-hidden transition-transform duration-300 ${
              selectedProjectId ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            <div className="h-full flex flex-col bg-white">
              <ProjectsList />
            </div>
          </div>

          {/* Panel de opciones (overlay nivel 1) */}
          <div
            className={`absolute inset-0 bg-white transition-transform duration-300 ${
              selectedProjectId && !selectedOption
                ? "translate-x-0"
                : "translate-x-full"
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
                <h2 className="text-lg font-semibold truncate">Opciones</h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                <DirectorOptionsMenu />
              </div>
            </div>
          </div>

          {/* Panel de contenido (overlay nivel 2) */}
          <div
            className={`absolute inset-0 bg-white transition-transform duration-300 ${
              selectedOption ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-3 px-4 py-3 border-b bg-white flex-shrink-0">
                <button
                  onClick={() => setSelectedOption(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold truncate">
                  {selectedOption === "cotizacion" && "Cotización"}
                  {selectedOption === "corrida-financiera" &&
                    "Corrida Financiera"}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                <MainContent />
              </div>
            </div>
          </div>

          {/* Botón flotante */}
          <button
            onClick={() => {
              if (selectedOption) setSelectedOption(null);
              else if (selectedProjectId) setSelectedProjectId(null);
            }}
            className="fixed bottom-6 left-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 z-50"
            aria-label="Volver"
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
      </AuthGuard>
    );
  }

  // VISTA DESKTOP - 3 COLUMNAS
  return (
    <AuthGuard>
      <div className="h-[calc(100vh-5rem)] flex flex-col">
        <div className="px-4 py-5 border-b bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Director</h1>
              <p className="text-sm text-gray-500">
                {projects.length} proyecto{projects.length !== 1 ? "s" : ""}{" "}
                asignado{projects.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Columna 1: Lista de proyectos */}
          <div className="w-72 border-r bg-gray-50 flex flex-col overflow-hidden">
            <ProjectsList />
          </div>

          {/* Columna 2: Menú de opciones */}
          <div className="w-80 border-r bg-white flex flex-col overflow-hidden">
            <DirectorOptionsMenu />
          </div>

          {/* Columna 3: Contenido principal */}
          <div className="flex-1 overflow-y-auto bg-white">
            <MainContent />
          </div>
        </div>
      </div>

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
    </AuthGuard>
  );
}
