"use client"

import { NotesColumn } from "@/components/areas/Notes"
import { TasksColumn } from "@/components/areas/Tasks"
import { ReceivedTasksColumn } from "@/components/areas/ReceivedTasks"
import { CompletedTasksColumn } from "@/components/areas/CompletedTasks"
import { ProjectCharts } from "@/components/charts/ProjectCharts"

export function Dashboard() {

  return (
    <div className="h-full">
      {/* Mobile View - Stacked columns */}
      <div className="md:hidden h-full overflow-y-auto">
        <div className="space-y-4 p-4">
          {/* Project Charts Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Inicio</h2>
            <ProjectCharts />
          </div>

          {/* Notes Section */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <NotesColumn />
          </div>

          {/* Assigned Tasks Section */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <TasksColumn />
          </div>

          {/* Received Tasks Section */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <ReceivedTasksColumn />
          </div>

          {/* Completed Tasks Section */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <CompletedTasksColumn />
          </div>
        </div>
      </div>

      {/* Desktop View - Side by side columns */}
      <div className="hidden md:flex h-full">
        {/* Project Charts Column (Inicio) */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 flex-shrink-0 h-full overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Inicio</h2>
          <ProjectCharts />
        </div>

        {/* Scrollable container for task columns */}
        <div className="flex-1 flex overflow-x-auto h-full">
          {/* Notes Column */}
          <div className="flex-shrink-0 h-full">
            <NotesColumn />
          </div>

          {/* Assigned Tasks Column */}
          <div className="flex-shrink-0 h-full">
            <TasksColumn />
          </div>

          {/* Received Tasks Column */}
          <div className="flex-shrink-0 h-full">
            <ReceivedTasksColumn />
          </div>

          {/* Completed Tasks Column */}
          <div className="flex-shrink-0 h-full">
            <CompletedTasksColumn />
          </div>
        </div>
      </div>
    </div>
  )
}
