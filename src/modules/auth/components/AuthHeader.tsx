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
import { LogOut, } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";

export function AuthHeader() {
  const { profile, user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  // const [isServicesOpen, setIsServicesOpen] = useState(false);
  const router = useRouter();

  const initials = (name?: string, email?: string) => {
    const src = name && name.trim().length ? name : (email || "").split("@")[0];
    const parts = src.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0]?.[0] || "U").toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (e) {
      console.error("Error al cerrar sesión", e);
    }
  };
  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-white/90 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="mx-auto px-3 py-2 sm:px-4 sm:py-3 lg:px-6 xl:px-8 2xl:px-12">
        <div className="flex items-center justify-between gap-3">
          {/* Logo - Responsive sizing */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              aria-label="ttArquitectos"
              className="block transition-opacity hover:opacity-80"
            >
              <Image
                src="/LogoTT.png"
                alt="Logo de ttArquitectos"
                width={220}
                height={35}
                priority
                className="h-auto w-28 xs:w-32 sm:w-36 md:w-44 lg:w-52 xl:w-56 2xl:w-60"
              />
            </Link>
          </div>

          {/* Desktop Navigation Menu - Hidden on tablets and mobile */}
          <div className="hidden lg:flex">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-1 xl:space-x-2">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/notes"
                      className="h-9 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors inline-flex items-center xl:h-10 xl:px-4 xl:text-base"
                    >
                      Notas
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/projects"
                      className="h-9 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors inline-flex items-center xl:h-10 xl:px-4 xl:text-base"
                    >
                      Proyectos
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                {/* {profile?.role === "Director" && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/projects/new"
                        className="h-9 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors inline-flex items-center xl:h-10 xl:px-4 xl:text-base"
                      >
                        Nuevo Proyecto
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )} */}
                {/* <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors xl:h-10 xl:px-4 xl:text-base">
                    Servicios
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[350px] gap-3 p-4 md:w-[450px] md:grid-cols-2 lg:w-[500px] xl:w-[600px]">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/arquitectura"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900"
                        >
                          <div className="text-sm font-medium leading-none xl:text-base">
                            Arquitectura
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                            Diseño y planificación de espacios arquitectónicos
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/consultoria"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900"
                        >
                          <div className="text-sm font-medium leading-none xl:text-base">
                            Consultoría
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                            Asesoramiento especializado en proyectos
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/urbanismo"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900"
                        >
                          <div className="text-sm font-medium leading-none xl:text-base">
                            Urbanismo
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                            Planificación urbana y territorial
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/interiorismo"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900"
                        >
                          <div className="text-sm font-medium leading-none xl:text-base">
                            Interiorismo
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                            Diseño de espacios interiores
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem> */}

                {/* <NavigationMenuItem> */}
                  {/* <NavigationMenuLink asChild>
                    <Link
                      href="/proyectos"
                      className="h-9 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors inline-flex items-center xl:h-10 xl:px-4 xl:text-base"
                    >
                      Proyectos
                    </Link>
                  </NavigationMenuLink> */}
                {/* </NavigationMenuItem> */}

                {/* <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/nosotros"
                      className="h-9 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors inline-flex items-center xl:h-10 xl:px-4 xl:text-base"
                    >
                      Nosotros
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem> */}

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/contacto"
                      className="h-9 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors inline-flex items-center xl:h-10 xl:px-4 xl:text-base"
                    >
                      Contacto
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User menu */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="User menu"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-gray-100"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {initials(profile?.fullName, user?.email || undefined)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {profile?.fullName || user?.email || "Usuario"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile/Tablet Menu - Sheet Component */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-gray-700 hover:text-gray-900 hover:bg-gray-50 sm:h-10 sm:w-10"
                >
                  <span className="sr-only">Abrir menú principal</span>
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
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

                <nav className="flex flex-col p-4 sm:p-6 space-y-2">
                  <Link
                    href="/notes"
                    className="block rounded-md px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors sm:text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    Notas
                  </Link>
                  <Link
                    href="/projects"
                    className="block rounded-md px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors sm:text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    Proyectos
                  </Link>
                  {/* {profile?.role === "Director" && (
                    <Link
                      href="/projects/new"
                      className="block rounded-md px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors sm:text-base"
                      onClick={() => setIsOpen(false)}
                    >
                      Nuevo Proyecto
                    </Link>
                  )} */}
                  {/* Services Collapsible */}
                  {/* <Collapsible
                    open={isServicesOpen}
                    onOpenChange={setIsServicesOpen}
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors sm:text-base">
                      Servicios
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isServicesOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pl-4 pt-2">
                      <Link
                        href="/arquitectura"
                        className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Arquitectura
                      </Link>
                      <Link
                        href="/consultoria"
                        className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Consultoría
                      </Link>
                      <Link
                        href="/urbanismo"
                        className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Urbanismo
                      </Link>
                      <Link
                        href="/interiorismo"
                        className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Interiorismo
                      </Link>
                    </CollapsibleContent>
                  </Collapsible> */}

                  {/* Direct Links */}
                  <Link
                    href="/proyectos"
                    className="block rounded-md px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors sm:text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    Finanzas
                  </Link>
{/* 
                  <Link
                    href="/nosotros"
                    className="block rounded-md px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors sm:text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    Nosotros
                  </Link>

                  <Link
                    href="/contacto"
                    className="block rounded-md px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors sm:text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    Contacto
                  </Link> */}

                  {/* Contact Info for Mobile */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-2 sm:text-sm">
                      Contacto directo:
                    </div>
                    <div className="space-y-2">
                      <a
                        href="tel:+1234567890"
                        className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        📞 +1 (234) 567-890
                      </a>
                      <a
                        href="mailto:info@ttarquitectos.com"
                        className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        ✉️ info@ttarquitectos.com
                      </a>
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
