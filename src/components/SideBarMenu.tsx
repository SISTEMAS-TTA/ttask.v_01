"use client";

import { Home, FileText, Folder, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/app/firebase/config";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import React from "react";

const navigationItems = [
  { icon: Home, label: "Inicio", href: "/", progress: null },
  { icon: FileText, label: "Notas", href: "/notes", progress: 50 },
  { icon: Folder, label: "Tareas", href: "/tasks", progress: 75 },
  { icon: BarChart3, label: "Proyectos", href: "/projects", progress: 30 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error al Iniciar Sesion", error);
    }
  };

  return (
    <div className="w-16 py-10 bg-gray-800 flex flex-col h-screen">
      {/* Logo */}

      {/* Navigation Items */}
      <div className="flex flex-col space-y-3 w-full px-2 flex-1">
        {navigationItems.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <div key={index} className="flex flex-col items-center">
              <a
                href={item.href}
                className={cn(
                  "p-2 rounded-lg transition-colors w-full flex justify-center",
                  isActive
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                )}
              >
                <item.icon className="w-5 h-5" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Sign Out Button */}
      <div className="px-2 pb-4">
        <button
          onClick={handleLogOut}
          className="p-2 rounded-lg transition-colors w-full flex justify-center text-gray-400 hover:text-white hover:bg-red-600"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
