"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProjectDoc, ProjectTask, ProjectRole } from "@/modules/types";
import { Star } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDoc | null>(null);

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) return;
    const ref = doc(db, "projects", id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setProject(null);
          return;
        }
        const data = snap.data();
        if (!data) return;

        const proj: ProjectDoc = {
          id: snap.id,
          title: String(data.title || ""),
          description: data.description || undefined,
          createdBy: String(data.createdBy || ""),
          createdAt: data.createdAt,
          members: Array.isArray(data.members)
            ? (data.members as string[])
            : [],
          rolesAllowed: Array.isArray(data.rolesAllowed)
            ? (data.rolesAllowed as ProjectRole[])
            : [],
          sections: Array.isArray(data.sections) ? data.sections : [],
          tasks: Array.isArray(data.tasks) ? data.tasks : [],
        };
        setProject(proj);
      },
      () => setProject(null)
    );
    return () => unsub();
  }, [params.id]);

  const sections = useMemo(
    () =>
      project?.sections
        ?.slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) || [],
    [project]
  );
  const tasksBySection = useMemo(() => {
    const map: Record<string, ProjectTask[]> = {};
    (project?.tasks || []).forEach((t) => {
      map[t.sectionId] ||= [];
      map[t.sectionId].push(t);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    );
    return map;
  }, [project]);

  const progress = useMemo(() => {
    const tasks = project?.tasks || [];
    const effective = tasks.filter((t) => !t.na);
    if (!effective.length) return 0;
    const done = effective.filter((t) => t.completed).length;
    return Math.round((done / effective.length) * 100);
  }, [project]);

  if (!project) {
    return (
      <AuthGuard>
        <div className="max-w-4xl mx-auto p-4">
          <p className="text-sm text-gray-600">Proyecto no encontrado.</p>
          <Button className="mt-3" onClick={() => router.push("/direccion")}>
            Volver
          </Button>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        {/* Header con botón de volver */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/direccion")}
            className="h-10 w-10"
          >
            {/* <ArrowLeft className="h-5 w-5" /> */}
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-sm text-gray-600">{project.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-700 mb-1">Avance General</div>
            <div className="flex items-center gap-2">
              <div className="w-40 h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-green-500 rounded transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Nota informativa de solo lectura */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Vista de solo lectura:</strong> Puedes ver el estado y
            avance de todas las tareas del proyecto, pero no puedes
            modificarlas.
          </p>
        </div>

        {sections.map((sec) => {
          // Calcular progreso de la sección
          const sectionTasks = tasksBySection[sec.id] || [];
          const effectiveTasks = sectionTasks.filter((t) => !t.na);
          const completedTasks = effectiveTasks.filter((t) => t.completed);
          const sectionProgress =
            effectiveTasks.length > 0
              ? Math.round(
                  (completedTasks.length / effectiveTasks.length) * 100
                )
              : 0;

          return (
            <Card key={sec.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{sec.title}</h2>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-green-500 rounded transition-all duration-300"
                      style={{ width: `${sectionProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {sectionProgress}%
                  </span>
                </div>
              </div>
              <ul className="space-y-2">
                {sectionTasks.map((t) => (
                  <li
                    key={t.id}
                    className={`flex items-center justify-between rounded-md border p-3 transition-colors ${
                      t.na
                        ? "bg-red-50 border-red-200 text-red-700 opacity-70"
                        : t.completed
                        ? "bg-green-50 border-green-200 text-green-700"
                        : t.favorite
                        ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-sm flex-1">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        disabled={true}
                        className="h-4 w-4 rounded border-gray-300 cursor-not-allowed"
                      />
                      <span
                        className={
                          t.completed ? "line-through text-gray-500" : ""
                        }
                      >
                        {t.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.favorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      {t.na && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                          N/A
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </AuthGuard>
  );
}
