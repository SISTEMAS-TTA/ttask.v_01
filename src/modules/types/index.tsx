import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;

  // USA EL TIPO QUE CREAMOS ABAJO
  role: UserRole;

  createdAt: Timestamp;
  lastLogin?: Date;
  active?: boolean;
  isAreaChief?: boolean;
}

export interface ActionMetadata {
  uid: string;
  name: string;
  at: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId?: string; // Ahora opcional
  assigneeRole?: UserRole; // Nuevo campo para áreas
  deleted: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  status?: "pending" | "in-progress" | "completed";
}

export const ALL_USER_ROLES = [
  "Director",
  "Administrador",
  "Aux. Admin",
  "Arquitectura",
  "Diseno",
  // "Gerencia",
  "Obra",
  "Sistemas",
  "Practicante",
  "Usuario",
] as const;

export type UserRole = (typeof ALL_USER_ROLES)[number];

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  color: string;
  completed: boolean;
  favorite: boolean; // valor legacy (global)
  favorites?: Record<string, boolean>; // favoritos por usuario: { userId: true }
  project: string;
  createdAt: Timestamp;
  // Posición manual para drag & drop (opcional)
  order?: number;
}

// Projects (frontend-only for now)
export type ProjectRole = UserRole;

export interface ProjectTask {
  id: string;
  sectionId: string;
  title: string;
  completed: boolean;
  favorite?: boolean;
  completedBy?: ActionMetadata;
  favoriteBy?: ActionMetadata;
  na?: boolean;
  isHeader?: boolean;
  order?: number;
}

export interface ProjectSection {
  id: string;
  title: string;
  order?: number;
}

export interface ProjectDoc {
  id: string;
  title: string;
  description?: string;
  clientName?: string;
  workType?: string;
  propertyAddress?: string;
  city?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdBy: string;
  createdAt: Timestamp;
  members: string[]; // userIds
  rolesAllowed: ProjectRole[]; // de momento ["Diseno"]
  sections: ProjectSection[];
  tasks: ProjectTask[];
  progress?: number; // calculado en cliente por ahora
  asignaciones?: Array<{ tipo: "area" | "usuario"; id: string }>;
}
