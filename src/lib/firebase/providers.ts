import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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
