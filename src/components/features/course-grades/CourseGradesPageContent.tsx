// src/components/features/course-grades/CourseGradesPageContent.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { courseGradesService } from '@/services/course-grades.service';
import {
  CourseGradeDetail,
  CourseGradesQuery,
  PaginatedCourseGrades,
} from '@/types/course-grades.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Plus, RefreshCw, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import CourseGradeFilters from './CourseGradeFilters';
import CourseGradesGrid from './CourseGradesGrid';
import CourseGradeForm from './CourseGradeForm';
import DeleteCourseGradeDialog from './DeleteCourseGradeDialog';
import CourseGradeDetailDialog from './CourseGradeDetailDialog';
import CourseGradeStats from './CourseGradeStats';

export default function CourseGradesPageContent() {
  const [data, setData] = useState<PaginatedCourseGrades | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CourseGradesQuery>({
    page: 1,
    limit: 12,
    sortBy: 'courseId',
    sortOrder: 'asc',
  });

  // Modals state
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedCourseGrade, setSelectedCourseGrade] = useState<CourseGradeDetail | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalCourses: 0,
    totalGrades: 0,
    coreAssignments: 0,
    electiveAssignments: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await courseGradesService.getCourseGrades(filters);
      setData(result);
      calculateStats(result.data);
    } catch (error: any) {
      toast.error('Error al cargar asignaciones', {
        description: error.message || 'No se pudieron cargar las asignaciones',
        icon: <XCircle className="w-5 h-5" />,
        duration: 5000,
      });
      setData({ data: [], meta: { page: 1, limit: 12, total: 0, totalPages: 0 } });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const calculateStats = (courseGrades: CourseGradeDetail[]) => {
    const uniqueCourses = new Set(courseGrades.map((cg) => cg.courseId)).size;
    const uniqueGrades = new Set(courseGrades.map((cg) => cg.gradeId)).size;
    const coreCount = courseGrades.filter((cg) => cg.isCore).length;
    const electiveCount = courseGrades.filter((cg) => !cg.isCore).length;

    setStats({
      totalAssignments: courseGrades.length,
      totalCourses: uniqueCourses,
      totalGrades: uniqueGrades,
      coreAssignments: coreCount,
      electiveAssignments: electiveCount,
    });
  };

  const handleFiltersChange = (newFilters: CourseGradesQuery) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'courseId',
      sortOrder: 'asc',
    });
    toast.success('Filtros eliminados', {
      description: 'Mostrando todas las asignaciones',
      icon: <CheckCircle2 className="w-5 h-5" />,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleCreate = () => {
    setSelectedCourseGrade(null);
    setShowForm(true);
    toast.info('Nueva asignación', {
      description: 'Completa el formulario para asignar un curso a un grado',
      icon: <Plus className="w-5 h-5" />,
    });
  };

  const handleEdit = (courseGrade: CourseGradeDetail) => {
    setSelectedCourseGrade(courseGrade);
    setShowForm(true);
  };

  const handleDelete = (courseGrade: CourseGradeDetail) => {
    setSelectedCourseGrade(courseGrade);
    setShowDeleteDialog(true);
  };

  const handleViewDetails = (courseGrade: CourseGradeDetail) => {
    setSelectedCourseGrade(courseGrade);
    setShowDetailDialog(true);
  };

  const handleSuccess = () => {
    loadData();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedCourseGrade(null);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSelectedCourseGrade(null);
  };

  const handleCloseDetailDialog = () => {
    setShowDetailDialog(false);
    setSelectedCourseGrade(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Asignaciones Curso-Grado
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Gestiona las asignaciones de cursos a grados escolares
          </p>
        </div>
        <TooltipProvider>
          <div className="flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={loadData}
                  variant="outline"
                  disabled={loading}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Actualizar
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Recargar todas las asignaciones</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCreate}
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Asignación
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Crear una nueva asignación curso-grado</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Stats */}
      <CourseGradeStats
        totalAssignments={stats.totalAssignments}
        totalCourses={stats.totalCourses}
        totalGrades={stats.totalGrades}
        coreAssignments={stats.coreAssignments}
        electiveAssignments={stats.electiveAssignments}
      />

      {/* Filters */}
      <CourseGradeFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* Loading State */}
      {loading && (
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="flex items-center justify-center py-20 bg-white dark:bg-gray-900">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando asignaciones...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid */}
      {!loading && data && (
        <>
          <CourseGradesGrid
            courseGrades={data.data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />

          {/* Pagination */}
          {data.meta.totalPages > 1 && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardContent className="px-6 py-4 bg-white dark:bg-gray-900">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {(data.meta.page - 1) * data.meta.limit + 1} a{' '}
                    {Math.min(data.meta.page * data.meta.limit, data.meta.total)} de{' '}
                    {data.meta.total} asignaciones
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handlePageChange(data.meta.page - 1)}
                      disabled={data.meta.page === 1}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 dark:border-gray-600"
                    >
                      Anterior
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          const current = data.meta.page;
                          return (
                            page === 1 ||
                            page === data.meta.totalPages ||
                            (page >= current - 1 && page <= current + 1)
                          );
                        })
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 py-2 text-gray-400">...</span>
                            )}
                            <Button
                              onClick={() => handlePageChange(page)}
                              variant={page === data.meta.page ? 'default' : 'outline'}
                              size="sm"
                              className={
                                page === data.meta.page
                                  ? 'bg-indigo-600 hover:bg-indigo-700'
                                  : 'border-gray-300 dark:border-gray-600'
                              }
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))}
                    </div>
                    <Button
                      onClick={() => handlePageChange(data.meta.page + 1)}
                      disabled={data.meta.page === data.meta.totalPages}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 dark:border-gray-600"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modals */}
      {showForm && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl">
            <CourseGradeForm
              courseGrade={selectedCourseGrade}
              onClose={handleCloseForm}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      )}

      {showDeleteDialog && selectedCourseGrade && (
        <DeleteCourseGradeDialog
          courseGrade={selectedCourseGrade}
          open={showDeleteDialog}
          onClose={handleCloseDeleteDialog}
          onSuccess={handleSuccess}
        />
      )}

      {showDetailDialog && selectedCourseGrade && (
        <CourseGradeDetailDialog
          courseGrade={selectedCourseGrade}
          onClose={handleCloseDetailDialog}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
