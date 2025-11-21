// src/components/features/courses/CoursesGrid.tsx
'use client';

import { Course } from '@/types/courses';
import { CourseCard } from './CourseCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState, EmptySearchResults } from '@/components/shared/feedback/EmptyState';
import { BookOpen } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CoursesGridProps {
  courses: (Course & { _count?: { schedules: number; students: number } })[];
  isLoading: boolean;
  error: string | null;
  currentPage?: number;
  totalPages?: number;
  totalResults?: number;
  onPageChange?: (page: number) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onUpdate?: () => void;
  onEdit?: (courseId: number) => void;
}

export function CoursesGrid({
  courses,
  isLoading,
  error,
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  onPageChange = () => {},
  hasActiveFilters = false,
  onClearFilters,
  onUpdate,
  onEdit,
}: CoursesGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        variant="error"
        icon={
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        title="Error al cargar cursos"
        description={error}
      />
    );
  }

  // Empty state - no filters
  if (courses.length === 0 && !hasActiveFilters) {
    return (
      <EmptyState
        variant="default"
        icon={<BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-500" strokeWidth={2} />}
        title="No hay cursos"
        description="Comienza creando un nuevo curso para gestionar tus asignaturas"
      />
    );
  }

  // Empty state - with filters
  if (courses.length === 0 && hasActiveFilters) {
    return (
      <EmptySearchResults onClearFilters={onClearFilters} />
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onUpdate={onUpdate}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <TooltipProvider>
          <div className="flex items-center justify-center gap-2 pt-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Ir a la primera página</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Página anterior</p>
              </TooltipContent>
            </Tooltip>

            <div className="flex items-center gap-2 px-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Página {currentPage} de {totalPages}
              </span>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Página siguiente</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Ir a la última página</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )}

      {/* Info footer */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2">
        Mostrando {courses.length} de {totalResults} cursos
      </div>
    </div>
  );
}
