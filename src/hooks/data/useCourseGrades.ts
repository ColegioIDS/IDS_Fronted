// src/hooks/data/useCourseGrades.ts
import { useState, useEffect, useCallback } from 'react';
import { courseGradesService } from '@/services/courseGrades.service';
import {
  CourseGradeWithRelations,
  CourseGradeFilters,
  PaginatedCourseGrades,
  Grade,
  CourseForGrade,
} from '@/types/courseGrades';

interface UseCourseGradesReturn {
  data: PaginatedCourseGrades | null;
  isLoading: boolean;
  error: string | null;
  query: CourseGradeFilters;
  grades: Grade[];
  courses: CourseForGrade[];
  updateQuery: (newQuery: Partial<CourseGradeFilters>) => void;
  refresh: () => void;
  loadAvailableData: () => Promise<void>;
}

export function useCourseGrades(
  initialQuery: CourseGradeFilters & { page?: number; limit?: number } = {}
): UseCourseGradesReturn {
  const [data, setData] = useState<PaginatedCourseGrades | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<CourseGradeFilters>(initialQuery);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<CourseForGrade[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Cargar datos
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await courseGradesService.getCourseGrades({
          ...query,
          page: initialQuery.page || 1,
          limit: initialQuery.limit || 12,
        });

        if (isMounted) {
          setData(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error al cargar las relaciones');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [
    query.courseId,
    query.gradeId,
    query.isCore,
    query.searchQuery,
    refreshKey,
  ]);

  // Cargar datos disponibles (grados y cursos)
  const loadAvailableData = useCallback(async () => {
    try {
      const [gradesData, coursesData] = await Promise.all([
        courseGradesService.getAvailableGrades(),
        courseGradesService.getAvailableCourses(),
      ]);

      setGrades(gradesData);
      setCourses(coursesData);
    } catch (err: any) {
    }
  }, []);

  // Cargar datos disponibles al iniciar
  useEffect(() => {
    loadAvailableData();
  }, [loadAvailableData]);

  const updateQuery = useCallback((newQuery: Partial<CourseGradeFilters>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    data,
    isLoading,
    error,
    query,
    grades,
    courses,
    updateQuery,
    refresh,
    loadAvailableData,
  };
}
