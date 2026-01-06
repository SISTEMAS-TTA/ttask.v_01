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
import { createProvider } from "@/lib/firebase/providers";
import {
  getChecklistsByType,
  type ChecklistDoc,
  type ChecklistSection,
  type ChecklistTask,
} from "@/lib/firebase/checklists";
import { initializeAllChecklists } from "@/lib/firebase/initChecklists";
import { useRouter } from "next/navigation";
import {
  Loader2,
  FolderOpen,
  ChevronRight,
  Plus,
  Users,
  Pencil,
  Trash2,
  AlertTriangle,
  LayoutDashboard,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type AuxOption = "editar" | "eliminar" | "proveedor" | null;

type Asignacion =
  | { tipo: "area"; id: string }
  | { tipo: "usuario"; id: string };

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
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
  const [isVacationsExpanded, setIsVacationsExpanded] = useState(false);
  const [isUsersAdminExpanded, setIsUsersAdminExpanded] = useState(false);
  const [isProvidersExpanded, setIsProvidersExpanded] = useState(false);

  // Formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingProvider, setIsSavingProvider] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [providerArea, setProviderArea] = useState("");
  const [providerName, setProviderName] = useState("");
  const [providerCompany, setProviderCompany] = useState("N/A");
  const [providerSpecialty, setProviderSpecialty] = useState("");
  const [providerCity, setProviderCity] = useState("");
  const [providerPhone, setProviderPhone] = useState("");
  const [providerEmail, setProviderEmail] = useState("");

  // Datos
  const [allAreas, setAllAreas] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<
    Array<{ id: string; name: string; role: string }>
  >([]);
  const [usersVacations, setUsersVacations] = useState<
    Array<{ id: string; name: string; role: string; vacationDays: Date[] }>
  >([]);
  const [providers, setProviders] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [areaAbierta, setAreaAbierta] = useState<string | null>(null);

  // Checklists desde Firestore
  const [checklists, setChecklists] = useState<ChecklistDoc[]>([]);
  const [loadingChecklists, setLoadingChecklists] = useState(true);
  const [checklistError, setChecklistError] = useState<string | null>(null);

  // --- EFECTOS ---
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 1024);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Cargar usuarios y áreas
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
        const normalizeVacationDays = (value: unknown): Date[] => {
          if (!value) return [];
          const rawDays = Array.isArray(value)
            ? value
            : typeof value === "object"
            ? Object.keys(value as Record<string, boolean>)
            : [];
          const toDate = (entry: unknown): Date | null => {
            if (!entry) return null;
            if (entry instanceof Date) return entry;
            if (typeof entry === "string" || typeof entry === "number") {
              const parsed = new Date(entry);
              return Number.isNaN(parsed.getTime()) ? null : parsed;
            }
            if (
              typeof entry === "object" &&
              entry !== null &&
              "toDate" in entry &&
              typeof (entry as { toDate: () => Date }).toDate === "function"
            ) {
              return (entry as { toDate: () => Date }).toDate();
            }
            if (
              typeof entry === "object" &&
              entry !== null &&
              "seconds" in entry &&
              typeof (entry as { seconds: number }).seconds === "number"
            ) {
              return new Date((entry as { seconds: number }).seconds * 1000);
            }
            return null;
          };
          const normalized = rawDays
            .map((entry) => toDate(entry))
            .filter((d): d is Date => Boolean(d));
          const uniqueByDay = new Map(
            normalized.map((d) => [d.toISOString().slice(0, 10), d])
          );
          return Array.from(uniqueByDay.values()).sort(
            (a, b) => a.getTime() - b.getTime()
          );
        };
        setUsersVacations(
          users
            .map((u) => {
              const vacationSource =
                (u as { vacationDays?: unknown }).vacationDays ??
                (u as { vacations?: unknown }).vacations ??
                (u as { calendar?: unknown }).calendar ??
                (u as { vacaciones?: unknown }).vacaciones;
              return {
                id: u.id,
                name: u.fullName || u.email,
                role: u.role,
                vacationDays: normalizeVacationDays(vacationSource),
              };
            })
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        setAllAreas([...new Set(users.map((u) => u.role))].filter(Boolean));
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  // Cargar checklists desde Firestore
  useEffect(() => {
    (async () => {
      try {
        setLoadingChecklists(true);
        const arquitecturaChecklists = await getChecklistsByType(
          "arquitectura"
        );

        if (arquitecturaChecklists.length === 0) {
          // Si no hay checklists, ofrecer inicializarlos
          console.warn(
            "No se encontraron checklists de arquitectura en Firestore"
          );
          setChecklistError(
            "No hay checklists disponibles. Se usará el template por defecto."
          );
          setChecklists([]);
        } else {
          setChecklists(arquitecturaChecklists);
          setChecklistError(null);
        }
      } catch (e) {
        console.error("Error cargando checklists:", e);
        setChecklistError(
          "Error al cargar checklists. Se usará el template por defecto."
        );
        setChecklists([]);
      } finally {
        setLoadingChecklists(false);
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

  const handleInitializeChecklists = async () => {
    if (!user) return;

    const confirmInit = window.confirm(
      "¿Estás seguro de que quieres inicializar los checklists en Firestore? Esta acción creará nuevos documentos."
    );

    if (!confirmInit) return;

    try {
      setLoadingChecklists(true);
      await initializeAllChecklists(user.uid);

      // Recargar los checklists
      const arquitecturaChecklists = await getChecklistsByType("arquitectura");
      setChecklists(arquitecturaChecklists);
      setChecklistError(null);

      alert("✓ Checklists inicializados correctamente en Firestore");
    } catch (error) {
      console.error("Error inicializando checklists:", error);
      alert(
        "Error al inicializar checklists. Revisa la consola para más detalles."
      );
    } finally {
      setLoadingChecklists(false);
    }
  };

  const handleSave = async () => {
    if (!user || !title.trim()) return;
    setIsSaving(true);
    try {
      if (selectedProject) {
        // Actualizar proyecto existente
        await updateProject(selectedProject.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          asignaciones,
          sections: selectedProject.sections,
          tasks: selectedProject.tasks,
        });
      } else {
        // Crear nuevo proyecto - REQUIERE checklist en Firestore
        if (checklists.length === 0) {
          alert(
            "⚠️ No hay checklists disponibles en Firestore.\n\nPor favor, inicializa los checklists primero haciendo clic en el botón 'Inicializar Checklists en Firestore'."
          );
          setIsSaving(false);
          return;
        }

        // Usar el primer checklist de arquitectura encontrado
        const checklist = checklists[0];

        await createProject(user.uid, {
          title: title.trim(),
          description: description.trim() || undefined,
          asignaciones,
          sections: checklist.sections,
          tasks: checklist.tasks,
        });
      }
      setSelectedOption(null);
      if (isMobile && !selectedProject) setSelectedProjectId(null);
    } catch (e) {
      console.error(e);
      alert(
        "Error al guardar el proyecto. Revisa la consola para más detalles."
      );
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

  const handleCreateNewProvider = () => {
    setSelectedProjectId(null);
    setSelectedOption("proveedor");
    setProviderError(null);
    setProviderArea("");
    setProviderName("");
    setProviderCompany("N/A");
    setProviderSpecialty("");
    setProviderCity("");
    setProviderPhone("");
    setProviderEmail("");
  };

  const handleSaveProvider = async () => {
    const area = providerArea.trim();
    const name = providerName.trim();
    const company = providerCompany.trim() || "N/A";
    const specialty = providerSpecialty.trim();
    const city = providerCity.trim();
    const phone = providerPhone.trim();
    const email = providerEmail.trim();

    if (!area || !name || !specialty || !city) {
      setProviderError("Completa los campos requeridos.");
      return;
    }

    setIsSavingProvider(true);
    setProviderError(null);
    try {
      const result = await createProvider({
        area,
        name,
        company,
        specialty,
        city,
        phone: phone || null,
        email: email || null,
        createdBy: user?.uid ?? null,
      });
      setProviders((prev) => [{ id: result.id, name }, ...prev]);
      setProviderArea("");
      setProviderName("");
      setProviderCompany("N/A");
      setProviderSpecialty("");
      setProviderCity("");
      setProviderPhone("");
      setProviderEmail("");
    } catch (error) {
      console.error("Error guardando proveedor:", error);
      setProviderError("No se pudo guardar el proveedor.");
    } finally {
      setIsSavingProvider(false);
    }
  };

  // --- RENDERIZADORES AUXILIARES ---

  const renderProjectList = () => (
    <>
      <div className="p-3 border-b bg-white flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
          className="flex items-center gap-2 hover:bg-gray-50 rounded px-2 py-1 -ml-2 transition-colors"
        >
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${
              isProjectsExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
          <span className="text-xs font-bold text-gray-500">
            PROYECTOS ACTIVOS
          </span>
        </button>
        <button
          onClick={handleCreateNew}
          className="p-1 hover:bg-gray-100 rounded text-blue-600"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {isProjectsExpanded && (
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
                    selectedProjectId === p.id
                      ? "text-blue-700"
                      : "text-gray-800"
                  }`}
                >
                  {p.title}
                </p>
                {isMobile && <ChevronRight className="h-4 w-4 text-gray-300" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
  const renderUsersVacations = () => {
    const formatMonthLabel = (date: Date) =>
      date.toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      });
    const groupByMonth = (dates: Date[]) => {
      const map = new Map<string, { label: string; days: Date[] }>();
      dates.forEach((date) => {
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        const entry = map.get(key);
        if (entry) {
          entry.days.push(date);
        } else {
          map.set(key, { label: formatMonthLabel(date), days: [date] });
        }
      });
      return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, value]) => ({
          label: value.label,
          days: value.days.sort((a, b) => a.getTime() - b.getTime()),
        }));
    };

    return (
      <>
        <div className="p-3 border-b bg-white flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setIsVacationsExpanded(!isVacationsExpanded)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded px-2 py-1 -ml-2 transition-colors"
          >
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                isVacationsExpanded ? "rotate-0" : "-rotate-90"
              }`}
            />
            <span className="text-xs font-bold text-gray-500">
              VACACIONES POR USUARIO
            </span>
          </button>
          <span className="text-[10px] text-gray-400">
            {usersVacations.length} usuarios
          </span>
        </div>
        {isVacationsExpanded && (
          <div className="flex-1 overflow-y-auto">
            {usersVacations.length === 0 && (
              <div className="p-6 text-center text-gray-400 text-sm">
                No hay vacaciones registradas.
              </div>
            )}
            {usersVacations.map((u) => (
              <div
                key={u.id}
                className="w-full text-left p-4 border-b bg-white"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {u.name}
                  </p>
                  <span className="text-[10px] text-gray-400 uppercase">
                    {u.role}
                  </span>
                </div>
                {u.vacationDays.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {groupByMonth(u.vacationDays).map((group) => (
                      <div key={`${u.id}-${group.label}`}>
                        <p className="text-[10px] uppercase text-gray-400 mb-1">
                          {group.label}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.days.map((d) => (
                            <span
                              key={`${u.id}-${d.toISOString().slice(0, 10)}`}
                              className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 border border-blue-100"
                            >
                              {d.toLocaleDateString("es-MX", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-gray-400">
                    Sin vacaciones registradas.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderProviders = () => (
    <>
      <div className="p-3 border-b bg-white flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => setIsProvidersExpanded(!isProvidersExpanded)}
          className="flex items-center gap-2 hover:bg-gray-50 rounded px-2 py-1 -ml-2 transition-colors"
        >
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${
              isProvidersExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
          <span className="text-xs font-bold text-gray-500">PROVEEDORES</span>
        </button>
        <button
          onClick={handleCreateNewProvider}
          className="p-1 hover:bg-gray-100 rounded text-blue-600"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {isProvidersExpanded && (
        <div className="flex-1 overflow-y-auto">
          {providers.length === 0 && (
            <div className="p-6 text-center text-gray-400 text-sm">
              No hay proveedores registrados.
            </div>
          )}
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="w-full text-left p-4 border-b bg-white"
            >
              <p className="text-sm font-semibold text-gray-800 truncate">
                {provider.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderUsersAdmin = () => (
    <>
      <div className="p-3 border-b bg-white flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => setIsUsersAdminExpanded(!isUsersAdminExpanded)}
          className="flex items-center gap-2 hover:bg-gray-50 rounded px-2 py-1 -ml-2 transition-colors"
        >
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${
              isUsersAdminExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
          <span className="text-xs font-bold text-gray-500">
            ADMINISTRACION DE USUARIOS
          </span>
        </button>
      </div>
      {isUsersAdminExpanded && (
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={() => router.push("/admon")}
            className="w-full text-left p-4 border-b transition-all hover:bg-gray-100 bg-white"
          >
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-gray-800 truncate">
                Administracion de Usuarios
              </p>
              {isMobile && <ChevronRight className="h-4 w-4 text-gray-300" />}
            </div>
          </button>
          <button
            onClick={() => router.push("/register")}
            className="w-full text-left p-4 border-b transition-all hover:bg-gray-100 bg-white"
          >
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-gray-800 truncate">
                Registrar Usuario
              </p>
              {isMobile && <ChevronRight className="h-4 w-4 text-gray-300" />}
            </div>
          </button>
        </div>
      )}
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

                {/* Mensaje sobre checklists */}
                {checklistError && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-yellow-800">
                          {checklistError}
                        </p>
                        {checklists.length === 0 && (
                          <button
                            onClick={handleInitializeChecklists}
                            disabled={loadingChecklists}
                            className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
                          >
                            {loadingChecklists
                              ? "Inicializando..."
                              : "Inicializar Checklists en Firestore"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {checklists.length > 0 && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <p className="text-xs text-green-800">
                        Usando checklist desde Firestore:{" "}
                        <strong>{checklists[0].name}</strong>
                      </p>
                    </div>
                  </div>
                )}

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
                              <label className="flex items-center gap-3 text-sm font-medium grow cursor-pointer">
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
                                                {
                                                  tipo: "usuario",
                                                  id: u.id,
                                                },
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

    if (selectedOption === "proveedor") {
      const isProviderFormValid =
        providerArea.trim() &&
        providerName.trim() &&
        providerSpecialty.trim() &&
        providerCity.trim();

      return (
        <div className="h-full flex flex-col bg-white">
          <MobileHeader title="Nuevo Proveedor" />
          <div className="flex-1 overflow-y-auto bg-gray-50/30">
            <div className="p-4 md:p-8 max-w-2xl mx-auto">
              <Card className="p-6 shadow-md border-0 bg-white">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Nuevo Proveedor
                </h2>
                {providerError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700">{providerError}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Area
                    </label>
                    <Input
                      placeholder="Area"
                      value={providerArea}
                      onChange={(e) => setProviderArea(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Nombre
                    </label>
                    <Input
                      placeholder="Nombre"
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Empresa
                    </label>
                    <div className="relative">
                      <select
                        className="w-full h-11 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={providerCompany}
                        onChange={(e) => setProviderCompany(e.target.value)}
                      >
                        <option value="N/A">N/A</option>
                        <option value="Empresa Alfa">Empresa Alfa</option>
                        <option value="Empresa Beta">Empresa Beta</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Especialidad
                    </label>
                    <div className="relative">
                      <select
                        className="w-full h-11 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={providerSpecialty}
                        onChange={(e) => setProviderSpecialty(e.target.value)}
                      >
                        <option value="">Selecciona una especialidad</option>
                        <option value="General">General</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Instalaciones">Instalaciones</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Ciudad
                    </label>
                    <Input
                      placeholder="Ciudad"
                      value={providerCity}
                      onChange={(e) => setProviderCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Telefono (opcional)
                    </label>
                    <Input
                      type="tel"
                      placeholder="Telefono"
                      value={providerPhone}
                      onChange={(e) => setProviderPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Correo (opcional)
                    </label>
                    <Input
                      type="email"
                      placeholder="Correo"
                      value={providerEmail}
                      onChange={(e) => setProviderEmail(e.target.value)}
                    />
                  </div>
                  <div className="pt-2">
                    <Button
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                      onClick={handleSaveProvider}
                      disabled={isSavingProvider || !isProviderFormValid}
                    >
                      {isSavingProvider ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Guardar Proveedor"
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
            <h1 className="text-xl font-bold text-gray-900 tracking-tight mt-4">
              AUX. ADMINISTRATIVO
            </h1>
            <p className="text-xs text-gray-500 uppercase font-medium">
              Panel de Gestión de Proyectos
            </p>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-72 border-r bg-gray-50 flex flex-col overflow-hidden">
            <div
              className={`flex flex-col overflow-hidden ${
                isProjectsExpanded ? "flex-1" : "shrink-0"
              }`}
            >
              {renderProjectList()}
            </div>
            <div
              className={`flex flex-col overflow-hidden border-t border-gray-200 ${
                isVacationsExpanded ? "flex-1" : "shrink-0"
              }`}
            >
              {renderUsersVacations()}
            </div>
            <div
              className={`flex flex-col overflow-hidden border-t border-gray-200 ${
                isUsersAdminExpanded ? "flex-1" : "shrink-0"
              }`}
            >
              {renderUsersAdmin()}
            </div>
            <div
              className={`flex flex-col overflow-hidden border-t border-gray-200 ${
                isProvidersExpanded ? "flex-1" : "shrink-0"
              }`}
            >
              {renderProviders()}
            </div>
          </div>
          {isProjectsExpanded && (
            <div className="w-80 border-r bg-white flex flex-col">
              {renderOptions()}
            </div>
          )}
          <div className="flex-1 overflow-y-auto bg-gray-50/30">
            {renderContent()}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
