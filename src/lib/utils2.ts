import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Detectar si es dispositivo táctil para drag & drop
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Validar conflictos de horarios
export interface TimeConflict {
  type: 'teacher' | 'classroom' | 'section';
  message: string;
  conflictingSchedules: any[];
}

export function validateScheduleConflicts(
  newSchedule: {
    teacherId?: number | null;
    sectionId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    classroom?: string;
  },
  existingSchedules: any[],
  excludeId?: number
): TimeConflict[] {
  const conflicts: TimeConflict[] = [];
  
  const newStart = timeToMinutes(newSchedule.startTime);
  const newEnd = timeToMinutes(newSchedule.endTime);

  // Filtrar horarios del mismo día y excluir el horario actual si es edición
  const sameDaySchedules = existingSchedules.filter(schedule => 
    schedule.dayOfWeek === newSchedule.dayOfWeek && 
    schedule.id !== excludeId
  );

  sameDaySchedules.forEach(schedule => {
    const existingStart = timeToMinutes(schedule.startTime);
    const existingEnd = timeToMinutes(schedule.endTime);

    // Verificar si hay superposición de horarios
    const hasTimeOverlap = (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );

    if (!hasTimeOverlap) return;

    // Conflicto de profesor
    if (newSchedule.teacherId && schedule.teacherId === newSchedule.teacherId) {
      conflicts.push({
        type: 'teacher',
        message: `El profesor ya tiene una clase asignada en este horario`,
        conflictingSchedules: [schedule]
      });
    }

    // Conflicto de aula
    if (newSchedule.classroom && schedule.classroom === newSchedule.classroom) {
      conflicts.push({
        type: 'classroom',
        message: `El aula "${newSchedule.classroom}" ya está ocupada en este horario`,
        conflictingSchedules: [schedule]
      });
    }

    // Conflicto de sección
    if (schedule.sectionId === newSchedule.sectionId) {
      conflicts.push({
        type: 'section',
        message: `La sección ya tiene una clase asignada en este horario`,
        conflictingSchedules: [schedule]
      });
    }
  });

  return conflicts;
}

// Convertir tiempo HH:MM a minutos para comparaciones
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convertir minutos a formato HH:MM
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Calcular duración entre dos horarios en minutos
export function calculateDuration(startTime: string, endTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

// Formatear duración en minutos a texto legible
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}min`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}min`;
  }
}

// Generar colores para horarios basado en curso
export function getScheduleColor(courseId: number): string {
  const colors = [
    'bg-blue-100 border-blue-300 text-blue-700',
    'bg-green-100 border-green-300 text-green-700',
    'bg-purple-100 border-purple-300 text-purple-700',
    'bg-pink-100 border-pink-300 text-pink-700',
    'bg-yellow-100 border-yellow-300 text-yellow-700',
    'bg-indigo-100 border-indigo-300 text-indigo-700',
    'bg-red-100 border-red-300 text-red-700',
    'bg-orange-100 border-orange-300 text-orange-700',
    'bg-teal-100 border-teal-300 text-teal-700',
    'bg-cyan-100 border-cyan-300 text-cyan-700',
  ];
  
  return colors[courseId % colors.length];
}

// Exportar horarios a CSV
export function exportSchedulesToCSV(schedules: any[], filename: string = 'horarios.csv'): void {
  const headers = [
    'Sección',
    'Curso', 
    'Docente',
    'Día',
    'Hora Inicio',
    'Hora Fin',
    'Aula'
  ];

  const dayNames = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const csvContent = [
    headers.join(','),
    ...schedules.map(schedule => [
      schedule.section?.name || 'Sin sección',
      schedule.course?.name || 'Sin curso',
      schedule.teacher ? `"${schedule.teacher.givenNames} ${schedule.teacher.lastNames}"` : 'Sin asignar',
      dayNames[schedule.dayOfWeek] || 'Sin día',
      schedule.startTime,
      schedule.endTime,
      schedule.classroom || 'Sin aula'
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Validar formato de tiempo HH:MM
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

// Obtener slots de tiempo disponibles
export function getAvailableTimeSlots(
  day: number,
  sectionId: number,
  existingSchedules: any[],
  startHour: number = 7,
  endHour: number = 17,
  slotDuration: number = 45
): Array<{ start: string; end: string; available: boolean }> {
  const slots = [];
  const daySchedules = existingSchedules.filter(s => 
    s.dayOfWeek === day && s.sectionId === sectionId
  );

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const startTime = minutesToTime(hour * 60 + minute);
      const endTime = minutesToTime(hour * 60 + minute + slotDuration);
      
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);
      
      const isAvailable = !daySchedules.some(schedule => {
        const scheduleStart = timeToMinutes(schedule.startTime);
        const scheduleEnd = timeToMinutes(schedule.endTime);
        
        return (
          (startMinutes >= scheduleStart && startMinutes < scheduleEnd) ||
          (endMinutes > scheduleStart && endMinutes <= scheduleEnd) ||
          (startMinutes <= scheduleStart && endMinutes >= scheduleEnd)
        );
      });

      slots.push({
        start: startTime,
        end: endTime,
        available: isAvailable
      });
    }
  }

  return slots;
}