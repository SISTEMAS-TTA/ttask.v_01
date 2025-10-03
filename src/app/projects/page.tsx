"use client";
import React from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { AuthWrapper } from "@/modules/auth/components/AuhWrapper";

const ProjectsPage = () => {
  const { user, loading, isAuthenticated } = useRequireAuth();

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
