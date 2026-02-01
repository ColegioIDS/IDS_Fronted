/**
 * ====================================================================
 * TIMEZONE CONFIGURATION - Horario de Guatemala
 * ====================================================================
 *
 * La aplicación usa un único tipo de horario: Horario de Guatemala (UTC-6).
 * Todas las fechas se formatean y muestran en esta zona horaria.
 *
 * Variable en .env: NEXT_PUBLIC_TIMEZONE=America/Guatemala
 * Por defecto: America/Guatemala (UTC-6)
 */

/**
 * Zona horaria IANA usada en toda la app (formateo de fechas, etc.)
 * Valor por defecto: America/Guatemala (Horario de Guatemala).
 */
export const TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || 'America/Guatemala';

/**
 * Obtener la fecha actual en el timezone configurado
 * Formato: YYYY-MM-DD
 * 
 * @returns {string} Fecha en formato YYYY-MM-DD
 * 
 * @example
 * const today = getTodayInConfiguredTimezone();
 * // Returns: "2025-11-23"
 */
export const getTodayInConfiguredTimezone = (): string => {
  // Crear formateador con el timezone configurado
  const formatter = new Intl.DateTimeFormat('es-ES', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(new Date());
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';

  return `${year}-${month}-${day}`;
};

/**
 * Obtener una fecha específica formateada en el timezone configurado
 * Formato: YYYY-MM-DD
 * 
 * @param date - Fecha a formatear (por defecto: hoy)
 * @returns {string} Fecha en formato YYYY-MM-DD
 * 
 * @example
 * const date = getDateInConfiguredTimezone(new Date('2025-11-20'));
 * // Returns: "2025-11-20"
 */
export const getDateInConfiguredTimezone = (date: Date = new Date()): string => {
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
 * Obtener la hora actual en el timezone configurado
 * Formato: HH:MM:SS
 * 
 * @returns {string} Hora en formato HH:MM:SS
 * 
 * @example
 * const time = getNowTimeInConfiguredTimezone();
 * // Returns: "18:33:45"
 */
export const getNowTimeInConfiguredTimezone = (): string => {
  const formatter = new Intl.DateTimeFormat('es-ES', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return formatter.format(new Date());
};

/**
 * Obtener fecha y hora actual en el timezone configurado
 * Formato: YYYY-MM-DD HH:MM:SS
 * 
 * @returns {string} Fecha y hora en formato YYYY-MM-DD HH:MM:SS
 * 
 * @example
 * const datetime = getNowInConfiguredTimezone();
 * // Returns: "2025-11-23 18:33:45"
 */
export const getNowInConfiguredTimezone = (): string => {
  const date = getTodayInConfiguredTimezone();
  const time = getNowTimeInConfiguredTimezone();
  return `${date} ${time}`;
};
