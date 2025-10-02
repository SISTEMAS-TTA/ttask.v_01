"use client";

import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { Dashboard } from "@/components/core/Dashboard";
// import { SidebarMenu } from "@/components/SideBarMenu";
import { SidebarMenu } from "@/components/core/SideBarMenu";
import { AuthWrapper } from "@/components/auth/AuhWrapper";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
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

          {/* Dashboard Content - Full height */}
          <div className="flex-1 overflow-hidden">
            <Dashboard />
          </div>
        </main>
      </div>
    </AuthWrapper>
  );
}
