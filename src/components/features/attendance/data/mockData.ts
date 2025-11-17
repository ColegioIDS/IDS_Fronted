// src/components/features/attendance/data/mockData.ts
// 📊 Datos mockup para el sistema de asistencia

import { AttendanceStatus } from '@/types/attendance.types';

// 🎓 Tipos locales
export interface MockStudent {
  id: number;
  givenNames: string;
  lastNames: string;
  codeSIRE: string;
  photoUrl?: string;
}

export interface MockEnrollment {
  id: number;
  student: MockStudent;
  sectionId: number;
}

export interface MockGrade {
  id: number;
  name: string;
  level: string;
  order: number;
}

export interface MockSection {
  id: number;
  name: string;
  gradeId: number;
  grade: MockGrade;
  capacity: number;
  teacher: null | {
    givenNames: string;
    lastNames: string;
    teacherDetails?: {
      isHomeroomTeacher: boolean;
    };
  };
}

export interface MockAttendance {
  id: number;
  enrollmentId: number;
  date: string;
  status: AttendanceStatus;
  bimesterId: number;
}

export interface MockHoliday {
  id: number;
  date: string;
  description: string;
  isRecovered: boolean;
}

export interface MockBimester {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface MockSchoolCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// 📚 Datos de grados
export const MOCK_GRADES = [
  { id: 1, name: 'Primero Básico', level: 'Básico', order: 1 },
  { id: 2, name: 'Segundo Básico', level: 'Básico', order: 2 },
  { id: 3, name: 'Tercero Básico', level: 'Básico', order: 3 },
  { id: 4, name: 'Cuarto Bachillerato', level: 'Diversificado', order: 4 },
  { id: 5, name: 'Quinto Bachillerato', level: 'Diversificado', order: 5 },
];

// 📝 Datos de secciones
export const MOCK_SECTIONS = [
  { id: 1, name: 'A', gradeId: 1, grade: MOCK_GRADES[0], capacity: 30, teacher: null },
  { id: 2, name: 'B', gradeId: 1, grade: MOCK_GRADES[0], capacity: 28, teacher: null },
  { id: 3, name: 'A', gradeId: 2, grade: MOCK_GRADES[1], capacity: 32, teacher: null },
  { id: 4, name: 'B', gradeId: 2, grade: MOCK_GRADES[1], capacity: 30, teacher: null },
  { id: 5, name: 'A', gradeId: 3, grade: MOCK_GRADES[2], capacity: 25, teacher: null },
  { id: 6, name: 'A', gradeId: 4, grade: MOCK_GRADES[3], capacity: 35, teacher: null },
  { id: 7, name: 'A', gradeId: 5, grade: MOCK_GRADES[4], capacity: 33, teacher: null },
];

// 👥 Datos de estudiantes
export const MOCK_STUDENTS: MockStudent[] = [
  { id: 1, givenNames: 'Juan Carlos', lastNames: 'García López', codeSIRE: '2024-001' },
  { id: 2, givenNames: 'María Fernanda', lastNames: 'Martínez Pérez', codeSIRE: '2024-002' },
  { id: 3, givenNames: 'Pedro José', lastNames: 'Rodríguez Gómez', codeSIRE: '2024-003' },
  { id: 4, givenNames: 'Ana Sofía', lastNames: 'Hernández Díaz', codeSIRE: '2024-004' },
  { id: 5, givenNames: 'Luis Miguel', lastNames: 'González Ruiz', codeSIRE: '2024-005' },
  { id: 6, givenNames: 'Carmen Elena', lastNames: 'Sánchez Morales', codeSIRE: '2024-006' },
  { id: 7, givenNames: 'Roberto Carlos', lastNames: 'Ramírez Torres', codeSIRE: '2024-007' },
  { id: 8, givenNames: 'Lucía María', lastNames: 'Flores Castillo', codeSIRE: '2024-008' },
  { id: 9, givenNames: 'Diego Alejandro', lastNames: 'Cruz Vargas', codeSIRE: '2024-009' },
  { id: 10, givenNames: 'Sofía Isabel', lastNames: 'Mendoza Reyes', codeSIRE: '2024-010' },
  { id: 11, givenNames: 'José Antonio', lastNames: 'Ortiz Jiménez', codeSIRE: '2024-011' },
  { id: 12, givenNames: 'Patricia Elena', lastNames: 'Gutiérrez Vega', codeSIRE: '2024-012' },
  { id: 13, givenNames: 'Fernando José', lastNames: 'Moreno Castro', codeSIRE: '2024-013' },
  { id: 14, givenNames: 'Gabriela María', lastNames: 'Rojas Medina', codeSIRE: '2024-014' },
  { id: 15, givenNames: 'Ricardo Manuel', lastNames: 'Delgado Silva', codeSIRE: '2024-015' },
  { id: 16, givenNames: 'Valeria Andrea', lastNames: 'Ramos Herrera', codeSIRE: '2024-016' },
  { id: 17, givenNames: 'Andrés Felipe', lastNames: 'Peña Domínguez', codeSIRE: '2024-017' },
  { id: 18, givenNames: 'Isabella Victoria', lastNames: 'Aguilar Cortés', codeSIRE: '2024-018' },
  { id: 19, givenNames: 'Miguel Ángel', lastNames: 'Núñez Fuentes', codeSIRE: '2024-019' },
  { id: 20, givenNames: 'Carolina Beatriz', lastNames: 'Campos Ríos', codeSIRE: '2024-020' },
];

// 📋 Datos de matrículas (enrollments)
export const MOCK_ENROLLMENTS: MockEnrollment[] = [
  // Sección 1A (Primero Básico A) - 10 estudiantes
  { id: 1, student: MOCK_STUDENTS[0], sectionId: 1 },
  { id: 2, student: MOCK_STUDENTS[1], sectionId: 1 },
  { id: 3, student: MOCK_STUDENTS[2], sectionId: 1 },
  { id: 4, student: MOCK_STUDENTS[3], sectionId: 1 },
  { id: 5, student: MOCK_STUDENTS[4], sectionId: 1 },
  { id: 6, student: MOCK_STUDENTS[5], sectionId: 1 },
  { id: 7, student: MOCK_STUDENTS[6], sectionId: 1 },
  { id: 8, student: MOCK_STUDENTS[7], sectionId: 1 },
  { id: 9, student: MOCK_STUDENTS[8], sectionId: 1 },
  { id: 10, student: MOCK_STUDENTS[9], sectionId: 1 },

  // Sección 1B (Primero Básico B) - 10 estudiantes
  { id: 11, student: MOCK_STUDENTS[10], sectionId: 2 },
  { id: 12, student: MOCK_STUDENTS[11], sectionId: 2 },
  { id: 13, student: MOCK_STUDENTS[12], sectionId: 2 },
  { id: 14, student: MOCK_STUDENTS[13], sectionId: 2 },
  { id: 15, student: MOCK_STUDENTS[14], sectionId: 2 },
  { id: 16, student: MOCK_STUDENTS[15], sectionId: 2 },
  { id: 17, student: MOCK_STUDENTS[16], sectionId: 2 },
  { id: 18, student: MOCK_STUDENTS[17], sectionId: 2 },
  { id: 19, student: MOCK_STUDENTS[18], sectionId: 2 },
  { id: 20, student: MOCK_STUDENTS[19], sectionId: 2 },
];

// 🎉 Datos de días festivos
export const MOCK_HOLIDAYS: MockHoliday[] = [
  { id: 1, date: '2025-01-01', description: 'Año Nuevo', isRecovered: false },
  { id: 2, date: '2025-03-29', description: 'Semana Santa - Viernes Santo', isRecovered: false },
  { id: 3, date: '2025-05-01', description: 'Día del Trabajo', isRecovered: false },
  { id: 4, date: '2025-06-30', description: 'Día del Ejército', isRecovered: false },
  { id: 5, date: '2025-09-15', description: 'Día de la Independencia', isRecovered: false },
  { id: 6, date: '2025-10-20', description: 'Día de la Revolución', isRecovered: false },
  { id: 7, date: '2025-11-01', description: 'Día de Todos los Santos', isRecovered: false },
  { id: 8, date: '2025-12-25', description: 'Navidad', isRecovered: false },
];

// 📅 Datos de bimestres
export const MOCK_BIMESTERS: MockBimester[] = [
  {
    id: 1,
    name: 'Primer Bimestre',
    startDate: '2025-01-15',
    endDate: '2025-03-15',
    isActive: false
  },
  {
    id: 2,
    name: 'Segundo Bimestre',
    startDate: '2025-03-16',
    endDate: '2025-05-15',
    isActive: false
  },
  {
    id: 3,
    name: 'Tercer Bimestre',
    startDate: '2025-05-16',
    endDate: '2025-07-15',
    isActive: false
  },
  {
    id: 4,
    name: 'Cuarto Bimestre',
    startDate: '2025-07-16',
    endDate: '2025-09-15',
    isActive: false
  },
  {
    id: 5,
    name: 'Quinto Bimestre',
    startDate: '2025-09-16',
    endDate: '2025-11-15',
    isActive: true
  },
];

// 🎓 Datos de ciclo escolar
export const MOCK_SCHOOL_CYCLES: MockSchoolCycle[] = [
  {
    id: 1,
    name: '2025',
    startDate: '2025-01-15',
    endDate: '2025-10-31',
    isActive: true
  },
];

// 📊 Datos de asistencia (ejemplo vacío, se genera dinámicamente)
export const MOCK_ATTENDANCES: MockAttendance[] = [];

// 🔧 Funciones helper

/**
 * Obtiene las secciones de un grado específico
 */
export function getSectionsByGrade(gradeId: number): MockSection[] {
  return MOCK_SECTIONS.filter(section => section.gradeId === gradeId);
}

/**
 * Obtiene las matrículas de una sección específica
 */
export function getEnrollmentsBySection(sectionId: number): MockEnrollment[] {
  return MOCK_ENROLLMENTS.filter(enrollment => enrollment.sectionId === sectionId);
}

/**
 * Obtiene una sección por ID
 */
export function getSectionById(sectionId: number): MockSection | undefined {
  return MOCK_SECTIONS.find(section => section.id === sectionId);
}

/**
 * Obtiene un grado por ID
 */
export function getGradeById(gradeId: number): MockGrade | undefined {
  return MOCK_GRADES.find(grade => grade.id === gradeId);
}

/**
 * Obtiene el bimestre activo
 */
export function getActiveBimester(): MockBimester | undefined {
  return MOCK_BIMESTERS.find(bimester => bimester.isActive);
}

/**
 * Obtiene el ciclo escolar activo
 */
export function getActiveSchoolCycle(): MockSchoolCycle | undefined {
  return MOCK_SCHOOL_CYCLES.find(cycle => cycle.isActive);
}

/**
 * Verifica si una fecha es día festivo
 */
export function isHolidayDate(date: Date): MockHoliday | undefined {
  const dateStr = date.toISOString().split('T')[0];
  return MOCK_HOLIDAYS.find(holiday => holiday.date === dateStr);
}

/**
 * Obtiene los días festivos próximos (siguientes 7 días)
 */
export function getUpcomingHolidays(fromDate: Date = new Date()): MockHoliday[] {
  const weekFromNow = new Date(fromDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  return MOCK_HOLIDAYS.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate > fromDate && holidayDate <= weekFromNow;
  });
}

/**
 * Calcula el progreso del bimestre activo
 */
export function getActiveBimesterProgress(): { progress: number; daysRemaining: number } {
  const activeBimester = getActiveBimester();
  if (!activeBimester) return { progress: 0, daysRemaining: 0 };

  const now = new Date();
  const start = new Date(activeBimester.startDate);
  const end = new Date(activeBimester.endDate);

  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

  return {
    progress: Math.round(progress),
    daysRemaining: Math.max(daysRemaining, 0)
  };
}
