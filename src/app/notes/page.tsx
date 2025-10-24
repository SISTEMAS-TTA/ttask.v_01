"use client";
import Image from "next/image";
import Link from "next/link";
import { NotesColumn } from "@/modules/notes/components/Notes";
import { TasksColumn } from "@/modules/tasks/components/Tasks";
import { ReceivedTasksColumn } from "@/modules/tasks/components/ReceivedTasks";
import { CompletedTasksColumn } from "@/modules/tasks/components/CompletedTasks";
import { AuthWrapper } from "@/modules/auth/components/AuhWrapper";
import { AppSidebar } from "@/modules/dashboard/components/AppSideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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
      </div>
    </header>
  );
}

export default function NotesPage() {
  return (
    <AuthWrapper>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header plano blanco con logo - FIJO */}
        <DashboardHeader />

        {/* Contenido principal con sidebar - FLEX RESTANTE */}
        <div className="flex flex-1 overflow-hidden">
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex-1 overflow-hidden">
              {/* Área de contenido principal */}
              <div className="h-full flex flex-col p-4 md:p-6 pb-6 md:pb-8 bg-gray-50">
                {/* Grid principal - diseño responsivo con altura dinámica */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6 overflow-hidden mb-4 md:mb-6">
                  {/* Columna de Notas */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-140px)] sm:h-auto">
                    <NotesColumn />
                  </div>

                  {/* Columna de Tareas Asignadas */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-140px)] sm:h-auto">
                    <TasksColumn />
                  </div>

                  {/* Columna de Tareas Recibidas */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-140px)] sm:h-auto">
                    <ReceivedTasksColumn />
                  </div>

                  {/* Columna de Tareas Completadas */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-140px)] sm:h-auto">
                    <CompletedTasksColumn />
                  </div>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </AuthWrapper>
  );
}
