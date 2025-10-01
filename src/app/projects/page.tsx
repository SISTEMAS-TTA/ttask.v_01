"use client";
import React from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
// import { AuthLoadingSpinner } from "@/components/LoadingSpinner";
import { AuthWrapper } from "@/components/auth/AuhWrapper";

const ProjectsPage = () => {
  const { user, loading, isAuthenticated } = useRequireAuth();

  // if (loading) {
  //   return <AuthLoadingSpinner />;
  // }

  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <AuthWrapper>
    <div>
      <h1>Proyectos</h1>
      <p>Bienvenido, {user?.email}</p>
      {/* Tu contenido de proyectos aquí */}
    </div>
    </AuthWrapper>
  );
};

export default ProjectsPage;
