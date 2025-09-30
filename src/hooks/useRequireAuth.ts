import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/config";

export function useRequireAuth() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user && !loading,
  };
}

// Hook para páginas que NO requieren autenticación (login, register)
export function useRedirectIfAuthenticated() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  return { user, loading };
}
