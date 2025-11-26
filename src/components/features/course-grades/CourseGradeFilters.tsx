// src/components/features/course-grades/CourseGradeFilters.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { CourseGradesQuery, AvailableCourse, AvailableGrade } from '@/types/course-grades.types';
import { courseGradesService } from '@/services/course-grades.service';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Filter, X, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CourseGradeFiltersProps {
  filters: CourseGradesQuery;
  onFiltersChange: (filters: CourseGradesQuery) => void;
  onReset: () => void;
}

export default function CourseGradeFilters({
  filters,
  onFiltersChange,
  onReset,
}: CourseGradeFiltersProps) {
  const [courses, setCourses] = useState<AvailableCourse[]>([]);
  const [grades, setGrades] = useState<AvailableGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAvailableData();
  }, []);

  const loadAvailableData = async () => {
    setLoading(true);
    try {
      const [coursesData, gradesData] = await Promise.all([
        courseGradesService.getAvailableCourses(),
        courseGradesService.getAvailableGrades(),
      ]);
      setCourses(coursesData);
      setGrades(gradesData);
    } catch (error: any) {
      toast.error('Error al cargar datos', {
        description: error.message || 'No se pudieron cargar cursos y grados',
        icon: <XCircle className="w-5 h-5" />,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof CourseGradesQuery, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const hasActiveFilters = 
    filters.courseId || 
    filters.gradeId || 
    filters.isCore !== undefined;

  return (
    <TooltipProvider>
      <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Header */}
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 shadow-sm">
                <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Filtros de Búsqueda
              </h3>
              {hasActiveFilters && (
                <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {Object.keys(filters).filter(k => filters[k as keyof CourseGradesQuery]).length} activos
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onReset}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpiar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                    <p className="font-semibold">Eliminar todos los filtros</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {showFilters ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Mostrar
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">{showFilters ? 'Ocultar' : 'Mostrar'} opciones de filtrado</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

      {/* Filters Content */}
      {showFilters && (
        <CardContent className="p-6 bg-white dark:bg-gray-900">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Course Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Curso
              </label>
              <select
                value={filters.courseId || ''}
                onChange={(e) =>
                  handleChange('courseId', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                <option value="">Todos los cursos</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    [{course.code}] {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Grado
              </label>
              <select
                value={filters.gradeId || ''}
                onChange={(e) =>
                  handleChange('gradeId', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                <option value="">Todos los grados</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name} ({grade.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de Curso
              </label>
              <select
                value={filters.isCore === undefined ? '' : filters.isCore.toString()}
                onChange={(e) =>
                  handleChange(
                    'isCore',
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Todos</option>
                <option value="true">Núcleo</option>
                <option value="false">Electivo</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ordenar por
              </label>
              <select
                value={filters.sortBy || 'courseId'}
                onChange={(e) =>
                  handleChange('sortBy', e.target.value as CourseGradesQuery['sortBy'])
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="courseId">Curso</option>
                <option value="gradeId">Grado</option>
                <option value="isCore">Tipo</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtros activos:</span>
              {filters.courseId && (
                <Badge className="bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                  Curso: {courses.find(c => c.id === filters.courseId)?.name}
                </Badge>
              )}
              {filters.gradeId && (
                <Badge className="bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                  Grado: {grades.find(g => g.id === filters.gradeId)?.name}
                </Badge>
              )}
              {filters.isCore !== undefined && (
                <Badge className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                  Tipo: {filters.isCore ? 'Núcleo' : 'Electivo'}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  </TooltipProvider>
  );
}
