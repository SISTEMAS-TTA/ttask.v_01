import { db } from "./config";
import type {
  QuerySnapshot,
  DocumentData,
  FirestoreError,
  Query,
  QueryDocumentSnapshot,
} from "@firebase/firestore";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import type {
  ProjectDoc,
  ProjectSection,
  ProjectTask,
  ProjectRole,
} from "@/modules/types";

const PROJECTS_COLLECTION = "projects";

// --- PEGA ESTE NUEVO BLOQUE ---

// Definimos el tipo de Asignacion aquí para poder usarlo
type Asignacion =
  | { tipo: "area"; id: string }
  | { tipo: "usuario"; id: string };

export type NewProjectINput = {
  title: string;
  description?: string;
  // members: string[]; // BORRADO
  // rolesAllowed: string[]; // BORRADO

  asignaciones: Asignacion[]; // NUEVO: Nuestra propiedad ya es válida

  sections: ProjectSection[];
  tasks: ProjectTask[];
};

// --- INICIO Bloque Corregido ---
export async function createProject(createdBy: string, input: NewProjectINput) {
  // <-- Arreglo 1: "INput" con 'N'
  const ref = collection(db, PROJECTS_COLLECTION);
  await addDoc(ref, {
    title: input.title,
    description: input.description ?? null,
    createdBy,
    createdAt: serverTimestamp(),

    // members: input.members ?? [], // BORRADO
    // rolesAllowed: input.rolesAllowed ?? [], // BORRADO
    asignaciones: input.asignaciones ?? [], // <-- Arreglo 2: Guardamos la nueva propiedad

    sections: input.sections,
    tasks: input.tasks,
  });
}
// --- FIN Bloque Corregido ---

// Merge three queries: createdBy, members contains uid, rolesAllowed contains role
export function subscribeToProjectsForUser(
  userId: string,
  role: ProjectRole,
  onProjects: (projects: ProjectDoc[]) => void,
  onError?: (e: unknown) => void
) {
  const ref = collection(db, PROJECTS_COLLECTION);
  const qByOwner: Query<DocumentData> = query(
    ref,
    where("createdBy", "==", userId)
  );
  const qByMember: Query<DocumentData> = query(
    ref,
    where("members", "array-contains", userId)
  );
  const qByRole: Query<DocumentData> = query(
    ref,
    where("rolesAllowed", "array-contains", role)
  );

  const map = new Map<string, ProjectDoc>();
  const emit = () => onProjects(Array.from(map.values()));

  const handle = (snap: QuerySnapshot<DocumentData>) => {
    snap.docs.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
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
    onSnapshot(qByOwner, handle, (e: FirestoreError) => onError?.(e)),
    onSnapshot(qByMember, handle, (e: FirestoreError) => onError?.(e)),
    onSnapshot(qByRole, handle, (e: FirestoreError) => onError?.(e)),
  ];
  return () => unsubs.forEach((u) => u());
}
