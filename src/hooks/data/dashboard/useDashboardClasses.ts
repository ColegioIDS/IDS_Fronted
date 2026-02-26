import { useState, useEffect, useMemo } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import {
  AllClassesResponse,
  ScheduleGridResponse,
  ScheduleWeeklyResponse,
  AttendanceReportParams,
  AttendanceReportResponse,
  TeacherProfileResponse,
} from '@/types/dashboard.types';

interface UseDashboardClassesState {
  classes: AllClassesResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UseDashboardClassesState = {
  classes: null,
  isLoading: true,
  error: null,
};

/**
 * Hook para obtener todas las clases del docente
 */
export function useDashboardClasses() {
  const [state, setState] = useState<UseDashboardClassesState>(initialState);

  useEffect(() => {
    (async () => {
      try {
        setState({ classes: null, isLoading: true, error: null });
        const data = await dashboardService.getAllClasses();
        setState({ classes: data, isLoading: false, error: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setState({ classes: null, isLoading: false, error: errorMessage });
        console.error('Error en useDashboardClasses:', error);
      }
    })();
  }, []);

  return state;
}

/**
 * Hook para obtener las clases de hoy
 */
export function useTodayClasses() {
  const [state, setState] = useState<UseDashboardClassesState>(initialState);

  useEffect(() => {
    (async () => {
      try {
        setState({ classes: null, isLoading: true, error: null });
        const data = await dashboardService.getTodayClasses();
        setState({ classes: data as any, isLoading: false, error: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setState({ classes: null, isLoading: false, error: errorMessage });
        console.error('Error en useTodayClasses:', error);
      }
    })();
  }, []);

  return state;
}

/**
 * Hook para obtener el horario en formato grid
 */
export function useScheduleGrid() {
  const [schedule, setSchedule] = useState<ScheduleGridResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await dashboardService.getScheduleGrid();
        setSchedule(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Error en useScheduleGrid:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { schedule, isLoading, error };
}

/**
 * Hook para obtener el horario en formato semanal
 */
export function useScheduleWeekly() {
  const [schedule, setSchedule] = useState<ScheduleWeeklyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await dashboardService.getScheduleWeekly();
        setSchedule(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Error en useScheduleWeekly:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { schedule, isLoading, error };
}

/**
 * Hook para obtener reporte de asistencia (Daily, Weekly, Bimestral)
 */
export function useAttendanceReport(params: AttendanceReportParams) {
  const [report, setReport] = useState<AttendanceReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize params to a stable string key to avoid mutation issues
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await dashboardService.getAttendanceReport(params);
        setReport(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Error en useAttendanceReport:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [paramsKey]);

  return { report, isLoading, error };
}

/**
 * Hook para obtener reporte diario
 */
export function useDailyAttendanceReport() {
  return useAttendanceReport({
    type: 'daily',
    includeJustifications: true,
  });
}

/**
 * Hook para obtener reporte semanal
 */
export function useWeeklyAttendanceReport() {
  return useAttendanceReport({
    type: 'weekly',
  });
}

/**
 * Hook para obtener reporte bimestral
 */
export function useBimestralAttendanceReport() {
  return useAttendanceReport({
    type: 'bimestral',
    includeRiskDetection: true,
  });
}

/**
 * Hook para obtener perfil del docente
 */
export function useTeacherProfile() {
  const [profile, setProfile] = useState<TeacherProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await dashboardService.getTeacherProfile();
        setProfile(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Error en useTeacherProfile:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { profile, isLoading, error };
}
