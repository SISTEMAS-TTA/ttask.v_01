import { useEffect, useState } from "react";
import { getUsersMap } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/modules/types";

export const useUsersMap = () => {
  const [usersMap, setUsersMap] = useState<
    Map<string, UserProfile & { id: string }>
  >(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const map = await getUsersMap();
        setUsersMap(map);
      } catch (error) {
        console.error("Error loading users map:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const getUserName = (userId: string): string => {
    const user = usersMap.get(userId);
    if (!user) return userId;
    return (
      user.fullName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.email
    );
  };

  return { usersMap, loading, getUserName };
};
