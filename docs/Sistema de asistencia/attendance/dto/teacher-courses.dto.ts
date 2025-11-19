import { z } from 'zod';

/**
 * DTO: Obtener cursos del maestro para un día específico
 * Filtra por Schedule y CourseAssignment activos
 */
export const getTeacherCoursesSchema = z.object({
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export type GetTeacherCoursesDto = z.infer<typeof getTeacherCoursesSchema>;

/**
 * Respuesta: Curso del maestro con información de horario
 */
export interface TeacherCourseDto {
  scheduleId: number;
  courseAssignmentId: number;
  courseId: number;
  courseName: string;
  courseCode: string;
  sectionId: number;
  sectionName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom?: string;
  studentCount?: number;
}

/**
 * DTO: Registrar asistencia por cursos específicos
 * Permite seleccionar 2-3 cursos en lugar de toda la sección
 */
export const bulkTeacherAttendanceByCourseSchema = z.object({
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  courseAssignmentIds: z.array(z.number()).min(1).max(10), // 1-10 cursos
  attendanceStatusId: z.number().int().positive(),
  arrivalTime: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type BulkTeacherAttendanceByCourseDto = z.infer<
  typeof bulkTeacherAttendanceByCourseSchema
>;

/**
 * Respuesta: Resumen de registro por cursos
 */
export interface BulkAttendanceByCourseResponseDto {
  success: boolean;
  message: string;
  date: string;
  courseCount: number;
  createdAttendances: number;
  createdReports: number;
  enrollmentsCovered: number;
  records: {
    scheduleId: number;
    courseAssignmentId: number;
    sectionId: number;
    enrollmentCount: number;
    attendanceRecordsCreated: number;
  }[];
}
