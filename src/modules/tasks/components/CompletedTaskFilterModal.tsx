"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CompletedTask {
  id: string
  title: string
  project: string
  assignedTo?: string
  assignedBy?: string
  completedAt: Date
  favorite: boolean
  type: "assigned" | "received"
}

interface CompletedTaskFilterModalProps {
  isOpen: boolean
  onClose: () => void
  currentFilter: {
    user?: string
    project?: string
  }
  onApplyFilter: (filter: {
    user?: string
    project?: string
  }) => void
  tasks: CompletedTask[]
}

export function CompletedTaskFilterModal({
  isOpen,
  onClose,
  currentFilter,
  onApplyFilter,
  tasks,
}: CompletedTaskFilterModalProps) {
  const [user, setUser] = useState(currentFilter.user || "all")
  const [project, setProject] = useState(currentFilter.project || "all")

  useEffect(() => {
    setUser(currentFilter.user || "all")
    setProject(currentFilter.project || "all")
  }, [currentFilter])

  const uniqueUsers = Array.from(new Set(tasks.map((task) => task.assignedTo || task.assignedBy).filter(Boolean)))

  const uniqueProjects = Array.from(new Set(tasks.map((task) => task.project)))

  const handleApply = () => {
    onApplyFilter({
      user: user === "all" ? undefined : user,
      project: project === "all" ? undefined : project,
    })
    onClose()
  }

  const handleClear = () => {
    setUser("all")
    setProject("all")
    onApplyFilter({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filtrar Tareas Finalizadas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Usuario</Label>
            <Select value={user} onValueChange={setUser}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los usuarios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {uniqueUsers.map((userName) => (
                  <SelectItem key={userName} value={userName!}>
                    {userName}
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
                {uniqueProjects.map((proj) => (
                  <SelectItem key={proj} value={proj}>
                    {proj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
  )
}
