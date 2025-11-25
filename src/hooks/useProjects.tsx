"use client";

import { useEffect, useState } from "react";
import type { ProjectDoc, UserRole } from "@/modules/types";
import { subscribeToProjectsForUser } from "@/lib/firebase/projects";

export default function useProjects(userId?: string, role?: UserRole) {
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  useEffect(() => {
    if (!userId || !role) return;
    const unsub = subscribeToProjectsForUser(userId, role, setProjects);
    return () => unsub();
  }, [userId, role]);
  return { projects } as const;
}
