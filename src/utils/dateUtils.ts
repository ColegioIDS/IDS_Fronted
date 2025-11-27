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
 * 
 * IMPORTANTE: Usa NEXT_PUBLIC_ para que esté disponible en el cliente
 */
const TIMEZONE = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_TIMEZONE || 'America/Guatemala')
  : (process.env.NEXT_PUBLIC_TIMEZONE || 'America/Guatemala');

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
/**
 * Formatea una fecha ISO (del backend) respetando la zona horaria de Guatemala
 * Evita el problema de diferencia de 1 día al convertir fechas UTC
 * 
 * SOLUCIÓN: Extrae la fecha YYYY-MM-DD del string ISO y la interpreta como
 * una fecha en la zona horaria de Guatemala, no como UTC.
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
  formatPattern: 'dd MMM yyyy' | "EEEE, dd 'de' MMMM 'de' yyyy" | 'dd MMM'
): string {
  try {
    // Extraer solo la parte YYYY-MM-DD del ISO string
    const datePart = isoDateString.split('T')[0]; // "2026-01-12"
    const [yearStr, monthStr, dayStr] = datePart.split('-');
    
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    console.log('🔍 formatISODateWithTimezone DEBUG:', {
      isoDateString,
      formatPattern,
      TIMEZONE,
      datePart,
      year,
      month,
      day,
    });

    // Map de meses (formato numérico a abreviado)
    const monthMap: Record<number, string> = {
      1: 'ene', 2: 'feb', 3: 'mar', 4: 'abr',
      5: 'may', 6: 'jun', 7: 'jul', 8: 'ago',
      9: 'sep', 10: 'oct', 11: 'nov', 12: 'dic',
    };

    // Map de meses (formato numérico a completo en español)
    const monthNameMap: Record<number, string> = {
      1: 'enero', 2: 'febrero', 3: 'marzo', 4: 'abril',
      5: 'mayo', 6: 'junio', 7: 'julio', 8: 'agosto',
      9: 'septiembre', 10: 'octubre', 11: 'noviembre', 12: 'diciembre',
    };

    const shortMonth = monthMap[month];
    const fullMonth = monthNameMap[month];
    
    // Para obtener el día de la semana, usamos Intl con la fecha interpretada en Guatemala
    let weekdayStr = '';
    if (formatPattern === "EEEE, dd 'de' MMMM 'de' yyyy") {
      // Crear fecha a las 12:00 del mediodía para evitar problemas de zona horaria
      const tempDate = new Date(year, month - 1, day, 12, 0, 0);
      
      const weekdayFormatter = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
      });
      weekdayStr = weekdayFormatter.format(tempDate);
      weekdayStr = weekdayStr.charAt(0).toUpperCase() + weekdayStr.slice(1);
    }

    if (formatPattern === 'dd MMM yyyy') {
      return `${day} ${shortMonth} ${year}`;
    } else if (formatPattern === "EEEE, dd 'de' MMMM 'de' yyyy") {
      return `${weekdayStr}, ${day} de ${fullMonth} de ${year}`;
    } else if (formatPattern === 'dd MMM') {
      return `${day} ${shortMonth}`;
    }

    return `${day} ${shortMonth} ${year}`;
  } catch (error) {
    console.error('❌ Error formatting ISO date:', error, { isoDateString, formatPattern });
    return isoDateString;
  }
}

/**
 * Formatea un objeto Date respetando la zona horaria de Guatemala
 * Útil para mostrar fechas seleccionadas en formularios
 *
 * @param date - Objeto Date a formatear
 * @param formatPattern - Patrón de formato (ej: "dd MMM yyyy", "PPP")
 * @returns string - Fecha formateada
 *
 * @example
 * formatDateWithTimezone(new Date(2026, 0, 12), "PPP")
 * // Devuelve "12 de enero de 2026"
 */
export function formatDateWithTimezone(
  date: Date,
  formatPattern: 'PPP' | 'dd MMM yyyy' | "EEEE, dd 'de' MMMM 'de' yyyy" | 'dd MMM' | "d 'de' MMMM 'de' yyyy" | "d 'de' MMMM" | "d 'de' MMMM, yyyy" | 'd MMM yyyy' | 'yyyy' | 'MMMM' = 'PPP'
): string {
  try {
    if (!date || !(date instanceof Date)) {
      return '';
    }

    // Obtener componentes de la fecha
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() devuelve 0-11
    const day = date.getDate();

    // Map de meses (formato numérico a abreviado)
    const monthMap: Record<number, string> = {
      1: 'ene', 2: 'feb', 3: 'mar', 4: 'abr',
      5: 'may', 6: 'jun', 7: 'jul', 8: 'ago',
      9: 'sep', 10: 'oct', 11: 'nov', 12: 'dic',
    };

    // Map de meses (formato numérico a completo en español)
    const monthNameMap: Record<number, string> = {
      1: 'enero', 2: 'febrero', 3: 'marzo', 4: 'abril',
      5: 'mayo', 6: 'junio', 7: 'julio', 8: 'agosto',
      9: 'septiembre', 10: 'octubre', 11: 'noviembre', 12: 'diciembre',
    };

    const shortMonth = monthMap[month];
    const fullMonth = monthNameMap[month];
    
    // Para obtener el día de la semana
    let weekdayStr = '';
    if (formatPattern === "EEEE, dd 'de' MMMM 'de' yyyy" || formatPattern === 'PPP') {
      const weekdayFormatter = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
      });
      weekdayStr = weekdayFormatter.format(date);
      weekdayStr = weekdayStr.charAt(0).toUpperCase() + weekdayStr.slice(1);
    }

    if (formatPattern === 'dd MMM yyyy') {
      return `${day} ${shortMonth} ${year}`;
    } else if (formatPattern === "EEEE, dd 'de' MMMM 'de' yyyy") {
      return `${weekdayStr}, ${day} de ${fullMonth} de ${year}`;
    } else if (formatPattern === 'dd MMM') {
      return `${day} ${shortMonth}`;
    } else if (formatPattern === "d 'de' MMMM 'de' yyyy") {
      // Formato como "5 de enero de 2026"
      return `${day} de ${fullMonth} de ${year}`;
    } else if (formatPattern === "d 'de' MMMM") {
      // Formato como "5 de enero"
      return `${day} de ${fullMonth}`;
    } else if (formatPattern === "d 'de' MMMM, yyyy") {
      // Formato como "5 de enero, 2026"
      return `${day} de ${fullMonth}, ${year}`;
    } else if (formatPattern === 'd MMM yyyy') {
      // Formato como "5 ene 2026"
      return `${day} ${shortMonth} ${year}`;
    } else if (formatPattern === 'yyyy') {
      // Solo el año
      return `${year}`;
    } else if (formatPattern === 'MMMM') {
      // Solo el mes
      return `${fullMonth}`;
    } else if (formatPattern === 'PPP') {
      // Formato "PPP" es como "12 de enero de 2026"
      return `${day} de ${fullMonth} de ${year}`;
    }

    return `${day} ${shortMonth} ${year}`;
  } catch (error) {
    console.error('❌ Error formatting Date:', error);
    return '';
  }
}

/**
 * Parsea una fecha ISO del backend y devuelve un objeto Date
 * que representa correctamente la fecha en la zona horaria de Guatemala
 * 
 * PROBLEMA: new Date("2026-01-12T00:00:00.000Z") parsea como UTC, entonces
 * a las 6 PM en Guatemala del día anterior.
 * 
 * SOLUCIÓN: Extrae la fecha YYYY-MM-DD y la interpreta como medianoche
 * en Guatemala, no como UTC.
 *
 * @param isoDateString - Fecha en formato ISO (ej: "2026-01-12T00:00:00.000Z")
 * @returns Date - Objeto Date que representa la fecha correctamente
 *
 * @example
 * const date = parseISODateForTimezone("2026-01-12T00:00:00.000Z");
 * // Devuelve una fecha que representa enero 12 de 2026 (no enero 11)
 */
export function parseISODateForTimezone(isoDateString: string): Date {
  try {
    // Extraer solo la parte YYYY-MM-DD del ISO string
    const datePart = isoDateString.split('T')[0]; // "2026-01-12"
    const [yearStr, monthStr, dayStr] = datePart.split('-');
    
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // JavaScript months are 0-11
    const day = parseInt(dayStr, 10);
    
    // Crear una fecha a las 12:00 del mediodía para evitar problemas de zona horaria
    // Al usar la hora del mediodía, aunque el navegador esté en una zona horaria diferente,
    // el getDate() seguirá devolviendo el día correcto
    const date = new Date(year, month, day, 12, 0, 0);
    
    console.log('🔍 parseISODateForTimezone DEBUG:', {
      isoDateString,
      datePart,
      year,
      month,
      day,
      resultDate: date,
    });
    
    return date;
  } catch (error) {
    console.error('❌ Error parsing ISO date for timezone:', error);
    return new Date();
  }
}
