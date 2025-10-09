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

export interface UserProfile {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: UserRole;
  createdAt: Timestamp;
  lastLogin?: Date;
  active?: boolean;
}

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
}
