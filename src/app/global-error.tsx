'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registrar el error
    console.error('Error global capturado:', error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Error del servidor
            </h2>
            <p className="text-gray-600 mb-8">
              Ha ocurrido un error interno del servidor. Por favor, intenta nuevamente.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => reset()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Intentar de nuevo
              </button>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}