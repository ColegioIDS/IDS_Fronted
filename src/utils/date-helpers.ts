// utils/date-helpers.ts - Crear un archivo compartido para utilidades de fecha

/**
 * Parsea una fecha UTC como fecha local para evitar problemas de zona horaria
 * @param dateString - Fecha en formato ISO string
 * @returns Date object tratado como fecha local
 */
export const parseUTCAsLocal = (dateString: string): Date => {
  const dateOnly = dateString.split('T')[0];
  return new Date(dateOnly + 'T00:00:00');
};

/**
 * Calcula el progreso de una semana basado en la fecha actual
 * @param startDate - Fecha de inicio de la semana
 * @param endDate - Fecha de fin de la semana
 * @returns Progreso en porcentaje (0-100)
 */
export const calculateWeekProgress = (startDate: Date, endDate: Date): number => {
  const now = new Date();
  
  if (now < startDate) return 0;
  if (now > endDate) return 100;
  
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  
  return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
};

/**
 * Calcula los días restantes en una semana
 * @param endDate - Fecha de fin de la semana
 * @returns Número de días restantes (0 si ya terminó)
 */
export const calculateDaysRemaining = (endDate: Date): number => {
  const now = new Date();
  const remainingTime = endDate.getTime() - now.getTime();
  
  if (remainingTime <= 0) return 0;
  
  return Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
};

/**
 * Calcula la duración total de una semana en días
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns Número total de días
 */
export const calculateTotalDays = (startDate: Date, endDate: Date): number => {
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};