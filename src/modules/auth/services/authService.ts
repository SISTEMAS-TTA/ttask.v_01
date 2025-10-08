import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  role: string = "user"
): Promise<void> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    fullName,
    role,
    createdAt: serverTimestamp(),
    active: true,
  });
}
