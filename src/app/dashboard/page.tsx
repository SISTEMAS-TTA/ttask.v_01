"use client";
// import { ProjectCharts } from "@/modules/charts/components/ProjectCharts";
import { NotesColumn } from "@/modules/notes/components/Notes";
import { CompletedTasksColumn } from "@/modules/tasks/components/CompletedTasks";
import { ReceivedTasksColumn } from "@/modules/tasks/components/ReceivedTasks";
import { TasksColumn } from "@/modules/tasks/components/Tasks";

export default function DashboardPage() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-8 md:pb-10">
        {/* CAMBIOS REALIZADOS AQUÍ:
            1. Quitamos '2xl:grid-cols-5' -> Para que no deje un hueco vacío al final.
            2. Quitamos 'lg:grid-cols-3' -> Para evitar que quede una tarjeta "huerfana" abajo sola. 
               Es mejor pasar de 2 columnas a 4 directamente.
            3. Agregamos 'mx-auto' -> Para asegurar que el bloque se centre.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-max pb-4 sm:pb-0 mx-auto">
          
          {/* Columna de Gráficos (Comentada) */}
          {/* ... */}

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
  );
}