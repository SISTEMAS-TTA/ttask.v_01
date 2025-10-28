// // Utilidades para manejar errores de Firebase de manera más elegante
// interface FirebaseError {
//   code?: string;
//   message?: string;
// }

// export const handleFirebaseError = (error: FirebaseError | Error | unknown) => {
//   console.error("Firebase Error:", error);

//   const errorCode = (error as FirebaseError)?.code;
//   const errorMessage = (error as Error)?.message;

//   switch (errorCode) {
//     case "auth/network-request-failed":
//       return "Error de conexión. Verifica tu conexión a internet.";
//     case "auth/too-many-requests":
//       return "Demasiadas solicitudes. Intenta de nuevo más tarde.";
//     case "auth/user-not-found":
//       return "Usuario no encontrado.";
//     case "auth/wrong-password":
//       return "Contraseña incorrecta.";
//     case "auth/invalid-email":
//       return "Correo electrónico inválido.";
//     case "auth/user-disabled":
//       return "Esta cuenta ha sido deshabilitada.";
//     case "permission-denied":
//       return "No tienes permisos para realizar esta acción.";
//     case "unavailable":
//       return "Servicio temporalmente no disponible. Intenta de nuevo.";
//     case "deadline-exceeded":
//       return "La operación tardó demasiado tiempo. Intenta de nuevo.";
//     case "resource-exhausted":
//       return "Se han excedido los límites de cuota.";
//     default:
//       return errorMessage || "Ha ocurrido un error inesperado.";
//   }
// };

// export const logNetworkRequest = (
//   operation: string,
//   success: boolean,
//   error?: Error | FirebaseError | unknown
// ) => {
//   if (success) {
//     console.log(`✅ ${operation} - Success`);
//   } else {
//     console.error(`❌ ${operation} - Failed:`, error);
//   }
// };
