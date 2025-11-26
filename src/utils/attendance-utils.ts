/**
 * ====================================================================
 * ATTENDANCE UTILS - Funciones utilitarias del módulo
 * ====================================================================
 *
 * Funciones reutilizables para formateo, validación, cálculos
 * y helpers visuales del módulo de asistencia.
 */

import { format, parse, startOfToday, isBefore, isAfter } from 'date-fns';
import { ATTENDANCE_DEFAULTS, ATTENDANCE_STATUS_COLORS } from '@/constants/attendance.constants';

// ====================================================================
// FORMATTERS - Formato de datos
// ====================================================================

/**
 * Formatea fecha a string YYYY-MM-DD
 * @param date - Fecha a formatear
 * @returns String formateado
 */
export function formatDateToString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Formatea fecha a string legible (ej: "21 de noviembre, 2025")
 * @param date - Fecha a formatear
 * @returns String formateado
 */
export function formatDateReadable(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const day = dateObj.getDate();
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  
  return `${day} de ${month}, ${year}`;
}

/**
 * Formatea hora a string HH:mm
 * @param time - Hora como string o Date
 * @returns String formateado HH:mm
 */
export function formatTimeToString(time: Date | string): string {
  if (typeof time === 'string') {
    // Asume que ya está en formato HH:mm
    if (/^\d{2}:\d{2}$/.test(time)) return time;
    const timeObj = parse(time, ATTENDANCE_DEFAULTS.DEFAULT_TIME_FORMAT, new Date());
    return format(timeObj, 'HH:mm');
  }
  return format(time, 'HH:mm');
}

/**
 * Formatea nombre de estado para mostrar en UI
 * @param statusName - Nombre del estado
 * @returns String formateado
 */
export function formatStatusName(statusName: string): string {
  return statusName
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formatea número de estudiantes con singular/plural
 * @param count - Cantidad de estudiantes
 * @returns String formateado
 */
export function formatStudentCount(count: number): string {
  return count === 1 ? '1 estudiante' : `${count} estudiantes`;
}

// ====================================================================
// VALIDATORS - Validaciones
// ====================================================================

/**
 * Valida fecha en formato YYYY-MM-DD
 * @param dateString - String a validar
 * @returns true si es válida
 */
export function isValidDate(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Valida que la fecha no sea futura
 * @param date - Fecha a validar
 * @returns true si NO es futura
 */
export function isNotFutureDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isBefore(dateObj, new Date()) || isToday(date);
}

/**
 * Valida que la fecha sea hoy
 * @param date - Fecha a validar
 * @returns true si es hoy
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = startOfToday();
  return dateObj.toDateString() === today.toDateString();
}

/**
 * Valida que la fecha esté dentro de límite de días en el pasado
 * @param date - Fecha a validar
 * @param maxDaysPast - Máximo de días en el pasado (default: 30)
 * @returns true si está dentro del límite
 */
export function isWithinPastLimit(date: Date | string, maxDaysPast: number = 30): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxDaysPast);
  
  return isAfter(dateObj, cutoffDate) || isToday(date);
}

/**
 * Valida hora en formato HH:mm
 * @param timeString - String a validar
 * @returns true si es válida
 */
export function isValidTime(timeString: string): boolean {
  return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(timeString);
}

/**
 * Valida color hex (#RRGGBB)
 * @param colorString - String a validar
 * @returns true si es válido
 */
export function isValidHexColor(colorString: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(colorString);
}

// ====================================================================
// CALCULATORS - Cálculos
// ====================================================================

/**
 * Calcula minutos entre hora de llegada y hora de entrada permitida
 * @param arrivalTime - Hora de llegada (HH:mm)
 * @param allowedTime - Hora permitida (HH:mm)
 * @returns Minutos de retraso (0 si llega a tiempo)
 */
export function calculateMinutesLate(arrivalTime: string, allowedTime: string): number {
  if (!isValidTime(arrivalTime) || !isValidTime(allowedTime)) return 0;
  
  const [arrHour, arrMin] = arrivalTime.split(':').map(Number);
  const [allowHour, allowMin] = allowedTime.split(':').map(Number);
  
  const arrivalMinutes = arrHour * 60 + arrMin;
  const allowedMinutes = allowHour * 60 + allowMin;
  
  const diff = arrivalMinutes - allowedMinutes;
  return diff > 0 ? diff : 0;
}

/**
 * Verifica si la hora es tarde
 * @param arrivalTime - Hora de llegada (HH:mm)
 * @param allowedTime - Hora permitida (HH:mm)
 * @param thresholdMinutes - Minutos de tolerancia (default: 15)
 * @returns true si está tarde
 */
export function isLate(arrivalTime: string, allowedTime: string, thresholdMinutes: number = 15): boolean {
  return calculateMinutesLate(arrivalTime, allowedTime) > thresholdMinutes;
}

/**
 * Calcula porcentaje de asistencia
 * @param daysPresent - Días asistido
 * @param totalDays - Total de días
 * @returns Porcentaje (0-100)
 */
export function calculateAttendancePercentage(daysPresent: number, totalDays: number): number {
  if (totalDays === 0) return 0;
  return Math.round((daysPresent / totalDays) * 100);
}

/**
 * Determina si estudiante está en riesgo
 * @param attendancePercentage - Porcentaje de asistencia
 * @param riskThreshold - Umbral de riesgo (default: 80)
 * @returns true si está en riesgo
 */
export function isAtRisk(attendancePercentage: number, riskThreshold: number = 80): boolean {
  return attendancePercentage < riskThreshold;
}

/**
 * Calcula consecutivos ausentes
 * @param attendanceRecords - Array de registros [boolean, boolean, ...]
 * @returns Número de ausentes consecutivos más recientes
 */
export function calculateConsecutiveAbsences(attendanceRecords: boolean[]): number {
  if (attendanceRecords.length === 0) return 0;
  
  let count = 0;
  for (let i = attendanceRecords.length - 1; i >= 0; i--) {
    if (!attendanceRecords[i]) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

// ====================================================================
// HELPERS - Funciones auxiliares visuales
// ====================================================================

/**
 * Obtiene color para un estado
 * @param statusCode - Código del estado (PRESENT, ABSENT, etc.)
 * @param statusColorMap - Mapa de colores desde BD (opcional)
 * @returns Código de color hex
 */
export function getColorByStatus(statusCode: string, statusColorMap?: Record<string, string>): string {
  // Si hay mapa desde BD, usarlo
  if (statusColorMap && statusColorMap[statusCode]) {
    return statusColorMap[statusCode];
  }
  
  // Sino, usar colores por defecto según código
  const codeUpper = statusCode.toUpperCase();
  
  if (codeUpper === 'PRESENT') return ATTENDANCE_STATUS_COLORS.present;
  if (codeUpper === 'ABSENT') return ATTENDANCE_STATUS_COLORS.absent;
  if (codeUpper === 'LATE') return ATTENDANCE_STATUS_COLORS.late;
  if (codeUpper === 'EXCUSED') return ATTENDANCE_STATUS_COLORS.excused;
  if (codeUpper === 'JUSTIFIED') return ATTENDANCE_STATUS_COLORS.justified;
  
  return ATTENDANCE_STATUS_COLORS.default;
}

/**
 * Obtiene icono para un estado
 * @param statusCode - Código del estado
 * @returns Nombre del icono (para usar con lucide-react o similar)
 */
export function getIconByStatus(statusCode: string): string {
  const codeUpper = statusCode.toUpperCase();
  
  if (codeUpper === 'PRESENT') return 'check-circle';
  if (codeUpper === 'ABSENT') return 'x-circle';
  if (codeUpper === 'LATE') return 'clock';
  if (codeUpper === 'EXCUSED') return 'file-check';
  if (codeUpper === 'JUSTIFIED') return 'shield-check';
  
  return 'help-circle';
}

/**
 * Obtiene clase CSS para estilo de estado
 * @param statusCode - Código del estado
 * @returns Nombre de clase CSS
 */
export function getStatusClassName(statusCode: string): string {
  const codeUpper = statusCode.toUpperCase();
  
  if (codeUpper === 'PRESENT') return 'bg-green-100 text-green-800 border-green-300';
  if (codeUpper === 'ABSENT') return 'bg-red-100 text-red-800 border-red-300';
  if (codeUpper === 'LATE') return 'bg-amber-100 text-amber-800 border-amber-300';
  if (codeUpper === 'EXCUSED') return 'bg-blue-100 text-blue-800 border-blue-300';
  if (codeUpper === 'JUSTIFIED') return 'bg-purple-100 text-purple-800 border-purple-300';
  
  return 'bg-gray-100 text-gray-800 border-gray-300';
}

/**
 * Obtiene badge visual para un estado
 * @param statusCode - Código del estado
 * @param statusName - Nombre del estado desde BD
 * @returns Objeto con color y label
 */
export function getStatusBadge(statusCode: string, statusName?: string): { color: string; label: string } {
  return {
    color: getColorByStatus(statusCode),
    label: statusName || formatStatusName(statusCode),
  };
}

/**
 * Ordena estudiantes por nombre
 * @param students - Array de estudiantes
 * @param order - 'asc' o 'desc'
 * @returns Array ordenado
 */
export function sortStudentsByName(
  students: Array<{firstName?: string; lastName?: string}>,
  order: 'asc' | 'desc' = 'asc'
): Array<{firstName?: string; lastName?: string}> {
  return [...students].sort((a, b) => {
    const nameA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase().trim();
    const nameB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase().trim();
    
    return order === 'asc' 
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });
}

/**
 * Filtra estudiantes por término de búsqueda
 * @param students - Array de estudiantes
 * @param searchTerm - Término a buscar
 * @returns Array filtrado
 */
export function filterStudentsBySearch(
  students: Array<{firstName?: string; lastName?: string; studentId?: number | string; email?: string}>,
  searchTerm: string
): Array<{firstName?: string; lastName?: string; studentId?: number | string; email?: string}> {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return students;
  
  return students.filter(student => {
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
    const studentId = String(student.studentId || '').toLowerCase();
    const email = `${student.email || ''}`.toLowerCase();
    
    return fullName.includes(term) || studentId.includes(term) || email.includes(term);
  });
}
