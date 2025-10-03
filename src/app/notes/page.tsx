"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarMenu } from "@/components/core/SideBarMenu";
import { Menu } from "lucide-react";
import { NotesColumn } from "@/modules/notes/components/Notes";
import { TasksColumn } from "@/modules/tasks/components/Tasks";
import { ReceivedTasksColumn } from "@/modules/tasks/components/ReceivedTasks";
import { CompletedTasksColumn } from "@/modules/tasks/components/CompletedTasks";
import { AuthWrapper } from "@/modules/auth/components/AuhWrapper";

export default function NotesPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <AuthWrapper>
      <div className="h-screen flex relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <SidebarMenu />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full">
              <SidebarMenu />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header - Only visible on mobile */}
          <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            {/* Mobile menu button */}
            <button
              className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo for mobile */}
            <div className="text-sm font-bold">
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                tt
              </span>
              <span className="ml-1 text-xs">ARQUITECTOS</span>
            </div>
          </header>

          {/* Notes Dashboard Content - Full height */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full w-full">
              {/* Mobile View (sm and below) - Horizontal scroll */}
              <div className="sm:hidden h-full">
                <div className="h-full overflow-x-auto overflow-y-hidden horizontal-scroll scroll-indicator">
                  <div
                    className="flex h-full"
                    style={{ minWidth: "max-content" }}
                  >
                    {/* Notes Column */}
                    <div className="w-80 flex-shrink-0 h-full border-r border-gray-200">
                      <NotesColumn />
                    </div>

                    {/* Assigned Tasks Column */}
                    <div className="w-80 flex-shrink-0 h-full border-r border-gray-200">
                      <TasksColumn />
                    </div>

                    {/* Received Tasks Column */}
                    <div className="w-80 flex-shrink-0 h-full border-r border-gray-200">
                      <ReceivedTasksColumn />
                    </div>

                    {/* Completed Tasks Column */}
                    <div className="w-80 flex-shrink-0 h-full">
                      <CompletedTasksColumn />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tablet View (sm to lg) - Horizontal scroll with slightly wider columns */}
              <div className="hidden sm:block lg:hidden h-full">
                <div className="h-full overflow-x-auto overflow-y-hidden horizontal-scroll scroll-indicator">
                  <div
                    className="flex h-full"
                    style={{ minWidth: "max-content" }}
                  >
                    {/* Notes Column */}
                    <div className="w-96 flex-shrink-0 h-full border-r border-gray-200">
                      <NotesColumn />
                    </div>

                    {/* Assigned Tasks Column */}
                    <div className="w-96 flex-shrink-0 h-full border-r border-gray-200">
                      <TasksColumn />
                    </div>

                    {/* Received Tasks Column */}
                    <div className="w-96 flex-shrink-0 h-full border-r border-gray-200">
                      <ReceivedTasksColumn />
                    </div>

                    {/* Completed Tasks Column */}
                    <div className="w-96 flex-shrink-0 h-full">
                      <CompletedTasksColumn />
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop View (lg and above) - Responsive grid with scroll */}
              <div className="hidden lg:block h-full">
                <div className="h-full overflow-x-auto overflow-y-hidden horizontal-scroll scroll-indicator">
                  <div
                    className="flex h-full"
                    style={{ minWidth: "max-content" }}
                  >
                    {/* Notes Column */}
                    <div className="flex-1 min-w-80 h-full border-r border-gray-200">
                      <NotesColumn />
                    </div>

                    {/* Assigned Tasks Column */}
                    <div className="flex-1 min-w-80 h-full border-r border-gray-200">
                      <TasksColumn />
                    </div>

                    {/* Received Tasks Column */}
                    <div className="flex-1 min-w-80 h-full border-r border-gray-200">
                      <ReceivedTasksColumn />
                    </div>

                    {/* Completed Tasks Column */}
                    <div className="flex-1 min-w-80 h-full">
                      <CompletedTasksColumn />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthWrapper>
  );
}
