"use client";

import { NotesColumn } from "@/modules/notes/components/Notes";
import { TasksColumn } from "@/modules/tasks/components/Tasks";
import { ReceivedTasksColumn } from "@/modules/tasks/components/ReceivedTasks";
import { CompletedTasksColumn } from "@/modules/tasks/components/CompletedTasks";
import { AuthWrapper } from "@/modules/auth/components/AuhWrapper";

export default function NotesPage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header plano blanco con logo - FIJO */}

        {/* Contenido principal - FLEX RESTANTE */}
        <div className="flex-1 overflow-hidden">
          {/* Área de contenido principal centrada */}
          <div className="h-full flex flex-col items-center bg-gray-50">
            {/* Container centrado con ancho máximo */}
            <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
              {/* Grid principal - diseño responsivo con altura completa */}
              <div className="flex-1 overflow-hidden py-4 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] lg:h-[calc(100vh-180px)]">
                  {/* Columna de Notas */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <NotesColumn />
                  </div>

                  {/* Columna de Tareas Asignadas */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <TasksColumn />
                  </div>

                  {/* Columna de Tareas Recibidas */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <ReceivedTasksColumn />
                  </div>

                  {/* Columna de Tareas Completadas */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <CompletedTasksColumn />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
