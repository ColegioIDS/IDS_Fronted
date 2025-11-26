// src/hooks/data/useCourses.ts
import { useState, useEffect, useCallback } from 'react';
import { coursesService } from '@/services/courses.service';
import { Course, CourseFilters, PaginatedCourses } from '@/types/courses';

interface CoursesQuery extends CourseFilters {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'code' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export function useCourses(initialQuery: CoursesQuery = {}) {
  const [data, setData] = useState<PaginatedCourses | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<CoursesQuery>(initialQuery);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await coursesService.getCourses({
          page: query.page,
          limit: query.limit,
          searchQuery: query.searchQuery,
          isActive: query.isActive,
          area: query.area,
          gradeId: query.gradeId,
        });

        if (isMounted) {
          setData(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error al cargar cursos');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, [
    query.page,
    query.limit,
    query.searchQuery,
    query.isActive,
    query.area,
    query.gradeId,
    query.sortBy,
    query.sortOrder,
    refreshKey,
  ]);

  const updateQuery = useCallback((newQuery: Partial<CoursesQuery>) => {
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
    updateQuery,
    refresh,
  };
}
