"use client";

import AuthGuard from "@/components/AuthGuard";
import { Card } from "@/components/ui/card";
import useProjects from "@/hooks/useProjects";
import useUser from "@/modules/auth/hooks/useUser";
import Link from "next/link";

type AreaProjectsViewProps = {
  title: string;
  description?: string;
  projectLinkBase?: string;
  emptyText?: string;
};

export default function AreaProjectsView({
  title,
  description,
  projectLinkBase = "/direccion",
  emptyText = "No hay proyectos disponibles.",
}: AreaProjectsViewProps) {
  const { user, profile } = useUser();
  const { projects } = useProjects(user?.uid, profile?.role);

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {projects.length === 0 && (
            <p className="text-sm text-gray-600">{emptyText}</p>
          )}
          {projects.map((p) => (
            <Card key={p.id} className="p-4">
              <h3 className="font-medium">{p.title}</h3>
              {p.description && (
                <p className="text-sm text-gray-600">{p.description}</p>
              )}
              <div className="mt-2">
                <Link
                  href={`${projectLinkBase}/${p.id}`}
                  className="text-sm text-blue-600"
                >
                  Ver
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
