"use client";

import { useEffect, useState } from "react";
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
import { useUsersMap } from "@/hooks/useUsersMap";

interface CompletedTask {
  id: string;
  title: string;
  project: string;
  assigneeId?: string;
  assignedBy?: string;
  completedAt: Date;
}

export function CompletedTaskFilterModal({
  isOpen,
  onClose,
  currentFilter,
  onApplyFilter,
  tasks,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentFilter: {
    user?: string;
    project?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  onApplyFilter: (f: {
    user?: string;
    project?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => void;
  tasks: CompletedTask[];
}) {
  const { getUserName } = useUsersMap();
  const [user, setUser] = useState(currentFilter.user || "all");
  const [project, setProject] = useState(currentFilter.project || "all");
  const [dateFrom, setDateFrom] = useState(currentFilter.dateFrom || "");
  const [dateTo, setDateTo] = useState(currentFilter.dateTo || "");

  useEffect(() => {
    setUser(currentFilter.user || "all");
    setProject(currentFilter.project || "all");
    setDateFrom(currentFilter.dateFrom || "");
    setDateTo(currentFilter.dateTo || "");
  }, [currentFilter]);

  const uniqueUsers: string[] = Array.from(
    new Set(
      tasks
        .map((t) => t.assigneeId || t.assignedBy)
        .filter((v): v is string => Boolean(v))
    )
  );
  const uniqueProjects: string[] = Array.from(
    new Set(tasks.map((t) => t.project).filter(Boolean))
  );

  const handleApply = () => {
    onApplyFilter({
      user: user === "all" ? undefined : user,
      project: project === "all" ? undefined : project,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setUser("all");
    setProject("all");
    setDateFrom("");
    setDateTo("");
    onApplyFilter({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filtrar Tareas Finalizadas</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Usuario</Label>
            <Select value={user} onValueChange={setUser}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los usuarios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {uniqueUsers.map((uid) => (
                  <SelectItem key={uid} value={uid}>
                    {getUserName(uid)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Proyecto</Label>
            <Select value={project} onValueChange={setProject}>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Desde</Label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Hasta</Label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
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
