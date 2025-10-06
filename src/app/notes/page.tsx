"use client";
import { NotesColumn } from "@/modules/notes/components/Notes";
import { TasksColumn } from "@/modules/tasks/components/Tasks";
import { ReceivedTasksColumn } from "@/modules/tasks/components/ReceivedTasks";
import { CompletedTasksColumn } from "@/modules/tasks/components/CompletedTasks";
import { AuthWrapper } from "@/modules/auth/components/AuhWrapper";
import { AppSidebar } from "@/modules/dashboard/components/AppSideBar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function NotesPage() {
  return (
    <AuthWrapper>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Building Your Application
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Notes</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
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

            {/* Desktop View (lg to xl) - Responsive grid with horizontal scroll */}
            <div className="hidden lg:block xl:hidden h-full">
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

            {/* Extra Large Desktop View (xl and above) - Grid layout that fits all columns */}
            <div className="hidden xl:block h-full">
              <div className="h-full">
                <div className="grid h-full grid-cols-4 gap-0">
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
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthWrapper>
  );
}
