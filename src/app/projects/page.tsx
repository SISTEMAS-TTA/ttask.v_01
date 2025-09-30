"use client";
import React from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { AuthLoadingSpinner } from "@/components/LoadingSpinner";

const ProjectsPage = () => {
  const { user, loading, isAuthenticated } = useRequireAuth();

  if (loading) {
    return <AuthLoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h1>Proyectos</h1>
      <p>Bienvenido, {user?.email}</p>
      {/* Tu contenido de proyectos aquí */}
    </div>
  );
};

export default ProjectsPage;
