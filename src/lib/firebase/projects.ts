import { getAllUserProfiles } from "@/lib/firebase/users";
import { deleteDoc, doc } from "firebase/firestore";
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
  const ref = collection(db, PROJECTS_COLLECTION);

  // PASO 1: Obtener todos los usuarios del sistema
  const allUsers = await getAllUserProfiles();

  // PASO 2: Calcular miembros finales y roles permitidos a partir de asignaciones
  const finalMembers = new Set<string>();
  const allowedRoles = new Set<ProjectRole>();

  input.asignaciones.forEach((assignment) => {
    if (assignment.tipo === "usuario") {
      if (assignment.id) {
        finalMembers.add(assignment.id!);
      }
    } else if (assignment.tipo === "area") {
      // 1. Agregamos el rol/área a la lista de roles permitidos (Clave para suscripción)
      if (assignment.id) {
        // Asumimos que assignment.id del tipo 'area' es un ProjectRole válido
        allowedRoles.add(assignment.id as ProjectRole);
      }

      // 2.Agregamos todos los UIDs que tienen ese rol
      // Usamos assignment.id! si ya está validado o lo validamos aquí de nuevo
      allUsers
        .filter((user) => user.role === assignment.id)
        .forEach((user) => {
          // Aplicamos aserción no nula (!) después de verificar
          if (user.id) {
            finalMembers.add(user.id!); // <--- Aserción de tipo
          }
        });
    }
  });

  // PASO 3: Guardar el documento, incluyendo los campos calculados
  await addDoc(ref, {
    title: input.title,
    description: input.description ?? null,
    createdBy,
    createdAt: serverTimestamp(),
    asignaciones: input.asignaciones,

    // CAMPOS VITALES CALCULADOS:
    members: Array.from(finalMembers),
    rolesAllowed: Array.from(allowedRoles),

    sections: input.sections,
    tasks: input.tasks,
  });
}
// --- FIN Bloque Corregido ---

export async function deleteProject(projectId: string): Promise<void> {
  try {
    const projectRef = doc(db, "projects", projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error("Error al eliminar el proyecto:", error);
    throw error;
  }
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

// Suscripción filtrada SOLO por el rol del usuario (para páginas de área)
// Solo muestra proyectos donde el área/rol del usuario está en rolesAllowed
export function subscribeToProjectsByRole(
  role: ProjectRole,
  onProjects: (projects: ProjectDoc[]) => void,
  onError?: (e: unknown) => void
) {
  const ref = collection(db, PROJECTS_COLLECTION);
  const qByRole = query(ref, where("rolesAllowed", "array-contains", role));

  const handle = (snap: QuerySnapshot<DocumentData>) => {
    const projects: ProjectDoc[] = snap.docs.map((d) => {
      const data = d.data();
      return {
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
    });
    onProjects(projects);
  };

  return onSnapshot(qByRole, handle, (e) => onError?.(e));
}
