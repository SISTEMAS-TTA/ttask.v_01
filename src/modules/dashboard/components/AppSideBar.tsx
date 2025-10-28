// "use client";

// import * as React from "react";
// import type { LucideIcon } from "lucide-react";
// import { SquareTerminal } from "lucide-react";

// import { NavMain } from "@/modules/dashboard/components/NavMain";
// import { NavUser } from "@/modules/dashboard/components/NavUser";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarRail,
// } from "@/components/ui/sidebar";
// import { useAdmin } from "@/hooks/useAdmin";

// // Extender tipo NavItem
// interface NavItem {
//   title: string;
//   url: string;
//   icon?: LucideIcon;
//   isActive?: boolean;
//   adminOnly?: boolean;
//   items?: {
//     title: string;
//     url: string;
//     adminOnly?: boolean;
//   }[];
// }

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   const { profile, user, isAdmin } = useAdmin();

//   const navMain = React.useMemo(() => {
//     const base: NavItem[] = [
//       {
//         title: "Area de Trabajo",
//         url: "#",
//         icon: SquareTerminal,
//         isActive: true,
//         items: [
//           {
//             title: "Dashboard",
//             url: "/",
//           },
//           {
//             title: "Notas",
//             url: "/notes",
//           },
//           // {
//           //   title: "Tareas asignadas",
//           //   url: "#",
//           // },
//           // {
//           //   title: "Tareas Recibidas",
//           //   url: "#",
//           // },
//           // {
//           //   title: "Tareas Finalizadas",
//           //   url: "#",
//           // },
//         ],
//       },
//       // {
//       //   title: "Models",
//       //   url: "#",
//       //   icon: Bot,
//       //   items: [
//       //     {
//       //       title: "Genesis",
//       //       url: "#",
//       //     },
//       //     {
//       //       title: "Explorer",
//       //       url: "#",
//       //     },
//       //     {
//       //       title: "Quantum",
//       //       url: "#",
//       //     },
//       //   ],
//       // },
//       // {
//       //   title: "Documentation",
//       //   url: "#",
//       //   icon: BookOpen,
//       //   items: [
//       //     {
//       //       title: "Introduction",
//       //       url: "#",
//       //     },
//       //     {
//       //       title: "Get Started",
//       //       url: "#",
//       //     },
//       //     {
//       //       title: "Tutorials",
//       //       url: "#",
//       //     },
//       //     {
//       //       title: "Changelog",
//       //       url: "#",
//       //     },
//       //   ],
//       // },
//       // {
//       //   title: "Settings",
//       //   url: "#",
//       //   icon: Settings2,
//       //   items: [
//       //     {
//       //       title: "General",
//       //       url: "#",
//       //     },
//       //     {
//       //       title: "Team",
//       //       url: "#",
//       //     },
//       //     {
//       //       title: "Billing",
//       //       url: "#",
//       //     },
//       //     {
//       //       title: "Limits",
//       //       url: "#",
//       //     },
//       //   ],
//       // },
//     ];

//     if (isAdmin) {
//       base[0].items?.push(
//         {
//           title: "Registrar usuarios",
//           url: "/register",
//         },
//         {
//           title: "Administrar Usuarios",
//           url: "/dashboard/admin/users",
//           adminOnly: true,
//         }
//       );
//     }

//     return base;
//   }, [isAdmin]);

//   const sidebarUser = React.useMemo(() => {
//     const fullName = [profile?.firstName, profile?.lastName]
//       .filter(Boolean)
//       .join(" ");

//     return {
//       name: profile?.fullName || fullName || user?.email || "Usuario",
//       email: profile?.email || user?.email || "usuario@example.com",
//       avatar: "",
//     };
//   }, [profile, user]);

//   return (
//     <Sidebar
//       collapsible="icon"
//       className="border-r border-gray-200 bg-white"
//       {...props}
//     >
//       {/* Header del sidebar más limpio */}
//       <SidebarHeader className="border-b border-gray-200 p-4"></SidebarHeader>
//       <SidebarContent className="bg-white">
//         <NavMain
//           items={navMain
//             .map((item) => ({
//               ...item,
//               items: item.items?.filter(
//                 (subItem) => !subItem.adminOnly || isAdmin
//               ),
//             }))
//             .filter((item) => !item.adminOnly || isAdmin)}
//         />
//       </SidebarContent>
//       <SidebarFooter className="border-t border-gray-200 bg-white">
//         <NavUser user={sidebarUser} />
//       </SidebarFooter>
//       <SidebarRail />
//     </Sidebar>
//   );
// }
