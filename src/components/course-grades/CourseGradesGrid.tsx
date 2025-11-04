// src/components/course-grades/CourseGradesGrid.tsx
'use client';

import { CourseGradeCard } from './CourseGradeCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertCircle, Search, BookOpen } from 'lucide-react';
import { CourseGradeWithRelations } from '@/types/courseGrades';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseGradesGridProps {
  courseGrades: CourseGradeWithRelations[];
  isLoading: boolean;
  error?: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onUpdate: () => void;
}

export function CourseGradesGrid({
  courseGrades,
  isLoading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  hasActiveFilters,
  onClearFilters,
  onUpdate,
}: CourseGradesGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-96 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">Error</h3>
        <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
        <Button onClick={onUpdate}>Reintentar</Button>
      </div>
    );
  }

  if (courseGrades.length === 0) {
    if (hasActiveFilters) {
      return (
        <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10 p-6 text-center">
          <Search className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Sin resultados</h3>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            No se encontraron asignaciones que coincidan con los filtros
          </p>
          <Button onClick={onClearFilters}>Limpiar filtros</Button>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-6 text-center">
        <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Sin asignaciones</h3>
        <p className="text-gray-600 dark:text-gray-400">
          No hay asignaciones de curso-grado creadas aún
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseGrades.map((cg) => (
          <CourseGradeCard key={cg.id} courseGrade={cg} onUpdate={onUpdate} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="gap-2"
          >
            ⟨⟨
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="gap-2"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="gap-2"
          >
            ⟩⟩
          </Button>
        </div>
      )}
    </div>
  );
}
