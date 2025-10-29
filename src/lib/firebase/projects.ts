import { db } from "./config";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import type {
  ProjectDoc,
  ProjectSection,
  ProjectTask,
  ProjectRole,
} from "@/modules/types";

const PROJECTS_COLLECTION = "projects";

export type NewProjectInput = {
  title: string;
  description?: string;
  members: string[]; // userIds
  rolesAllowed: ProjectRole[]; // e.g., ["Diseno"]
  sections: ProjectSection[];
  tasks: ProjectTask[];
};

export async function createProject(createdBy: string, input: NewProjectInput) {
  const ref = collection(db, PROJECTS_COLLECTION);
  await addDoc(ref, {
    title: input.title,
    description: input.description ?? null,
    createdBy,
    createdAt: serverTimestamp(),
    members: input.members ?? [],
    rolesAllowed: input.rolesAllowed ?? [],
    sections: input.sections,
    tasks: input.tasks,
  });
}

// Merge three queries: createdBy, members contains uid, rolesAllowed contains role
export function subscribeToProjectsForUser(
  userId: string,
  role: ProjectRole,
  onProjects: (projects: ProjectDoc[]) => void,
  onError?: (e: unknown) => void
) {
  const ref = collection(db, PROJECTS_COLLECTION);
  const qByOwner = query(ref, where("createdBy", "==", userId));
  const qByMember = query(ref, where("members", "array-contains", userId));
  const qByRole = query(ref, where("rolesAllowed", "array-contains", role));

  const map = new Map<string, ProjectDoc>();
  const emit = () => onProjects(Array.from(map.values()));

  const handle = (snap: QuerySnapshot<DocumentData>) => {
    snap.docs.forEach((d) => {
      const data = d.data();
      const proj: ProjectDoc = {
        id: d.id,
        title: data.title ?? "",
        description: data.description ?? undefined,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        members: Array.isArray(data.members) ? data.members : [],
        rolesAllowed: Array.isArray(data.rolesAllowed) ? data.rolesAllowed : [],
        sections: (data.sections as ProjectSection[]) ?? [],
        tasks: (data.tasks as ProjectTask[]) ?? [],
      };
      map.set(d.id, proj);
    });
    emit();
  };

  const unsubs = [
    onSnapshot(qByOwner, handle, (e) => onError?.(e)),
    onSnapshot(qByMember, handle, (e) => onError?.(e)),
    onSnapshot(qByRole, handle, (e) => onError?.(e)),
  ];
  return () => unsubs.forEach((u) => u());
}
