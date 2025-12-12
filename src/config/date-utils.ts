/**
 * Utilidades para manejo de fechas con Timezone
 * Asegura que todas las fechas se procesen en la zona horaria de Guatemala
 */

import { TIMEZONE } from './timezone';

/**
 * Convierte una fecha a string en la zona horaria configurada
 * Formato: YYYY-MM-DD
 * 
 * @param date - Fecha a convertir (por defecto: hoy)
 * @returns {string} Fecha en formato YYYY-MM-DD en la zona horaria configurada
 */
export const formatDateForAPI = (date: Date = new Date()): string => {
  const formatter = new Intl.DateTimeFormat('es-ES', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';

  return `${year}-${month}-${day}`;
};

/**
 * Convierte una fecha a ISO string con la zona horaria correcta
 * Útil para enviar al backend
 * 
 * @param date - Fecha a convertir
 * @returns {string} Fecha en formato ISO compatible con zona horaria
 */
export const formatDateTimeForAPI = (date: Date = new Date()): string => {
  const formatter = new Intl.DateTimeFormat('es-ES', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  const hour = parts.find(p => p.type === 'hour')?.value || '';
  const minute = parts.find(p => p.type === 'minute')?.value || '';
  const second = parts.find(p => p.type === 'second')?.value || '';

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};

/**
 * Parsea una fecha del servidor y la convierte a objeto Date
 * Maneja la zona horaria correctamente
 * 
 * @param dateString - String de fecha del servidor
 * @returns {Date} Objeto Date
 */
export const parseDateFromAPI = (dateString: string | Date): Date => {
  if (dateString instanceof Date) {
    return dateString;
  }
  return new Date(dateString);
};

/**
 * Valida que una fecha sea válida
 * 
 * @param date - Fecha a validar
 * @returns {boolean} true si la fecha es válida
 */
export const isValidDate = (date: Date | any): boolean => {
  if (!(date instanceof Date)) {
    return false;
  }
  return !isNaN(date.getTime());
};

/**
 * Obtiene la diferencia en días entre dos fechas considerando la zona horaria
 * 
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns {number} Diferencia en días
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((date1.getTime() - date2.getTime()) / oneDay);
};

/**
 * Verifica si una fecha está vencida
 * 
 * @param dueDate - Fecha de vencimiento
 * @returns {boolean} true si la fecha está vencida
 */
export const isDateOverdue = (dueDate: Date): boolean => {
  const now = new Date();
  return dueDate < now;
};
