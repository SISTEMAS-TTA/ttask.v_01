"use client";

import DashboardPage from "./dashboard/page";
import { AuthWrapper } from "@/modules/auth/components/AuhWrapper";

export default function Home() {
  return (
    <AuthWrapper>
      <DashboardPage/>
    </AuthWrapper>
  );
}

