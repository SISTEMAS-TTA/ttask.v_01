"use client";

import { useEffect, useState } from "react";
import { Filter, Star, CircleCheckBig, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompletedTaskFilterModal } from "@/modules/tasks/components/CompletedTaskFilterModal";
import useUser from "@/modules/auth/hooks/useUser";
import { subscribeToCompletedTasks } from "@/lib/firebase/tasks";
import { useUsersMap } from "@/hooks/useUsersMap";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CompletedTask {
  id: string;
  title: string;
  project: string;
  assigneeId?: string;
  assignedBy?: string;
  completedAt: Date;
  createdAt: Date;
  favorite: boolean;
  type: "assigned" | "received";
  description?: string;
}

const initialCompletedTasks: CompletedTask[] = [];

export function CompletedTasksColumn() {
  const { user, loading: userLoading } = useUser();
  const { getUserName } = useUsersMap();
  const [tasks, setTasks] = useState<CompletedTask[]>(initialCompletedTasks);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState<{
    user?: string;
    project?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userLoading || !user) return;

    const unsubscribe = subscribeToCompletedTasks(
      user.uid,
      (docs) => {
        const completedTasks = docs.map((d) => ({
          id: d.id,
          title: d.title,
          project: d.project,
          assigneeId: d.assigneeId,
          assignedBy: d.assignedBy,
          completedAt: d.updatedAt?.toDate() ?? d.createdAt.toDate(),
          createdAt: d.createdAt.toDate(),
          favorite: Boolean(d.favorites?.[user!.uid]) || Boolean(d.favorite),
          type: (d.assignedBy === user.uid ? "assigned" : "received") as
            | "assigned"
            | "received",
          description: d.description ?? "",
        }));
        setTasks(completedTasks);
      },
      () => setTasks([])
    );

    return () => unsubscribe();
  }, [user, userLoading]);

  // --- FILTROS ---
  const filteredTasks = tasks.filter((task) => {
    if (filter.user) {
      const taskUser = task.assigneeId || task.assignedBy;
      if (taskUser !== filter.user) return false;
    }
    if (filter.project && task.project !== filter.project) return false;
    if (filter.dateFrom) {
      const from = new Date(filter.dateFrom);
      if (task.completedAt < from) return false;
    }
    if (filter.dateTo) {
      const to = new Date(filter.dateTo);
      if (
        task.completedAt >
        new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
      )
        return false;
    }
    return true;
  });

  const orderedTasks = filteredTasks.slice().sort((a, b) => {
    if (a.favorite === b.favorite) {
      return b.completedAt.getTime() - a.completedAt.getTime();
    }
    return a.favorite ? -1 : 1;
  });

  // --- LÓGICA DE AGRUPACIÓN POR MES ---
  const formatMonthYear = (date: Date) =>
    date
      .toLocaleDateString("es-ES", { month: "long", year: "numeric" })
      .replace(/^\w/, (c) => c.toUpperCase());

  const toggleGroup = (monthYear: string) => {
    setOpenGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(monthYear)) newSet.delete(monthYear);
      else newSet.add(monthYear);
      return newSet;
    });
  };

  const groupedTasks = orderedTasks.reduce((groups, task) => {
    const date = task.completedAt;
    const monthYear = formatMonthYear(date);
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(task);
    return groups;
  }, {} as Record<string, CompletedTask[]>);

  const sortedGroups = Object.entries(groupedTasks).sort((a, b) => {
    const dateA = a[1][0].completedAt.getTime();
    const dateB = b[1][0].completedAt.getTime();
    return dateB - dateA;
  });

  return (
    <div className="w-full bg-green-100 flex flex-col h-[500px] md:h-full">
      {/* Header */}
      <div className="p-4 border-b border-green-200 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          T. Finalizadas
        </h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsFilterModalOpen(true)}
          className="h-8 w-8 p-0 hover:bg-green-200"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Lista de Tareas */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
        {sortedGroups.length === 0 && (
          <p className="text-center text-gray-500 mt-10 text-sm">
            No hay tareas finalizadas
          </p>
        )}

        {sortedGroups.map(([monthYear, groupTasks]) => (
          <Collapsible
            key={monthYear}
            open={openGroups.has(monthYear)}
            onOpenChange={() => toggleGroup(monthYear)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center my-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="flex-1 border-t border-green-300" />
                <span className="mx-2 px-2 py-1 text-xs font-semibold text-gray-600 uppercase bg-green-300 rounded-full flex items-center gap-1.5">
                  <CircleCheckBig className="h-3 w-3 text-green-700" />
                  {monthYear}
                  <span className="bg-gray-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                    {groupTasks.length}
                  </span>
                  {openGroups.has(monthYear) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </span>
                <div className="flex-1 border-t border-green-300" />
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="space-y-2 mt-2">
                {groupTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="p-3 bg-green-200 border-none shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-800 line-through decoration-gray-500 decoration-1">
                        {task.title}
                      </h3>
                      <div className="flex space-x-1">
                        <Star
                          className={`h-5 w-5 ${
                            task.favorite
                              ? "text-yellow-600 fill-current"
                              : "text-gray-400"
                          }`}
                          aria-hidden
                        />
                        <CircleCheckBig
                          className="h-5 w-5 text-green-600"
                          aria-hidden
                        />
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="text-sm text-gray-500 mt-1">
                      <p>
                        {task.type === "assigned"
                          ? `Asignado a: ${getUserName(task.assigneeId!)}`
                          : `Asignado por: ${getUserName(task.assignedBy!)}`}
                      </p>
                      
                      {/* --- SECCIÓN DE FECHAS CON HORA (Actualizado) --- */}
                      <div className="mt-1 space-y-0.5 border-t border-green-300/30 pt-2">
                        <p className="text-xs text-gray-500">
                          Asignado:{" "}
                          {task.createdAt.toLocaleString("es-MX", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          })}
                        </p>
                        <p className="text-xs text-gray-400">
                          Completado:{" "}
                          {task.completedAt.toLocaleString("es-MX", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          })}
                        </p>
                      </div>

                    </div>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      <CompletedTaskFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilter={filter}
        onApplyFilter={setFilter}
        tasks={tasks}
      />
    </div>
  );
}