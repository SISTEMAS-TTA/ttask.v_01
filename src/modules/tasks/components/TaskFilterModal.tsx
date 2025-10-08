"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUsersMap } from "@/hooks/useUsersMap";

interface Task {
  id: string;
  title: string;
  project: string;
  assigneeId?: string;
  assignedBy?: string;
  viewed?: boolean;
  completed?: boolean;
  favorite?: boolean;
  createdAt?: Date;
}

type ViewValue = "all" | "viewed" | "pending" | "completed" | "favorites";

interface TaskFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilter: {
    user?: string;
    project?: string;
    view?: string;
  };
  onApplyFilter: (filter: {
    user?: string;
    project?: string;
    view?: string;
  }) => void;
  tasks: Task[];
  userField?: "assigneeId" | "assignedBy";
  viewOptions?: { value: string; label: string }[];
}

export function TaskFilterModal({
  isOpen,
  onClose,
  currentFilter,
  onApplyFilter,
  tasks,
  userField = "assigneeId",
  viewOptions = [
    { value: "all", label: "Todas" },
    { value: "viewed", label: "Vistas" },
    { value: "completed", label: "Terminadas" },
    { value: "favorites", label: "Favoritas" },
  ],
}: TaskFilterModalProps) {
  const { getUserName } = useUsersMap();

  const [selectedUser, setSelectedUser] = useState(currentFilter.user || "all");
  const [selectedProject, setSelectedProject] = useState(
    currentFilter.project || "all"
  );
  const [view, setView] = useState<string>(currentFilter.view || "all");

  useEffect(() => {
    setSelectedUser(currentFilter.user || "all");
    setSelectedProject(currentFilter.project || "all");
    setView(currentFilter.view || "all");
  }, [currentFilter]);

  const uniqueUsers: string[] = Array.from(
    new Set(
      tasks
        .map((task) =>
          userField === "assigneeId" ? task.assigneeId : task.assignedBy
        )
        .filter((v): v is string => Boolean(v))
    )
  );

  const uniqueProjects: string[] = Array.from(
    new Set(tasks.map((task) => task.project).filter(Boolean))
  );

  const handleApply = () => {
    onApplyFilter({
      user: selectedUser === "all" ? undefined : selectedUser,
      project: selectedProject === "all" ? undefined : selectedProject,
      view,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedUser("all");
    setSelectedProject("all");
    setView("all");
    onApplyFilter({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filtrar Tareas</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>
              {userField === "assigneeId" ? "Asignado a" : "Asignado por"}
            </Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los usuarios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {uniqueUsers.map((userId) => (
                  <SelectItem key={userId} value={userId}>
                    {getUserName(userId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Proyecto</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los proyectos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {uniqueProjects.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Vista</Label>
            <RadioGroup value={view} onValueChange={(value) => setView(value)}>
              {viewOptions.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={opt.value} />
                  <Label htmlFor={opt.value}>{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClear}>
              Limpiar
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleApply}>Aplicar Filtros</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
