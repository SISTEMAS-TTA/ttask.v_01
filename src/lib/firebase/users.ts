import { db } from "./config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore"; //Añadido doc, getDoc
import type { UserProfile } from "@/modules/types";

// NUEVA FUNCIÓN: Obtener un solo perfil por ID
export async function getUserProfileById(
  userId: string
): Promise<UserProfile | null> {
  if (!userId) return null;

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: userSnap.id,
        email: data.email ?? "",
        fullName: data.fullName ?? "",
        role: (data.role as string) ?? "Usuario",
        createdAt: data.createdAt,
        active: data.active ?? false,
      } as UserProfile;
    }
    return null;
  } catch (e) {
    console.error("Error al obtener el perfil del usuario:", e);
    return null;
  }
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  const users: UserProfile[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    const userId = doc.id;

    return {
      id: userId,
      email: data.email ?? "",
      fullName: data.fullName ?? "",
      role: (data.role as string) ?? "Usuario",
      createdAt: data.createdAt,
      active: data.active ?? false,
    } as UserProfile;
  });

  return users;
}
