// src/components/features/academic-weeks/AcademicWeekPageContent.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Grid3x3, List, Calendar as CalendarIcon, GitBranch, HelpCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { AcademicWeek, QueryAcademicWeeksDto } from '@/types/academic-week.types';
import { academicWeekService } from '@/services/academic-week.service';
import { useAcademicWeeksWithPagination } from '@/hooks/useAcademicWeeksWithPagination';
import { useAcademicWeekCycles } from '@/hooks/data/useAcademicWeekCycles';
import { useAcademicWeekBimesters } from '@/hooks/useAcademicWeekBimesters';

// Componentes
import { AcademicWeekStats } from './AcademicWeekStats';
import { AcademicWeekFilters } from './AcademicWeekFilters';
import { BimesterProgressCard } from './BimesterProgressCard';
import { AcademicWeekGrid } from './AcademicWeekGrid';
import { AcademicWeekList } from './AcademicWeekList';
import { AcademicWeekCalendar } from './AcademicWeekCalendar';
import { AcademicWeekTimeline } from './AcademicWeekTimeline';
import { AcademicWeekFormDialog } from './AcademicWeekFormDialog';
import { DeleteAcademicWeekDialog } from './DeleteAcademicWeekDialog';
import { AcademicWeekDetailDialog } from './AcademicWeekDetailDialog';
import { AcademicWeekBusinessRulesDialog } from './AcademicWeekBusinessRulesDialog';

type ViewMode = 'grid' | 'list' | 'calendar' | 'timeline';

interface AcademicWeekPageContentProps {
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
}

/**
 * 🎯 Componente Orquestador Principal de Academic Weeks
 * 
 * Coordina todos los sub-componentes:
 * - Filtros y búsqueda
 * - Estadísticas y progreso
 * - Múltiples vistas (Grid/List/Calendar/Timeline)
 * - Diálogos de CRUD
 * - Gestión de estado global
 */
export function AcademicWeekPageContent({
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canExport = false,
}: AcademicWeekPageContentProps) {
  // Estados de vista
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Estados de diálogos
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  // Estados de datos
  const [selectedWeek, setSelectedWeek] = useState<AcademicWeek | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bimesterDateRange, setBimesterDateRange] = useState<{ startDate: string; endDate: string } | null>(null);

  // Hooks de datos
  const {
    data: weeks,
    meta,
    isLoading: isLoadingWeeks,
    error,
    updateQuery,
    setPage,
    refresh: refreshWeeks,
  } = useAcademicWeeksWithPagination();

  const {
    cycles,
    activeCycle,
    isLoading: isLoadingCycles,
  } = useAcademicWeekCycles();

  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [selectedBimesterId, setSelectedBimesterId] = useState<number | null>(null);

  const {
    bimesters,
    activeBimester,
    isLoading: isLoadingBimesters,
  } = useAcademicWeekBimesters({
    cycleId: selectedCycleId,
  });

  // Auto-seleccionar ciclo activo
  useEffect(() => {
    if (activeCycle && !selectedCycleId) {
      setSelectedCycleId(activeCycle.id);
    }
  }, [activeCycle, selectedCycleId]);

  // Auto-seleccionar bimestre activo
  useEffect(() => {
    if (activeBimester && !selectedBimesterId) {
      setSelectedBimesterId(activeBimester.id);
    }
  }, [activeBimester, selectedBimesterId]);

  // Cargar rango de fechas del bimestre seleccionado
  useEffect(() => {
    const loadBimesterDateRange = async () => {
      if (selectedBimesterId) {
        try {
          const range = await academicWeekService.getBimesterDateRange(selectedBimesterId);
          setBimesterDateRange(range);
        } catch (error) {
          console.error('Error al cargar rango de bimestre:', error);
          setBimesterDateRange(null);
        }
      } else {
        setBimesterDateRange(null);
      }
    };

    loadBimesterDateRange();
  }, [selectedBimesterId]);

  // Calcular distribución de tipos
  const weekTypeDistribution = useMemo(() => {
    return {
      REGULAR: weeks.filter(w => w.weekType === 'REGULAR').length,
      EVALUATION: weeks.filter(w => w.weekType === 'EVALUATION').length,
      REVIEW: weeks.filter(w => w.weekType === 'REVIEW').length,
    };
  }, [weeks]);

  // Obtener info del bimestre seleccionado
  const selectedBimesterInfo = useMemo(() => {
    if (!selectedBimesterId) return null;
    return bimesters.find((b: any) => b.id === selectedBimesterId) || null;
  }, [selectedBimesterId, bimesters]);

  // Handlers de filtros
  const handleFilterChange = (filters: QueryAcademicWeeksDto) => {
    updateQuery(filters);
    
    // Actualizar estados locales
    if (filters.cycleId !== undefined) {
      setSelectedCycleId(filters.cycleId);
    }
    if (filters.bimesterId !== undefined) {
      setSelectedBimesterId(filters.bimesterId);
    }
  };

  // Handlers de CRUD
  const handleCreate = () => {
    setFormMode('create');
    setSelectedWeek(null);
    setIsFormDialogOpen(true);
  };

  const handleEdit = (week: AcademicWeek) => {
    setFormMode('edit');
    setSelectedWeek(week);
    setIsFormDialogOpen(true);
  };

  const handleView = (week: AcademicWeek) => {
    setSelectedWeek(week);
    setIsDetailDialogOpen(true);
  };

  const handleDelete = (week: AcademicWeek) => {
    setSelectedWeek(week);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (formMode === 'create') {
  const bimesterId = data.bimesterId;
  if (!bimesterId) {
    throw new Error('Debe seleccionar un bimestre antes de crear la semana académica.');
  }

  await academicWeekService.create(bimesterId, data);
  toast.success('Semana académica creada exitosamente');
}

      
      
      else if (selectedWeek) {
        await academicWeekService.update(selectedWeek.id, data);
        toast.success('Semana académica actualizada exitosamente');
      }
      
      setIsFormDialogOpen(false);
      setSelectedWeek(null);
      await refreshWeeks();
    } catch (error: any) {
      console.error('Error al guardar semana académica:', error);
      toast.error(error.message || 'Error al guardar la semana académica');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedWeek) return;

    setIsDeleting(true);
    try {
      await academicWeekService.delete(selectedWeek.id);
      toast.success('Semana académica eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedWeek(null);
      await refreshWeeks();
    } catch (error: any) {
      console.error('Error al eliminar semana académica:', error);
      toast.error(error.message || 'Error al eliminar la semana académica');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    toast.info('Función de exportación en desarrollo');
  };

  // Handlers de ordenamiento (para vista de lista)
  const [sortBy, setSortBy] = useState<'weekNumber' | 'startDate' | 'name'>('weekNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'weekNumber' | 'startDate' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    // TODO: Implementar ordenamiento en la API
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Semanas Académicas
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestión de semanas académicas por bimestre
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón de ayuda (reglas de negocio) */}
          <AcademicWeekBusinessRulesDialog />

          {/* Botón de exportar */}
          {canExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          )}

          {/* Botón de crear */}
          {canCreate && (
            <Button
              onClick={handleCreate}
              className="gap-2"
              disabled={isLoadingWeeks}
            >
              <Plus className="h-4 w-4" />
              Nueva Semana
            </Button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <AcademicWeekStats
        data={weeks}
        isLoading={isLoadingWeeks}
      />

      {/* Progress Card del Bimestre */}
      <BimesterProgressCard
        bimesterInfo={selectedBimesterInfo}
        totalWeeks={weeks.length}
        weekTypeDistribution={weekTypeDistribution}
        isLoading={isLoadingWeeks}
      />

      {/* Filtros */}
      <AcademicWeekFilters
        onFilterChange={handleFilterChange}
        isLoading={isLoadingWeeks}
        currentCycleId={selectedCycleId || undefined}
        currentBimesterId={selectedBimesterId || undefined}
        availableCycles={cycles}
        availableBimesters={bimesters}
      />

      {/* Selector de Vista */}
      <Card className="p-4 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Modo de vista
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-2"
            >
              <Grid3x3 className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Lista</span>
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Calendario</span>
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
              className="gap-2"
            >
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Timeline</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Vistas */}
      {viewMode === 'grid' && (
        <AcademicWeekGrid
          weeks={weeks}
          isLoading={isLoadingWeeks}
          onView={handleView}
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={canDelete ? handleDelete : undefined}
          canEdit={canEdit}
          canDelete={canDelete}
          currentPage={meta.page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      )}

      {viewMode === 'list' && (
        <AcademicWeekList
          weeks={weeks}
          isLoading={isLoadingWeeks}
          onView={handleView}
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={canDelete ? handleDelete : undefined}
          canEdit={canEdit}
          canDelete={canDelete}
          currentPage={meta.page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      {viewMode === 'calendar' && (
        <AcademicWeekCalendar
          weeks={weeks}
          isLoading={isLoadingWeeks}
          onWeekClick={handleView}
        />
      )}

      {viewMode === 'timeline' && (
        <AcademicWeekTimeline
          weeks={weeks}
          isLoading={isLoadingWeeks}
          onWeekClick={handleView}
        />
      )}

      {/* Diálogos */}
      <AcademicWeekFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => {
          setIsFormDialogOpen(false);
          setSelectedWeek(null);
        }}
        onSubmit={handleFormSubmit}
        mode={formMode}
        initialData={selectedWeek}
        isSubmitting={isSubmitting}
        availableCycles={cycles}
        availableBimesters={bimesters}
        bimesterDateRange={bimesterDateRange}
      />

      <DeleteAcademicWeekDialog
        week={selectedWeek}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedWeek(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <AcademicWeekDetailDialog
        week={selectedWeek}
        isOpen={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false);
          setSelectedWeek(null);
        }}
      />
    </div>
  );
}

export default AcademicWeekPageContent;
