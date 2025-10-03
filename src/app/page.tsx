"use client";

import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/config";
import { Dashboard } from "@/components/core/Dashboard";
// import { SidebarMenu } from "@/components/SideBarMenu";
import { SidebarMenu } from "@/components/core/SideBarMenu";
import { AuthWrapper } from "@/modules/auth/components/AuhWrapper";
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

          {/* Dashboard Content - Full height */}
          <div className="flex-1 overflow-hidden">
            <Dashboard />
          </div>
        </main>
      </div>
    </AuthWrapper>
  );
}
