// src/services/cascade-data.service.ts
import { api } from '@/config/api';
import {
  SchoolCycle,
  Bimester,
  AcademicWeek,
  Grade,
  Course,
  CascadeDataResponse,
} from '@/types/cascade-data.types';
import { CascadeDataError } from '@/utils/cascade-data-error';

export const cascadeDataService = {
  /**
   * Obtener ciclo escolar activo
   * @throws Error si no hay ciclo activo o error en la solicitud
   */
  async getActiveCycle(): Promise<SchoolCycle> {
    const response = await api.get('/api/cascade-data/active-cycle');

    // ✅ VALIDACIÓN
    if (!response.data?.success || !response.data?.data) {
      throw new Error(
        response.data?.message || 'No hay un ciclo escolar activo en el sistema'
      );
    }

    return response.data.data;
  },

  /**
   * Obtener bimestre activo de un ciclo
   * @throws Error si no hay bimestre activo o error en la solicitud
   */
  async getActiveBimester(cycleId: number): Promise<Bimester | null> {
    // ✅ VALIDACIÓN
    if (!cycleId || cycleId <= 0) {
      throw new Error('ID de ciclo inválido');
    }

    const response = await api.get(`/api/cascade-data/active-bimester/${cycleId}`);

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(
        response.data?.message || `No hay bimestre activo para el ciclo ${cycleId}`
      );
    }

    return response.data.data || null;
  },

  /**
   * Obtener semanas de un bimestre
   * @throws Error si hay error en la solicitud
   */
  async getWeeks(bimesterId: number): Promise<AcademicWeek[]> {
    // ✅ VALIDACIÓN
    if (!bimesterId || bimesterId <= 0) {
      throw new Error('ID de bimestre inválido');
    }

    const response = await api.get(`/api/cascade-data/weeks/${bimesterId}`);

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener las semanas académicas'
      );
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener grados de un ciclo
   * @throws Error si hay error en la solicitud
   */
  async getGrades(cycleId: number, includeInactive = false): Promise<Grade[]> {
    // ✅ VALIDACIÓN
    if (!cycleId || cycleId <= 0) {
      throw new Error('ID de ciclo inválido');
    }

    const params = new URLSearchParams();
    if (includeInactive) params.append('includeInactive', 'true');

    const response = await api.get(
      `/api/cascade-data/grades/${cycleId}?${params.toString()}`
    );

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener los grados'
      );
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener cursos de un grado
   * @throws Error si hay error en la solicitud
   */
  async getCourses(gradeId: number, includeInactive = false): Promise<Course[]> {
    // ✅ VALIDACIÓN
    if (!gradeId || gradeId <= 0) {
      throw new Error('ID de grado inválido');
    }

    const params = new URLSearchParams();
    if (includeInactive) params.append('includeInactive', 'true');

    const response = await api.get(
      `/api/cascade-data/courses/${gradeId}?${params.toString()}`
    );

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener los cursos'
      );
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener TODOS los datos en cascada (endpoint principal)
   * Realiza una única solicitud para obtener:
   * - Ciclo escolar activo
   * - Bimestre activo
   * - Semanas académicas
   * - Grados
   * - Secciones por grado (con cursos y docentes asignados)
   *
   * @throws CascadeDataError si no hay ciclo activo o error en la solicitud
   * 
   * Orden de validación: Ciclo → Bimestre → Semanas → Grados
   */
  async getAllCascadeData(includeInactive = false): Promise<CascadeDataResponse> {
    const params = new URLSearchParams();
    if (includeInactive) params.append('includeInactive', 'true');

    const response = await api.get(
      `/api/cascade-data/all?${params.toString()}`
    );

    // ✅ VALIDACIÓN: success debe ser true
    if (!response.data?.success) {
      throw new CascadeDataError(
        response.data?.message || 'Error al obtener los datos en cascada',
        'API_ERROR'
      );
    }

    // ✅ VALIDACIÓN: data debe existir
    if (!response.data?.data) {
      throw new CascadeDataError(
        'No hay datos disponibles en el sistema',
        'API_ERROR'
      );
    }

    const data = response.data.data;

    // ✅ VALIDACIÓN 1: Ciclo escolar activo (PRIMERO)
    if (!data.cycle) {
      throw new CascadeDataError(
        'No hay un ciclo escolar activo en el sistema',
        'NO_ACTIVE_CYCLE'
      );
    }

    // ✅ VALIDACIÓN 2: Bimestre activo (SEGUNDO)
    if (!data.activeBimester) {
      throw new CascadeDataError(
        'No hay un bimestre activo para el ciclo escolar actual',
        'NO_ACTIVE_BIMESTER'
      );
    }

    // ✅ VALIDACIÓN 3: Semanas académicas (TERCERO)
    if (!Array.isArray(data.weeks) || data.weeks.length === 0) {
      throw new CascadeDataError(
        'No hay semanas académicas registradas para este bimestre',
        'NO_WEEKS'
      );
    }

    // ✅ VALIDACIÓN 4: Grados (CUARTO)
    if (!Array.isArray(data.grades) || data.grades.length === 0) {
      throw new CascadeDataError(
        'No hay grados registrados para este ciclo escolar',
        'NO_GRADES'
      );
    }

    // ✅ VALIDACIÓN 5: Estructura de gradesSections (solo validar que exista el objeto)
    // No bloqueamos si las secciones están vacías, el formulario manejará ese caso
    if (!data.gradesSections || typeof data.gradesSections !== 'object') {
      data.gradesSections = {}; // Asegurar que siempre exista
    }

    return data;
  },
};
