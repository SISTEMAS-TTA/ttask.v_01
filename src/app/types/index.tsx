// types/index.ts
import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  email: string;
  role: "user" | "admin";
  createdAt: Timestamp;
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