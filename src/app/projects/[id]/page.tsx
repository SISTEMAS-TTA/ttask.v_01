"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProjectDoc, ProjectTask, ProjectRole } from "@/modules/types";
import { Star } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

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

  const toggleCompleted = async (taskId: string) => {
    if (!project) return;
    const updated = project.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setProject({ ...project, tasks: updated });
    await updateDoc(doc(db, "projects", project.id), { tasks: updated });
  };

  const toggleNA = async (taskId: string) => {
    if (!project) return;
    const updated = project.tasks.map((t) =>
      t.id === taskId
        ? { ...t, na: !t.na, completed: t.na ? t.completed : false }
        : t
    );
    setProject({ ...project, tasks: updated });
    await updateDoc(doc(db, "projects", project.id), { tasks: updated });
  };

  const toggleFavorite = async (taskId: string) => {
    if (!project) return;
    const updated = project.tasks.map((t) =>
      t.id === taskId ? { ...t, favorite: !t.favorite } : t
    );
    setProject({ ...project, tasks: updated });
    await updateDoc(doc(db, "projects", project.id), { tasks: updated });
  };

  if (!project) {
    return (
      <AuthGuard>
        <div className="max-w-4xl mx-auto p-4">
          <p className="text-sm text-gray-600">Proyecto no encontrado.</p>
          <Button className="mt-3" onClick={() => router.push("/projects")}>
            Volver
          </Button>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-sm text-gray-600">{project.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-700">Avance</div>
            <div className="flex items-center gap-2">
              <div className="w-40 h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-green-500 rounded"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
          </div>
        </div>

        {sections.map((sec) => (
          <Card key={sec.id} className="p-4 space-y-3">
            <h2 className="text-lg font-medium">{sec.title}</h2>
            <ul className="space-y-2">
              {(tasksBySection[sec.id] || []).map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-md border p-2 bg-white"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      disabled={t.na}
                      onChange={() => toggleCompleted(t.id)}
                    />
                    <span
                      className={
                        t.completed ? "line-through text-gray-500" : ""
                      }
                    >
                      {t.title}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Star
                      className={`h-4 w-4 ${
                        t.favorite
                          ? "text-yellow-600 fill-current"
                          : "text-gray-400"
                      }`}
                      onClick={() => toggleFavorite(t.id)}
                      style={{ cursor: "pointer" }}
                    />
                    <button
                      className={`text-xs px-2 py-1 rounded-full border ${
                        t.na ? "bg-gray-200" : "bg-gray-50"
                      }`}
                      onClick={() => toggleNA(t.id)}
                    >
                      {t.na ? "N/A" : "Marcar N/A"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </AuthGuard>
  );
}
