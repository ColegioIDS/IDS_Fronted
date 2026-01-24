// src/utils/scheduleValidator.ts
import type { Schedule, ScheduleConfig, DayOfWeek } from '@/types/schedules.types';
import { DAY_NAMES, DAY_SHORT_LABELS } from '@/types/schedules.types';

export interface ScheduleValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ScheduleSuggestion {
  scheduleId: number;
  reason: 'outside_working_days' | 'outside_time_range' | 'invalid_duration' | 'overlaps_break';
  currentState: {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
  };
  recommendation: string;
}

export interface ScheduleValidationResult {
  isValid: boolean;
  errors: ScheduleValidationError[];
  affectedSchedules: Schedule[];
  suggestions: ScheduleSuggestion[];
  changesSummary: {
    durationChanged: boolean;
    workingDaysChanged: boolean;
    startTimeChanged: boolean;
    endTimeChanged: boolean;
    breakSlotsChanged: boolean;
    oldValues: {
      classDuration?: number;
      workingDays?: DayOfWeek[];
      startTime?: string;
      endTime?: string;
    };
    newValues: {
      classDuration: number;
      workingDays: DayOfWeek[];
      startTime: string;
      endTime: string;
    };
  };
}

export class ScheduleConfigValidator {
  /**
   * Valida todos los horarios contra una configuración
   * Retorna cuáles son inválidos y por qué
   */
  static validateSchedulesAgainstConfig(
    schedules: Schedule[],
    oldConfig: ScheduleConfig,
    newConfig: ScheduleConfig
  ): ScheduleValidationResult {
    const errors: ScheduleValidationError[] = [];
    const affectedSchedules: Schedule[] = [];
    const suggestions: ScheduleSuggestion[] = [];

    // Detectar cambios en configuración
    const durationChanged = oldConfig.classDuration !== newConfig.classDuration;
    const workingDaysChanged = JSON.stringify(oldConfig.workingDays) !== JSON.stringify(newConfig.workingDays);
    const startTimeChanged = oldConfig.startTime !== newConfig.startTime;
    const endTimeChanged = oldConfig.endTime !== newConfig.endTime;
    const breakSlotsChanged = JSON.stringify(oldConfig.breakSlots) !== JSON.stringify(newConfig.breakSlots);

    schedules.forEach((schedule) => {
      const validation = this.validateSingleSchedule(schedule, newConfig);

      if (!validation.isValid) {
        errors.push({
          field: `schedule_${schedule.id}`,
          message: validation.error!,
          code: validation.code!,
        });
        affectedSchedules.push(schedule);

        if (validation.suggestion) {
          suggestions.push({
            scheduleId: schedule.id,
            reason: validation.code as any,
            currentState: {
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            },
            recommendation: validation.suggestion,
          });
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      affectedSchedules,
      suggestions,
      changesSummary: {
        durationChanged,
        workingDaysChanged,
        startTimeChanged,
        endTimeChanged,
        breakSlotsChanged,
        oldValues: {
          classDuration: oldConfig.classDuration,
          workingDays: oldConfig.workingDays,
          startTime: oldConfig.startTime,
          endTime: oldConfig.endTime,
        },
        newValues: {
          classDuration: newConfig.classDuration,
          workingDays: newConfig.workingDays,
          startTime: newConfig.startTime,
          endTime: newConfig.endTime,
        },
      },
    };
  }

  /**
   * Valida un solo horario contra una configuración
   */
  static validateSingleSchedule(
    schedule: Schedule,
    config: ScheduleConfig
  ): { isValid: boolean; error?: string; code?: string; suggestion?: string } {
    // Validación 1: El día está en los días laborales
    if (!config.workingDays.includes(schedule.dayOfWeek)) {
      return {
        isValid: false,
        error: `Horario asignado para ${DAY_NAMES[schedule.dayOfWeek]} pero no es día laboral`,
        code: 'outside_working_days',
        suggestion: `Cambiar a un día laboral: ${config.workingDays.map((d) => DAY_NAMES[d]).join(', ')}`,
      };
    }

    // Validación 2: El horario está dentro del rango
    const [configStartHour, configStartMin] = config.startTime.split(':').map(Number);
    const [configEndHour, configEndMin] = config.endTime.split(':').map(Number);
    const [schedStartHour, schedStartMin] = schedule.startTime.split(':').map(Number);
    const [schedEndHour, schedEndMin] = schedule.endTime.split(':').map(Number);

    const configStartTotalMins = configStartHour * 60 + configStartMin;
    const configEndTotalMins = configEndHour * 60 + configEndMin;
    const schedStartTotalMins = schedStartHour * 60 + schedStartMin;
    const schedEndTotalMins = schedEndHour * 60 + schedEndMin;

    if (schedStartTotalMins < configStartTotalMins || schedEndTotalMins > configEndTotalMins) {
      return {
        isValid: false,
        error: `Horario ${schedule.startTime}-${schedule.endTime} está fuera del rango ${config.startTime}-${config.endTime}`,
        code: 'outside_time_range',
        suggestion: `Ajustar el horario al rango permitido: ${config.startTime}-${config.endTime}`,
      };
    }

    // Validación 3: La duración coincide
    const scheduleDurationMins = schedEndTotalMins - schedStartTotalMins;
    if (scheduleDurationMins !== config.classDuration) {
      return {
        isValid: false,
        error: `Duración del horario (${scheduleDurationMins}min) no coincide con configuración (${config.classDuration}min)`,
        code: 'invalid_duration',
        suggestion: `Duración debe ser ${config.classDuration} minutos`,
      };
    }

    // Validación 4: Solapea con breaks
    // breakSlots is now Record<string, ScheduleSlot[]> - validate only against the specific day's breaks
    const dayBreakSlots = (config.breakSlots && config.breakSlots[schedule.dayOfWeek.toString()]) 
      ? config.breakSlots[schedule.dayOfWeek.toString()] 
      : [];
    
    const overlapsBreak = dayBreakSlots.some((b) => {
      const [bStartHour, bStartMin] = b.start.split(':').map(Number);
      const [bEndHour, bEndMin] = b.end.split(':').map(Number);
      const breakStartMins = bStartHour * 60 + bStartMin;
      const breakEndMins = bEndHour * 60 + bEndMin;

      return schedStartTotalMins < breakEndMins && schedEndTotalMins > breakStartMins;
    });

    if (overlapsBreak) {
      return {
        isValid: false,
        error: `Horario solapea con un descanso`,
        code: 'overlaps_break',
        suggestion: `Cambiar el horario para evitar los descansos configurados`,
      };
    }

    return { isValid: true };
  }

  /**
   * Sugiere un nuevo horario válido para un schedule inválido
   */
  static suggestValidTimeSlot(
    schedule: Schedule,
    config: ScheduleConfig
  ): { startTime: string; endTime: string } | null {
    const [startHour, startMin] = config.startTime.split(':').map(Number);
    const [endHour, endMin] = config.endTime.split(':').map(Number);

    const startTotalMins = startHour * 60 + startMin;
    const endTotalMins = endHour * 60 + endMin;

    // Intentar usar el primer slot disponible del día
    let currentMins = startTotalMins;
    while (currentMins + config.classDuration <= endTotalMins) {
      const slotStart = Math.floor(currentMins / 60);
      const slotStartMin = currentMins % 60;
      const slotEndMins = currentMins + config.classDuration;
      const slotEnd = Math.floor(slotEndMins / 60);
      const slotEndMin = slotEndMins % 60;

      const startStr = `${String(slotStart).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`;
      const endStr = `${String(slotEnd).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;

      // Verificar que no solapee con breaks
      // breakSlots is now Record<string, ScheduleSlot[]>
      const breakSlotsArray = config.breakSlots 
        ? Object.values(config.breakSlots).flat() 
        : [];
      
      const overlapsBreak = breakSlotsArray.some((b) => {
        const [bStartHour, bStartMin] = b.start.split(':').map(Number);
        const [bEndHour, bEndMin] = b.end.split(':').map(Number);
        const breakStartMins = bStartHour * 60 + bStartMin;
        const breakEndMins = bEndHour * 60 + bEndMin;

        return currentMins < breakEndMins && currentMins + config.classDuration > breakStartMins;
      });

      if (!overlapsBreak) {
        return { startTime: startStr, endTime: endStr };
      }

      currentMins += config.classDuration;
    }

    return null;
  }
}
