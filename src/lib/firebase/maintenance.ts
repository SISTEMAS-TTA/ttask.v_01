// Script de mantenimiento para la base de datos
// Este archivo contiene funciones para mantener la integridad de los datos

import { listAllUsers, cleanupIncompleteUsers } from "@/lib/firebase/firestore";

// Función para obtener estadísticas de usuarios
export const getUserStats = async () => {
  try {
    const allUsers = await listAllUsers();

    const stats = {
      total: allUsers.length,
      active: allUsers.filter((u) => u.active !== false).length,
      inactive: allUsers.filter((u) => u.active === false).length,
      incomplete: allUsers.filter(
        (u) => !u.firstName || !u.lastName || !u.email || !u.role
      ).length,
      byRole: {} as Record<string, number>,
    };

    // Contar por roles
    allUsers.forEach((user) => {
      if (user.role) {
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw error;
  }
};

// Función para generar reporte de usuarios problemáticos
export const generateProblemReport = async () => {
  try {
    const allUsers = await listAllUsers();

    const problems = {
      missingData: [] as string[],
      duplicateEmails: [] as string[],
      invalidRoles: [] as string[],
    };

    const validRoles = [
      "Director",
      "Administrador",
      "Proyectos",
      "Diseno",
      "Gerencia",
      "Obra",
      "Sistemas",
      "Practicante",
      "Usuario",
    ];

    const emailMap = new Map<string, string[]>();

    allUsers.forEach((user) => {
      // Verificar datos faltantes
      if (!user.firstName || !user.lastName || !user.email || !user.role) {
        problems.missingData.push(user.id);
      }

      // Verificar emails duplicados
      if (user.email) {
        if (!emailMap.has(user.email)) {
          emailMap.set(user.email, []);
        }
        emailMap.get(user.email)!.push(user.id);
      }

      // Verificar roles válidos
      if (user.role && !validRoles.includes(user.role)) {
        problems.invalidRoles.push(user.id);
      }
    });

    // Encontrar emails duplicados
    emailMap.forEach((userIds, email) => {
      if (userIds.length > 1) {
        problems.duplicateEmails.push(`${email}: ${userIds.join(", ")}`);
      }
    });

    return problems;
  } catch (error) {
    console.error("Error generating problem report:", error);
    throw error;
  }
};

export { cleanupIncompleteUsers };
