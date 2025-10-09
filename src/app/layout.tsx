import type { Metadata } from "next";
import "./globals.css";
import NavigationGuard from "@/components/NavigationGuard";

export const metadata: Metadata = {
  title: "ERP",
  description: "Sistema de gestión de indicaciones empresariales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        <NavigationGuard />
        {children}
      </body>
    </html>
  );
}
