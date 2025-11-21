  "use client";

import { NotesColumn } from "@/modules/notes/components/Notes";
import { TasksColumn } from "@/modules/tasks/components/Tasks";
import { ReceivedTasksColumn } from "@/modules/tasks/components/ReceivedTasks";
import { CompletedTasksColumn } from "@/modules/tasks/components/CompletedTasks";
import { AuthWrapper } from "@/modules/auth/components/AuhWrapper";

export default function NotesPage() {
  return (
    <AuthWrapper>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Contenido principal (mismo marco del home pero sin charts) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-8 md:pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 auto-rows-max pb-4 sm:pb-0">
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
        </div>
      </div>
    </AuthWrapper>
  );
}
