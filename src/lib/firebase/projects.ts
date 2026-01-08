import { getAllUserProfiles } from "@/lib/firebase/users";
import { db } from "./config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
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

// --- TIPOS ---

export type Asignacion =
  | { tipo: "area"; id: string }
  | { tipo: "usuario"; id: string };

export type NewProjectINput = {
  title: string;
  description?: string;
  clientName?: string;
  workType?: string;
  propertyAddress?: string;
  city?: string;
  contactPhone?: string;
  contactEmail?: string;
  asignaciones: Asignacion[];
  sections: ProjectSection[];
  tasks: ProjectTask[];
};

// --- FUNCIONES DE ESCRITURA ---

/**
 * Crea un nuevo proyecto y calcula automáticamente los miembros y roles permitidos.
 */
export async function createProject(createdBy: string, input: NewProjectINput) {
  const ref = collection(db, PROJECTS_COLLECTION);

  // 1. Calcular permisos basados en asignaciones
  const { finalMembers, allowedRoles } = await calculatePermissions(
    input.asignaciones
  );

  const projectData = {
    title: input.title,
    description: input.description ?? null,
    clientName: input.clientName ?? null,
    workType: input.workType ?? null,
    propertyAddress: input.propertyAddress ?? null,
    city: input.city ?? null,
    contactPhone: input.contactPhone ?? null,
    contactEmail: input.contactEmail ?? null,
    createdBy,
    createdAt: serverTimestamp(),

    // Guardamos la configuración visual
    asignaciones: input.asignaciones ?? [],

    // Guardamos los permisos calculados (Seguridad)
    members: Array.from(finalMembers),
    rolesAllowed: Array.from(allowedRoles),

    sections: input.sections,
    tasks: input.tasks,
  };

  // 2. Guardar documento
  await addDoc(ref, projectData);
}

/**
 * Actualiza un proyecto existente.
 * Si se modifican las 'asignaciones', recalcula automáticamente los permisos.
 */
export async function updateProject(
  projectId: string,
  updates: Partial<NewProjectINput>
) {
  const ref = doc(db, PROJECTS_COLLECTION, projectId);

  // 1. Limpiamos datos undefined
  // Usamos DocumentData para evitar el error de "Unexpected any"
  const dataToUpdate: DocumentData = { ...updates };

  Object.keys(dataToUpdate).forEach((key) => {
    if (dataToUpdate[key] === undefined) {
      delete dataToUpdate[key];
    }
  });

  // 2. Si se están actualizando las asignaciones, debemos recalcular permisos
  if (updates.asignaciones) {
    const { finalMembers, allowedRoles } = await calculatePermissions(
      updates.asignaciones
    );

    dataToUpdate.members = Array.from(finalMembers);
    dataToUpdate.rolesAllowed = Array.from(allowedRoles);
  }

  await updateDoc(ref, dataToUpdate);
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error("Error al eliminar el proyecto:", error);
    throw error;
  }
}

// --- UTILIDADES INTERNAS ---

/**
 * Helper para no repetir lógica entre create y update.
 * Calcula los UIDs y Roles permitidos basándose en las asignaciones.
 */
async function calculatePermissions(asignaciones: Asignacion[]) {
  const allUsers = await getAllUserProfiles();
  const finalMembers = new Set<string>();
  const allowedRoles = new Set<ProjectRole>();

  asignaciones.forEach((assignment) => {
    if (assignment.tipo === "usuario") {
      if (assignment.id) {
        finalMembers.add(assignment.id);
      }
    } else if (assignment.tipo === "area") {
      // 1. Agregar el rol a roles permitidos
      if (assignment.id) {
        allowedRoles.add(assignment.id as ProjectRole);
      }
      // 2. Agregar a todos los usuarios que tengan ese rol actualmente
      const usersInThisRole = allUsers.filter(
        (user) => user.role === assignment.id
      );

      usersInThisRole.forEach((user) => {
        if (user.id) {
          finalMembers.add(user.id);
        }
      });
    }
  });

  return { finalMembers, allowedRoles };
}

// --- SUSCRIPCIONES (READ) ---

// --- Función para actualizar asignaciones de un proyecto ---
export async function updateProjectAssignments(
  projectId: string,
  asignaciones: Asignacion[]
) {
  // PASO 1: Obtener todos los usuarios del sistema
  const allUsers = await getAllUserProfiles();

  // PASO 2: Calcular miembros finales y roles permitidos a partir de asignaciones
  const finalMembers = new Set<string>();
  const allowedRoles = new Set<ProjectRole>();

  asignaciones.forEach((assignment) => {
    if (assignment.tipo === "usuario") {
      if (assignment.id) {
        finalMembers.add(assignment.id);
      }
    } else if (assignment.tipo === "area") {
      if (assignment.id) {
        allowedRoles.add(assignment.id as ProjectRole);
      }

      allUsers
        .filter((user) => user.role === assignment.id)
        .forEach((user) => {
          if (user.id) {
            finalMembers.add(user.id);
          }
        });
    }
  });

  // PASO 3: Actualizar el documento
  const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
  await updateDoc(projectRef, {
    asignaciones: asignaciones,
    members: Array.from(finalMembers),
    rolesAllowed: Array.from(allowedRoles),
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
      const proj = mapDocToProject(d.id, data);
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

export function subscribeToProjectsByRole(
  role: ProjectRole,
  onProjects: (projects: ProjectDoc[]) => void,
  onError?: (e: unknown) => void
) {
  const ref = collection(db, PROJECTS_COLLECTION);
  const qByRole = query(ref, where("rolesAllowed", "array-contains", role));

  const handle = (snap: QuerySnapshot<DocumentData>) => {
    const projects = snap.docs.map((d) => mapDocToProject(d.id, d.data()));
    onProjects(projects);
  };

  return onSnapshot(qByRole, handle, (e) => onError?.(e));
}

// Helper para mapear datos crudos a ProjectDoc
function mapDocToProject(id: string, data: DocumentData): ProjectDoc {
  return {
    id: id,
    title: data.title ?? "",
    description: data.description ?? undefined,
    clientName: data.clientName ?? undefined,
    workType: data.workType ?? undefined,
    propertyAddress: data.propertyAddress ?? undefined,
    city: data.city ?? undefined,
    contactPhone: data.contactPhone ?? undefined,
    contactEmail: data.contactEmail ?? undefined,
    createdBy: data.createdBy,
    createdAt: data.createdAt,
    asignaciones: data.asignaciones ?? [], // Aseguramos que venga del DB
    members: Array.isArray(data.members) ? data.members : [],
    rolesAllowed: Array.isArray(data.rolesAllowed) ? data.rolesAllowed : [],
    sections: (data.sections as ProjectSection[]) ?? [],
    tasks: (data.tasks as ProjectTask[]) ?? [],
  };
}
