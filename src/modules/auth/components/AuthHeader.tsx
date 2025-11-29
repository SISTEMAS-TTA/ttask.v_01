"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import useUser from "@/modules/auth/hooks/useUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/modules/types";

// Mapeo de roles a sus enlaces correspondientes
const roleToAreaLink: Record<UserRole, { href: string; label: string } | null> =
  {
    Director: { href: "/direccion", label: "Dirección" },
    Administrador: { href: "/admon", label: "Administración" },
    "Aux. Admin": { href: "/aux-admin", label: "Aux. Admin" },

    // Áreas técnicas
    Arquitectura: { href: "/arquitectura", label: "Arquitectura" },
    Diseno: { href: "/diseno", label: "Diseño" },
    Proyectos: { href: "/proyectos", label: "Proyectos" }, // <--- ESTA ERA LA QUE FALTABA
    Gerencia: { href: "/gerencia", label: "Gerencia" },
    Obra: { href: "/obra", label: "Obra" },
    Sistemas: { href: "/sistemas", label: "Sistemas" },

    // Otros
    Practicante: { href: "/practicante", label: "Practicante" },
    Usuario: null,
  };

export function AuthHeader() {
  const { profile, user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Generar enlaces basados en el rol del usuario (DEBE estar antes de cualquier return condicional)
  const navLinks = useMemo(() => {
    const links: { href: string; label: string }[] = [
      { href: "/notes", label: "Inicio" },
    ];

    // Agregar el enlace del área correspondiente al rol del usuario
    if (profile?.role) {
      const areaLink = roleToAreaLink[profile.role];
      if (areaLink) {
        links.push(areaLink);
      }
    }

    return links;
  }, [profile?.role]);

  const initials = (name?: string, email?: string) => {
    const src = name && name.trim().length ? name : (email || "").split("@")[0];
    const parts = src.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0]?.[0] || "U").toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (e) {
      console.error("Error al cerrar sesión", e);
    }
  };

  const navLinkClassName =
    "h-9 px-3 py-2 text-xs md:text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors inline-flex items-center whitespace-nowrap leading-tight xl:h-10 xl:px-4 xl:text-sm";

  // Si no hay usuario autenticado, mostrar solo el logo
  if (!user) {
    return (
      <header className="fixed left-0 top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-md">
        <div className="mx-auto px-4 py-4 sm:px-6 sm:py-4 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-shrink-0">
              <Link
                href="/"
                aria-label="ttArquitectos"
                className="block transition-opacity hover:opacity-80"
              >
                <Image
                  src="/LogoTT.png"
                  alt="Logo de ttArquitectos"
                  width={180}
                  height={30}
                  priority
                  className="h-auto w-28 sm:w-32 md:w-36 lg:w-40"
                />
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed left-0 top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-md">
      <div className="mx-auto px-4 py-4 sm:px-6 sm:py-4 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between gap-3">
          {/* LOGO */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              aria-label="ttArquitectos"
              className="block transition-opacity hover:opacity-80"
            >
              <Image
                src="/LogoTT.png"
                alt="Logo de ttArquitectos"
                width={180}
                height={30}
                priority
                className="h-auto w-28 sm:w-32 lg:w-36 xl:w-40"
              />
            </Link>
          </div>

          {/* CENTRO (solo se muestra en desktop) */}
          <div className="hidden lg:flex justify-center flex-grow">
            {" "}
            {/* Añadir flex-grow para usar espacio */}
            <NavigationMenu>
              <NavigationMenuList className="flex items-center gap-1">
                {/* Enlaces basados en el rol del usuario */}
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild>
                      <Link href={link.href} className={navLinkClassName}>
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* DERECHA (Avatar + Hamburguesa móvil) */}
          <div className="flex items-center space-x-2">
            {/* MENU USUARIO */}
            <div className="relative z-[10000]">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="User menu"
                    className="inline-flex items-center justify-center h-11 w-11 rounded-full hover:bg-gray-100 sm:h-12 sm:w-12"
                  >
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                      <AvatarFallback className="text-sm sm:text-base">
                        {initials(profile?.fullName, user?.email || undefined)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                {/* Sin portal, sin fixed, sin error */}
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56 z-[10001]"
                >
                  <DropdownMenuLabel>
                    {profile?.fullName || user?.email || "Usuario"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* HAMBURGUESA - SOLO MOVIL */}
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-gray-700 hover:text-gray-900 hover:bg-gray-50 sm:h-12 sm:w-12"
                  >
                    <svg
                      className="h-6 w-6 sm:h-7 sm:w-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                      />
                    </svg>
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="w-[280px] sm:w-[320px] md:w-[360px] p-0"
                >
                  <SheetHeader className="p-4 sm:p-6 border-b border-gray-100">
                    <SheetTitle className="text-left">
                      <Image
                        src="/LogoTT.png"
                        alt="Logo de ttArquitectos"
                        width={180}
                        height={28}
                        className="h-auto w-36 sm:w-40"
                      />
                    </SheetTitle>
                  </SheetHeader>

                  <nav className="flex flex-col p-4 space-y-1">
                    {/* Enlaces basados en el rol del usuario */}
                    <div className="pb-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-3">
                        Navegación
                      </p>
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
