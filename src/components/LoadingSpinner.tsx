import React from "react";

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = "Cargando...",
}: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="text-lg text-gray-600">{message}</div>
      </div>
    </div>
  );
}

export function AuthLoadingSpinner() {
  return <LoadingSpinner message="Verificando autenticación..." />;
}
