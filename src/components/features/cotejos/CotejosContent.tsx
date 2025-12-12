'use client';

import { useEffect, useState, useMemo } from 'react';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CotejosFilters } from './CotejosFilters';
import { CotejosTable } from './CotejosTable';
import { CotejoForm } from './CotejoForm';
import { useCascade, useCotejosBySection } from '@/hooks/useCotejos';
import { CotejoResponse } from '@/types/cotejos.types';

/**
 * Componente principal para gestionar cotejos
 * Permite ver, crear y editar cotejos por sección y curso
 */
export const CotejosContent = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    cycleId: null as number | null,
    bimesterId: null as number | null,
    gradeId: null as number | null,
    sectionId: null as number | null,
    courseId: null as number | null,
  });

  const { cascade, loading: cascadeLoading, error: cascadeError } = useCascade();

  // Auto-seleccionar ciclo activo y bimestre activo cuando cascade carga
  useEffect(() => {
    if (!cascade || !cascade.success || !cascade.data) return;

    const { cycle, activeBimester } = cascade.data;

    setFilters((prev) => ({
      ...prev,
      cycleId: cycle?.id || null,
      bimesterId: activeBimester?.id || null,
    }));
  }, [cascade]);

  const cotejoParams = useMemo(() => ({
    sectionId: filters.sectionId,
    courseId: filters.courseId,
    bimesterId: filters.bimesterId,
    cycleId: filters.cycleId,
  }), [filters.sectionId, filters.courseId, filters.bimesterId, filters.cycleId]);

  const {
    cotejos,
    total,
    loading: cotejosLoading,
    error: cotejosError,
    refetch: refetchCotejos,
  } = useCotejosBySection(cotejoParams);

  // Validar que cascade data esté cargado
  const hasCascadeError =
    !cascadeLoading && cascade && !cascade.success;
  const hasNoActiveCycle =
    cascade && cascade.errorCode === 'NO_ACTIVE_CYCLE';

  const isFiltersComplete =
    filters.sectionId && filters.courseId && filters.bimesterId && filters.cycleId;

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleCotejoCreated = () => {
    setIsCreateDialogOpen(false);
    refetchCotejos();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cotejos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consolidación de calificaciones por estudiante y curso
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={!isFiltersComplete || cascadeLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Generar Cotejo
        </Button>
      </div>

      {/* Sección de Ciclo y Bimestre Activos */}
      {cascade?.data?.cycle && cascade?.data?.activeBimester && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Ciclo Escolar: <span className="font-bold">{cascade.data.cycle.name}</span>
              </p>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Bimestre: <span className="font-bold">{cascade.data.activeBimester.name}</span>
              </p>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">
              {cascade.data.cycle.startDate && cascade.data.cycle.endDate && (
                <p>
                  {new Date(cascade.data.cycle.startDate).toLocaleDateString('es-ES')} -{' '}
                  {new Date(cascade.data.cycle.endDate).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Errores */}
      {hasNoActiveCycle && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No hay ciclo escolar activo</AlertTitle>
          <AlertDescription>
            Se requiere un ciclo escolar activo para acceder a los cotejos. Contacta al administrador.
          </AlertDescription>
        </Alert>
      )}

      {cascadeError && !hasCascadeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar datos</AlertTitle>
          <AlertDescription>{cascadeError.message}</AlertDescription>
        </Alert>
      )}

      {cotejosError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar cotejos</AlertTitle>
          <AlertDescription>{cotejosError.message}</AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <CotejosFilters
        cascade={cascade}
        filters={filters}
        onFilterChange={handleFilterChange}
        loading={cascadeLoading}
      />

      {/* Dialog para generar cotejo */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generar Cotejo</DialogTitle>
            <DialogDescription>
              Crea un nuevo cotejo para el estudiante. Los componentes ERICA y TAREAS se calcularán
              automáticamente.
            </DialogDescription>
          </DialogHeader>
          {cascade && cascade.success && (
            <CotejoForm
              cascade={cascade}
              filters={filters}
              onSuccess={handleCotejoCreated}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Tabla de Cotejos */}
      {!hasNoActiveCycle && (
        <CotejosTable
          cotejos={cotejos}
          total={total}
          loading={cotejosLoading}
          onCotejoUpdate={refetchCotejos}
        />
      )}
    </div>
  );
};
