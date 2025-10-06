"use client";

import { useState } from "react";
import { Plus, Filter, Eye, Check, Star, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddTaskModal } from "@/modules/tasks/components/AddTaskModal";
import { TaskFilterModal } from "@/modules/tasks/components/TaskFilterModal";

interface Task {
  id: string;
  title: string;
  project: string;
  assignedTo: string;
  viewed: boolean;
  completed: boolean;
  favorite: boolean;
  createdAt: Date;
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "TITULO DE LA TAREA",
    project: "Proyecto al que pertenece",
    assignedTo: "Juan Pérez",
    viewed: false,
    completed: false,
    favorite: true,
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "TITULO DE LA TAREA",
    project: "Proyecto al que pertenece",
    assignedTo: "María García",
    viewed: true,
    completed: false,
    favorite: false,
    createdAt: new Date(),
  },
];

export function TasksColumn() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState<{
    assignedTo?: string;
    view?: "all" | "viewed" | "completed" | "favorites";
  }>({ view: "all" });

  const toggleViewed = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, viewed: !task.viewed } : task
      )
    );
  };

  // const toggleCompleted = (id: string) => {
  //   setTasks(
  //     tasks.map((task) =>
  //       task.id === id ? { ...task, completed: !task.completed } : task
  //     )
  //   );
  // };

  // const toggleComplete = (id: string) => {
  //   setNotes((prevNotes) =>
  //     prevNotes.map((note) =>
  //       note.id === id ? { ...note, completed: !note.completed } : note
  //     )
  //   );
  // };
  const toggleCompleted = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const toggleFavorite = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, favorite: !task.favorite } : task
      )
    );
  };

  const addTask = (newTask: Omit<Task, "id" | "createdAt">) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTasks([task, ...tasks]);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter.assignedTo && task.assignedTo !== filter.assignedTo)
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
        {activeTasks.map((task) => (
          <Card key={task.id} className="p-3 bg-blue-200 border-none shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-800">
                {task.title}
              </h3>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleCompleted(task.id)}
                  className="h-8 w-8 p-0 hover:bg-black/10"
                >
                  <Check
                    className={`h-5 w-5 ${
                      task.completed ? "text-green-600" : "text-gray-400"
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
              Asignado a: {task.assignedTo}
            </p>
          </Card>
        ))}

        {/* Viewed Tasks */}
        {viewedTasks.map((task) => (
          <Card
            key={task.id}
            className="p-3 bg-blue-200 border-none shadow-sm opacity-70"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-800">
                {task.title}
              </h3>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleCompleted(task.id)}
                  className="h-8 w-8 p-0 hover:bg-black/10"
                >
                  <Check
                    className={`h-5 w-5 ${
                      task.completed ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleViewed(task.id)}
                  className="h-8 w-8 p-0 hover:bg-black/10"
                >
                  <Eye className="h-5 w-5 text-blue-600" />
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
              Asignado a: {task.assignedTo}
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
        tasks={tasks}
      />
    </div>
  );
}
