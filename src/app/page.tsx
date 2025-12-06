"use client";

import DashboardPage from "./dashboard/page";
import { AuthWrapper } from "@/modules/auth/components/AuhWrapper";

export default function Home() {
  return (
    <AuthWrapper>
      {/* AGREGAMOS ESTE CONTENEDOR MAESTRO:
         1. w-full: Ocupa todo el ancho disponible en celulares/laptops.
         2. max-w-[1920px]: En pantallas gigantes, NO crezcas más de 1920 pixeles.
         3. mx-auto: Si la pantalla es más grande que 1920px, céntrate automáticamente (margen automático a los lados).
         4. h-screen: Asegura que ocupe la altura de la pantalla.
      */}
      <main className="w-full max-w-[1920px] mx-auto h-screen flex flex-col">
        <DashboardPage/>
      </main>
    </AuthWrapper>
  );
}