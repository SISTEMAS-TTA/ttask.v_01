import { db } from "./config";
import { UserRole } from "@/modules/types";
import { getUserProfileById } from "./users";
import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  getDoc,
  getDocs, // Agregamos getDocs
  arrayUnion,
  DocumentData,
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
  comments?: Array<{
    id: string;
    authorId: string;
    text: string;
    createdAt: Timestamp;
  }>;
  lastCommentAt?: Timestamp;
  lastSeenByAssignerAt?: Timestamp;
};

export interface NewTaskInput {
  title: string;
  project: string;
  description: string;
  assigneeId?: string; // string | undefined
  assigneeRole?: UserRole;
  viewed: boolean;
  completed: boolean;
  favorite: boolean;
}

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
        const data = d.data() as Record<string, unknown>;
        const favoritesMap =
          (data.favorites as Record<string, boolean> | undefined) ?? undefined;
        const task: TaskDoc = {
          id: d.id,
          title: (data.title as string) ?? "",
          project: (data.project as string) ?? "General",
          description: (data.description as string) ?? "",
          assigneeId: (data.assigneeId as string) ?? "",
          assignedBy: (data.assignedBy as string) ?? userId,
          viewed: Boolean(data.viewed),
          completed: Boolean(data.completed),
          favorite: Boolean(favoritesMap?.[userId]) || Boolean(data.favorite),
          deleted: Boolean(data.deleted),
          favorites: favoritesMap,
          createdAt:
            data.createdAt instanceof Timestamp
              ? (data.createdAt as Timestamp)
              : Timestamp.now(),
          updatedAt:
            data.updatedAt instanceof Timestamp
              ? (data.updatedAt as Timestamp)
              : undefined,
          comments: (data.comments as TaskDoc["comments"]) ?? [],
          lastCommentAt:
            data.lastCommentAt instanceof Timestamp
              ? (data.lastCommentAt as Timestamp)
              : undefined,
          lastSeenByAssignerAt:
            data.lastSeenByAssignerAt instanceof Timestamp
              ? (data.lastSeenByAssignerAt as Timestamp)
              : undefined,
        };
        return task;
      });

      // Ordenar: favoritas del usuario primero, luego por createdAt desc
      const sorted = tasks.sort((a, b) => {
        if (a.favorite === b.favorite)
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        return a.favorite ? -1 : 1;
      });
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
        const data = d.data() as Record<string, unknown>;
        const favoritesMap =
          (data.favorites as Record<string, boolean> | undefined) ?? undefined;
        const task: TaskDoc = {
          id: d.id,
          title: (data.title as string) ?? "",
          project: (data.project as string) ?? "General",
          description: (data.description as string) ?? "",
          assigneeId: (data.assigneeId as string) ?? userId,
          assignedBy: (data.assignedBy as string) ?? "",
          viewed: Boolean(data.viewed),
          completed: Boolean(data.completed),
          favorite: Boolean(favoritesMap?.[userId]) || Boolean(data.favorite),
          deleted: Boolean(data.deleted),
          favorites: favoritesMap,
          createdAt:
            data.createdAt instanceof Timestamp
              ? (data.createdAt as Timestamp)
              : Timestamp.now(),
          updatedAt:
            data.updatedAt instanceof Timestamp
              ? (data.updatedAt as Timestamp)
              : undefined,
          comments: (data.comments as TaskDoc["comments"]) ?? [],
          lastCommentAt:
            data.lastCommentAt instanceof Timestamp
              ? (data.lastCommentAt as Timestamp)
              : undefined,
          lastSeenByAssignerAt:
            data.lastSeenByAssignerAt instanceof Timestamp
              ? (data.lastSeenByAssignerAt as Timestamp)
              : undefined,
        };
        return task;
      });

      const sorted = tasks.sort((a, b) => {
        if (a.favorite === b.favorite)
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        return a.favorite ? -1 : 1;
      });
      onTasks(sorted);
    },
    (err) => {
      console.error("Error al suscribirse a tareas recibidas por usuario", err);
      onError?.(err);
    }
  );
};

// Modificado para enviar a email
export const createTask = async (
  assignedByUserId: string,
  input: NewTaskInput
) => {
  const ref = collection(db, TASKS_COLLECTION);

  // --- CASO 1: Asignación por Área (Rol) ---
  if (input.assigneeRole && !input.assigneeId) {
    try {
      // Buscar todos los usuarios con ese rol
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "==", input.assigneeRole));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.warn(
          `No se encontraron usuarios para el rol: ${input.assigneeRole}`
        );
        return;
      }

      const batchPromises = snapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        const userData = userDoc.data();

        const newTaskData = {
          ...input,
          assigneeId: userId, // Aquí asignamos el ID específico
          assigneeRole: null, // Limpiamos el rol
          assignedBy: assignedByUserId,
          deleted: false,
          createdAt: Timestamp.now(),
        };

        // Crear la tarea individual
        await addDoc(ref, newTaskData);

        // Enviar correo individual
        if (userData.email) {
          // CORRECCIÓN: Añadimos || "Usuario" por si fullName es undefined
          await sendEmailNotification(
            userData.email,
            userData.fullName || "Usuario",
            input.title
          );
        }
      });

      await Promise.all(batchPromises);
      return;
    } catch (error) {
      console.error("Error al asignar tarea masiva por rol:", error);
      throw error;
    }
  }

  // --- CASO 2: Asignación Individual ---
  const newTaskData = {
    ...input,
    // Aseguramos que assigneeId sea string vacío si viene undefined (para evitar errores en DB)
    assigneeId: input.assigneeId || "",
    assignedBy: assignedByUserId,
    deleted: false,
    createdAt: Timestamp.now(),
  };

  await addDoc(ref, newTaskData);

  // Notificación por Correo
  if (input.assigneeId) {
    // CORRECCIÓN: Forzamos el tipo 'as string' porque ya validamos en el if que existe
    const assigneeProfile = await getUserProfileById(
      input.assigneeId as string
    );

    if (assigneeProfile && assigneeProfile.email) {
      // CORRECCIÓN: Añadimos || "Usuario" para manejar el fullName opcional
      await sendEmailNotification(
        assigneeProfile.email,
        assigneeProfile.fullName || "Usuario",
        input.title
      );
    }
  }
};

// Función auxiliar para no repetir código de email
async function sendEmailNotification(
  email: string,
  name: string,
  title: string
) {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientEmail: email,
        recipientName: name,
        taskTitle: title,
      }),
    });
    if (!response.ok) console.error("Error API Email", await response.json());
  } catch (e) {
    console.error("Fallo fetch email", e);
  }
}

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

// Suscripción a tareas completadas (SOLO las asignadas POR el usuario, no las recibidas)
export const subscribeToCompletedTasks = (
  userId: string,
  onTasks: (tasks: TaskDoc[]) => void,
  onError?: (error: unknown) => void
) => {
  const ref = collection(db, TASKS_COLLECTION);

  // Solo consultar tareas completadas asignadas POR el usuario
  const assignedByQuery = query(
    ref,
    where("assignedBy", "==", userId),
    where("completed", "==", true)
  );

  const unsubscribers: (() => void)[] = [];
  const allTasks = new Map<string, TaskDoc>();

  const handleSnapshot = (snapshot: {
    docs: Array<{ data: () => Record<string, unknown>; id: string }>;
  }) => {
    // Limpiar el mapa y agregar las tareas actualizadas
    allTasks.clear();
    snapshot.docs.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      const favoritesMap =
        (data.favorites as Record<string, boolean> | undefined) ?? undefined;
      const task: TaskDoc = {
        id: d.id,
        title: (data.title as string) ?? "",
        project: (data.project as string) ?? "General",
        description: (data.description as string) ?? "",
        assigneeId: (data.assigneeId as string) ?? "",
        assignedBy: (data.assignedBy as string) ?? "",
        viewed: Boolean(data.viewed),
        completed: Boolean(data.completed),
        favorite: Boolean(favoritesMap?.[userId]) || Boolean(data.favorite),
        deleted: Boolean(data.deleted),
        favorites: favoritesMap,
        createdAt:
          data.createdAt instanceof Timestamp
            ? (data.createdAt as Timestamp)
            : Timestamp.now(),
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? (data.updatedAt as Timestamp)
            : undefined,
      };
      allTasks.set(task.id, task);
    });

    // Ordenar y enviar todas las tareas
    const sorted = Array.from(allTasks.values()).sort((a, b) => {
      // favoritas del usuario arriba; si igual, por updatedAt/createdAt desc
      if (a.favorite === b.favorite) {
        return (
          (b.updatedAt?.toMillis() ?? b.createdAt.toMillis()) -
          (a.updatedAt?.toMillis() ?? a.createdAt.toMillis())
        );
      }
      return a.favorite ? -1 : 1;
    });
    onTasks(sorted);
  };

  // Suscripción a tareas asignadas por el usuario
  const unsubAssignedBy = onSnapshot(
    assignedByQuery,
    (snapshot) => handleSnapshot(snapshot),
    (err) => {
      console.error(
        "Error al suscribirse a tareas completadas asignadas por usuario",
        err
      );
      onError?.(err);
    }
  );

  unsubscribers.push(unsubAssignedBy);

  // Retornar función para cancelar la suscripción
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

// Agregar comentario (solo activa en UI para el asignado)
export async function addTaskComment(
  taskId: string,
  authorId: string,
  text: string
) {
  const ref = doc(db, "tasks", taskId);
  const commentId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newComment = {
    id: commentId,
    authorId,
    text,
    // No se puede usar serverTimestamp() dentro de arrayUnion; usar hora del cliente
    createdAt: Timestamp.now(),
  };
  await updateDoc(ref, {
    comments: arrayUnion(newComment),
    lastCommentAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Eliminar comentario (solo el autor puede borrar)
export async function deleteTaskComment(
  taskId: string,
  requesterId: string,
  commentId: string
) {
  const ref = doc(db, "tasks", taskId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as DocumentData;
  const comments = (data.comments as TaskDoc["comments"]) ?? [];
  const target = comments.find((c) => c.id === commentId);
  if (!target) return;
  if (target.authorId !== requesterId) {
    throw new Error("Solo el autor del comentario puede borrarlo");
  }
  const remaining = comments.filter((c) => c.id !== commentId);
  // Recalcular lastCommentAt basado en el último comentario restante
  const last = remaining
    .map((c) => c.createdAt)
    .filter(Boolean)
    .sort((a, b) => b.toMillis() - a.toMillis())[0];
  await updateDoc(ref, {
    comments: remaining,
    lastCommentAt: last || null,
    updatedAt: serverTimestamp(),
  });
}

// Marcar comentarios como vistos por el asignador
export async function markTaskCommentsSeenByAssigner(taskId: string) {
  const ref = doc(db, "tasks", taskId);
  await updateDoc(ref, {
    lastSeenByAssignerAt: serverTimestamp(),
  });
}

// --- Borrar una Tarea---
export async function deleteTask(taskId: string) {
  const ref = doc(db, TASKS_COLLECTION, taskId);
  await deleteDoc(ref);
}
