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
  const { profile, loading: userProfileLoading } = useUser();
  const router = useRouter();

  const loading = adminLoading || userProfileLoading;

  // Solo Director y Administrador pueden acceder a esta página
  const canAccessRegister =
    profile?.role === "Director" || profile?.role === "Administrador";

  // 🔑 Director y Administrador pueden asignar jefes de área
  const canAssignAreaChief = profile?.role === "Director" || profile?.role === "Administrador";

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Solo Director y Administrador pueden registrar usuarios
    if (!canAccessRegister) {
      router.replace("/");
    }
  }, [canAccessRegister, isAuthenticated, loading, router]);

  // Director y Administrador pueden asignar cualquier rol, no hay rol forzado
  const forcedRole: UserRole | undefined = undefined;

  // Mostrar loading si los datos no están listos o si el usuario no está autorizado
  if (loading || !isAuthenticated || !canAccessRegister) {
    return (
      <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />     {" "}
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
      {/* Contenido */}     {" "}
      <div className="relative z-20 pt-24 sm:pt-28 md:pt-32">
               {" "}
        {/* 🔑 CAMBIO CLAVE: Pasamos el rol forzado Y el permiso de asignar jefe de área */}
        <Register
          forcedRole={forcedRole}
          isCurrentUserAdmin={canAssignAreaChief} // 🔑 Director y Admin pueden asignar jefes de área
        />
             {" "}
      </div>
         {" "}
    </div>
  );
}
