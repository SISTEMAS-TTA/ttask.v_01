/**
 * Función que devuelve un saludo basado en la hora del día
 */
export const getSaludo = (): string => {
  const hora = new Date().getHours();
  
  if (hora >= 5 && hora < 12) {
    return 'Buenos Días';
  } else if (hora >= 12 && hora < 19) {
    return 'Buenas Tardes';
  } else {
    return 'Buenas Noches';
  }
};