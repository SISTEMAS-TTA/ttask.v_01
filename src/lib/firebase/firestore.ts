import { db } from "./config";
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { UserProfile } from "../../modules/types";

const USERS_COLLECTION = "users";

export const createUserProfile = async (
  userId: string,
  userData: UserProfile
) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, {
      ...userData,
      id: userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      fullName: `${userData.firstName} ${userData.lastName}`,
      active: true,
      lastLogin: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export type UserWithId = UserProfile & { id: string };

export const listAllUsers = async (): Promise<UserWithId[]> => {
  try {
    const ref = collection(db, USERS_COLLECTION);
    const snap = await getDocs(ref);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as UserProfile) }));
  } catch (error) {
    console.error("Error listing users:", error);
    throw error;
  }
};

export const getUsersMap = async (): Promise<Map<string, UserWithId>> => {
  const users = await listAllUsers();
  const map = new Map<string, UserWithId>();
  users.forEach((u) => map.set(u.id, u));
  return map;
};

export const updateUserProfileFields = async (
  userId: string,
  updates: Partial<UserProfile>
) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);

    const payloadEntries = Object.entries(updates).filter(
      ([, value]) => value !== undefined
    );

    if (payloadEntries.length === 0) {
      return;
    }

    const payload = Object.fromEntries(payloadEntries) as Partial<UserProfile>;

    if (
      (updates.firstName || updates.lastName) &&
      !updates.fullName &&
      (updates.firstName !== undefined || updates.lastName !== undefined)
    ) {
      const composed = `${updates.firstName ?? ""} ${updates.lastName ?? ""}`.trim();
      if (composed) {
        payload.fullName = composed;
      }
    }

    await updateDoc(userRef, payload);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export async function deleteUser(uid: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await deleteDoc(userRef);
}
