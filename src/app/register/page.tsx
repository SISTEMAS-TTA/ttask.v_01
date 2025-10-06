"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import Register from "@/modules/auth/components/Register";
import { AuthHeader } from "@/modules/auth/components/AuthHeader";
import { AuthWrapper } from "@/modules/auth/components/AuhWrapper";
import { useAdmin } from "@/hooks/useAdmin";

export default function RegisterPage() {
  return (
    <AuthWrapper>
      <AdminRegisterContent />
    </AuthWrapper>
  );
}

function AdminRegisterContent() {
  const { isAdmin, isAuthenticated, loading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, isAuthenticated, loading, router]);

  if (loading || !isAuthenticated || !isAdmin) {
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
        <Register />
      </div>
    </div>
  );
}
