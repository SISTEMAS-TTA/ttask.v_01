"use client";

import { NotesColumn } from "@/modules/notes/components/Notes";
import { TasksColumn } from "@/modules/tasks/components/Tasks";
import { ReceivedTasksColumn } from "@/modules/tasks/components/ReceivedTasks";
import { CompletedTasksColumn } from "@/modules/tasks/components/CompletedTasks";
import { AuthWrapper } from "@/modules/auth/components/AuhWrapper";
import { PageShell } from "@/components/PageShell";

export default function NotesPage() {
  return (
    <AuthWrapper>
      <PageShell>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-max pb-4 sm:pb-0 mx-auto">
          {/* Columna de Notas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[500px] sm:h-[calc(100vh-180px)]">
            <NotesColumn />
          </div>
          {/* Columna de Tareas Asignadas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[500px] sm:h-[calc(100vh-180px)]">
            <TasksColumn />
          </div>
          {/* Columna de Tareas Recibidas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[500px] sm:h-[calc(100vh-180px)]">
            <ReceivedTasksColumn />
          </div>
          {/* Columna de Tareas Completadas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[500px] sm:h-[calc(100vh-180px)]">
            <CompletedTasksColumn />
          </div>
        </div>
      </PageShell>
    </AuthWrapper>
  );
}
