"use client"

import { useState } from "react"
import { Filter, Check, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CompletedTaskFilterModal } from "@/components/modals/CompletedTaskFilterModal"

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

const initialCompletedTasks: CompletedTask[] = [
  {
    id: "1",
    title: "TITULO DE LA TAREA",
    project: "Proyecto al que pertenece",
    assignedTo: "Juan Pérez",
    completedAt: new Date(),
    favorite: false,
    type: "assigned",
  },
  {
    id: "2",
    title: "TITULO DE LA TAREA",
    project: "Proyecto al que pertenece",
    assignedTo: "María García",
    completedAt: new Date(),
    favorite: true,
    type: "assigned",
  },
  {
    id: "3",
    title: "TITULO DE LA TAREA",
    project: "Proyecto al que pertenece",
    assignedBy: "Carlos López",
    completedAt: new Date(),
    favorite: false,
    type: "received",
  },
  {
    id: "4",
    title: "TITULO DE LA TAREA",
    project: "Proyecto al que pertenece",
    assignedTo: "Ana Martínez",
    completedAt: new Date(),
    favorite: true,
    type: "assigned",
  },
]

export function CompletedTasksColumn() {
  const [tasks, setTasks] = useState<CompletedTask[]>(initialCompletedTasks)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filter, setFilter] = useState<{
    user?: string
    project?: string
  }>({})

  const toggleFavorite = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, favorite: !task.favorite } : task)))
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter.user) {
      const taskUser = task.assignedTo || task.assignedBy
      if (taskUser !== filter.user) return false
    }
    if (filter.project && task.project !== filter.project) return false
    return true
  })

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
        {filteredTasks.map((task) => (
          <Card key={task.id} className="p-3 bg-green-200 border-none shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-800 line-through">{task.title}</h3>
              <div className="flex space-x-1">
                <Check className="h-3 w-3 text-green-600" />
                <Check className="h-3 w-3 text-green-600" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleFavorite(task.id)}
                  className="h-6 w-6 p-0 hover:bg-black/10"
                >
                  <Star className={`h-3 w-3 ${task.favorite ? "text-yellow-600 fill-current" : "text-gray-400"}`} />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-600">{task.project}</p>
            <p className="text-xs text-gray-500 mt-1">
              {task.type === "assigned" ? `Asignado a: ${task.assignedTo}` : `Asignado por: ${task.assignedBy}`}
            </p>
            <p className="text-xs text-gray-400 mt-1">Completado: {task.completedAt.toLocaleDateString()}</p>
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
  )
}
