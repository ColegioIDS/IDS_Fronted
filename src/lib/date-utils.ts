// src/lib/date-utils.ts

/**
 * Formatea una fecha al formato español (DD/MM/YYYY)
 */
export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formatea una fecha con hora (DD/MM/YYYY HH:MM)
 */
export const formatDateTime = (date: Date): string => {
  const dateStr = formatDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
};

/**
 * Obtiene la diferencia en días entre dos fechas
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.floor((date1.getTime() - date2.getTime()) / MS_PER_DAY);
};

/**
 * Convierte un string ISO a formato legible
 */
export const formatISO = (isoString: string): string => {
  return formatDate(new Date(isoString));
};
