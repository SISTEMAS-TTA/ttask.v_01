"use client"

import { useState } from "react"
import { Eye, Check, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ReceivedTask {
  id: string
  title: string
  project: string
  assignedBy: string
  viewed: boolean
  completed: boolean
  favorite: boolean
  createdAt: Date
}

const initialReceivedTasks: ReceivedTask[] = [
  {
    id: "1",
    title: "TITULO DE LA TAREA",
    project: "Proyecto al que pertenece",
    assignedBy: "Carlos López",
    viewed: false,
    completed: false,
    favorite: false,
    createdAt: new Date(),
  },
]

export function ReceivedTasksColumn() {
  const [tasks, setTasks] = useState<ReceivedTask[]>(initialReceivedTasks)

  const toggleViewed = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, viewed: !task.viewed } : task)))
  }

  const toggleCompleted = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const toggleFavorite = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, favorite: !task.favorite } : task)))
  }

  const activeTasks = tasks.filter((task) => !task.completed && !task.viewed)
  const viewedTasks = tasks.filter((task) => task.viewed && !task.completed)

  return (
    <div className="w-100 bg-pink-100 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-pink-200">
        <h2 className="text-lg font-semibold text-gray-800">T. Recibidas</h2>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Active Tasks */}
        {activeTasks.map((task) => (
          <Card key={task.id} className="p-3 bg-pink-200 border-none shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-800">{task.title}</h3>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleViewed(task.id)}
                  className="h-6 w-6 p-0 hover:bg-black/10"
                >
                  <Eye className={`h-3 w-3 ${task.viewed ? "text-blue-600" : "text-gray-400"}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleCompleted(task.id)}
                  className="h-6 w-6 p-0 hover:bg-black/10"
                >
                  <Check className={`h-3 w-3 ${task.completed ? "text-green-600" : "text-gray-400"}`} />
                </Button>
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
            <p className="text-xs text-gray-500 mt-1">Asignado por: {task.assignedBy}</p>
          </Card>
        ))}

        {/* Viewed Tasks */}
        {viewedTasks.map((task) => (
          <Card key={task.id} className="p-3 bg-pink-200 border-none shadow-sm opacity-70">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-800">{task.title}</h3>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleViewed(task.id)}
                  className="h-6 w-6 p-0 hover:bg-black/10"
                >
                  <Eye className="h-3 w-3 text-blue-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleCompleted(task.id)}
                  className="h-6 w-6 p-0 hover:bg-black/10"
                >
                  <Check className={`h-3 w-3 ${task.completed ? "text-green-600" : "text-gray-400"}`} />
                </Button>
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
            <p className="text-xs text-gray-500 mt-1">Asignado por: {task.assignedBy}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
