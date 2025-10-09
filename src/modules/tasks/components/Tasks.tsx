"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Filter, Eye, Check, Star, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddTaskModal } from "@/modules/tasks/components/AddTaskModal";
import { TaskFilterModal } from "@/modules/tasks/components/TaskFilterModal";
import useUser from "@/modules/auth/hooks/useUser";
import {
  createTask,
  NewTaskInput,
  subscribeToTasksAssignedBy,
  updateTaskFavorite,
} from "@/lib/firebase/tasks";
import { useUsersMap } from "@/hooks/useUsersMap";
import { Timestamp } from "firebase/firestore";

interface UITask {
  id: string;
  title: string;
  project: string;
  assigneeId: string;
  viewed: boolean;
  completed: boolean;
  favorite: boolean;
  createdAt: Date;
}

const initialTasks: UITask[] = [];

export function TasksColumn() {
  const { user, loading: userLoading } = useUser();
  const { getUserName } = useUsersMap();
  const [tasks, setTasks] = useState<UITask[]>(initialTasks);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState<{
    assigneeId?: string;
    view?: "all" | "viewed" | "completed" | "favorites";
  }>({ view: "all" });

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
          viewed: d.viewed,
          completed: d.completed,
          favorite: Boolean(d.favorites?.[user!.uid]) || Boolean(d.favorite),
          createdAt: d.createdAt.toDate(),
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

  const toggleFavorite = async (id: string) => {
    const current = tasks.find((t) => t.id === id);
    if (!current || !user?.uid) return;

    console.debug("toggleFavorite requested", {
      id,
      currentFavorite: current.favorite,
      user: user.uid,
    });
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
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, favorite: current.favorite } : t
        )
      );
    }
  };

  const addTask = async (task: {
    title: string;
    project: string;
    assigneeId: string;
    description?: string;
  }) => {
    if (!user) return;
    const payload: NewTaskInput = {
      title: task.title,
      project: task.project,
      description: task.description ?? "",
      assigneeId: task.assigneeId,
      viewed: false,
      completed: false,
      favorite: false,
    } as any;
    await createTask(user.uid, payload);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter.assigneeId && task.assigneeId !== filter.assigneeId)
      return false;

    switch (filter.view) {
      case "viewed":
        return task.viewed && !task.completed;
      case "completed":
        return task.completed;
      case "favorites":
        return task.favorite && !task.completed;
      default:
        return true;
    }
  });
  const activeTasks = filteredTasks.filter(
    (task) => !task.completed && !task.viewed
  );
  const viewedTasks = filteredTasks.filter(
    (task) => task.viewed && !task.completed
  );
  const completedTasks = filteredTasks.filter((task) => task.completed);

  // Orden: favoritas arriba
  const orderedTasks = filteredTasks
    .slice()
    .sort((a, b) => (a.favorite === b.favorite ? 0 : a.favorite ? -1 : 1));

  // Visibles en asignadas: excluir las completadas (segundo check)
  const visibleTasks = orderedTasks.filter((t) => !t.completed);

  return (
    <div className="w-full bg-blue-100 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-blue-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">T. Asignadas</h2>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Active Tasks */}
        {visibleTasks.map((task) => (
          <Card key={task.id} className="p-3 bg-blue-200 border-none shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <h3
                className={`font-semibold text-sm text-gray-800 ${
                  task.viewed ? "line-through opacity-70" : ""
                }`}
              >
                {task.title}
              </h3>
              <div className="flex space-x-1">
                {/* Checks deshabilitados para el asignador */}
                <Check className="h-5 w-5 text-gray-400" aria-hidden />
                <CheckCheck className="h-5 w-5 text-gray-400" aria-hidden />
                {/* Mantener estrella/favorito como esté implementado */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleFavorite(task.id)}
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
            <p className="text-xs text-gray-600">{task.project}</p>
            <p className="text-xs text-gray-500 mt-1">
              Asignado a: {getUserName(task.assigneeId)}
            </p>
          </Card>
        ))}
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={addTask}
      />

      <TaskFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilter={filter}
        onApplyFilter={setFilter}
        tasks={tasks as any}
      />
    </div>
  );
}
