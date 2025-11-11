"use client";

import { useEffect, useState } from "react";
import { Circle, Star, Filter, CircleCheckBig } from "lucide-react";
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

  const activeTasks = orderedTasks.filter(
    (task) => !task.completed && !task.viewed
  );
  const viewedTasks = orderedTasks.filter(
    (task) => task.viewed && !task.completed
  );
  const completedTasks = orderedTasks.filter((task) => task.completed);

  return (
    <div className="w-full bg-red-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-red-300 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">T. Recibidas</h2>
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
        {/* Active Tasks */}
        {activeTasks.map((task) => (
          <Card
            key={task.id}
            className="p-3 bg-red-300 border-none shadow-sm"
            onClick={() => {
              setActiveTask(task);
              setIsViewModalOpen(true);
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800">
                {task.title}
              </h3>
              <div className="flex space-x-1">
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
            <p className="text-sm text-gray-500 mt-1">
              Asignado por: {getUserName(task.assignedBy)}
            </p>
          </Card>
        ))}

        {/* Viewed Tasks */}
        {viewedTasks.map((task) => (
          <Card
            key={task.id}
            className="p-3 bg-pink-200 border-none shadow-sm"
            onClick={() => {
              setActiveTask(task);
              setIsViewModalOpen(true);
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-800">
                {task.title}
              </h3>
              <div className="flex space-x-1">
                <Star
                  className="h-5 w-5 text-yellow-600 fill-current"
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
              <p className="text-xs text-gray-600 mb-2">{task.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Asignado por: {getUserName(task.assignedBy)}
            </p>
          </Card>
        ))}

        {/* Completed Tasks */}
        {completedTasks.map((task) => (
          <Card
            key={task.id}
            className="p-3 bg-gray-300 border-none shadow-sm opacity-60"
            onClick={() => {
              setActiveTask(task);
              setIsViewModalOpen(true);
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-800 line-through">
                {task.title}
              </h3>
              <div className="flex space-x-1">
                <Star
                  className="h-5 w-5 text-yellow-600 fill-current"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleViewed(task.id);
                  }}
                  style={{ cursor: "pointer" }}
                />
                <CircleCheckBig
                  className="h-5 w-5 text-green-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompleted(task.id);
                  }}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>
            {task.description && (
              <p className="text-xs text-gray-600 mb-2">{task.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Asignado por: {getUserName(task.assignedBy)}
            </p>
          </Card>
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
      />
    </div>
  );
}
