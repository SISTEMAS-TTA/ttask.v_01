"use client"

import { NotesColumn } from "@/components/areas/Notes"
import { TasksColumn } from "@/components/areas/Tasks"
import { ReceivedTasksColumn } from "@/components/areas/ReceivedTasks"
import { CompletedTasksColumn } from "@/components/areas/CompletedTasks"
import { ProjectCharts } from "@/components/charts/ProjectCharts"

export function Dashboard() {

  return (
    <div className="h-full">
      {/* Mobile View (sm and below) - Stacked columns */}
      <div className="lg:hidden h-full overflow-y-auto">
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

      {/* Desktop/Tablet View (lg and above) - Responsive grid */}
      <div className="hidden lg:block h-full">
        <div className="grid h-full" style={{gridTemplateColumns: 'minmax(280px, 1fr) repeat(4, minmax(280px, 1fr))'}}>
          {/* Project Charts Column (Inicio) */}
          <div className="bg-white border-r border-gray-200 p-4 h-full overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Inicio</h2>
            <ProjectCharts />
          </div>

          {/* Notes Column */}
          <div className="h-full border-r border-gray-200">
            <NotesColumn />
          </div>

          {/* Assigned Tasks Column */}
          <div className="h-full border-r border-gray-200">
            <TasksColumn />
          </div>

          {/* Received Tasks Column */}
          <div className="h-full border-r border-gray-200">
            <ReceivedTasksColumn />
          </div>

          {/* Completed Tasks Column */}
          <div className="h-full">
            <CompletedTasksColumn />
          </div>
        </div>
      </div>
    </div>
  )
}
