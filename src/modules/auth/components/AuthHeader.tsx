"use client";

import { useState } from "react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
import { ChevronDown } from "lucide-react";

export function AuthHeader() {
  const { profile, user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isAreasOpen, setIsAreasOpen] = useState(false);
  const router = useRouter();

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
    "h-9 px-2 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors inline-flex items-center whitespace-nowrap leading-tight lg:px-3 xl:h-10 xl:px-4 xl:text-sm";

  // Si no hay usuario autenticado, mostrar solo el logo
  if (!user) {
    return (
      <header className="fixed left-0 top-0 z-[1000] w-full h-16 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="flex items-center justify-between gap-3 w-full">
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

  // Enlaces principales (siempre visibles en desktop)
  const mainLinks = [
    { href: "/notes", label: "Inicio" },
    { href: "/obra", label: "Obra" },
    { href: "/logistica-compras", label: "Logística" },
    { href: "/pagos-presupuestos", label: "Pagos" },
  ];

  // Áreas de trabajo (en dropdown)
  const areaLinks = [
    { href: "/arquitectura", label: "Arquitectura" },
    { href: "/diseno", label: "Diseño" },
    { href: "/gerencia", label: "Gerencia" },
    { href: "/sistemas", label: "Sistemas" },
    { href: "/admon", label: "Administración" },
  ];

  // Enlaces de gestión (en dropdown "Más")
  const moreLinks = [
    { href: "/cliente", label: "Cliente" },
    { href: "/aux-admin", label: "Aux. Admin" },
    { href: "/direccion", label: "Dirección" },
  ];

  return (
    <header className="fixed left-0 top-0 z-[1000] w-full h-16 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 justify-center">
            <NavigationMenu>
              <NavigationMenuList className="flex items-center gap-1">
                {/* Enlaces principales */}
                {mainLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild>
                      <Link href={link.href} className={navLinkClassName}>
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}

                {/* Dropdown: Áreas */}
                <NavigationMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`${navLinkClassName} gap-1`}>
                        Áreas
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" sideOffset={2} className="w-44">
                      <DropdownMenuLabel className="text-xs text-gray-500">
                        Áreas de trabajo
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {areaLinks.map((link) => (
                        <DropdownMenuItem key={link.href} asChild>
                          <Link
                            href={link.href}
                            className="w-full cursor-pointer"
                          >
                            {link.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>

                {/* Dropdown: Más */}
                <NavigationMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`${navLinkClassName} gap-1`}>
                        Más
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" sideOffset={2} className="w-44">
                      <DropdownMenuLabel className="text-xs text-gray-500">
                        Gestión
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {moreLinks.map((link) => (
                        <DropdownMenuItem key={link.href} asChild>
                          <Link
                            href={link.href}
                            className="w-full cursor-pointer"
                          >
                            {link.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User menu + Mobile menu */}
          <div className="flex items-center gap-2">
            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Menú de usuario"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-sm">
                      {initials(profile?.fullName, user?.email || undefined)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={2} className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {profile?.fullName || user?.email || "Usuario"}
                    </p>
                    <p className="text-xs text-gray-500">{profile?.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer"
                >
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <span className="sr-only">Abrir menú</span>
                    <svg
                      className="h-5 w-5"
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
                  className="w-[280px] sm:w-[320px] p-0 overflow-y-auto"
                >
                  <SheetHeader className="p-4 border-b border-gray-100">
                    <SheetTitle className="text-left">
                      <Image
                        src="/LogoTT.png"
                        alt="Logo de ttArquitectos"
                        width={140}
                        height={24}
                        className="h-auto w-32"
                      />
                    </SheetTitle>
                  </SheetHeader>

                  <nav className="flex flex-col p-4 space-y-1">
                    {/* Enlaces principales */}
                    <div className="pb-2 border-b border-gray-100 mb-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-3">
                        Principal
                      </p>
                      {mainLinks.map((link) => (
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

                    {/* Áreas - Collapsible */}
                    <Collapsible
                      open={isAreasOpen}
                      onOpenChange={setIsAreasOpen}
                    >
                      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            Áreas
                          </span>
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isAreasOpen ? "rotate-180" : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 pl-3 pt-1">
                        {areaLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Gestión */}
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-3">
                        Gestión
                      </p>
                      {moreLinks.map((link) => (
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
