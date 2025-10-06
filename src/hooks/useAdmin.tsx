"use client";

import useUser from "@/modules/auth/hooks/useUser";

export const useAdmin = () => {
  const { user, profile, loading } = useUser();

  const isAdmin = profile?.role === "Administrador";
  const isAuthenticated = Boolean(user);

  return {
    user,
    profile,
    loading,
    isAdmin,
    isAuthenticated,
  };
};
