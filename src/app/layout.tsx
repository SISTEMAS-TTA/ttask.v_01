import type { Metadata } from "next";
import "./globals.css";
import NavigationGuard from "@/components/NavigationGuard";

export const metadata: Metadata = {
  title: "ERP",
  description: "Sistema de gestión de indicaciones empresariales",
  icons: [
    { rel: "icon", url: "/icono_tt.svg", sizes: "32x32", type: "image/png" },
    { rel: "apple-touch-icon", url: "/icono_tt.svg" },
  ],
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#ffff"/>  
      </head>
      <body className="min-h-screen bg-gray-50">
        <NavigationGuard />
        {children}
      </body>
    </html>
  );
}
