// src/components/features/bimesters/BimesterPageContent.tsx

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBimesters } from '@/hooks/data/useBimesters';
import { useBimesterCycles } from '@/hooks/data/useBimesterCycles';
import { usePermissions } from '@/hooks/usePermissions';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { ProtectedContent } from '@/components/shared/permissions/ProtectedContent';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { ErrorAlert } from '@/components/shared/feedback/ErrorAlert';
import { BimesterStats } from './BimesterStats';
import { BimesterFilters } from './BimesterFilters';
import { CycleProgressCard } from './CycleProgressCard';
import { BimesterBusinessRulesDialog } from './BimesterBusinessRulesDialog';
import { BimesterGrid } from './BimesterGrid';
import { BimesterForm } from './BimesterForm';
import { BimesterDetailDialog } from './BimesterDetailDialog';
import { DeleteBimesterDialog } from './DeleteBimesterDialog';
import { Bimester, SchoolCycleForBimester } from '@/types/bimester.types';
import { handleApiError, handleApiSuccess } from '@/utils/handleApiError';
import { bimesterService } from '@/services/bimester.service';

interface ApiError {
  title: string;
  message: string;
  details?: string[];
}

/**
 * Componente principal de la página de Bimestres
 * 
 * Sigue el patrón PageContent Orchestrator del master guide
 * 
 * Responsabilidades:
 * - Gestionar estado global de la página
 * - Coordinar diálogos y modales
 * - Manejar permisos
 * - Orquestar la interacción entre componentes
 */
export function BimesterPageContent() {
  const { hasPermission } = usePermissions();
  const { activeCycle, cycles } = useBimesterCycles();
  
  // Estado de query inicial con ciclo activo
  const [initialQuery] = useState(() => ({
    schoolCycleId: activeCycle?.id,
    page: 1,
    limit: 12,
  }));

  const { data, meta, isLoading, error, query, updateQuery, setPage, refresh } = 
    useBimesters(initialQuery);

  // Estado para el ciclo seleccionado (para mostrar en el progress card)
  const [selectedCycle, setSelectedCycle] = useState<SchoolCycleForBimester | null>(activeCycle);

  // Actualizar el ciclo seleccionado cuando cambie el query
  useEffect(() => {
    if (query.schoolCycleId) {
      const cycle = cycles.find((c) => c.id === query.schoolCycleId);
      setSelectedCycle(cycle || null);
    } else {
      setSelectedCycle(null);
    }
  }, [query.schoolCycleId, cycles]);

  // Estados de UI
  const [selectedBimester, setSelectedBimester] = useState<Bimester | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingBimester, setEditingBimester] = useState<Bimester | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bimesterToDelete, setBimesterToDelete] = useState<Bimester | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [globalError, setGlobalError] = useState<ApiError | null>(null);

  // Verificar permisos
  const canRead = hasPermission('bimester', 'read');
  const canCreate = hasPermission('bimester', 'create');
  const canUpdate = hasPermission('bimester', 'update');
  const canDelete = hasPermission('bimester', 'delete');

  // Handlers
  const handleFilterChange = useCallback((filters: any) => {
    updateQuery(filters);
  }, [updateQuery]);

  const handlePageChange = useCallback((page: number) => {
    setPage(page);
  }, [setPage]);

  const handleCreateClick = useCallback(() => {
  // eslint-disable-next-line no-console
    setEditingBimester(null);
    setFormDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((bimester: Bimester) => {
  // eslint-disable-next-line no-console
    setEditingBimester(bimester);
    setFormDialogOpen(true);
  }, []);

  const handleViewDetails = useCallback((bimester: Bimester) => {
    setSelectedBimester(bimester);
    setDetailDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((bimester: Bimester) => {
    setBimesterToDelete(bimester);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!bimesterToDelete) return;

    try {
      setDeleteLoading(true);
      setGlobalError(null);

      await bimesterService.delete(bimesterToDelete.id);
      
      handleApiSuccess('Bimestre eliminado correctamente');
      
      setDeleteDialogOpen(false);
      setBimesterToDelete(null);
      refresh();
    } catch (err: any) {
      const handled = handleApiError(err, 'Error al eliminar bimestre');
      setGlobalError({
        title: 'Error al eliminar',
        message: handled.message,
        details: handled.details,
      });
    } finally {
      setDeleteLoading(false);
    }
  }, [bimesterToDelete, refresh]);

  const handleFormSuccess = useCallback(() => {
    refresh();
    setFormDialogOpen(false);
    setEditingBimester(null);
  }, [refresh]);

  if (!canRead) {
    return (
      <NoPermissionCard 
        title="Acceso Denegado" 
        /* message="No tienes permisos para ver bimestres" */
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Gestión de Bimestres
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Administra los bimestres del ciclo escolar
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón de Reglas de Negocio - Solo visible con permiso read */}
          {canRead && <BimesterBusinessRulesDialog />}
          
          {/* Botón Crear - Solo visible con permiso create */}
          <ProtectedContent module="bimester" action="create">
            <Button 
              onClick={handleCreateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Bimestre
            </Button>
          </ProtectedContent>
        </div>
      </div>

      {/* Stats */}
      <BimesterStats data={data} isLoading={isLoading} />

      {/* Progress Card del Ciclo Escolar */}
      <CycleProgressCard cycle={selectedCycle} />

      {/* Errores globales */}
      {error && (
        <ErrorAlert 
          title="Error al cargar bimestres" 
          message={error} 
        />
      )}
      {globalError && (
        <ErrorAlert 
          title={globalError.title}
          message={globalError.message}
          details={globalError.details}
        />
      )}

      {/* Filtros */}
      <BimesterFilters 
        onFilterChange={handleFilterChange}
        isLoading={isLoading || deleteLoading}
        currentCycleId={query.schoolCycleId}
      />

      {/* Grid de Bimestres */}
      <BimesterGrid
        bimesters={data}
        isLoading={isLoading}
        currentPage={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        onPageChange={handlePageChange}
        onEdit={canUpdate ? handleEditClick : undefined}
        onDelete={canDelete ? handleDeleteClick : undefined}
        onViewDetails={handleViewDetails}
      />

      {/* Diálogos */}
      <BimesterForm
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        editingBimester={editingBimester}
        onSuccess={handleFormSuccess}
      />

      <BimesterDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        bimester={selectedBimester}
        onEdit={canUpdate ? handleEditClick : undefined}
        onDelete={canDelete ? handleDeleteClick : undefined}
      />

      <DeleteBimesterDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        bimester={bimesterToDelete}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading}
      />
    </div>
  );
}

export default BimesterPageContent;
