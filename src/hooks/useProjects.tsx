"use client";

import { useEffect, useState } from "react";
import type { ProjectDoc, UserRole } from "@/modules/types";
import { subscribeToProjectsForUser } from "@/lib/firebase/projects";

export default function useProjects(userId?: string, role?: UserRole) {
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  // 1. Agregamos el estado de carga (true por defecto)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si no hay usuario o rol, no cargamos nada y quitamos el loading
    if (!userId || !role) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true); // Reiniciamos loading al cambiar de usuario

    // 2. Pasamos una función intermedia para manejar los datos Y el loading
    const unsub = subscribeToProjectsForUser(userId, role, (newProjects) => {
      setProjects(newProjects);
      setLoading(false); // ¡Datos recibidos! Apagamos el spinner
    });

    return () => unsub();
  }, [userId, role]);

  // 3. Retornamos projects Y loading
  return { projects, loading } as const;
}
