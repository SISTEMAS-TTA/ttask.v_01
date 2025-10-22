"use client";
import Image from "next/image";
import Link from "next/link";
import { ProjectCharts } from "@/modules/charts/components/ProjectCharts";
import { AppSidebar } from "@/modules/dashboard/components/AppSideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { NotesColumn } from "@/modules/notes/components/Notes";
import { CompletedTasksColumn } from "@/modules/tasks/components/CompletedTasks";
import { ReceivedTasksColumn } from "@/modules/tasks/components/ReceivedTasks";
import { TasksColumn } from "@/modules/tasks/components/Tasks";

// Header plano blanco con solo el logo
function DashboardHeader() {
  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm flex-shrink-0 relative z-50">
      <div className="flex items-center justify-between px-6 py-3">
        <Link href="/" aria-label="ttArquitectos" className="flex items-center">
          <Image
            src="/LogoTT.png"
            alt="Logo de ttArquitectos"
            width={180}
            height={32}
            priority
            className="h-auto w-36"
          />
        </Link>
        {/* Aquí se pueden agregar elementos adicionales del header como notificaciones, usuario, etc. */}
      </div>
    </header>
  );
}

export default function DashboardPage() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header plano blanco con logo - FIJO */}
      <DashboardHeader />

      {/* Contenido principal con sidebar - FLEX RESTANTE */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-auto">
            {/* Área de contenido principal */}
            <div className="p-4 md:p-6 bg-gray-50 min-h-full">
              {/* Grid principal - diseño responsivo similar al ERP */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {/* Columna de Gráficos del Proyecto (Inicio) */}
                <div className="md:col-span-2 lg:col-span-1 xl:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b border-gray-100 pb-2">
                    Inicio
                  </h2>
                  <ProjectCharts />
                </div>

                {/* Columna de Notas */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <NotesColumn />
                </div>

                {/* Columna de Tareas Asignadas */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <TasksColumn />
                </div>

                {/* Columna de Tareas Recibidas */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <ReceivedTasksColumn />
                </div>

                {/* Columna de Tareas Completadas */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <CompletedTasksColumn />
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
