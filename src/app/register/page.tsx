"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import Register from "@/modules/auth/components/Register";
import { AuthHeader } from "@/modules/auth/components/AuthHeader";
import { AuthWrapper } from "@/modules/auth/components/AuhWrapper";
import { useAdmin } from "@/hooks/useAdmin";
// [NUEVO]: Importar useUser para obtener el perfil del jefe
import useUser from "@/modules/auth/hooks/useUser";
import type { UserRole } from "@/modules/types"; // Asumido que UserRole se exporta aquí

export default function RegisterPage() {
  return (
    <AuthWrapper>
      <AdminRegisterContent />
    </AuthWrapper>
  );
}

function AdminRegisterContent() {
  // Obtiene el estado de autenticación y si es Administrador
  const { isAdmin, isAuthenticated, loading: adminLoading } = useAdmin();
  // [CAMBIO CLAVE]: Obtiene el perfil completo, incluyendo 'role' e 'isAreaChief'
  const { profile, loading: userProfileLoading } = useUser();
  const router = useRouter();

  const loading = adminLoading || userProfileLoading;

  // Determina si el usuario actual es un Jefe o Administrador
  // Un Jefe de Área debe tener isAreaChief=true, o ser el Administrador.
  const isChief = profile?.isAreaChief === true || isAdmin;

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // [MODIFICACIÓN DE REGLA]: Si no es Administrador Y no es Jefe de Área, redirigir al dashboard.
    // Solo Jefes/Administradores pueden acceder a esta página.
    if (!isChief) {
      router.replace("/");
    }
  }, [isChief, isAuthenticated, loading, router, profile]);

  // [NUEVA LÓGICA]: Determinar el rol que el jefe está "forzando" para el nuevo usuario.
  let forcedRole: UserRole | undefined = undefined;

  if (profile?.isAreaChief === true && !isAdmin) {
    // Si es Jefe de Área (pero no es Administrador), el nuevo usuario DEBE tener el rol del jefe.
    // Esto asegura que el Jefe de Sistemas solo registre roles 'Sistemas'.
    forcedRole = profile.role as UserRole;
  }

  // Mostrar loading si los datos no están listos o si el usuario no está autorizado
  if (loading || !isAuthenticated || !isChief) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Imagen de fondo */}
      <Image
        src="/wpp_sketches.jpg"
        alt="Background"
        fill
        className="object-cover"
        priority
        quality={75}
      />
      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/20 z-10" />
      {/* Encabezado con logotipo */}
      <AuthHeader />
      {/* Contenido */}
      <div className="relative z-20 pt-24 sm:pt-28 md:pt-32">
        {/* [CAMBIO CLAVE]: Pasamos el rol forzado al componente Register */}
        <Register forcedRole={forcedRole} />
      </div>
    </div>
  );
}
