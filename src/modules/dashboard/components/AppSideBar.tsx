"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
} from "lucide-react";

import { NavMain } from "@/modules/dashboard/components/NavMain";
import { NavProjects } from "@/modules/dashboard/components/NavProjects";
import { NavUser } from "@/modules/dashboard/components/NavUser";
import { TeamSwitcher } from "@/modules/dashboard/components/TeamSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAdmin } from "@/hooks/useAdmin";

const teams = [
  {
    name: "Acme Inc",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
  },
  {
    name: "Acme Corp.",
    logo: AudioWaveform,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: Command,
    plan: "Free",
  },
];

const projects = [
  {
    name: "Design Engineering",
    url: "#",
    icon: Frame,
  },
  {
    name: "Sales & Marketing",
    url: "#",
    icon: PieChart,
  },
  {
    name: "Travel",
    url: "#",
    icon: Map,
  },
];

// Extender tipo NavItem
interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  adminOnly?: boolean;
  items?: {
    title: string;
    url: string;
    adminOnly?: boolean;
  }[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { profile, user, isAdmin } = useAdmin();

  const navMain = React.useMemo(() => {
    const base: NavItem[] = [
      {
        title: "Area de Trabajo",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Dashboard",
            url: "/",
          },
          {
            title: "Notas",
            url: "/notes",
          },
          // {
          //   title: "Tareas asignadas",
          //   url: "#",
          // },
          // {
          //   title: "Tareas Recibidas",
          //   url: "#",
          // },
          // {
          //   title: "Tareas Finalizadas",
          //   url: "#",
          // },
        ],
      },
      // {
      //   title: "Models",
      //   url: "#",
      //   icon: Bot,
      //   items: [
      //     {
      //       title: "Genesis",
      //       url: "#",
      //     },
      //     {
      //       title: "Explorer",
      //       url: "#",
      //     },
      //     {
      //       title: "Quantum",
      //       url: "#",
      //     },
      //   ],
      // },
      // {
      //   title: "Documentation",
      //   url: "#",
      //   icon: BookOpen,
      //   items: [
      //     {
      //       title: "Introduction",
      //       url: "#",
      //     },
      //     {
      //       title: "Get Started",
      //       url: "#",
      //     },
      //     {
      //       title: "Tutorials",
      //       url: "#",
      //     },
      //     {
      //       title: "Changelog",
      //       url: "#",
      //     },
      //   ],
      // },
      // {
      //   title: "Settings",
      //   url: "#",
      //   icon: Settings2,
      //   items: [
      //     {
      //       title: "General",
      //       url: "#",
      //     },
      //     {
      //       title: "Team",
      //       url: "#",
      //     },
      //     {
      //       title: "Billing",
      //       url: "#",
      //     },
      //     {
      //       title: "Limits",
      //       url: "#",
      //     },
      //   ],
      // },
    ];

    if (isAdmin) {
      base[0].items?.push(
        {
          title: "Registrar usuarios",
          url: "/register",
        },
        {
          title: "Administrar Usuarios",
          url: "/dashboard/admin/users",
          adminOnly: true,
        }
      );
    }

    return base;
  }, [isAdmin]);

  const sidebarUser = React.useMemo(() => {
    const fullName = [profile?.firstName, profile?.lastName]
      .filter(Boolean)
      .join(" ");

    return {
      name: profile?.fullName || fullName || user?.email || "Usuario",
      email: profile?.email || user?.email || "usuario@example.com",
      avatar: "",
    };
  }, [profile, user]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>{/* <TeamSwitcher teams={teams} /> */}</SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navMain
            .map((item) => ({
              ...item,
              items: item.items?.filter(
                (subItem) => !subItem.adminOnly || isAdmin
              ),
            }))
            .filter((item) => !item.adminOnly || isAdmin)}
        />
        {/* <NavProjects projects={projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
