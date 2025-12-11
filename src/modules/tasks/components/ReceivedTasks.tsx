"use client";

import { useEffect, useState } from "react";
import { Circle, Star, Filter, CircleCheckBig, ChevronDown,ChevronRight,CircleCheck, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TaskViewModal } from "@/modules/tasks/components/TaskViewModal";
import useUser from "@/modules/auth/hooks/useUser";
import { subscribeToTasksAssignedTo, updateTask } from "@/lib/firebase/tasks";
import { useUsersMap } from "@/hooks/useUsersMap";

interface ReceivedTask {
  id: string;
  title: string;
  project: string;
  assigneeId?: string;
  assignedBy: string;
  viewed: boolean;
  completed: boolean;
  favorite: boolean;
  description?: string;
  createdAt: Date;
}

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const initialReceivedTasks: ReceivedTask[] = [];

export function ReceivedTasksColumn() {
  const { user, loading: userLoading } = useUser();
  const { getUserName } = useUsersMap();
  const [tasks, setTasks] = useState<ReceivedTask[]>(initialReceivedTasks);
  const [, setIsFilterModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<ReceivedTask | null>(null);
  const [filter] = useState<{
    assignedBy?: string;
    view?: "all" | "viewed" | "pending";
  }>({});

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setTasks([]);
      return;
    }
    const unsub = subscribeToTasksAssignedTo(
      user.uid,
      (docs) => {
        const mapped = docs.map((d) => ({
          id: d.id,
          title: d.title,
          project: d.project,
          assignedBy: d.assignedBy,
          assigneeId: d.assigneeId,
          description: d.description ?? "",
          viewed: d.viewed,
          completed: d.completed,
          favorite: Boolean(d.favorites?.[user!.uid]) || Boolean(d.favorite),
          createdAt: d.createdAt.toDate(),
        }));
        console.debug(
          "subscribeToTasksAssignedTo -> received docs:",
          mapped.map((m) => ({ id: m.id, favorite: m.favorite }))
        );
        setTasks(mapped);
      },
      () => setTasks([])
    );
    return () => unsub();
  }, [user, userLoading]);

  // Estrella marca como vista
  const toggleViewed = async (id: string) => {
    const current = tasks.find((t) => t.id === id);
    if (!current || !user?.uid) return;

    try {
      await updateTask(id, { viewed: !current.viewed }, user?.uid);
    } catch (e) {
      console.warn("No autorizado para marcar viewed", e);
    }
  };

  // Círculo marca como completada
  const toggleCompleted = async (id: string) => {
    const current = tasks.find((t) => t.id === id);
    if (!current || !user?.uid) return;

    console.debug("toggleCompleted requested", {
      id,
      currentCompleted: current.completed,
      user: user.uid,
    });

    // Optimista: actualizar UI inmediatamente marcando como completada
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      // Marcar la tarea como completada
      await updateTask(id, { completed: !current.completed }, user.uid);
      console.debug("updateTask completed succeeded", {
        id,
        newValue: !current.completed,
      });
    } catch (err) {
      console.error("Error al actualizar tarea completada", err);
      // Revertir en caso de error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: current.completed } : t
        )
      );
    }
  };

  // Apply filters - INCLUIR tareas completadas
  const filteredTasks = tasks.filter((task) => {
    if (filter.assignedBy && task.assignedBy !== filter.assignedBy)
      return false;
    if (filter.view) {
      switch (filter.view) {
        case "viewed":
          return task.viewed && !task.completed;
        case "pending":
          return !task.viewed && !task.completed;
        default:
          return true; // Mostrar todas incluyendo completadas
      }
    }
    return true; // Mostrar todas incluyendo completadas
  });

  // Orden: completadas al final, luego no vistas primero
  const orderedTasks = filteredTasks.slice().sort((a, b) => {
    // Primero ordenar por completadas (completadas al final)
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Luego ordenar por viewed (no vistas primero)
    if (a.viewed !== b.viewed) return a.viewed ? 1 : -1;
    return 0;
  });

  // --- Logica del historial (Para Tareas Recibidas) ---

  // 1. Estado para los acordeones
  const [openCompletedGroups, setOpenCompletedGroups] = useState<Set<string>>(
    new Set()
  );

  const toggleCompletedGroup = (monthYear: string) => {
    setOpenCompletedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(monthYear)) newSet.delete(monthYear);
      else newSet.add(monthYear);
      return newSet;
    });
  };

  // 2. Clasificar Tareas
  const activeTasks = orderedTasks.filter(
    (task) => !task.completed && !task.viewed
  );
  const viewedTasks = orderedTasks.filter(
    (task) => task.viewed && !task.completed
  );
  // Juntamos activas y vistas para la parte superior
  const allActiveList = [...activeTasks, ...viewedTasks]; 
  
  const completedTasks = orderedTasks.filter((task) => task.completed);

  // 3. Helpers de Fecha
  const getTaskDate = (task: ReceivedTask) => task.createdAt;
  
  const formatMonthYear = (date: Date) => 
    date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
        .replace(/^\w/, (c) => c.toUpperCase());

  // 4. Agrupar Completadas
  const groupedCompletedTasks = completedTasks.reduce((groups, task) => {
    const date = getTaskDate(task);
    const monthYear = formatMonthYear(date);
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(task);
    return groups;
  }, {} as Record<string, ReceivedTask[]>);

  // 5. Ordenar Grupos
  const sortedGroups = Object.entries(groupedCompletedTasks).sort((a, b) => {
    const dateA = getTaskDate(a[1][0]).getTime();
    const dateB = getTaskDate(b[1][0]).getTime();
    return dateB - dateA;
  });

  // Función auxiliar para renderizar el pie de página de la tarea
  const TaskFooter = ({ task }: { task: ReceivedTask }) => {
    const assignedByName = getUserName(task.assignedBy);

    return (
      <div className="text-sm text-gray-500 mt-1">
        {/* Línea 1: Quién asignó */}
        <p>
          Asignado por: <span className="font-semibold">{assignedByName}</span>
        </p>
        {/* Línea 2: Fecha y Hora de Creación */}
        <p className="text-xs mt-1">
          Recibida:{" "}
          {task.createdAt.toLocaleString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    );
  };

  return (
    <div className="w-full bg-red-200 flex flex-col h-[500px] md:h-full">
      {/* Header */}
      <div className="p-4 border-b border-red-300 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          T. Recibidas
        </h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsFilterModalOpen(true)}
          className="h-8 w-8 p-0 hover:bg-red-300"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
        
        {/* 1. TAREAS ACTIVAS (Rojas y Rosas mezcladas según tu orden) */}
        {allActiveList.map((task) => (
          <Card
            key={task.id}
            className={`p-3 border-none shadow-sm ${
              task.viewed ? "bg-pink-200" : "bg-red-300"
            }`}
            onClick={() => {
              setActiveTask(task);
              setIsViewModalOpen(true);
            }}
          >
            {/* ... (Copia aquí el contenido de tu Card original para mantener diseño) ... */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800">
                {task.title}
              </h3>
              <div className="flex space-x-1">
                <Star
                  className={`h-5 w-5 ${
                    task.viewed ? "text-yellow-600 fill-current" : "text-gray-400"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleViewed(task.id);
                  }}
                  style={{ cursor: "pointer" }}
                />
                <Circle
                  className="h-5 w-5 text-gray-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompleted(task.id);
                  }}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>
            {task.description && (
              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            )}
            <TaskFooter task={task} />
          </Card>
        ))}

        {/* 2. SEPARADOR */}
        {allActiveList.length > 0 && sortedGroups.length > 0 && (
          <div className="flex items-center my-6">
            <div className="flex-1 border-t-2 border-red-300/50" />
            <span className="mx-3 text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
              <CircleCheck className="h-3 w-3" />
              Finalizadas
            </span>
            <div className="flex-1 border-t-2 border-red-300/50" />
          </div>
        )}

        {/* 3. HISTORIAL AGRUPADO */}
        {sortedGroups.map(([monthYear, groupTasks]) => (
          <Collapsible
            key={monthYear}
            open={openCompletedGroups.has(monthYear)}
            onOpenChange={() => toggleCompletedGroup(monthYear)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center my-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="flex-1 border-t border-red-300" />
                <span className="mx-2 px-2 py-1 text-xs font-semibold text-gray-600 uppercase bg-red-300 rounded-full flex items-center gap-1.5">
                  <Filter className="h-3 w-3" />
                  {monthYear}
                  <span className="bg-gray-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                    {groupTasks.length}
                  </span>
                  {openCompletedGroups.has(monthYear) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </span>
                <div className="flex-1 border-t border-red-300" />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="space-y-2 mt-2 opacity-75">
                {groupTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="p-3 border-none shadow-sm bg-gray-300 opacity-60 hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setActiveTask(task);
                      setIsViewModalOpen(true);
                    }}
                  >
                    {/* Usamos la misma estructura que las notas activas: Título a la izq, Iconos a la der */}
                    <div className="flex items-start justify-between mb-2">
                      
                      {/* TÍTULO TACHADO */}
                      <h3 className="font-semibold text-sm text-gray-600 line-through decoration-gray-500 decoration-1">
                        {task.title}
                      </h3>
                      
                      {/* CONTENEDOR DE ICONOS (ESTRELLA + CHECK) */}
                      <div className="flex space-x-1">
                        {/* 1. ESTRELLA (Recuperada) */}
                        <Star
                          className={`h-5 w-5 ${
                            task.viewed
                              ? "text-yellow-600 fill-current"
                              : "text-gray-400"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleViewed(task.id);
                          }}
                          style={{ cursor: "pointer" }}
                        />

                        {/* 2. CHECK VERDE (Para revivir) */}
                        <CircleCheckBig 
                          className="h-5 w-5 text-green-600 hover:text-green-700 hover:scale-110 transition-transform cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation(); 
                            toggleCompleted(task.id);
                          }}
                        />
                      </div>
                    </div>

                    <TaskFooter task={task} />
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}

      </div>

      <TaskViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setActiveTask(null);
        }}
        task={
          activeTask
            ? {
                id: activeTask.id,
                title: activeTask.title,
                project: activeTask.project,
                assigneeId: activeTask.assigneeId ?? user?.uid ?? "",
                viewed: activeTask.viewed,
                completed: activeTask.completed,
                favorite: activeTask.favorite,
                description: activeTask.description ?? undefined,
              }
            : null
        }
        readOnly={true}
        onSave={(updates) => {
          if (!activeTask) return;
          const upd = updates as Partial<
            ReceivedTask & { description?: string }
          >;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === activeTask.id
                ? {
                    ...t,
                    title: upd.title ?? t.title,
                    completed: (upd.completed ?? t.completed) as boolean,
                  }
                : t
            )
          );
        }}
        onDelete={() => {}}
      />
    </div>
  );
}
