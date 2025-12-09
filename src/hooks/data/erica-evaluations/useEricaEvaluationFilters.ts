// hooks/data/erica-evaluations/useEricaEvaluationFilters.ts
import { useState, useCallback, useMemo } from 'react';
import {
  EvaluationFilters,
  EricaDimension,
  EricaState,
} from '@/types/erica-evaluations';

interface FilterState {
  enrollmentId: number | null;
  studentId: number | null;
  courseId: number | null;
  topicId: number | null;
  bimesterId: number | null;
  academicWeekId: number | null;
  sectionId: number | null;
  teacherId: number | null;
  dimension: EricaDimension | null;
  state: EricaState | null;
  startWeek: number | null;
  endWeek: number | null;
  dateFrom: Date | null;
  dateTo: Date | null;
  minPoints: number | null;
  maxPoints: number | null;
  page: number;
  limit: number;
  orderBy: 'createdAt' | 'points' | 'student' | 'dimension';
  orderDirection: 'asc' | 'desc';
}

interface UseFiltersReturn {
  // Current filter state
  filters: FilterState;
  
  // Individual setters
  setEnrollmentId: (id: number | null) => void;
  setStudentId: (id: number | null) => void;
  setCourseId: (id: number | null) => void;
  setTopicId: (id: number | null) => void;
  setBimesterId: (id: number | null) => void;
  setAcademicWeekId: (id: number | null) => void;
  setSectionId: (id: number | null) => void;
  setTeacherId: (id: number | null) => void;
  setDimension: (dimension: EricaDimension | null) => void;
  setState: (state: EricaState | null) => void;
  setWeekRange: (startWeek: number | null, endWeek: number | null) => void;
  setDateRange: (from: Date | null, to: Date | null) => void;
  setPointsRange: (min: number | null, max: number | null) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setOrderBy: (orderBy: FilterState['orderBy']) => void;
  setOrderDirection: (direction: FilterState['orderDirection']) => void;
  
  // Bulk operations
  updateFilters: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  clearPagination: () => void;
  
  // Conversion to API format
  toApiFilters: () => EvaluationFilters;
  
  // State checks
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

const defaultFilters: FilterState = {
  enrollmentId: null,
  studentId: null,
  courseId: null,
  topicId: null,
  bimesterId: null,
  academicWeekId: null,
  sectionId: null,
  teacherId: null,
  dimension: null,
  state: null,
  startWeek: null,
  endWeek: null,
  dateFrom: null,
  dateTo: null,
  minPoints: null,
  maxPoints: null,
  page: 1,
  limit: 50,
  orderBy: 'createdAt',
  orderDirection: 'desc',
};

export function useEricaEvaluationFilters(
  initialFilters?: Partial<FilterState>
): UseFiltersReturn {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  });

  // Individual setters
  const setEnrollmentId = useCallback((id: number | null) => {
    setFilters(prev => ({ ...prev, enrollmentId: id, page: 1 }));
  }, []);

  const setStudentId = useCallback((id: number | null) => {
    setFilters(prev => ({ ...prev, studentId: id, page: 1 }));
  }, []);

  const setCourseId = useCallback((id: number | null) => {
    setFilters(prev => ({ ...prev, courseId: id, page: 1 }));
  }, []);

  const setTopicId = useCallback((id: number | null) => {
    setFilters(prev => ({ ...prev, topicId: id, page: 1 }));
  }, []);

  const setBimesterId = useCallback((id: number | null) => {
    setFilters(prev => ({ ...prev, bimesterId: id, page: 1 }));
  }, []);

  const setAcademicWeekId = useCallback((id: number | null) => {
    setFilters(prev => ({ ...prev, academicWeekId: id, page: 1 }));
  }, []);

  const setSectionId = useCallback((id: number | null) => {
    setFilters(prev => ({ ...prev, sectionId: id, page: 1 }));
  }, []);

  const setTeacherId = useCallback((id: number | null) => {
    setFilters(prev => ({ ...prev, teacherId: id, page: 1 }));
  }, []);

  const setDimension = useCallback((dimension: EricaDimension | null) => {
    setFilters(prev => ({ ...prev, dimension, page: 1 }));
  }, []);

  const setStateFilter = useCallback((state: EricaState | null) => {
    setFilters(prev => ({ ...prev, state, page: 1 }));
  }, []);

  const setWeekRange = useCallback((startWeek: number | null, endWeek: number | null) => {
    setFilters(prev => ({ ...prev, startWeek, endWeek, page: 1 }));
  }, []);

  const setDateRange = useCallback((from: Date | null, to: Date | null) => {
    setFilters(prev => ({ ...prev, dateFrom: from, dateTo: to, page: 1 }));
  }, []);

  const setPointsRange = useCallback((min: number | null, max: number | null) => {
    setFilters(prev => ({ ...prev, minPoints: min, maxPoints: max, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const setOrderBy = useCallback((orderBy: FilterState['orderBy']) => {
    setFilters(prev => ({ ...prev, orderBy }));
  }, []);

  const setOrderDirection = useCallback((orderDirection: FilterState['orderDirection']) => {
    setFilters(prev => ({ ...prev, orderDirection }));
  }, []);

  // Bulk update
  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Clear only pagination
  const clearPagination = useCallback(() => {
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  // Convert to API format (remove nulls)
  const toApiFilters = useCallback((): EvaluationFilters => {
    const apiFilters: EvaluationFilters = {};
    
    if (filters.enrollmentId !== null) apiFilters.enrollmentId = filters.enrollmentId;
    if (filters.studentId !== null) apiFilters.studentId = filters.studentId;
    if (filters.courseId !== null) apiFilters.courseId = filters.courseId;
    if (filters.topicId !== null) apiFilters.topicId = filters.topicId;
    if (filters.bimesterId !== null) apiFilters.bimesterId = filters.bimesterId;
    if (filters.academicWeekId !== null) apiFilters.academicWeekId = filters.academicWeekId;
    if (filters.sectionId !== null) apiFilters.sectionId = filters.sectionId;
    if (filters.teacherId !== null) apiFilters.teacherId = filters.teacherId;
    if (filters.dimension !== null) apiFilters.dimension = filters.dimension;
    if (filters.state !== null) apiFilters.state = filters.state;
    if (filters.startWeek !== null) apiFilters.startWeek = filters.startWeek;
    if (filters.endWeek !== null) apiFilters.endWeek = filters.endWeek;
    if (filters.dateFrom !== null) apiFilters.dateFrom = filters.dateFrom;
    if (filters.dateTo !== null) apiFilters.dateTo = filters.dateTo;
    if (filters.minPoints !== null) apiFilters.minPoints = filters.minPoints;
    if (filters.maxPoints !== null) apiFilters.maxPoints = filters.maxPoints;
    
    apiFilters.page = filters.page;
    apiFilters.limit = filters.limit;
    apiFilters.orderBy = filters.orderBy;
    apiFilters.orderDirection = filters.orderDirection;
    
    return apiFilters;
  }, [filters]);

  // Calculate active filter count (excluding pagination/sorting)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.enrollmentId !== null) count++;
    if (filters.studentId !== null) count++;
    if (filters.courseId !== null) count++;
    if (filters.topicId !== null) count++;
    if (filters.bimesterId !== null) count++;
    if (filters.academicWeekId !== null) count++;
    if (filters.sectionId !== null) count++;
    if (filters.teacherId !== null) count++;
    if (filters.dimension !== null) count++;
    if (filters.state !== null) count++;
    if (filters.startWeek !== null || filters.endWeek !== null) count++;
    if (filters.dateFrom !== null || filters.dateTo !== null) count++;
    if (filters.minPoints !== null || filters.maxPoints !== null) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    
    // Individual setters
    setEnrollmentId,
    setStudentId,
    setCourseId,
    setTopicId,
    setBimesterId,
    setAcademicWeekId,
    setSectionId,
    setTeacherId,
    setDimension,
    setState: setStateFilter,
    setWeekRange,
    setDateRange,
    setPointsRange,
    setPage,
    setLimit,
    setOrderBy,
    setOrderDirection,
    
    // Bulk operations
    updateFilters,
    resetFilters,
    clearPagination,
    
    // Conversion
    toApiFilters,
    
    // State checks
    hasActiveFilters,
    activeFilterCount,
  };
}

export default useEricaEvaluationFilters;
