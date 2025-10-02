import { Timestamp } from "firebase/firestore";

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
