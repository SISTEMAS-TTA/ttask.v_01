"use client";

import { useEffect, useState } from "react";
import { Check, Star, Filter, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TaskViewModal } from "@/modules/tasks/components/TaskViewModal";
import useUser from "@/modules/auth/hooks/useUser";
import {
  subscribeToTasksAssignedTo,
  updateTask,
  updateTaskFavorite,
} from "@/lib/firebase/tasks";
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

  const onToggleViewed = async (taskId: string, next: boolean) => {
    try {
      await updateTask(taskId, { viewed: next }, user?.uid);
    } catch (e) {
      console.warn("No autorizado para marcar viewed", e);
    }
  };

  const onToggleCompleted = async (taskId: string, next: boolean) => {
    try {
      await updateTask(taskId, { completed: next }, user?.uid);
    } catch (e) {
      console.warn("No autorizado para marcar completed", e);
    }
  };

  const toggleFavorite = async (id: string) => {
    const current = tasks.find((t) => t.id === id);
    if (!current || !user?.uid) return;

    console.debug("toggleFavorite requested", {
      id,
      currentFavorite: current.favorite,
      user: user.uid,
    });
    // Optimista: actualizar UI inmediatamente
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t))
    );

    try {
      await updateTaskFavorite(id, user.uid, !current.favorite);
      console.debug("updateTaskFavorite succeeded", {
        id,
        newValue: !current.favorite,
      });
    } catch (err) {
      console.error("Error al actualizar favorito", err);
      // Revertir en caso de error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, favorite: current.favorite } : t
        )
      );
    }
  };

  // Apply filters
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
          return !task.completed;
      }
    }
    return !task.completed;
  });

  // Orden: favoritas arriba
  const orderedTasks = filteredTasks
    .slice()
    .sort((a, b) => (a.favorite === b.favorite ? 0 : a.favorite ? -1 : 1));

  const activeTasks = orderedTasks.filter(
    (task) => !task.completed && !task.viewed
  );
  const viewedTasks = orderedTasks.filter(
    (task) => task.viewed && !task.completed
  );

  return (
    <div className="w-full bg-red-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-red-300 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">T. Recibidas</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsFilterModalOpen(true)}
          className="h-8 w-8 p-0 hover:bg-red-300"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Active Tasks */}
        {activeTasks.map((task) => (
          <Card
            key={task.id}
            className="p-3 bg-red-300 border-none shadow-sm"
            onClick={() => {
              setActiveTask(task);
              setIsViewModalOpen(true);
              if (!task.viewed) onToggleViewed(task.id, true);
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <h3
                className={`font-semibold text-sm text-gray-800 ${
                  task.viewed ? "line-through opacity-70" : ""
                }`}
              >
                {task.title}
              </h3>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleViewed(task.id, !task.viewed);
                  }}
                  className="h-8 w-8 p-0 hover:bg-black/10"
                >
                  <Check
                    className={`h-5 w-5 ${
                      task.viewed ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompleted(task.id, !task.completed);
                  }}
                  className="h-8 w-8 p-0 hover:bg-black/10"
                >
                  <CheckCheck
                    className={`h-5 w-5 ${
                      task.completed ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(task.id);
                  }}
                  className="h-8 w-8 p-0 hover:bg-black/10"
                >
                  <Star
                    className={`h-5 w-5 ${
                      task.favorite
                        ? "text-yellow-600 fill-current"
                        : "text-gray-400"
                    }`}
                  />
                </Button>
              </div>
            </div>
            {task.description && (
              <p className="text-xs text-gray-600 mb-2">{task.description}</p>
            )}
            <p className="text-xs text-gray-600">{task.project}</p>
            <p className="text-xs text-gray-500 mt-1">
              Asignado por: {getUserName(task.assignedBy)}
            </p>
          </Card>
        ))}

        {/* Viewed Tasks */}
        {viewedTasks.map((task) => (
          <Card
            key={task.id}
            className="p-3 bg-pink-200 border-none shadow-sm opacity-70"
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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleViewed(task.id, !task.viewed);
                  }}
                  className="h-8 w-8 p-0 hover:bg-black/10"
                >
                  <Check className="h-5 w-5 text-blue-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompleted(task.id, !task.completed);
                  }}
                  className="h-8 w-8 p-0 hover:bg-black/10"
                >
                  <CheckCheck
                    className={`h-5 w-5 ${
                      task.completed ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(task.id);
                  }}
                  className="h-8 w-8 p-0 hover:bg-black/10"
                >
                  <Star
                    className={`h-5 w-5 ${
                      task.favorite
                        ? "text-yellow-600 fill-current"
                        : "text-gray-400"
                    }`}
                  />
                </Button>
              </div>
            </div>
            {task.description && (
              <p className="text-xs text-gray-600 mb-2">{task.description}</p>
            )}
            <p className="text-xs text-gray-600">{task.project}</p>
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
