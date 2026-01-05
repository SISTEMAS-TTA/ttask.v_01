import { db } from "./config";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

const CHECKLISTS_COLLECTION = "checklists";

// --- TIPOS ---

export type ChecklistType =
  | "arquitectura"
  | "obra"
  | "auxAdmin"
  | "logistica"
  | "pagos"
  | "sistemas"
  | "direccion"
  | "cliente"
  | "diseno";

export interface ChecklistSection {
  id: string;
  title: string;
  order: number;
}

export interface ChecklistTask {
  id: string;
  sectionId: string;
  title: string;
  completed: boolean;
  favorite: boolean;
  isHeader?: boolean;
  order: number;
}

export interface ChecklistDoc {
  id: string;
  type: ChecklistType;
  name: string;
  description?: string;
  sections: ChecklistSection[];
  tasks: ChecklistTask[];
  createdAt: any;
  updatedAt: any;
  createdBy?: string;
}

// --- FUNCIONES DE ESCRITURA ---

/**
 * Crea un nuevo checklist template
 */
export async function createChecklist(data: {
  type: ChecklistType;
  name: string;
  description?: string;
  sections: ChecklistSection[];
  tasks: ChecklistTask[];
  createdBy?: string;
}) {
  const ref = collection(db, CHECKLISTS_COLLECTION);

  const newChecklist = {
    type: data.type,
    name: data.name,
    description: data.description || "",
    sections: data.sections,
    tasks: data.tasks,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: data.createdBy || null,
  };

  const docRef = await addDoc(ref, newChecklist);
  return docRef.id;
}

/**
 * Actualiza un checklist existente
 */
export async function updateChecklist(
  checklistId: string,
  data: Partial<{
    name: string;
    description: string;
    sections: ChecklistSection[];
    tasks: ChecklistTask[];
  }>
) {
  const docRef = doc(db, CHECKLISTS_COLLECTION, checklistId);

  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Elimina un checklist
 */
export async function deleteChecklist(checklistId: string) {
  const docRef = doc(db, CHECKLISTS_COLLECTION, checklistId);
  await deleteDoc(docRef);
}

// --- FUNCIONES DE LECTURA ---

/**
 * Obtiene un checklist por ID
 */
export async function getChecklistById(
  checklistId: string
): Promise<ChecklistDoc | null> {
  const docRef = doc(db, CHECKLISTS_COLLECTION, checklistId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as ChecklistDoc;
}

/**
 * Obtiene todos los checklists de un tipo específico
 */
export async function getChecklistsByType(
  type: ChecklistType
): Promise<ChecklistDoc[]> {
  const q = query(
    collection(db, CHECKLISTS_COLLECTION),
    where("type", "==", type)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as ChecklistDoc)
  );
}

/**
 * Obtiene todos los checklists
 */
export async function getAllChecklists(): Promise<ChecklistDoc[]> {
  const snapshot = await getDocs(collection(db, CHECKLISTS_COLLECTION));

  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as ChecklistDoc)
  );
}

/**
 * Suscripción en tiempo real a checklists de un tipo
 */
export function subscribeToChecklistsByType(
  type: ChecklistType,
  callback: (checklists: ChecklistDoc[]) => void
) {
  const q = query(
    collection(db, CHECKLISTS_COLLECTION),
    where("type", "==", type)
  );

  return onSnapshot(q, (snapshot) => {
    const checklists = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ChecklistDoc)
    );
    callback(checklists);
  });
}

/**
 * Suscripción en tiempo real a un checklist específico
 */
export function subscribeToChecklist(
  checklistId: string,
  callback: (checklist: ChecklistDoc | null) => void
) {
  const docRef = doc(db, CHECKLISTS_COLLECTION, checklistId);

  return onSnapshot(docRef, (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }

    callback({
      id: docSnap.id,
      ...docSnap.data(),
    } as ChecklistDoc);
  });
}
