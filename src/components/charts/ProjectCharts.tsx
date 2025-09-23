"use client"

import { Progress } from "@/components/ui/progress"

const projects = [
  { name: "Casa 1", progress: 50, color: "bg-blue-500" },
  { name: "Casa 2", progress: 75, color: "bg-green-500" },
  { name: "Casa 3", progress: 30, color: "bg-orange-500" },
]

export function ProjectCharts() {
  return (
    <div className="space-y-6">
      {projects.map((project, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-700">{project.name}</h3>
            <span className="text-sm text-gray-500">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
      ))}
    </div>
  )
}
