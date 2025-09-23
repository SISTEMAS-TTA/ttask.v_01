"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Sidebar } from "@/components/SideBarMenu";
import { Menu } from "lucide-react";

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }
  if (!user) {
    return null;
  }
  return (
    <div className="h-screen flex relative">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar />
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
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">tt</span>
            <span className="ml-1 text-xs">ARQUITECTOS</span>
          </div>
        </header>
        
        {/* Dashboard Content - Full height */}
        <div className="flex-1 overflow-hidden">
          <Dashboard />
        </div>
      </main>
    </div>
  );
}
