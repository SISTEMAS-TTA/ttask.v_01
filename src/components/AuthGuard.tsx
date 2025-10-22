"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/modules/auth/hooks/useUser";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string[];
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requiredRole,
}: AuthGuardProps) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (requireAuth) {
      if (!user) {
        router.push("/login");
        return;
      }

      if (!profile) {
        // Usuario autenticado pero sin perfil en Firestore
        router.push("/login");
        return;
      }

      if (requiredRole && !requiredRole.includes(profile.role)) {
        router.push("/dashboard");
        return;
      }
    }
  }, [user, profile, loading, requireAuth, requiredRole, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (requireAuth && (!user || !profile)) {
    return null;
  }

  if (requiredRole && profile && !requiredRole.includes(profile.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">
          No tienes permisos para acceder a esta página
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
