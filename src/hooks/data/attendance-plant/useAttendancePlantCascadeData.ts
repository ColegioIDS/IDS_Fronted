/**
 * ====================================================================
 * useAttendancePlantCascadeData - Hook para datos en cascada
 * ====================================================================
 * 
 * Hook que obtiene los datos en cascada para attendance-plant
 * Determina automáticamente el ciclo actual, bimestre y semana
 */

import { useState, useEffect } from 'react';
import { getCascadeData } from '@/services/attendance-plant.service';
import type { AttendancePlantCascadeData } from '@/types/attendance-plant.types';

interface ProcessedCascadeData {
  cycle: AttendancePlantCascadeData['cycle'];
  activeBimester: AttendancePlantCascadeData['activeBimester'];
  weeks: AttendancePlantCascadeData['weeks'];
  grades: AttendancePlantCascadeData['grades'];
  sections: Array<{ id: number; name: string; gradeId: number }>;
}

interface CascadeState {
  data: ProcessedCascadeData | null;
  isLoading: boolean;
  error: string | null;
  currentBimester: AttendancePlantCascadeData['activeBimester'] | null;
  currentWeek: AttendancePlantCascadeData['weeks'][0] | null;
}

export function useAttendancePlantCascadeData() {
  const [state, setState] = useState<CascadeState>({
    data: null,
    isLoading: true,
    error: null,
    currentBimester: null,
    currentWeek: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const cascadeData = await getCascadeData(false);

        // Procesar datos: convertir gradesSections en un array plano de sections
        const allSections = Object.entries(cascadeData.gradesSections).flatMap(
          ([gradeId, sections]) =>
            sections.map((section) => ({
              id: section.id,
              name: section.name,
              gradeId: parseInt(gradeId, 10),
            }))
        );

        // Determinar semana actual (por fecha)
        const currentWeek = getCurrentOrNextWeek(cascadeData.weeks);

        const processedData: ProcessedCascadeData = {
          cycle: cascadeData.cycle,
          activeBimester: cascadeData.activeBimester,
          weeks: cascadeData.weeks,
          grades: cascadeData.grades,
          sections: allSections,
        };

        setState({
          data: processedData,
          isLoading: false,
          error: null,
          currentBimester: cascadeData.activeBimester,
          currentWeek: currentWeek || null,
        });
      } catch (error) {
        console.error('Error loading cascade data:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Error al cargar datos en cascada',
        }));
      }
    };

    loadData();
  }, []);

  return state;
}

/**
 * Obtener la semana más reciente que ya pasó o la próxima si aún no empieza ninguna
 */
function getCurrentOrNextWeek(weeks: AttendancePlantCascadeData['weeks']) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar a medianoche

  // Buscar semana actual (la que contiene hoy)
  const currentWeek = weeks.find((w) => {
    const startDate = new Date(w.startDate);
    const endDate = new Date(w.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return today >= startDate && today <= endDate;
  });

  if (currentWeek) {
    return currentWeek;
  }

  // Si no hay semana actual, buscar la última semana que pasó
  const pastWeeks = weeks.filter((w) => {
    const endDate = new Date(w.endDate);
    endDate.setHours(0, 0, 0, 0);
    return today > endDate;
  });

  if (pastWeeks.length > 0) {
    return pastWeeks[pastWeeks.length - 1]; // La última semana que pasó
  }

  // Si no hay semana pasada, devolver la próxima
  return weeks[0];
}
