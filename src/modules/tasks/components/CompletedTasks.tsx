"use client";

import { useEffect, useState } from "react";
import { Filter, Star, CircleCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompletedTaskFilterModal } from "@/modules/tasks/components/CompletedTaskFilterModal";
import useUser from "@/modules/auth/hooks/useUser";
import { subscribeToCompletedTasks } from "@/lib/firebase/tasks";
import { useUsersMap } from "@/hooks/useUsersMap";

interface CompletedTask {
  id: string;
  title: string;
  project: string;
  assigneeId?: string;
  assignedBy?: string;
  completedAt: Date;
  favorite: boolean;
  type: "assigned" | "received";
  description?: string;
}

const initialCompletedTasks: CompletedTask[] = [];

export function CompletedTasksColumn() {
  const { user, loading: userLoading } = useUser();
  const { getUserName } = useUsersMap();
  const [tasks, setTasks] = useState<CompletedTask[]>(initialCompletedTasks);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState<{
    user?: string;
    project?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  useEffect(() => {
    if (userLoading || !user) return;

    const unsubscribe = subscribeToCompletedTasks(
      user.uid,
      (docs) => {
        const completedTasks = docs.map((d) => ({
          id: d.id,
          title: d.title,
          project: d.project,
          assigneeId: d.assigneeId,
          assignedBy: d.assignedBy,
          completedAt: d.updatedAt?.toDate() ?? d.createdAt.toDate(),
          favorite: Boolean(d.favorites?.[user!.uid]) || Boolean(d.favorite),
          type: (d.assignedBy === user.uid ? "assigned" : "received") as
            | "assigned"
            | "received",
          description: d.description ?? "",
        }));
        console.debug(
          "subscribeToCompletedTasks -> received docs:",
          completedTasks.map((m) => ({ id: m.id, favorite: m.favorite }))
        );
        setTasks(completedTasks);
      },
      () => setTasks([])
    );

    return () => unsubscribe();
  }, [user, userLoading]);

  const filteredTasks = tasks.filter((task) => {
    if (filter.user) {
      const taskUser = task.assigneeId || task.assignedBy;
      if (taskUser !== filter.user) return false;
    }
    if (filter.project && task.project !== filter.project) return false;
    if (filter.dateFrom) {
      const from = new Date(filter.dateFrom);
      if (task.completedAt < from) return false;
    }
    if (filter.dateTo) {
      const to = new Date(filter.dateTo);
      if (
        task.completedAt >
        new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
      )
        return false;
    }
    return true;
  });

  const orderedTasks = filteredTasks.slice().sort((a, b) => {
    if (a.favorite === b.favorite) {
      return b.completedAt.getTime() - a.completedAt.getTime();
    }
    return a.favorite ? -1 : 1;
  });

  return (
    <div className="w-full bg-green-100 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-green-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">T. Finalizadas</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsFilterModalOpen(true)}
          className="h-8 w-8 p-0 hover:bg-green-200"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {orderedTasks.map((task) => (
          <Card
            key={task.id}
            className="p-3 bg-green-200 border-none shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-800 line-through">
                {task.title}
              </h3>
              <div className="flex space-x-1">
                <Star
                  className="h-5 w-5 text-yellow-600 fill-current"
                  aria-hidden
                />
                <CircleCheckBig
                  className="h-5 w-5 text-green-600"
                  aria-hidden
                />
              </div>
            </div>
            {task.description && (
              <p className="text-xs text-gray-600 mb-2">{task.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {task.type === "assigned"
                ? `Asignado a: ${getUserName(task.assigneeId!)}`
                : `Asignado por: ${getUserName(task.assignedBy!)}`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Completado:{" "}
              {task.completedAt.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </Card>
        ))}
      </div>

      <CompletedTaskFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilter={filter}
        onApplyFilter={setFilter}
        tasks={tasks}
      />
    </div>
  );
}
