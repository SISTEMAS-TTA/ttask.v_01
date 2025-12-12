"use client";

import { useEffect, useState } from "react";
import { UserRole } from "@/modules/types";
import { Plus, Filter, Star, Circle, ChevronDown, ChevronRight, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddTaskModal } from "@/modules/tasks/components/AddTaskModal";
import { TaskFilterModal } from "@/modules/tasks/components/TaskFilterModal";
import { TaskViewModal } from "@/modules/tasks/components/TaskViewModal";
import useUser from "@/modules/auth/hooks/useUser";
import {
  createTask,
  NewTaskInput,
  subscribeToTasksAssignedBy,
  deleteTask,
} from "@/lib/firebase/tasks";
import { useUsersMap } from "@/hooks/useUsersMap";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface UITask {
  id: string;
  title: string;
  project: string;
  assigneeId: string;
  viewed: boolean;
  completed: boolean;
  favorite: boolean;
  description?: string;
  createdAt: Date;
  lastCommentAt?: Date;
  lastSeenByAssignerAt?: Date;
}

const initialTasks: UITask[] = [];

export function TasksColumn() {
  const { user, loading: userLoading } = useUser();
  const { getUserName } = useUsersMap();
  const [tasks, setTasks] = useState<UITask[]>(initialTasks);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<UITask | null>(null);
  const [filter, setFilter] = useState<{
    user?: string;
    project?: string;
    view?: string;
  }>({});

  // Estado para los acordeones de historial
  const [openCompletedGroups, setOpenCompletedGroups] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setTasks([]);
      return;
    }

    const unsubscribe = subscribeToTasksAssignedBy(
      user.uid,
      (docs) => {
        const mapped = docs.map((d) => ({
          id: d.id,
          title: d.title,
          project: d.project,
          assigneeId: d.assigneeId,
          description: d.description ?? "",
          viewed: d.viewed,
          completed: d.completed,
          favorite: Boolean(d.favorites?.[user!.uid]) || Boolean(d.favorite),
          createdAt: d.createdAt.toDate(),
          lastCommentAt: d.lastCommentAt ? d.lastCommentAt.toDate() : undefined,
          lastSeenByAssignerAt: d.lastSeenByAssignerAt
            ? d.lastSeenByAssignerAt.toDate()
            : undefined,
        }));
        setTasks(mapped);
      },
      () => setTasks([])
    );

    return () => unsubscribe();
  }, [user, userLoading]);

  // Mantener activeTask en sync
  useEffect(() => {
    if (!activeTask) return;
    const latest = tasks.find((t) => t.id === activeTask.id);
    if (latest) setActiveTask(latest);
  }, [tasks, activeTask]);

  const addTask = async (task: {
    title: string;
    project: string;
    assigneeIds?: string[];
    assigneeRoles?: UserRole[];
    description?: string;
  }) => {
    if (!user) return;

    const payload: NewTaskInput = {
      title: task.title,
      project: task.project,
      description: task.description || "",
      viewed: false,
      completed: false,
      favorite: false,
      assigneeIds: task.assigneeIds,
      assigneeRoles: task.assigneeRoles,
    };

    try {
      await createTask(user.uid, payload);
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Hubo un error al crear la tarea.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setIsViewModalOpen(false);
      setActiveTask(null);
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      alert("No se pudo eliminar la tarea");
    }
  };

  // Filtros y Ordenamiento
  const filteredTasks = tasks.filter((task) => {
    if (filter.user && task.assigneeId !== filter.user) return false;
    if (filter.project && task.project !== filter.project) return false;
    if (filter.view === "viewed" && !task.viewed) return false;
    if (filter.view === "favorites" && !task.favorite) return false;
    return true;
  });

  const orderedTasks = filteredTasks.slice().sort((a, b) => {
    if (a.viewed !== b.viewed) return a.viewed ? 1 : -1;
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    return 0;
  });

  // --- LÓGICA DE HISTORIAL Y AGRUPACIÓN ---

  const toggleCompletedGroup = (monthYear: string) => {
    setOpenCompletedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(monthYear)) newSet.delete(monthYear);
      else newSet.add(monthYear);
      return newSet;
    });
  };

  const activeTasks = orderedTasks.filter((t) => !t.completed);
  const completedTasks = orderedTasks.filter((t) => t.completed);

  const getTaskDate = (task: UITask) => task.createdAt;
  
  const formatMonthYear = (date: Date) => 
    date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
        .replace(/^\w/, (c) => c.toUpperCase());

  const groupedCompletedTasks = completedTasks.reduce((groups, task) => {
    const date = getTaskDate(task);
    const monthYear = formatMonthYear(date);
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(task);
    return groups;
  }, {} as Record<string, UITask[]>);

  const sortedGroups = Object.entries(groupedCompletedTasks).sort((a, b) => {
    const dateA = getTaskDate(a[1][0]).getTime();
    const dateB = getTaskDate(b[1][0]).getTime();
    return dateB - dateA;
  });

  return (
    <div className="w-full bg-blue-100 flex flex-col h-[500px] md:h-full">
      {/* Header */}
      <div className="p-4 border-b border-blue-200 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          T. Asignadas
        </h2>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAddModalOpen(true)}
            className="h-8 w-8 p-0 hover:bg-blue-200"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFilterModalOpen(true)}
            className="h-8 w-8 p-0 hover:bg-blue-200"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
        
        {/* 1. TAREAS ACTIVAS (Lista normal) */}
        {activeTasks.map((task) => (
          <Card
            key={task.id}
            className={`p-3 border-none shadow-sm ${
              task.viewed ? "bg-gray-300" : "bg-blue-200"
            }`}
            onClick={() => {
              setActiveTask(task);
              setIsViewModalOpen(true);
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800">
                {task.title}
              </h3>
              <div className="flex items-center space-x-1 relative">
                {task.lastCommentAt &&
                  (!task.lastSeenByAssignerAt ||
                    task.lastCommentAt > task.lastSeenByAssignerAt) && (
                    <span className="absolute -top-1 -right-1 inline-block w-2 h-2 rounded-full bg-red-600" />
                  )}
                <Star
                  className={`h-5 w-5 ${
                    task.favorite ? "text-yellow-600 fill-current" : "text-gray-400"
                  }`}
                />
                <Circle className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            {task.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
            )}
            
            {/* --- SECCIÓN DE FECHA ACTUALIZADA CON HORA --- */}
            <div className="mt-2 pt-2 border-t border-blue-300/30">
              <p className="text-xs text-gray-600">
                Asignado a: <span className="font-medium">{getUserName(task.assigneeId)}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Asignado: {task.createdAt.toLocaleString("es-MX", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true
                })}
              </p>
            </div>
          </Card>
        ))}

        {/* 2. SEPARADOR (Solo si hay historial) */}
        {activeTasks.length > 0 && sortedGroups.length > 0 && (
          <div className="flex items-center my-6">
            <div className="flex-1 border-t-2 border-blue-300/50" />
            <span className="mx-3 text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
              <CircleCheck className="h-3 w-3" />
              Finalizadas
            </span>
            <div className="flex-1 border-t-2 border-blue-300/50" />
          </div>
        )}

        {/* 3. HISTORIAL AGRUPADO (Acordeones) */}
        {sortedGroups.map(([monthYear, groupTasks]) => (
          <Collapsible
            key={monthYear}
            open={openCompletedGroups.has(monthYear)}
            onOpenChange={() => toggleCompletedGroup(monthYear)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center my-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="flex-1 border-t border-blue-300" />
                <span className="mx-2 px-2 py-1 text-xs font-semibold text-gray-600 uppercase bg-blue-200 rounded-full flex items-center gap-1.5">
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
                <div className="flex-1 border-t border-blue-300" />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="space-y-2 mt-2 opacity-75">
                {groupTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="p-3 border-none shadow-sm bg-gray-200"
                    onClick={() => {
                      setActiveTask(task);
                      setIsViewModalOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-gray-600 line-through decoration-gray-400">
                        {task.title}
                      </h3>
                      <CircleCheck className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Finalizada el {task.createdAt.toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}

      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={addTask}
      />

      <TaskViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        task={activeTask}
        onSave={(updates) => {
          if (!activeTask) return;
          const upd = updates as Partial<UITask & { description?: string }>;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === activeTask.id
                ? {
                    ...t,
                    title: upd.title ?? t.title,
                    description:
                      upd.description ??
                      (t as unknown as { description?: string }).description,
                    completed: (upd.completed ?? t.completed) as boolean,
                  }
                : t
            )
          );
        }}
        onDelete={handleDeleteTask}
      />

      <TaskFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilter={filter}
        onApplyFilter={setFilter}
        tasks={tasks}
      />
    </div>
  );
}