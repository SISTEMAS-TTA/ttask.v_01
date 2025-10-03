// "use client";

// import { NotesColumn } from "@/modules/notes/components/Notes";
// import { TasksColumn } from "@/modules/tasks/components/Tasks";
// import { ReceivedTasksColumn } from "@/modules/tasks/components/ReceivedTasks";
// import { CompletedTasksColumn } from "@/modules/tasks/components/CompletedTasks";
// import { ProjectCharts } from "@/components/charts/ProjectCharts";

// export function Dashboard() {
//   return (
//     <div className="h-full w-full">
//       {/* Mobile View (sm and below) - Horizontal scroll */}
//       <div className="sm:hidden h-full">
//         <div className="h-full overflow-x-auto overflow-y-hidden horizontal-scroll scroll-indicator">
//           <div className="flex h-full" style={{ minWidth: "max-content" }}>
//             {/* Project Charts Column */}
//             <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 p-4 h-full overflow-y-auto">
//               <h2 className="text-lg font-semibold mb-4">Inicio</h2>
//               <ProjectCharts />
//             </div>

//             {/* Notes Column */}
//             <div className="w-80 flex-shrink-0 h-full border-r border-gray-200">
//               <NotesColumn />
//             </div>

//             {/* Assigned Tasks Column */}
//             <div className="w-80 flex-shrink-0 h-full border-r border-gray-200">
//               <TasksColumn />
//             </div>

//             {/* Received Tasks Column */}
//             <div className="w-80 flex-shrink-0 h-full border-r border-gray-200">
//               <ReceivedTasksColumn />
//             </div>

//             {/* Completed Tasks Column */}
//             <div className="w-80 flex-shrink-0 h-full">
//               <CompletedTasksColumn />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tablet View (sm to lg) - Horizontal scroll with slightly wider columns */}
//       <div className="hidden sm:block lg:hidden h-full">
//         <div className="h-full overflow-x-auto overflow-y-hidden horizontal-scroll scroll-indicator">
//           <div className="flex h-full" style={{ minWidth: "max-content" }}>
//             {/* Project Charts Column */}
//             <div className="w-96 flex-shrink-0 bg-white border-r border-gray-200 p-4 h-full overflow-y-auto">
//               <h2 className="text-lg font-semibold mb-4">Inicio</h2>
//               <ProjectCharts />
//             </div>

//             {/* Notes Column */}
//             <div className="w-96 flex-shrink-0 h-full border-r border-gray-200">
//               <NotesColumn />
//             </div>

//             {/* Assigned Tasks Column */}
//             <div className="w-96 flex-shrink-0 h-full border-r border-gray-200">
//               <TasksColumn />
//             </div>

//             {/* Received Tasks Column */}
//             <div className="w-96 flex-shrink-0 h-full border-r border-gray-200">
//               <ReceivedTasksColumn />
//             </div>

//             {/* Completed Tasks Column */}
//             <div className="w-96 flex-shrink-0 h-full">
//               <CompletedTasksColumn />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Desktop View (lg to xl) - Responsive grid with horizontal scroll */}
//       <div className="hidden lg:block xl:hidden h-full">
//         <div className="h-full overflow-x-auto overflow-y-hidden horizontal-scroll scroll-indicator">
//           <div className="flex h-full" style={{ minWidth: "max-content" }}>
//             {/* Project Charts Column (Inicio) */}
//             <div className="flex-1 min-w-80 bg-white border-r border-gray-200 p-4 h-full overflow-y-auto">
//               <h2 className="text-lg font-semibold mb-4">Inicio</h2>
//               <ProjectCharts />
//             </div>

//             {/* Notes Column */}
//             <div className="flex-1 min-w-80 h-full border-r border-gray-200">
//               <NotesColumn />
//             </div>

//             {/* Assigned Tasks Column */}
//             <div className="flex-1 min-w-80 h-full border-r border-gray-200">
//               <TasksColumn />
//             </div>

//             {/* Received Tasks Column */}
//             <div className="flex-1 min-w-80 h-full border-r border-gray-200">
//               <ReceivedTasksColumn />
//             </div>

//             {/* Completed Tasks Column */}
//             <div className="flex-1 min-w-80 h-full">
//               <CompletedTasksColumn />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Extra Large Desktop View (xl and above) - Grid layout that fits all columns */}
//       <div className="hidden xl:block h-full">
//         <div className="h-full">
//           <div className="grid h-full grid-cols-5 gap-0">
//             {/* Project Charts Column (Inicio) */}
//             <div className="bg-white border-r border-gray-200 p-4 h-full overflow-y-auto">
//               <h2 className="text-lg font-semibold mb-4">Inicio</h2>
//               <ProjectCharts />
//             </div>

//             {/* Notes Column */}
//             <div className="h-full border-r border-gray-200">
//               <NotesColumn />
//             </div>

//             {/* Assigned Tasks Column */}
//             <div className="h-full border-r border-gray-200">
//               <TasksColumn />
//             </div>

//             {/* Received Tasks Column */}
//             <div className="h-full border-r border-gray-200">
//               <ReceivedTasksColumn />
//             </div>

//             {/* Completed Tasks Column */}
//             <div className="h-full">
//               <CompletedTasksColumn />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
