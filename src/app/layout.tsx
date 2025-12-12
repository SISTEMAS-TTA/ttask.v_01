import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavigationGuard from "@/components/NavigationGuard";
import { AuthHeader } from "@/modules/auth/components/AuthHeader";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "TTask - Sistema de Gestión",
  description: "Sistema de gestión de tareas y proyectos empresariales",
  keywords: ["gestión", "tareas", "proyectos", "productividad", "empresa"],
  authors: [{ name: "TT Arquitectos" }],
  creator: "TT Arquitectos",
  publisher: "TT Arquitectos",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: [
    { rel: "icon", url: "/icono_tt.svg", sizes: "any", type: "image/svg+xml" },
    { rel: "apple-touch-icon", url: "/icono_tt.svg", sizes: "180x180" },
    { rel: "apple-touch-icon", url: "/icono_tt.svg", sizes: "192x192" },
    { rel: "mask-icon", url: "/icono_tt.svg", color: "#ffffff" },
  ],
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TTask",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TTask" />
        <link rel="apple-touch-startup-image" href="/icono_tt.svg" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <NavigationGuard />
        <AuthHeader />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
