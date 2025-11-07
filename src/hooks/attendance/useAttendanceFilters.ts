// src/hooks/attendance/useAttendanceFilters.ts

'use client';

import { useState, useCallback, useMemo } from 'react';
import { AttendanceQuery, AttendanceStatusCode } from '@/types/attendance.types';

interface FilterState {
  dateFrom?: string;
  dateTo?: string;
  statusCode?: AttendanceStatusCode;
  sectionId?: number;
  courseId?: number;
  search?: string;
  hasJustification?: boolean;
  sortBy?: 'date' | 'studentName' | 'status' | 'recordedAt';
  sortOrder?: 'asc' | 'desc';
}

const initialFilters: FilterState = {
  dateFrom: undefined,
  dateTo: undefined,
  statusCode: undefined,
  sectionId: undefined,
  courseId: undefined,
  search: undefined,
  hasJustification: undefined,
  sortBy: 'date',
  sortOrder: 'desc',
};

export const useAttendanceFilters = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  /**
   * Establecer un filtro individual
   */
  const setFilter = useCallback(
    (key: keyof FilterState, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  /**
   * Actualizar múltiples filtros
   */
  const setMultipleFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  /**
   * Establecer rango de fechas
   */
  const setDateRange = useCallback((dateFrom?: string, dateTo?: string) => {
    setFilters((prev) => ({
      ...prev,
      dateFrom,
      dateTo,
    }));
  }, []);

  /**
   * Establecer ordenamiento
   */
  const setSorting = useCallback(
    (sortBy?: 'date' | 'studentName' | 'status' | 'recordedAt', sortOrder?: 'asc' | 'desc') => {
      setFilters((prev) => ({
        ...prev,
        sortBy: sortBy || prev.sortBy,
        sortOrder: sortOrder || prev.sortOrder,
      }));
    },
    []
  );

  /**
   * Limpiar todos los filtros
   */
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  /**
   * Limpiar un filtro específico
   */
  const clearFilter = useCallback((key: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [key]: initialFilters[key],
    }));
  }, []);

  /**
   * Obtener query string de filtros
   */
  const getQueryParams = useCallback((): AttendanceQuery => {
    return {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      statusCode: filters.statusCode,
      sectionId: filters.sectionId,
      courseId: filters.courseId,
      search: filters.search,
      hasJustification: filters.hasJustification,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
  }, [filters]);

  /**
   * Verificar si hay filtros activos
   */
  const hasActiveFilters = useMemo(() => {
    const query = getQueryParams();
    return Object.values(query).some((value) => value !== undefined);
  }, [getQueryParams]);

  /**
   * Obtener descripción de filtros activos
   */
  const getFilterDescription = useMemo(() => {
    const descriptions: string[] = [];

    if (filters.search) descriptions.push(`Búsqueda: "${filters.search}"`);
    if (filters.statusCode) descriptions.push(`Estado: ${filters.statusCode}`);
    if (filters.sectionId) descriptions.push(`Sección: ${filters.sectionId}`);
    if (filters.dateFrom) descriptions.push(`Desde: ${filters.dateFrom}`);
    if (filters.dateTo) descriptions.push(`Hasta: ${filters.dateTo}`);
    if (filters.hasJustification !== undefined)
      descriptions.push(`Con justificante: ${filters.hasJustification ? 'Sí' : 'No'}`);

    return descriptions.join(' | ');
  }, [filters]);

  return {
    filters,
    setFilter,
    setMultipleFilters,
    setDateRange,
    setSorting,
    clearFilters,
    clearFilter,
    getQueryParams,
    hasActiveFilters,
    getFilterDescription,
  };
};
