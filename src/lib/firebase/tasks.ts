import { db } from "./config";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  getDoc,
} from "firebase/firestore";

export type TaskDoc = {
  id: string;
  title: string;
  project: string;
  description?: string;
  assigneeId: string; // usuario que recibe la tarea
  assignedBy: string; // usuario que asigna
  viewed: boolean;
  completed: boolean;
  favorite: boolean;
  deleted: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  favorites?: Record<string, boolean>; // favoritos por usuario
};

export type NewTaskInput = Omit<
  TaskDoc,
  "id" | "assignedBy" | "deleted" | "createdAt" | "updatedAt"
>;

const TASKS_COLLECTION = "tasks";

// Suscripción a tareas asignadas POR el usuario actual (columna T. Asignadas)
export const subscribeToTasksAssignedBy = (
  userId: string,
  onTasks: (tasks: TaskDoc[]) => void,
  onError?: (error: unknown) => void
) => {
  const ref = collection(db, TASKS_COLLECTION);
  const q = query(ref, where("assignedBy", "==", userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map((d) => {
        const data = d.data() as any;
        const task: TaskDoc = {
          id: d.id,
          title: data.title ?? "",
          project: data.project ?? "General",
          description: data.description ?? "",
          assigneeId: data.assigneeId ?? "",
          assignedBy: data.assignedBy ?? userId,
          viewed: Boolean(data.viewed),
          completed: Boolean(data.completed),
          favorite: Boolean(data.favorite),
          deleted: Boolean(data.deleted),
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt
              : Timestamp.now(),
          updatedAt:
            data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
        };
        return task;
      });

      const sorted = tasks.sort(
        (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
      );
      onTasks(sorted);
    },
    (err) => {
      console.error("Error al suscribirse a tareas asignadas por usuario", err);
      onError?.(err);
    }
  );
};

// Suscripción a tareas asignadas AL usuario actual (columna T. Recibidas)
export const subscribeToTasksAssignedTo = (
  userId: string,
  onTasks: (tasks: TaskDoc[]) => void,
  onError?: (error: unknown) => void
) => {
  const ref = collection(db, TASKS_COLLECTION);
  const q = query(ref, where("assigneeId", "==", userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map((d) => {
        const data = d.data() as any;
        const task: TaskDoc = {
          id: d.id,
          title: data.title ?? "",
          project: data.project ?? "General",
          description: data.description ?? "",
          assigneeId: data.assigneeId ?? userId,
          assignedBy: data.assignedBy ?? "",
          viewed: Boolean(data.viewed),
          completed: Boolean(data.completed),
          favorite: Boolean(data.favorite),
          deleted: Boolean(data.deleted),
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt
              : Timestamp.now(),
          updatedAt:
            data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
        };
        return task;
      });

      const sorted = tasks.sort(
        (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
      );
      onTasks(sorted);
    },
    (err) => {
      console.error("Error al suscribirse a tareas recibidas por usuario", err);
      onError?.(err);
    }
  );
};

export const createTask = async (
  assignedByUserId: string,
  input: NewTaskInput
) => {
  const ref = collection(db, TASKS_COLLECTION);
  await addDoc(ref, {
    ...input,
    assignedBy: assignedByUserId,
    deleted: false,
    createdAt: Timestamp.now(),
  });
};

// Solo el asignado puede marcar viewed/completed
export async function updateTask(
  taskId: string,
  updates: Partial<{
    viewed: boolean;
    completed: boolean;
    favorite: boolean;
    title: string;
    project: string;
    description?: string;
  }>,
  currentUserId?: string
) {
  const ref = doc(db, "tasks", taskId);

  // Si se intenta actualizar viewed/completed, validar asignado
  const touchesViewedOrCompleted =
    Object.prototype.hasOwnProperty.call(updates, "viewed") ||
    Object.prototype.hasOwnProperty.call(updates, "completed");

  if (touchesViewedOrCompleted) {
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as { assigneeId?: string };
    if (
      !currentUserId ||
      !data.assigneeId ||
      data.assigneeId !== currentUserId
    ) {
      throw new Error(
        "Solo el usuario asignado puede actualizar viewed/completed"
      );
    }
  }

  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Suscripción a tareas completadas (tanto las asignadas por el usuario como las recibidas por él)
export const subscribeToCompletedTasks = (
  userId: string,
  onTasks: (tasks: TaskDoc[]) => void,
  onError?: (error: unknown) => void
) => {
  const ref = collection(db, TASKS_COLLECTION);

  // Crear consultas para tareas completadas asignadas POR el usuario y AL usuario
  const assignedByQuery = query(
    ref,
    where("assignedBy", "==", userId),
    where("completed", "==", true)
  );

  const assignedToQuery = query(
    ref,
    where("assigneeId", "==", userId),
    where("completed", "==", true)
  );

  const unsubscribers: (() => void)[] = [];
  const allTasks = new Map<string, TaskDoc>();

  const handleSnapshot = (snapshot: any, source: "assigned" | "received") => {
    snapshot.docs.forEach((d: any) => {
      const data = d.data() as any;
      const task: TaskDoc = {
        id: d.id,
        title: data.title ?? "",
        project: data.project ?? "General",
        description: data.description ?? "",
        assigneeId: data.assigneeId ?? "",
        assignedBy: data.assignedBy ?? "",
        viewed: Boolean(data.viewed),
        completed: Boolean(data.completed),
        favorite: Boolean(data.favorite),
        deleted: Boolean(data.deleted),
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt
            : Timestamp.now(),
        updatedAt:
          data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
      };
      allTasks.set(task.id, task);
    });

    // Ordenar y enviar todas las tareas
    const sorted = Array.from(allTasks.values()).sort(
      (a, b) =>
        (b.updatedAt?.toMillis() ?? b.createdAt.toMillis()) -
        (a.updatedAt?.toMillis() ?? a.createdAt.toMillis())
    );
    onTasks(sorted);
  };

  // Suscripción a tareas asignadas por el usuario
  const unsubAssignedBy = onSnapshot(
    assignedByQuery,
    (snapshot) => handleSnapshot(snapshot, "assigned"),
    (err) => {
      console.error(
        "Error al suscribirse a tareas completadas asignadas por usuario",
        err
      );
      onError?.(err);
    }
  );

  // Suscripción a tareas asignadas al usuario
  const unsubAssignedTo = onSnapshot(
    assignedToQuery,
    (snapshot) => handleSnapshot(snapshot, "received"),
    (err) => {
      console.error(
        "Error al suscribirse a tareas completadas asignadas al usuario",
        err
      );
      onError?.(err);
    }
  );

  unsubscribers.push(unsubAssignedBy, unsubAssignedTo);

  // Retornar función para cancelar ambas suscripciones
  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
};

export async function updateTaskFavorite(
  taskId: string,
  userId: string,
  value: boolean
) {
  const ref = doc(db, "tasks", taskId);
  await updateDoc(ref, {
    [`favorites.${userId}`]: value,
    updatedAt: serverTimestamp(),
  });
}
