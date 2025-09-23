"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTask: (task: {
    title: string
    project: string
    assignedTo: string
    viewed: boolean
    completed: boolean
    favorite: boolean
  }) => void
}

const users = ["Juan Pérez", "María García", "Carlos López", "Ana Martínez", "Luis Rodríguez"]

const projects = ["Casa 1", "Casa 2", "Casa 3", "Proyecto General"]

export function AddTaskModal({ isOpen, onClose, onAddTask }: AddTaskModalProps) {
  const [title, setTitle] = useState("")
  const [project, setProject] = useState("")
  const [assignedTo, setAssignedTo] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && project && assignedTo) {
      onAddTask({
        title: title.trim(),
        project,
        assignedTo,
        viewed: false,
        completed: false,
        favorite: false,
      })
      setTitle("")
      setProject("")
      setAssignedTo("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Tarea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título de la tarea</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título de la tarea..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Proyecto</Label>
            <Select value={project} onValueChange={setProject} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((proj) => (
                  <SelectItem key={proj} value={proj}>
                    {proj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Asignar a</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un usuario" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Agregar Tarea</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
