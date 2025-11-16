'use client';

import { useState, useEffect } from 'react';
import { useEnrollments } from '@/hooks/data/useEnrollments';
import { useCycles } from '@/hooks/data/useCycles';
import { useEnrollmentGrades } from '@/hooks/data/useEnrollmentGrades';
import { useEnrollmentSections } from '@/hooks/data/useEnrollmentSections';
import { EnrollmentTable } from './EnrollmentTable';
import { EnrollmentFilters } from './EnrollmentFilters';
import { EnrollmentStatistics } from './EnrollmentStatistics';
import { EnrollmentDetailDialog } from './EnrollmentDetailDialog';
import { EnrollmentStatusDialog } from './EnrollmentStatusDialog';
import { EnrollmentTransferDialog } from './EnrollmentTransferDialog';
import { useEnrollmentDetail } from '@/hooks/data/useEnrollmentDetail';
import { useEnrollmentStatistics } from '@/hooks/data/useEnrollmentStatistics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  Download,
  Plus,
  FileText,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Loader2,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  GraduationCap,
} from 'lucide-react';
import { enrollmentsService } from '@/services/enrollments.service';
import { EnrollmentResponse } from '@/types/enrollments.types';

export const EnrollmentsPageContent = () => {
  // Hooks principales
  const { enrollments, loading, pagination, fetchEnrollments, refetch } = useEnrollments();
  const { enrollment, fetchDetail } = useEnrollmentDetail();
  const { statistics, fetchStatistics } = useEnrollmentStatistics();
  const { cycles, loading: cyclesLoading } = useCycles();
  const { grades, loading: gradesLoading, refetch: refetchGrades } = useEnrollmentGrades();
  const { sections, loading: sectionsLoading, refetch: refetchSections } = useEnrollmentSections();

  // Estados de diálogos
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentResponse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Estado de ciclo seleccionado
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);

  // Cargar estadísticas y grados cuando hay ciclo seleccionado
  useEffect(() => {
    if (selectedCycleId) {
      fetchStatistics(selectedCycleId);
      refetchGrades(selectedCycleId);
      // Resetear grado y secciones cuando cambia el ciclo
      setSelectedGradeId(null);
    }
  }, [selectedCycleId, fetchStatistics, refetchGrades]);

  // Cargar secciones cuando hay ciclo y grado seleccionado
  useEffect(() => {
    if (selectedCycleId && selectedGradeId) {
      refetchSections(selectedCycleId, selectedGradeId);
    }
  }, [selectedCycleId, selectedGradeId, refetchSections]);

  // Handlers de acciones
  const handleView = async (enrollment: EnrollmentResponse) => {
    setSelectedEnrollment(enrollment);
    await fetchDetail(enrollment.id);
    setDetailOpen(true);
  };

  const handleStatusChange = (enrollment: EnrollmentResponse) => {
    setSelectedEnrollment(enrollment);
    setStatusDialogOpen(true);
  };

  const handleTransfer = (enrollment: EnrollmentResponse) => {
    setSelectedEnrollment(enrollment);
    setTransferDialogOpen(true);
  };

  const handleStatusSubmit = async (status: string, reason: string, notes?: string) => {
    if (!selectedEnrollment) return;

    const statusToast = toast.loading('Actualizando estado...', {
      description: 'Procesando el cambio de estado de la matrícula',
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
    });

    try {
      setActionLoading(true);
      await enrollmentsService.updateEnrollmentStatus(selectedEnrollment.id, {
        status,
        reason,
        notes,
      });
      await refetch();

      toast.success('Estado actualizado exitosamente', {
        id: statusToast,
        description: `La matrícula de ${selectedEnrollment.student.givenNames} fue actualizada`,
        icon: <CheckCircle className="w-5 h-5" />,
        duration: 4000,
      });

      setStatusDialogOpen(false);
    } catch (error: any) {
      toast.error('Error al actualizar estado', {
        id: statusToast,
        description: error.message || 'No se pudo actualizar el estado. Intente nuevamente.',
        icon: <XCircle className="w-5 h-5" />,
        duration: 5000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransferSubmit = async (
    newGradeId: number,
    newSectionId: number,
    reason: string,
    notes?: string
  ) => {
    if (!selectedEnrollment) return;

    const transferToast = toast.loading('Transfiriendo estudiante...', {
      description: 'Procesando la transferencia de sección/grado',
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
    });

    try {
      setActionLoading(true);
      await enrollmentsService.transferStudent(selectedEnrollment.id, {
        newGradeId,
        newSectionId,
        reason,
        notes,
      });
      await refetch();

      toast.success('Transferencia exitosa', {
        id: transferToast,
        description: `${selectedEnrollment.student.givenNames} fue transferido correctamente`,
        icon: <CheckCircle className="w-5 h-5" />,
        duration: 4000,
      });

      setTransferDialogOpen(false);
    } catch (error: any) {
      toast.error('Error en la transferencia', {
        id: transferToast,
        description: error.message || 'No se pudo completar la transferencia. Intente nuevamente.',
        icon: <XCircle className="w-5 h-5" />,
        duration: 5000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    const exportToast = toast.loading('Generando archivo Excel...', {
      description: 'Exportando todas las matrículas',
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
    });

    try {
      setActionLoading(true);
      const blob = await enrollmentsService.exportToExcel({});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `matrículas_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Archivo exportado exitosamente', {
        id: exportToast,
        description: `Descargando: ${filename}`,
        icon: <FileSpreadsheet className="w-5 h-5" />,
        duration: 4000,
      });
    } catch (error: any) {
      toast.error('Error al exportar', {
        id: exportToast,
        description: error.message || 'No se pudo generar el archivo Excel. Intente nuevamente.',
        icon: <XCircle className="w-5 h-5" />,
        duration: 5000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchEnrollments({ page });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
              <GraduationCap className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Matrículas</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1 text-base">
                Gestión de inscripciones y estudiantes
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={loading || actionLoading}
                  className="border-2 shadow-sm hover:shadow-md transition-all"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                  )}
                  Exportar
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Exportar matrículas a Excel</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Estadísticas */}
        {selectedCycleId && (
          <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b-2 border-slate-200 dark:border-slate-800">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Estadísticas Generales
              </CardTitle>
              <CardDescription className="text-base">
                Resumen de matrículas y ocupación para el ciclo seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <EnrollmentStatistics statistics={statistics} loading={loading} />
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card className="sticky top-0 z-30 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-neutral-900/95 supports-[backdrop-filter]:backdrop-blur-lg shadow-lg">
          <CardContent className="pt-6 pb-6">
            <EnrollmentFilters
              onFiltersChange={fetchEnrollments}
              onCycleChange={setSelectedCycleId}
              onGradeChange={setSelectedGradeId}
              loading={loading}
              cycles={cycles}
              grades={grades}
              sections={sections}
            />
          </CardContent>
        </Card>

        {/* Tabla */}
        {!selectedCycleId ? (
          <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="pt-16 pb-16">
              <div className="flex flex-col items-center justify-center text-center gap-5">
                <div className="p-6 rounded-2xl bg-blue-100 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800">
                  <BookOpen className="h-20 w-20 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Selecciona un ciclo escolar
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md text-base">
                    Elige un ciclo en los filtros anteriores para ver las matrículas disponibles
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b-2 border-slate-200 dark:border-slate-800">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Lista de Matrículas
              </CardTitle>
              <CardDescription className="text-base">
                Mostrando {enrollments.length} de {pagination.total} matrículas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
            <EnrollmentTable
              enrollments={enrollments}
              loading={loading}
              onView={handleView}
              onStatusChange={handleStatusChange}
              onTransfer={handleTransfer}
            />

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="p-6 border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1 || loading}
                        className="border-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">Página anterior</p>
                    </TooltipContent>
                  </Tooltip>

                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, idx) => {
                      const pageNum = Math.max(1, pagination.page - 2) + idx;
                      if (pageNum > pagination.totalPages) return null;

                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className={`min-w-12 border-2 ${
                            pageNum === pagination.page
                              ? 'shadow-md'
                              : 'hover:shadow-md'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages || loading}
                        className="border-2"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">Página siguiente</p>
                    </TooltipContent>
                  </Tooltip>

                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-3 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
                    Página {pagination.page} de {pagination.totalPages}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Diálogos */}
        <EnrollmentDetailDialog
          enrollment={enrollment}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />

        <EnrollmentStatusDialog
          enrollment={selectedEnrollment}
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          onSubmit={handleStatusSubmit}
          loading={actionLoading}
        />

        <EnrollmentTransferDialog
          enrollment={selectedEnrollment}
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          onSubmit={handleTransferSubmit}
          loading={actionLoading}
        />
      </div>
    </TooltipProvider>
  );
};
