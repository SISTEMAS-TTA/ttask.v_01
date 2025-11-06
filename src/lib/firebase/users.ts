import { db } from "./config";
import { collection, getDocs } from "firebase/firestore";
import type { UserProfile } from "@/modules/types";

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
