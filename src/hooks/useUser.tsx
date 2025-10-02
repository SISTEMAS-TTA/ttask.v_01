"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, prodErrorMap, User } from "firebase/auth";
import { auth, db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { UserProfile } from "@/app/types/index";

export const USER_PROFILE_STORAGE_KEY = "user_profile_fallback";

export default function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error fetching user profile", error);
        }

        let fallbackProfile: UserProfile | null = null;
        if (typeof window !== "undefined") {
          try {
            const storedProfile = localStorage.getItem(
              USER_PROFILE_STORAGE_KEY,
            );
            if (storedProfile) {
              fallbackProfile = JSON.parse(storedProfile) as UserProfile;
            }
          } catch (storageError) {
            console.error("Error reading stored user profile", storageError);
          }
        }

        // TODO: Reemplazar esta lectura local por la consulta real a Firestore cuando el backend esté configurado.
        setProfile(fallbackProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => {
      unsub();
    };
  }, []);

  return { user, profile, loading };
}
