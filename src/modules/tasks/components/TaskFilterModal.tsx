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

interface Task {
  id: string;
  title: string;
  project: string;
  assigneeId: string;
  viewed: boolean;
  completed: boolean;
  favorite: boolean;
  createdAt: Date;
}

interface TaskFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilter: {
    assigneeId?: string;
    view?: "all" | "viewed" | "completed" | "favorites";
  };
  onApplyFilter: (filter: {
    assigneeId?: string;
    view?: "all" | "viewed" | "completed" | "favorites";
  }) => void;
  tasks: Task[];
}

export function TaskFilterModal({
  isOpen,
  onClose,
  currentFilter,
  onApplyFilter,
  tasks,
}: TaskFilterModalProps) {
  const [assignedTo, setAssignedTo] = useState(
    currentFilter.assigneeId || "all"
  );
  const [view, setView] = useState(currentFilter.view || "all");

  useEffect(() => {
    setAssignedTo(currentFilter.assigneeId || "all");
    setView(currentFilter.view || "all");
  }, [currentFilter]);

  const uniqueUsers: string[] = Array.from(
    new Set(tasks.map((task) => task.assigneeId))
  );

  const handleApply = () => {
    onApplyFilter({
      assigneeId: assignedTo === "all" ? undefined : assignedTo,
      view: view as "all" | "viewed" | "completed" | "favorites",
    });
    onClose();
  };

  const handleClear = () => {
    setAssignedTo("all");
    setView("all");
    onApplyFilter({ view: "all" });
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
            <Label>Asignado a</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los usuarios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {uniqueUsers.map((userId) => (
                  <SelectItem key={userId} value={userId}>
                    {userId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Vista</Label>
            <RadioGroup
              value={view}
              onValueChange={(value) =>
                setView(value as "all" | "viewed" | "completed" | "favorites")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">Todas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="viewed" id="viewed" />
                <Label htmlFor="viewed">Vistas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completed" id="completed" />
                <Label htmlFor="completed">Terminadas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="favorites" id="favorites" />
                <Label htmlFor="favorites">Favoritas</Label>
              </div>
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
