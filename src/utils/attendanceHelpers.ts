// src/utils/attendanceHelpers.ts

import { StudentWithAttendance } from '@/types/global';

/**
 * Verificar si un estudiante ya tiene registro para hoy
 */
export const hasRegistryToday = (student: StudentWithAttendance): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return student.attendances.some((a) => a.date.startsWith(today));
};

/**
 * Obtener el registro de hoy si existe
 */
export const getTodayRegistry = (student: StudentWithAttendance) => {
  const today = new Date().toISOString().split('T')[0];
  return student.attendances.find((a) => a.date.startsWith(today));
};

/**
 * Obtener los últimos N registros de un estudiante
 */
export const getLastNRecords = (student: StudentWithAttendance, n: number = 10) => {
  return student.attendances.slice(0, n);
};

/**
 * Formatear fecha para mostrar
 */
export const formatDateToDisplay = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formatear nombre completo del estudiante
 */
export const formatStudentName = (givenNames: string, lastNames: string): string => {
  return `${givenNames} ${lastNames}`;
};

/**
 * Obtener la semana de una fecha
 */
export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000) + 1);
};

/**
 * Verificar si dos fechas son del mismo día
 */
export const isSameDay = (date1: string, date2: string): boolean => {
  return date1.split('T')[0] === date2.split('T')[0];
};

/**
 * Obtener rango de fechas para un mes
 */
export const getMonthDateRange = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return {
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0],
  };
};

/**
 * Calcular días escolares en un rango (excluyendo fines de semana)
 */
export const calculateSchoolDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      // 0 = domingo, 6 = sábado
      count++;
    }
  }

  return count;
};

/**
 * Generar array de colores según cantidad
 */
export const generateColorArray = (count: number, baseColor: string): string[] => {
  const colors: Record<string, string[]> = {
    green: [
      'bg-green-50',
      'bg-green-100',
      'bg-green-200',
      'bg-green-300',
      'bg-green-400',
    ],
    red: ['bg-red-50', 'bg-red-100', 'bg-red-200', 'bg-red-300', 'bg-red-400'],
    blue: [
      'bg-blue-50',
      'bg-blue-100',
      'bg-blue-200',
      'bg-blue-300',
      'bg-blue-400',
    ],
    yellow: [
      'bg-yellow-50',
      'bg-yellow-100',
      'bg-yellow-200',
      'bg-yellow-300',
      'bg-yellow-400',
    ],
  };

  const colorArray = colors[baseColor] || colors.green;
  return Array(count)
    .fill(0)
    .map((_, i) => colorArray[i % colorArray.length]);
};

/**
 * Convertir CSV string a blob y descargar
 */
export const downloadCSV = (csvContent: string, filename: string = 'reporte.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Validar si la fecha es hoy
 */
export const isToday = (date: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return date.startsWith(today);
};

/**
 * Obtener diferencia en días
 */
export const getDaysDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};