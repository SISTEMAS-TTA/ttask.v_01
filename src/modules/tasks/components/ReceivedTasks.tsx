"use client";

import { useEffect, useState } from "react";
import { Eye, Check, Star, Filter, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useUser from "@/modules/auth/hooks/useUser";
import { subscribeToTasksAssignedTo, updateTask } from "@/lib/firebase/tasks";
import { useUsersMap } from "@/hooks/useUsersMap";

interface ReceivedTask {
  id: string;
  title: string;
  project: string;
  assignedBy: string;
  viewed: boolean;
  completed: boolean;
  favorite: boolean;
  createdAt: Date;
}

const initialReceivedTasks: ReceivedTask[] = [];

export function ReceivedTasksColumn() {
  const { user, loading: userLoading } = useUser();
  const { getUserName } = useUsersMap();
  const [tasks, setTasks] = useState<ReceivedTask[]>(initialReceivedTasks);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState<{
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
        setTasks(
          docs.map((d) => ({
            id: d.id,
            title: d.title,
            project: d.project,
            assignedBy: d.assignedBy,
            viewed: d.viewed,
            completed: d.completed,
            favorite: d.favorite,
            createdAt: d.createdAt.toDate(),
          }))
        );
      },
      () => setTasks([])
    );
    return () => unsub();
  }, [user, userLoading]);

  const toggleViewed = async (id: string) => {
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    await updateTask(id, { viewed: !current.viewed });
  };

  const toggleCompleted = async (id: string) => {
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    await updateTask(id, { completed: !current.completed });
  };

  const toggleFavorite = async (id: string) => {
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    await updateTask(id, { favorite: !current.favorite });
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
          return true;
      }
    }
    return true;
  });

  const activeTasks = filteredTasks.filter(
    (task) => !task.completed && !task.viewed
  );
  const viewedTasks = filteredTasks.filter(
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
          <Card key={task.id} className="p-3 bg-red-300 border-none shadow-sm">
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
                  onClick={() => toggleViewed(task.id)}
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
                  onClick={() => toggleCompleted(task.id)}
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
              Asignado por: {getUserName(task.assignedBy)}
            </p>
          </Card>
        ))}

        {/* Viewed Tasks */}
        {viewedTasks.map((task) => (
          <Card
            key={task.id}
            className="p-3 bg-pink-200 border-none shadow-sm opacity-70"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-800">
                {task.title}
              </h3>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleViewed(task.id)}
                  className="h-8 w-8 p-0 hover:bg-black/10"
                >
                  <Check className="h-5 w-5 text-blue-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleCompleted(task.id)}
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
              Asignado por: {getUserName(task.assignedBy)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
