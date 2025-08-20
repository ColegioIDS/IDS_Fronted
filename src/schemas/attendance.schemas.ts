// schemas/attendance.schemas.ts
import { z } from 'zod';

// Schema para estados de asistencia
export const attendanceStatusSchema = z.enum(['present', 'absent', 'late', 'excused'], {
  errorMap: () => ({ message: "Selecciona un estado válido" })
});

// Schema para crear asistencia (sin transform para evitar conflictos de tipo)
export const createAttendanceSchema = z.object({
  enrollmentId: z.string()
    .min(1, "Selecciona una matrícula"),
  bimesterId: z.string()
    .min(1, "Selecciona un bimestre"),
  date: z.string()
    .min(1, "Selecciona una fecha")
    .refine(val => !isNaN(Date.parse(val)), "Fecha inválida"),
  status: attendanceStatusSchema,
  notes: z.string()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional()
    .or(z.literal(''))
});

// Schema para actualizar asistencia
export const updateAttendanceSchema = z.object({
  enrollmentId: z.string()
    .min(1, "Selecciona una matrícula")
    .optional(),
  bimesterId: z.string()
    .min(1, "Selecciona un bimestre")
    .optional(),
  date: z.string()
    .refine(val => !isNaN(Date.parse(val)), "Fecha inválida")
    .optional(),
  status: attendanceStatusSchema.optional(),
  notes: z.string()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional()
    .or(z.literal(''))
}).refine(data => {
  const hasData = Object.values(data).some(value => 
    value !== undefined && value !== null && value !== ''
  );
  return hasData;
}, {
  message: "Debe actualizar al menos un campo"
});

// Schema con transformaciones para validación adicional (opcional)
export const createAttendanceSchemaWithTransform = createAttendanceSchema.transform(data => ({
  ...data,
  enrollmentId: parseInt(data.enrollmentId),
  bimesterId: parseInt(data.bimesterId)
})).refine(data => !isNaN(data.enrollmentId) && data.enrollmentId > 0, {
  message: "Matrícula inválida",
  path: ["enrollmentId"]
}).refine(data => !isNaN(data.bimesterId) && data.bimesterId > 0, {
  message: "Bimestre inválido", 
  path: ["bimesterId"]
});

// Schema para filtros de búsqueda
export const attendanceFiltersSchema = z.object({
  enrollmentId: z.string()
    .transform(val => val ? parseInt(val) : undefined)
    .optional(),
  bimesterId: z.string()
    .transform(val => val ? parseInt(val) : undefined)
    .optional(),
  studentId: z.string()
    .transform(val => val ? parseInt(val) : undefined)
    .optional(),
  status: attendanceStatusSchema.optional(),
  dateFrom: z.string()
    .refine(val => !val || !isNaN(Date.parse(val)), "Fecha desde inválida")
    .optional(),
  dateTo: z.string()
    .refine(val => !val || !isNaN(Date.parse(val)), "Fecha hasta inválida")
    .optional(),
  page: z.string()
    .transform(val => val ? parseInt(val) : 1)
    .refine(val => val > 0, "Página debe ser mayor a 0")
    .optional(),
  limit: z.string()
    .transform(val => val ? parseInt(val) : 10)
    .refine(val => val > 0 && val <= 100, "Límite debe estar entre 1 y 100")
    .optional()
}).refine(data => {
  if (data.dateFrom && data.dateTo) {
    return new Date(data.dateFrom) <= new Date(data.dateTo);
  }
  return true;
}, {
  message: "La fecha desde debe ser anterior a la fecha hasta",
  path: ["dateFrom"]
});

// Schema para formulario rápido de asistencia (solo estado)
export const quickAttendanceSchema = z.object({
  status: attendanceStatusSchema,
  notes: z.string()
    .max(200, "Las notas no pueden exceder 200 caracteres")
    .optional()
    .or(z.literal(''))
});

// Schema para asistencia masiva
export const bulkAttendanceSchema = z.object({
  bimesterId: z.string()
    .min(1, "Selecciona un bimestre")
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val > 0, "Bimestre inválido"),
  date: z.string()
    .min(1, "Selecciona una fecha")
    .refine(val => !isNaN(Date.parse(val)), "Fecha inválida"),
  attendances: z.array(z.object({
    enrollmentId: z.number().positive("ID de matrícula inválido"),
    status: attendanceStatusSchema,
    notes: z.string().max(500).optional()
  })).min(1, "Debe incluir al menos un registro de asistencia")
});

// Schema para importar asistencia desde archivo
export const importAttendanceSchema = z.object({
  file: z.instanceof(File, { message: "Selecciona un archivo válido" })
    .refine(file => {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      return validTypes.includes(file.type);
    }, "El archivo debe ser CSV o Excel"),
  bimesterId: z.string()
    .min(1, "Selecciona un bimestre")
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val > 0, "Bimestre inválido"),
  overwrite: z.boolean().default(false)
});

// Schema para validar fechas en rango de bimestre
export const dateInBimesterSchema = (startDate: Date, endDate: Date) => z.string()
  .refine(val => !isNaN(Date.parse(val)), "Fecha inválida")
  .refine(val => {
    const date = new Date(val);
    return date >= startDate && date <= endDate;
  }, `La fecha debe estar entre ${startDate.toLocaleDateString()} y ${endDate.toLocaleDateString()}`);

// Tipos inferidos
export type CreateAttendanceForm = z.infer<typeof createAttendanceSchema>;
export type UpdateAttendanceForm = z.infer<typeof updateAttendanceSchema>;
export type AttendanceFiltersForm = z.infer<typeof attendanceFiltersSchema>;
export type QuickAttendanceForm = z.infer<typeof quickAttendanceSchema>;
export type BulkAttendanceForm = z.infer<typeof bulkAttendanceSchema>;
export type ImportAttendanceForm = z.infer<typeof importAttendanceSchema>;

// Valores por defecto para formularios
export const defaultAttendanceValues = {
  enrollmentId: '',
  bimesterId: '',
  date: '',
  status: 'present' as const,
  notes: ''
};

// Constantes para opciones de formularios
export const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'present' as const, label: 'Presente', color: 'green', icon: 'CheckCircle' },
  { value: 'absent' as const, label: 'Ausente', color: 'red', icon: 'XCircle' },
  { value: 'late' as const, label: 'Tardanza', color: 'yellow', icon: 'Clock' },
  { value: 'excused' as const, label: 'Justificado', color: 'blue', icon: 'ShieldCheck' }
];

export const ATTENDANCE_FILTER_PRESETS = [
  { label: 'Hoy', dateFrom: new Date().toISOString().split('T')[0], dateTo: new Date().toISOString().split('T')[0] },
  { label: 'Esta semana', dateFrom: getStartOfWeek().toISOString().split('T')[0], dateTo: new Date().toISOString().split('T')[0] },
  { label: 'Este mes', dateFrom: getStartOfMonth().toISOString().split('T')[0], dateTo: new Date().toISOString().split('T')[0] },
  { label: 'Últimos 7 días', dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], dateTo: new Date().toISOString().split('T')[0] }
];

// Funciones auxiliares
function getStartOfWeek(): Date {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function getStartOfMonth(): Date {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}