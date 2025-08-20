'use client';

import { CourseCard } from './CourseCard';
import { CourseTableRow } from './CourseTableRow';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Course } from '@/types/courses';

interface CoursesListProps {
  viewMode: 'grid' | 'list';
  loading?: boolean;
  courses?: Course[];
  error?: string | null;
  onRetry?: () => void;
}

export function CoursesList({ 
  viewMode, 
  loading = false, 
  courses = [], 
  error = null,
  onRetry 
}: CoursesListProps) {

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
        <span className="ml-3 text-gray-600 dark:text-gray-300 font-medium">
          Cargando cursos...
        </span>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Card className="p-8 text-center border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error al cargar los cursos</span>
          </div>
          <div className="text-red-700 dark:text-red-300 text-sm max-w-md">
            {error}
          </div>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm"
              className="mt-2 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Estado vacío
  if (courses.length === 0) {
    return (
      <Card className="p-12 text-center border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-gray-400 dark:text-gray-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
              />
            </svg>
          </div>
          <div className="space-y-2">
            <div className="text-gray-600 dark:text-gray-300 font-medium">
              No se encontraron cursos
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm max-w-md">
              No hay cursos que coincidan con los criterios de búsqueda actuales. 
              Intenta ajustar los filtros o crear un nuevo curso.
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Vista en Grid
  if (viewMode === 'grid') {
    return (
      <div className="space-y-4">
        {/* Indicador de resultados para grid */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {courses.length} curso{courses.length !== 1 ? 's' : ''}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
            />
          ))}
        </div>
      </div>
    );
  }

  // Vista en Lista (Tabla)
  return (
    <div className="space-y-4">
      {/* Indicador de resultados para tabla */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando {courses.length} curso{courses.length !== 1 ? 's' : ''}
      </div>
      
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg dark:bg-gray-800/60 dark:shadow-gray-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                  Curso
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                  Área
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                  Grados
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                  Estado
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course, index) => (
                <CourseTableRow 
                  key={course.id} 
                  course={course}
                  className={
                    index % 2 === 0 
                      ? 'bg-white/30 dark:bg-gray-800/30' 
                      : 'bg-white/10 dark:bg-gray-700/20'
                  }
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}