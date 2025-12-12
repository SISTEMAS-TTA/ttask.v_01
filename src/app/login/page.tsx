"use client";

import React from "react";
import Image from "next/image";
import Login from "@/modules/auth/components/Login";

export default function LoginPage() {
  return (
    <div className="fixed inset-0 top-10 overflow-y-auto">
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
      <div className="absolute inset-0 bg-black/30" />
      {/* Contenido con scroll */}
      <div className="relative z-10 min-h-full flex items-center justify-center px-4 py-6 sm:py-8">
        <Login />
      </div>
    </div>
  );
}
