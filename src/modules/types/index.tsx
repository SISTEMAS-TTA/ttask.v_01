import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role:
    | "Director"
    | "Administrador"
    | "Proyectos"
    | "Diseno"
    | "Gerencia"
    | "Obra"
    | "Sistemas"
    | "Practicante"
    | "Usuario";
  createdAt: Timestamp;
  lastLogin?: Date;
  active?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  deleted: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  status?: "pending" | "in-progress" | "completed";
}

export type UserRole =
  | "Director"
  | "Administrador"
  | "Proyectos"
  | "Diseno"
  | "Gerencia"
  | "Obra"
  | "Sistemas"
  | "Practicante"
  | "Usuario";

  export const ALL_USER_ROLES = [
  "Director",
  "Administrador",
  "Proyectos",
  "Diseno",
  "Gerencia",
  "Obra",
  "Sistemas",
  "Practicante",
  "Usuario",
] as const;
// ---------------------

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
  na?: boolean; // No aplica
  order?: number; // para drag & drop
  // weight?: number; // futuro: ponderación personalizada
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
  createdBy: string;
  createdAt: Timestamp;
  members: string[]; // userIds
  rolesAllowed: ProjectRole[]; // de momento ["Diseno"]
  sections: ProjectSection[];
  tasks: ProjectTask[];
  progress?: number; // calculado en cliente por ahora
}
