/**
 * ====================================================================
 * USE ATTENDANCE FILTERS - Hook para búsqueda, filtrado y paginación
 * ====================================================================
 *
 * Hook para gestionar:
 * • Búsqueda de estudiantes (debounced)
 * • Filtros por estado, fecha, sección
 * • Paginación y sorting
 */

'use client';

import { useState, useCallback } from 'react';
import { Enrollment } from '@/types/attendance.types';
import {
  ATTENDANCE_PAGINATION,
} from '@/constants/attendance.constants';

/**
 * Criterios de filtro
 */
export interface FilterCriteria {
  searchTerm: string;
  statusFilter: string[];
  dateFromFilter?: string;
  dateToFilter?: string;
  sectionFilter?: number;
  sortBy: 'name' | 'percentage' | 'status';
  sortOrder: 'asc' | 'desc';
}

/**
 * Estado de filtros
 */
export interface FilterState {
  filters: FilterCriteria;
  filteredStudents: Enrollment[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  isSearching: boolean;
}

/**
 * Acciones de filtros
 */
export interface FilterActions {
  setSearchTerm: (term: string) => void;
  setStatusFilter: (statuses: string[]) => void;
  setDateRange: (from?: string, to?: string) => void;
  setSectionFilter: (sectionId?: number) => void;
  setSortBy: (field: 'name' | 'percentage' | 'status', order: 'asc' | 'desc') => void;
  setPagination: (page: number, pageSize?: number) => void;
  applyFilters: (students: Enrollment[]) => void;
  resetFilters: () => void;
}

/**
 * Hook para filtros y búsqueda
 */
export function useAttendanceFilters(): [FilterState, FilterActions] {
  const [state, setState] = useState<FilterState>({
    filters: {
      searchTerm: '',
      statusFilter: [],
      dateFromFilter: undefined,
      dateToFilter: undefined,
      sectionFilter: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
    },
    filteredStudents: [],
    currentPage: 1,
    pageSize: ATTENDANCE_PAGINATION.STUDENTS_PER_PAGE || 20,
    totalItems: 0,
    totalPages: 0,
    isSearching: false,
  });

  /**
   * Establece término de búsqueda
   */
  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, searchTerm: term },
      currentPage: 1,
      isSearching: true,
    }));
  }, []);

  /**
   * Establece filtro de estados
   */
  const setStatusFilter = useCallback((statuses: string[]) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, statusFilter: statuses },
      currentPage: 1,
    }));
  }, []);

  /**
   * Establece rango de fechas
   */
  const setDateRange = useCallback((from?: string, to?: string) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        dateFromFilter: from,
        dateToFilter: to,
      },
      currentPage: 1,
    }));
  }, []);

  /**
   * Establece filtro de sección
   */
  const setSectionFilter = useCallback((sectionId?: number) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, sectionFilter: sectionId },
      currentPage: 1,
    }));
  }, []);

  /**
   * Establece sorting
   */
  const setSortBy = useCallback((field: 'name' | 'percentage' | 'status', order: 'asc' | 'desc') => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, sortBy: field, sortOrder: order },
    }));
  }, []);

  /**
   * Establece paginación
   */
  const setPagination = useCallback((page: number, pageSize?: number) => {
    setState(prev => ({
      ...prev,
      currentPage: Math.max(1, page),
      pageSize: pageSize || prev.pageSize,
    }));
  }, []);

  /**
   * Aplica todos los filtros a una lista de estudiantes
   */
  const applyFilters = useCallback((students: Enrollment[]) => {
    let filtered = [...students];

    // Aplicar búsqueda
    if (state.filters.searchTerm) {
      const term = state.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.studentName.toLowerCase().includes(term) ||
        s.studentEmail.toLowerCase().includes(term)
      );
    }

    // Aplicar filtro de sección
    if (state.filters.sectionFilter) {
      filtered = filtered.filter(s => s.sectionId === state.filters.sectionFilter);
    }

    // Aplicar sorting
    if (state.filters.sortBy === 'name') {
      filtered.sort((a, b) => {
        const comparison = a.studentName.localeCompare(b.studentName);
        return state.filters.sortOrder === 'asc' ? comparison : -comparison;
      });
    } else if (state.filters.sortBy === 'percentage') {
      // Note: percentage field not in Enrollment, would need StudentAttendance
      // Placeholder for future implementation
    } else if (state.filters.sortBy === 'status') {
      filtered.sort((a, b) => {
        const aStatus = a.status || '';
        const bStatus = b.status || '';
        return state.filters.sortOrder === 'asc'
          ? aStatus.localeCompare(bStatus)
          : bStatus.localeCompare(aStatus);
      });
    }

    // Calcular paginación
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / state.pageSize);
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    const paginatedItems = filtered.slice(startIndex, endIndex);

    setState(prev => ({
      ...prev,
      filteredStudents: paginatedItems,
      totalItems,
      totalPages: Math.max(1, totalPages),
      isSearching: false,
    }));
  }, [state.filters, state.currentPage, state.pageSize]);

  /**
   * Reinicia todos los filtros
   */
  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        searchTerm: '',
        statusFilter: [],
        dateFromFilter: undefined,
        dateToFilter: undefined,
        sectionFilter: undefined,
        sortBy: 'name',
        sortOrder: 'asc',
      },
      currentPage: 1,
      filteredStudents: [],
      totalItems: 0,
      totalPages: 0,
      isSearching: false,
    }));
  }, []);

  const actions: FilterActions = {
    setSearchTerm,
    setStatusFilter,
    setDateRange,
    setSectionFilter,
    setSortBy,
    setPagination,
    applyFilters,
    resetFilters,
  };

  return [state, actions];
}