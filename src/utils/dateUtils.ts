/**
 * ====================================================================
 * DATE UTILITIES - Manejo de fechas con zona horaria de Guatemala
 * ====================================================================
 *
 * Proporciona funciones para parsear y manipular fechas usando
 * la zona horaria de Guatemala (America/Guatemala, UTC-6)
 * independientemente de la zona horaria del navegador/PC del usuario.
 */

import { DayOfWeek } from '@/types/schedules.types';

/**
 * Zona horaria configurada en .env
 * Por defecto: America/Guatemala (UTC-6)
 */
const TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || 'America/Guatemala';

/**
 * Obtiene el día de la semana en formato ISO 8601 (1-7) desde una fecha YYYY-MM-DD
 * usando la zona horaria de Guatemala, sin depender del navegador/PC del usuario.
 *
 * @param dateString - Fecha en formato YYYY-MM-DD (ej: "2025-11-22")
 * @returns DayOfWeek - Día de la semana en ISO 8601 (1=Lunes, 7=Domingo)
 *
 * @example
 * const dayOfWeek = getIsoDayOfWeek("2025-11-22"); // Devuelve 6 (Sábado)
 */
export function getIsoDayOfWeek(dateString: string): DayOfWeek {
  try {
    // Parse la fecha YYYY-MM-DD de forma segura
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // JavaScript months are 0-11
    const day = parseInt(dayStr, 10);

    // Usar Intl.DateTimeFormat para obtener el día de la semana en la zona horaria especificada
    // Esto es más confiable que usar Date.UTC() porque respeta realmente la zona horaria
    const date = new Date(year, month, day, 12, 0, 0);
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone: TIMEZONE,
    });

    const dayName = formatter.format(date);
    const dayMap: Record<string, DayOfWeek> = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 7,
    };

    const isoDay = dayMap[dayName];
    
    if (!isoDay) {
      throw new Error(`No se pudo determinar el día de la semana: ${dayName}`);
    }

    console.log(
      '📅 Date parsing with timezone:',
      {
        timezone: TIMEZONE,
        dateString,
        dayName,
        isoDay,
      }
    );

    return isoDay;
  } catch (error) {
    console.error('❌ Error parsing date:', error);
    throw error;
  }
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD usando la zona horaria de Guatemala
 *
 * @returns string - Fecha en formato YYYY-MM-DD
 *
 * @example
 * const today = getTodayDateString(); // "2025-11-22"
 */
export function getTodayDateString(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date());
}

/**
 * Valida que una fecha esté en formato YYYY-MM-DD
 *
 * @param dateString - Fecha a validar
 * @returns boolean - true si es un formato válido
 */
export function isValidDateFormat(dateString: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

/**
 * Convierte una fecha en formato YYYY-MM-DD a una string legible en español
 * usando la zona horaria de Guatemala
 *
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns string - Fecha formateada (ej: "22 de noviembre de 2025")
 *
 * @example
 * const readable = formatDateToSpanish("2025-11-22"); // "22 de noviembre de 2025"
 */
export function formatDateToSpanish(dateString: string): string {
  const [yearStr, monthStr, dayStr] = dateString.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const date = new Date(year, month, day, 12, 0, 0);

  const formatter = new Intl.DateTimeFormat('es-ES', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return formatter.format(date);
}

/**
 * Formatea una fecha ISO (del backend) respetando la zona horaria de Guatemala
 * Evita el problema de diferencia de 1 día al convertir fechas UTC
 *
 * @param isoDateString - Fecha en formato ISO (ej: "2026-01-12T00:00:00.000Z")
 * @param formatPattern - Patrón de formato (ej: "dd MMM yyyy", "EEEE, dd 'de' MMMM")
 * @returns string - Fecha formateada
 *
 * @example
 * formatISODateWithTimezone("2026-01-12T00:00:00.000Z", "dd MMM yyyy")
 * // Devuelve "12 ene 2026" (no "11 ene 2026")
 */
export function formatISODateWithTimezone(
  isoDateString: string,
  format: 'dd MMM yyyy' | "EEEE, dd 'de' MMMM 'de' yyyy" | 'dd MMM'
): string {
  try {
    // Parsear la fecha ISO
    const date = new Date(isoDateString);
    
    // Obtener componentes en la zona horaria especificada
    const formatter = new Intl.DateTimeFormat('es-ES', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    const parts = formatter.formatToParts(date);
    const dateParts: Record<string, string> = {};
    parts.forEach((part) => {
      dateParts[part.type] = part.value;
    });

    const monthMap: Record<string, string> = {
      'enero': 'ene',
      'febrero': 'feb',
      'marzo': 'mar',
      'abril': 'abr',
      'mayo': 'may',
      'junio': 'jun',
      'julio': 'jul',
      'agosto': 'ago',
      'septiembre': 'sep',
      'octubre': 'oct',
      'noviembre': 'nov',
      'diciembre': 'dic',
    };

    const day = dateParts.day;
    const month = dateParts.month;
    const year = dateParts.year;
    const weekday = dateParts.weekday;

    if (format === 'dd MMM yyyy') {
      const shortMonth = monthMap[month.toLowerCase()] || month.substring(0, 3);
      return `${day} ${shortMonth} ${year}`;
    } else if (format === "EEEE, dd 'de' MMMM 'de' yyyy") {
      const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      return `${capitalizedWeekday}, ${day} de ${month} de ${year}`;
    } else if (format === 'dd MMM') {
      const shortMonth = monthMap[month.toLowerCase()] || month.substring(0, 3);
      return `${day} ${shortMonth}`;
    }

    return date.toLocaleDateString('es-ES');
  } catch (error) {
    console.error('❌ Error formatting ISO date:', error);
    return isoDateString;
  }
}
