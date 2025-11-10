// src/hooks/attendance/useSchedulesForDay.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Schedule } from '@/types/attendance.types';
import { api } from '@/config/api';

interface UseSchedulesForDayReturn {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  fetchSchedules: (sectionId: number, date: Date) => Promise<void>;
}

/**
 * Hook para obtener los horarios de un día específico para una sección
 * Obtiene automáticamente el dayOfWeek basado en la fecha
 */
export function useSchedulesForDay(): UseSchedulesForDayReturn {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDayOfWeek = (date: Date): number => {
    // JavaScript: 0 = domingo, 1 = lunes, ..., 6 = sábado
    // Backend probablemente: 1 = lunes, 2 = martes, ..., 5 = viernes
    const jsDay = date.getDay();
    // Convertir: 0 (dom) -> 7, 1 (lun) -> 1, ..., 6 (sab) -> 6
    return jsDay === 0 ? 7 : jsDay;
  };

  const fetchSchedules = useCallback(async (sectionId: number, date: Date) => {
    if (!sectionId) {
      setError('Debe seleccionar una sección');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dayOfWeek = getDayOfWeek(date);
      const formattedDate = date.toISOString().split('T')[0];

      console.log(
        `[useSchedulesForDay] Obteniendo horarios: sectionId=${sectionId}, date=${formattedDate}, dayOfWeek=${dayOfWeek}`
      );

      // Endpoint para obtener schedules de un día específico
      const response = await api.get(
        `/api/schedules?sectionId=${sectionId}&dayOfWeek=${dayOfWeek}`
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener horarios');
      }

      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setSchedules(data);

      console.log(`[useSchedulesForDay] Obtenidos ${data.length} horarios`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      console.error('[useSchedulesForDay] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
  };
}
