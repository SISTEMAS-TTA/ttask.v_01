"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import useUser from "@/modules/auth/hooks/useUser";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import type { ProjectDoc, UserRole } from "@/modules/types";
import { subscribeToProjectsByRole } from "@/lib/firebase/projects";
import { Loader2 } from "lucide-react";

interface AreaProjectsPageProps {
  areaRole: UserRole;
  areaName: string;
}

export default function AreaProjectsPage({
  areaRole,
  areaName,
}: AreaProjectsPageProps) {
  const { user, profile, loading: userLoading } = useUser();
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo suscribirse cuando el usuario esté autenticado
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsub = subscribeToProjectsByRole(
      areaRole,
      (projs) => {
        setProjects(projs);
        setLoading(false);
      },
      (err) => {
        console.error("Error al cargar proyectos:", err);
        setError("Error al cargar los proyectos. Intenta recargar la página.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user, areaRole]);

  // Verificar que el usuario tenga el rol correcto o sea admin
  const canAccess =
    profile?.role === areaRole ||
    profile?.role === "Director" ||
    profile?.role === "Administrador" ||
    profile?.role === "Aux. Admin";

  if (userLoading || loading) {
    return (
      <AuthGuard>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AuthGuard>
    );
  }

  if (!canAccess) {
    return (
      <AuthGuard>
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Acceso restringido
            </h1>
            <p className="text-gray-600">
              No tienes permisos para ver esta página.
            </p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Proyectos - {areaName}
          </h1>
        </div>

        <p className="text-sm text-gray-600">
          Proyectos asignados al área de {areaName}
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Grid de proyectos */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {projects.map((p) => (
            <Card key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{p.title}</h3>
                {p.description && (
                  <p className="text-sm text-gray-600">{p.description}</p>
                )}
              </div>
              <Link
                href={`/projects/${p.id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                Ver
              </Link>
            </Card>
          ))}
          {projects.length === 0 && !error && (
            <p className="text-sm text-gray-600 col-span-full">
              No hay proyectos asignados a {areaName}.
            </p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

