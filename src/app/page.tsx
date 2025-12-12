"use client";

import DashboardPage from "./dashboard/page";
import { AuthWrapper } from "@/modules/auth/components/AuhWrapper";
import { PageShell } from "@/components/PageShell";

export default function Home() {
  return (
    <AuthWrapper>
      <PageShell>
        <DashboardPage />
      </PageShell>
    </AuthWrapper>
  );
}
