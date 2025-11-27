"use client";

import { useEffect, useState } from "react";
import { UserRole } from "@/modules/types";
import { Plus, Filter, Star, Circle } from "lucide-react";
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

// [NUEVO]: Componente de pie de página para Tareas Asignadas
const AssignedTaskFooter = ({
  task,
  getUserName,
}: {
  task: UITask;
  getUserName: (uid: string) => string;
}) => {
  // Obtenemos el nombre usando el hook de mapa de usuarios
  const assigneeName = task.assigneeId
    ? getUserName(task.assigneeId)
    : "Sin asignar";

  return (
    <div className="text-sm text-gray-500 mt-1 border-t border-blue-200/50 pt-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-gray-400">Para:</span>
        <span
          className="text-xs font-semibold text-gray-700 truncate max-w-[120px]"
          title={assigneeName}
        >
          {assigneeName}
        </span>
      </div>
      <p className="text-[10px] text-right mt-1 text-gray-400">
        {task.createdAt.toLocaleString("es-MX", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
};

// Tipos de vista compatibles con el modal
// type ViewValue = "all" | "viewed" | "completed" | "favorites";

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
        console.debug(
          "subscribeToTasksAssignedBy -> received docs:",
          mapped.map((m) => ({ id: m.id, favorite: m.favorite }))
        );
        setTasks(mapped);
      },
      () => setTasks([])
    );

    return () => unsubscribe();
  }, [user, userLoading]);

  // Mantener activeTask en sync con la lista de tasks para reflejar cambios guardados
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

    // Construir el payload con soporte para múltiples destinatarios
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
      // No necesitamos actualizar el estado local manualmente,
      // la suscripción (onSnapshot) lo hará automáticamente.
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Hubo un error al crear la tarea.");
    }
  };

  // --- Funcion para elimminar la tarea ---
  const handleDeleteTask = async (taskId: string) => {
    try {
      // 1. Borrar de Firebase
      await deleteTask(taskId);

      // 2. Actualizar la lista visualmente (para que desaparezca al instante)
      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      // 3. Cerrar el modal y limpiar selección
      setIsViewModalOpen(false);
      setActiveTask(null);
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      alert("No se pudo eliminar la tarea");
    }
  };

  // Aplicar filtros
  const filteredTasks = tasks.filter((task) => {
    if (filter.user && task.assigneeId !== filter.user) return false;
    if (filter.project && task.project !== filter.project) return false;
    if (filter.view === "viewed" && !task.viewed) return false;
    if (filter.view === "favorites" && !task.favorite) return false;
    return true;
  });
  // (nota: descomentaba vistas separadas si se necesitan más adelante)

  // Orden: no vistas primero, luego favoritas arriba
  const orderedTasks = filteredTasks.slice().sort((a, b) => {
    // Primero ordenar por viewed (no vistas primero)
    if (a.viewed !== b.viewed) return a.viewed ? 1 : -1;
    // Luego por favoritas
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    return 0;
  });

  // Visibles en asignadas: excluir las completadas
  const visibleTasks = orderedTasks.filter((t) => !t.completed);

  return (
    <div className="w-full bg-blue-100 flex flex-col h-full">
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
        {/* Active Tasks */}
        {visibleTasks.map((task) => (
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
                    task.viewed
                      ? "text-yellow-600 fill-current"
                      : "text-gray-400"
                  }`}
                  aria-hidden
                />
                <Circle className="h-5 w-5 text-gray-400" aria-hidden />
              </div>
            </div>
            {task.description && (
              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            )}
            {/* [IMPLEMENTACIÓN]: Footer con el asignado y la fecha/hora */}
            <AssignedTaskFooter task={task} getUserName={getUserName} />
          </Card>
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
