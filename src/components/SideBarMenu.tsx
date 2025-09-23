"use client";

import { Home, FileText, Folder, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/app/firebase/config";

const navigationItems = [
  { icon: Home, label: "Inicio", href: "#", progress: null },
  { icon: FileText, label: "Casa 1", href: "#", progress: 50 },
  { icon: Folder, label: "Casa 2", href: "#", progress: 75 },
  { icon: BarChart3, label: "Casa 3", href: "#", progress: 30 },
];

export function Sidebar() {
  return (
    <div className="w-16 bg-gray-800 flex flex-col h-screen">
      {/* Logo */}
      <div className="text-white text-xs font-bold mb-4 px-2 pt-4">
        <div className="bg-red-500 text-white px-2 py-1 rounded text-center">
          tt
        </div>
        <div className="text-center mt-1 text-[10px]">ARQUITECTOS</div>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col space-y-3 w-full px-2 flex-1">
        {navigationItems.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <a
              href={item.href}
              className={cn(
                "p-2 rounded-lg transition-colors w-full flex justify-center",
                index === 0
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              )}
            >
              <item.icon className="w-5 h-5" />
            </a>
          </div>
        ))}
      </div>

      {/* Sign Out Button */}
      <div className="px-2 pb-4">
        <button
          onClick={() => auth.signOut()}
          className="p-2 rounded-lg transition-colors w-full flex justify-center text-gray-400 hover:text-white hover:bg-red-600"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
