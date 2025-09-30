import React from "react";
import Image from "next/image";
import Login from "@/components/auth/Login";
import { AuthHeader } from "@/components/auth/AuthHeader";

function login() {
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
        <Login />
      </div>
    </div>
  );
}

export default login;
