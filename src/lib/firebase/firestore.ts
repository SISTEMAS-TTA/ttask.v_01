import { db } from "./config";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
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

export const listAllUsers = async () => {
  try {
    const ref = collection(db, USERS_COLLECTION);
    const snap = await getDocs(ref);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as UserProfile) }));
  } catch (error) {
    console.error("Error listing users:", error);
    throw error;
  }
};

export const getUsersMap = async () => {
  const users = await listAllUsers();
  const map = new Map<string, UserProfile & { id: string }>();
  users.forEach((u) => map.set(u.id!, u as any));
  return map;
};
