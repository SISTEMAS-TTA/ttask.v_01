import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config";

const PROVIDERS_COLLECTION = "proveedores";

export type NewProviderInput = {
  area: string;
  name: string;
  company: string;
  specialty: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  createdBy?: string | null;
};

export type ProviderDoc = {
  id: string;
  area: string;
  name: string;
  company: string;
  specialty: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  createdBy?: string | null;
};

export async function createProvider(input: NewProviderInput) {
  const ref = collection(db, PROVIDERS_COLLECTION);
  const docRef = await addDoc(ref, {
    area: input.area,
    name: input.name,
    company: input.company,
    specialty: input.specialty,
    city: input.city,
    phone: input.phone ?? null,
    email: input.email ?? null,
    createdBy: input.createdBy ?? null,
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id };
}

export async function listProviders(): Promise<ProviderDoc[]> {
  const ref = collection(db, PROVIDERS_COLLECTION);
  const snap = await getDocs(ref);
  return snap.docs
    .map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<ProviderDoc, "id">),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function updateProvider(
  providerId: string,
  updates: Partial<NewProviderInput>
) {
  const ref = doc(db, PROVIDERS_COLLECTION, providerId);
  await updateDoc(ref, updates);
}

export async function deleteProvider(providerId: string) {
  const ref = doc(db, PROVIDERS_COLLECTION, providerId);
  await deleteDoc(ref);
}
