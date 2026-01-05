"use client";

import { useEffect, useState, useMemo } from "react";
import AuthGuard from "@/components/AuthGuard";
import useUser from "@/modules/auth/hooks/useUser";
import useProjects from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { listAllUsers } from "@/lib/firebase/firestore";
import {
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/firebase/projects";
import { useRouter } from "next/navigation";
import {
  Loader2,
  FolderOpen,
  ChevronRight,
  Plus,
  UserPlus,
  Users,
  Pencil,
  Trash2,
  AlertTriangle,
  LayoutDashboard,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type AuxOption = "editar" | "eliminar" | null;

type Asignacion =
  | { tipo: "area"; id: string }
  | { tipo: "usuario"; id: string };

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
    // --- 2. PROYECTO ARQUITECTÓNICO ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.1 INFORMACIÓN ARQUITECTÓNICA",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 50,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.1.1 Planta de conjunto",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.1.2 Plantas arquitectónicas",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.1.3 Fachadas arquitectónicas",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.1.4 Secciones longitudinales",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.1.5 Secciones transversales",
      completed: false,
      favorite: false,
      order: 500,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.2 MATERIAL DE PRESENTACIÓN",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 550,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.2.1 Visualización digital (Vista exterior e interior)",
      completed: false,
      favorite: false,
      order: 600,
    },
    // --- 3. PROYECTO EJECUTIVO ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.1 INFORMACIÓN CONSTRUCTIVA",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 50,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.1.1 Detalles de cancelería",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.1.2 Detalles de carpintería",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.1.3 Detalles de herrería",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.1.4 Detalles constructivos arquitectónicos",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.1.5 Plano de albañilería",
      completed: false,
      favorite: false,
      order: 500,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.2 ACABADOS",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 550,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.2.1 Plano de referencias de acabados",
      completed: false,
      favorite: false,
      order: 600,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.2.2 Plantas de acabados",
      completed: false,
      favorite: false,
      order: 700,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.2.3 Despiece de pisos y lambrines",
      completed: false,
      favorite: false,
      order: 800,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.2.4 Accesorios y equipos",
      completed: false,
      favorite: false,
      order: 900,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.2.4.1 Detalles accesorios y equipos",
      completed: false,
      favorite: false,
      order: 950,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.2.5 Plano de mármol",
      completed: false,
      favorite: false,
      order: 1000,
    },
    // --- 4. DISEÑO ESTRUCTURAL ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "4.1 Planos de especificaciones generales",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "4.2 Planta estructural de cimentación",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "4.3 Plantas estructuradas de losas por nivel",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "4.4 Secciones estructurales de refuerzo",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "4.5 Secciones esquemáticas de niveles",
      completed: false,
      favorite: false,
      order: 500,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "4.6 Memoria de cálculo",
      completed: false,
      favorite: false,
      order: 600,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "4.7 Mecánica de suelos",
      completed: false,
      favorite: false,
      order: 700,
    },
    // --- 5. INGENIERÍAS ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.1 INGENIERÍA HIDRÁULICA",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 50,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.1.1 Acometida general, cisterna y líneas generales",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.1.2 Instalación de líneas por nivel",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.1.3 Isométricos generales de instalación de agua",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.1.4 Especificaciones y detalles hidráulicos",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.1.5 Memoria descriptiva",
      completed: false,
      favorite: false,
      order: 500,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.2 INGENIERÍA SANITARIA",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 550,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.2.1 Descargas generales y drenajes residuales",
      completed: false,
      favorite: false,
      order: 600,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.2.2 Sistema de captación pluvial e interconexión a red",
      completed: false,
      favorite: false,
      order: 700,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.2.3 Plantas e isométricos de instalación",
      completed: false,
      favorite: false,
      order: 800,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.2.4 Especificaciones y detalles sanitarios",
      completed: false,
      favorite: false,
      order: 900,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.2.5 Memoria descriptiva",
      completed: false,
      favorite: false,
      order: 1000,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.3 INSTALACIÓN DE GAS",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 1050,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.3.1 Diseño de red de conducción",
      completed: false,
      favorite: false,
      order: 1100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.3.2 Líneas de alimentación",
      completed: false,
      favorite: false,
      order: 1200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.3.3 Equipos de consumo",
      completed: false,
      favorite: false,
      order: 1300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.3.4 Conjunto de abastecimiento, distribución y regulación",
      completed: false,
      favorite: false,
      order: 1400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.3.5 Memoria descriptiva",
      completed: false,
      favorite: false,
      order: 1500,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.4 INGENIERÍA ELÉCTRICA",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 1550,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.4.1 Iluminación por nivel",
      completed: false,
      favorite: false,
      order: 1600,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.4.2 Contactos por nivel",
      completed: false,
      favorite: false,
      order: 1700,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.4.3 Diagrama unifilar",
      completed: false,
      favorite: false,
      order: 1800,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.4.4 Cuadros y resúmenes de cargas",
      completed: false,
      favorite: false,
      order: 1900,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.4.5 Especificaciones y detalles eléctricos",
      completed: false,
      favorite: false,
      order: 2000,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.4.6 Memoria descriptiva",
      completed: false,
      favorite: false,
      order: 2100,
    },
    // --- 6. INSTALACIONES ESPECIALES ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "6.1 Domótica",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "6.2 Aire acondicionado",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "6.3 Voz y datos",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "6.4 Sistema de riego",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "6.5 CCTV",
      completed: false,
      favorite: false,
      order: 500,
    },
    // --- 7. TABLAROCA ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-tab",
      title: "7.1 TABLAROCA",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 50,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-tab",
      title: "7.1.1 Plano de plafones",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-tab",
      title: "7.1.2 Plano muros de tablaroca",
      completed: false,
      favorite: false,
      order: 200,
    },
  ];

  return { sections, tasks };
}

export default function AuxAdminPage() {
  const { user, profile, loading: userLoading } = useUser();
  const { projects } = useProjects(user?.uid, profile?.role);
  const router = useRouter();

  // --- ESTADOS ---
  const [isMobile, setIsMobile] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedOption, setSelectedOption] = useState<AuxOption>(null);

  // Formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Datos
  const [allAreas, setAllAreas] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<
    Array<{ id: string; name: string; role: string }>
  >([]);
  const [areaAbierta, setAreaAbierta] = useState<string | null>(null);

  // --- EFECTOS ---
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 1024);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const users = await listAllUsers();
        setAllUsers(
          users.map((u) => ({
            id: u.id,
            name: u.fullName || u.email,
            role: u.role,
          }))
        );
        setAllAreas([...new Set(users.map((u) => u.role))].filter(Boolean));
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  // Sincronizar formulario
  useEffect(() => {
    if (selectedProject && selectedOption === "editar") {
      setTitle(selectedProject.title);
      setDescription(selectedProject.description || "");
      setAsignaciones((selectedProject.asignaciones as Asignacion[]) || []);
    } else if (selectedOption === "editar" && !selectedProjectId) {
      setTitle("");
      setDescription("");
      setAsignaciones([]);
    }
  }, [selectedProject, selectedOption, selectedProjectId]);

  // --- HANDLERS ---
  const handleCreateNew = () => {
    setSelectedProjectId(null);
    setSelectedOption("editar");
  };

  const handleSave = async () => {
    if (!user || !title.trim()) return;
    setIsSaving(true);
    try {
      if (selectedProject) {
        await updateProject(selectedProject.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          asignaciones,
          sections: selectedProject.sections,
          tasks: selectedProject.tasks,
        });
      } else {
        const base = buildTemplate();
        await createProject(user.uid, {
          title: title.trim(),
          description: description.trim() || undefined,
          asignaciones,
          sections: base.sections,
          tasks: base.tasks,
        });
      }
      setSelectedOption(null);
      if (isMobile && !selectedProject) setSelectedProjectId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProjectId) return;
    setIsDeleting(true);
    try {
      await deleteProject(selectedProjectId);
      setSelectedProjectId(null);
      setSelectedOption(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- RENDERIZADORES AUXILIARES ---

  const renderProjectList = () => (
    <>
      <div className="p-3 border-b bg-white flex items-center justify-between sticky top-0 z-10">
        <span className="text-xs font-bold text-gray-500">
          PROYECTOS ACTIVOS
        </span>
        <button
          onClick={handleCreateNew}
          className="p-1 hover:bg-gray-100 rounded text-blue-600"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 && (
          <div className="p-6 text-center text-gray-400 text-sm">
            No hay proyectos. Crea uno nuevo.
          </div>
        )}
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedProjectId(p.id);
              setSelectedOption(null);
            }}
            className={`w-full text-left p-4 border-b transition-all ${
              selectedProjectId === p.id
                ? "bg-white border-l-4 border-l-blue-600 shadow-sm"
                : "hover:bg-gray-100 bg-white"
            }`}
          >
            <div className="flex justify-between items-center">
              <p
                className={`text-sm font-semibold truncate ${
                  selectedProjectId === p.id ? "text-blue-700" : "text-gray-800"
                }`}
              >
                {p.title}
              </p>
              {isMobile && <ChevronRight className="h-4 w-4 text-gray-300" />}
            </div>
          </button>
        ))}
      </div>
    </>
  );

  const renderOptions = () => (
    <div className="h-full flex flex-col bg-white">
      {isMobile && (
        <div className="px-4 py-3 border-b bg-white flex items-center gap-2 sticky top-0 z-10">
          <button
            onClick={() => setSelectedProjectId(null)}
            className="p-1 -ml-2"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="font-semibold text-gray-900 truncate flex-1">
            {selectedProject?.title}
          </h2>
        </div>
      )}

      {selectedProject ? (
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {!isMobile && (
            <div className="pb-4 mb-2 border-b">
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {selectedProject.title}
              </h2>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {selectedProject.description}
              </p>
            </div>
          )}

          <button
            onClick={() => setSelectedOption("editar")}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
              selectedOption === "editar"
                ? "bg-blue-50 border-blue-500 shadow-sm"
                : "bg-white hover:border-blue-300"
            }`}
          >
            <Pencil
              className={`h-5 w-5 ${
                selectedOption === "editar" ? "text-blue-600" : "text-gray-400"
              }`}
            />
            <div className="text-left font-medium text-sm">
              Editar Información
            </div>
            {isMobile && (
              <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
            )}
          </button>

          <button
            onClick={() => setSelectedOption("eliminar")}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
              selectedOption === "eliminar"
                ? "bg-red-50 border-red-500 shadow-sm"
                : "bg-white hover:border-red-300"
            }`}
          >
            <Trash2
              className={`h-5 w-5 ${
                selectedOption === "eliminar" ? "text-red-600" : "text-gray-400"
              }`}
            />
            <div className="text-left font-medium text-sm text-gray-900">
              Eliminar Proyecto
            </div>
            {isMobile && (
              <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
            )}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-4">
          <FolderOpen className="h-12 w-12 mb-2" />
          <p className="text-sm font-medium">
            Selecciona un proyecto para ver sus opciones
          </p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    const MobileHeader = ({ title }: { title: string }) =>
      isMobile ? (
        <div className="px-4 py-3 border-b bg-white flex items-center gap-2 sticky top-0 z-10">
          <button onClick={() => setSelectedOption(null)} className="p-1 -ml-2">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="font-semibold text-gray-900 truncate flex-1">
            {title}
          </h2>
        </div>
      ) : null;

    if (selectedOption === "editar") {
      return (
        <div className="h-full flex flex-col bg-white">
          <MobileHeader
            title={selectedProject ? "Editar Proyecto" : "Nuevo Proyecto"}
          />
          <div className="flex-1 overflow-y-auto bg-gray-50/30">
            <div className="p-4 md:p-8 max-w-2xl mx-auto">
              <Card className="p-6 shadow-md border-0 bg-white">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-blue-600" />
                  {selectedProject ? "Modificar Proyecto" : "Nuevo Registro"}
                </h2>
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase">
                      Título del Proyecto
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej. Corporativo Santa Fe"
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase">
                      Notas Adicionales
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detalles u observaciones..."
                      rows={3}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>

                  {/* --- SECCIÓN DE ASIGNACIÓN (INTEGRADA) --- */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-gray-600 uppercase">
                      Asignar Equipo
                    </label>
                    <p className="text-[10px] text-gray-400 mb-2">
                      Selecciona áreas completas o usuarios específicos.
                    </p>

                    <div className="max-h-60 overflow-y-auto border rounded-md bg-white shadow-sm">
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
                                          !(
                                            a.tipo === "area" && a.id === area
                                          ) &&
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
                                  setAreaAbierta(
                                    areaAbierta === area ? null : area
                                  )
                                }
                                className="text-gray-400 hover:text-blue-600 p-1"
                              >
                                {areaAbierta === area ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            </div>

                            {areaAbierta === area && (
                              <div className="pl-9 pr-3 pb-2 bg-gray-50/50 border-t border-dashed border-gray-100">
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
                                          usuarioSeleccionado ||
                                          areaSeleccionada
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
                  {/* --- FIN SECCIÓN DE ASIGNACIÓN --- */}

                  <div className="pt-4 border-t">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                      onClick={handleSave}
                      disabled={isSaving || !title.trim()}
                    >
                      {isSaving ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : selectedProject ? (
                        "Actualizar Datos"
                      ) : (
                        "Confirmar y Crear"
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      );
    }

    if (selectedOption === "eliminar") {
      return (
        <div className="h-full flex flex-col bg-white">
          <MobileHeader title="Eliminar Proyecto" />
          <div className="flex-1 flex items-center justify-center p-8 bg-gray-50/30">
            <Card className="max-w-md w-full p-8 text-center border-red-200 shadow-lg bg-white">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¿Confirmar Baja?
              </h2>
              <p className="text-sm text-gray-500 mb-8">
                Esta acción eliminará permanentemente{" "}
                <strong>{selectedProject?.title}</strong>.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => setSelectedOption(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 h-11"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Procesando..." : "Sí, Eliminar"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-300">
        <LayoutDashboard className="h-20 w-20 mb-4 opacity-10" />
        <p className="text-lg font-semibold tracking-wide">ÁREA DE TRABAJO</p>
      </div>
    );
  };

  if (userLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <AuthGuard>
        <div className="h-[calc(100vh-4rem)] relative overflow-hidden bg-gray-50">
          <div
            className={`absolute inset-0 flex flex-col transition-transform duration-300 ${
              selectedProjectId || selectedOption
                ? "-translate-x-full"
                : "translate-x-0"
            }`}
          >
            <div className="px-4 py-4 border-b bg-white flex justify-between items-center shadow-sm z-10">
              <div>
                <h1 className="text-lg font-bold text-gray-900">AUX. ADMIN</h1>
                <p className="text-xs text-gray-500">
                  {projects.length} proyectos
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateNew}
                  size="sm"
                  className="bg-zinc-900 hover:bg-zinc-800"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push("/admon")}
                  size="sm"
                  variant="outline"
                >
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-white">
              {renderProjectList()}
            </div>
          </div>

          <div
            className={`absolute inset-0 bg-white transition-transform duration-300 z-20 ${
              selectedProjectId && !selectedOption
                ? "translate-x-0"
                : "translate-x-full"
            }`}
          >
            {renderOptions()}
          </div>

          <div
            className={`absolute inset-0 bg-white transition-transform duration-300 z-30 ${
              selectedOption ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {renderContent()}
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-white">
        <div className="px-6 py-4 border-b flex justify-between items-center shrink-0 bg-white shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              AUX. ADMINISTRATIVO
            </h1>
            <p className="text-xs text-gray-500 uppercase font-medium">
              Panel de Gestión de Proyectos
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCreateNew}
              size="sm"
              className="bg-zinc-900 hover:bg-zinc-800"
            >
              <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
            </Button>
            <Button
              onClick={() => router.push("/register")}
              size="sm"
              variant="outline"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Registrar Usuario
            </Button>
            <Button
              onClick={() => router.push("/admon")}
              size="sm"
              variant="outline"
            >
              <Users className="mr-2 h-4 w-4" /> Administrar Usuarios
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-72 border-r bg-gray-50 flex flex-col overflow-hidden">
            {renderProjectList()}
          </div>
          <div className="w-80 border-r bg-white flex flex-col">
            {renderOptions()}
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50/30">
            {renderContent()}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
