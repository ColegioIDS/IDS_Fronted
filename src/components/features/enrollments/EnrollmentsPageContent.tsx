'use client';

import { useState, useEffect } from 'react';
import { useEnrollments } from '@/hooks/data/useEnrollments';
import { useCycles } from '@/hooks/data/useCycles';
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
  Download,
  Plus,
  FileText,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { enrollmentsService } from '@/services/enrollments.service';
import { EnrollmentResponse } from '@/types/enrollments.types';

export const EnrollmentsPageContent = () => {
  // Hooks principales
  const { enrollments, loading, pagination, fetchEnrollments, refetch } = useEnrollments();
  const { enrollment, fetchDetail } = useEnrollmentDetail();
  const { statistics, fetchStatistics } = useEnrollmentStatistics();
  const { cycles, loading: cyclesLoading } = useCycles();

  // Estados de diálogos
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentResponse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Estado de ciclo seleccionado
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

  // Datos estáticos (en producción vendrían del backend)
  const grades = [
    { id: 1, name: 'Preescolar' },
    { id: 2, name: 'Primer Grado' },
    { id: 3, name: 'Segundo Grado' },
    { id: 4, name: 'Tercero Primaria' },
  ];

  const sections = [
    { id: 1, name: 'A' },
    { id: 2, name: 'B' },
    { id: 3, name: 'C' },
  ];

  // Cargar estadísticas cuando hay ciclo seleccionado
  useEffect(() => {
    if (selectedCycleId) {
      fetchStatistics(selectedCycleId);
    }
  }, [selectedCycleId, fetchStatistics]);

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

    try {
      setActionLoading(true);
      await enrollmentsService.updateEnrollmentStatus(selectedEnrollment.id, {
        status,
        reason,
        notes,
      });
      await refetch();
      setStatusDialogOpen(false);
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

    try {
      setActionLoading(true);
      await enrollmentsService.transferStudent(selectedEnrollment.id, {
        newGradeId,
        newSectionId,
        reason,
        notes,
      });
      await refetch();
      setTransferDialogOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setActionLoading(true);
      const blob = await enrollmentsService.exportToExcel({});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `matrículas_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchEnrollments({ page });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Matrículas</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gestión de inscripciones y estudiantes
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport} disabled={loading || actionLoading}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button disabled={loading || actionLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Matrícula
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {selectedCycleId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estadísticas Generales
            </CardTitle>
            <CardDescription>Resumen de matrículas y ocupación para el ciclo seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <EnrollmentStatistics statistics={statistics} loading={loading} />
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <EnrollmentFilters 
            onFiltersChange={fetchEnrollments}
            onCycleChange={setSelectedCycleId}
            loading={loading}
            cycles={cycles}
            grades={grades}
            sections={sections}
          />
        </CardContent>
      </Card>

      {/* Tabla */}
      {!selectedCycleId ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center text-center gap-3">
              <div className="text-5xl opacity-10">📚</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Selecciona un ciclo escolar
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md">
                Elige un ciclo en los filtros anteriores para ver las matrículas disponibles
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Matrículas
            </CardTitle>
            <CardDescription>
              Mostrando {enrollments.length} de {pagination.total} matrículas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnrollmentTable
              enrollments={enrollments}
              loading={loading}
              onView={handleView}
              onStatusChange={handleStatusChange}
              onTransfer={handleTransfer}
            />

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex gap-1">
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
                      className="min-w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="text-xs text-slate-600 dark:text-slate-400 ml-2">
                Página {pagination.page} de {pagination.totalPages}
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
  );
};
