// src/components/features/school-cycles/SchoolCyclePageContent.tsx

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ErrorAlert, ConfirmDialog } from '@/components/shared/feedback';
import { useSchoolCycles } from '@/hooks/data/useSchoolCycles';
import { usePermissions } from '@/hooks/usePermissions';
import { schoolCycleService } from '@/services/school-cycle.service';
import { SchoolCycle, QuerySchoolCyclesDto } from '@/types/school-cycle.types';
import { ProtectedContent } from '@/components/shared/permissions/ProtectedContent';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { handleApiError } from '@/utils/handleApiError';
import {
  SchoolCycleStats,
  SchoolCycleFilters,
  SchoolCycleGrid,
  SchoolCycleForm,
  SchoolCycleDetailDialog,
  ArchiveReasonDialog, // ← NUEVO
} from './index';
import { Plus, Loader, PencilIcon, PlusIcon, X } from 'lucide-react';

interface ApiError {
  title?: string;
  message: string;
  details?: string[];
}

export function SchoolCyclePageContent() {
  const { hasPermission } = usePermissions();
  const { data, meta, isLoading, error, query, updateQuery, setPage, refresh } =
    useSchoolCycles();

  const [selectedCycle, setSelectedCycle] = useState<SchoolCycle | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<SchoolCycle | null>(null);
  
  // Estados para dialogs de confirmación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activateConfirmOpen, setActivateConfirmOpen] = useState(false);
  const [cycleToDelete, setCycleToDelete] = useState<SchoolCycle | null>(null);
  const [cycleToActivate, setCycleToActivate] = useState<SchoolCycle | null>(null);
  
  // ✅ NUEVO: Estados para Archive Dialog
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [cycleToArchive, setCycleToArchive] = useState<SchoolCycle | null>(null);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [globalError, setGlobalError] = useState<ApiError | null>(null);

  // Permisos
  const canRead = hasPermission('school-cycle', 'read');
  const canCreate = hasPermission('school-cycle', 'create');
  const canUpdate = hasPermission('school-cycle', 'update');
  const canDelete = hasPermission('school-cycle', 'delete');
  const canActivate = hasPermission('school-cycle', 'activate');
  const canArchive = hasPermission('school-cycle', 'activate'); // ← CAMBIO: era canClose

  const hasSearchFilter =
    (query.search && query.search.trim().length > 0) ||
    query.isActive !== undefined ||
    query.isArchived !== undefined; // ← CAMBIO: era isClosed

  // Handlers
  const handleFilterChange = useCallback(
    (filters: Partial<QuerySchoolCyclesDto>) => {
      updateQuery(filters);
    },
    [updateQuery]
  );

  const handleClearFilters = useCallback(() => {
    updateQuery({
      search: undefined,
      isActive: undefined,
      isArchived: undefined, // ← CAMBIO: era isClosed
      sortBy: 'startDate',
      sortOrder: 'desc',
      page: 1,
    });
  }, [updateQuery]);

  const handleEdit = useCallback((cycle: SchoolCycle) => {
    setEditingCycle(cycle);
    setFormDialogOpen(true);
  }, []);

  const handleDelete = useCallback((cycle: SchoolCycle) => {
    setCycleToDelete(cycle);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(
    async () => {
      if (!cycleToDelete) return;

      try {
        setActionLoading(true);
        setGlobalError(null);
        await schoolCycleService.delete(cycleToDelete.id);
        setDeleteConfirmOpen(false);
        setCycleToDelete(null);
        refresh();
      } catch (err: any) {
        const handled = handleApiError(err, 'Error al eliminar ciclo escolar');
        setGlobalError({
          title: 'Error al eliminar',
          message: handled.message,
          details: handled.details,
        });
      } finally {
        setActionLoading(false);
      }
    },
    [cycleToDelete, refresh]
  );

  const handleActivate = useCallback((cycle: SchoolCycle) => {
    setCycleToActivate(cycle);
    setActivateConfirmOpen(true);
  }, []);

  const handleActivateConfirm = useCallback(
    async () => {
      if (!cycleToActivate) return;

      try {
        setActionLoading(true);
        setGlobalError(null);
        await schoolCycleService.activate(cycleToActivate.id);
        setActivateConfirmOpen(false);
        setCycleToActivate(null);
        refresh();
      } catch (err: any) {
        const handled = handleApiError(err, 'Error al activar ciclo escolar');
        setGlobalError({
          title: 'Error al activar',
          message: handled.message,
          details: handled.details,
        });
      } finally {
        setActionLoading(false);
      }
    },
    [cycleToActivate, refresh]
  );

  // ✅ NUEVO: Handler para abrir Archive Dialog
  const handleArchiveClick = useCallback((cycle: SchoolCycle) => {
    setCycleToArchive(cycle);
    setArchiveDialogOpen(true);
  }, []);

  // ✅ NUEVO: Handler para confirmar Archive con razón
  const handleArchiveConfirm = useCallback(
    async (reason: string) => {
      if (!cycleToArchive) return;

      try {
        setActionLoading(true);
        setGlobalError(null);
        // ← AQUÍ: Se envía la razón al servicio
        await schoolCycleService.archive(cycleToArchive.id, reason);
        refresh();
        setArchiveDialogOpen(false);
        setCycleToArchive(null);
      } catch (err: any) {
        const handled = handleApiError(err, 'Error al archivar ciclo escolar');
        setGlobalError({
          title: 'Error al archivar',
          message: handled.message,
          details: handled.details,
        });
      } finally {
        setActionLoading(false);
      }
    },
    [cycleToArchive, refresh]
  );

  const handleViewDetails = useCallback((cycle: SchoolCycle) => {
    setSelectedCycle(cycle);
    setDetailDialogOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setFormDialogOpen(false);
    setEditingCycle(null);
    setGlobalError(null);
    refresh();
  }, [refresh]);

  const handleCreateClick = useCallback(() => {
    setEditingCycle(null);
    setGlobalError(null);
    setFormDialogOpen(true);
  }, []);

  // Sin permisos de lectura
  if (!canRead) {
    return (
      <div className="space-y-6">
        <NoPermissionCard
          title="Acceso Denegado"
          description="No tienes permiso para ver ciclos escolares"
/*           requiredPermission="school-cycle:read"
 */        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ciclos Escolares
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los ciclos escolares y sus configuraciones
          </p>
        </div>

        <ProtectedContent module="school-cycle" action="create" hideOnNoPermission>
          <Button
            onClick={handleCreateClick}
            disabled={isLoading || actionLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Crear Ciclo Escolar
          </Button>
        </ProtectedContent>
      </div>

      {/* Estadísticas */}
      <SchoolCycleStats cycles={data} isLoading={isLoading} />

      {/* Errores globales - Carga de datos */}
      {error && (
        <ErrorAlert
          title="Error al cargar"
          message={error}
          details={['Verifica tu conexión e intenta nuevamente']}
        />
      )}

      {/* Errores globales - Acciones */}
      {globalError && (
        <ErrorAlert
          title={globalError.title}
          message={globalError.message}
          details={globalError.details}
        />
      )}

      {/* Filtros */}
      <SchoolCycleFilters
        onFilterChange={handleFilterChange}
        isLoading={isLoading || actionLoading}
      />

      {/* Grid */}
      <SchoolCycleGrid
        cycles={data}
        isLoading={isLoading}
        hasSearchFilter={hasSearchFilter}
        onEdit={canUpdate ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        onActivate={canActivate ? handleActivate : undefined}
        onArchive={canArchive ? handleArchiveClick : undefined} // ← CAMBIO: era onClose
        onViewDetails={handleViewDetails}
        onCreate={canCreate ? handleCreateClick : undefined}
        onClearFilters={handleClearFilters}
      />

      {/* Paginación */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            onClick={() => setPage(meta.page - 1)}
            disabled={meta.page === 1 || isLoading}
            variant="outline"
            size="sm"
          >
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, meta.totalPages) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  variant={meta.page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  disabled={isLoading}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            onClick={() => setPage(meta.page + 1)}
            disabled={meta.page === meta.totalPages || isLoading}
            variant="outline"
            size="sm"
          >
            Siguiente
          </Button>

          <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
            Página {meta.page} de {meta.totalPages}
          </span>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent showCloseButton={false} className="max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0 bg-white dark:bg-gray-950 border-2 border-blue-200 dark:border-blue-900 shadow-2xl rounded-2xl overflow-hidden">
          {/* Gradient Header con botón de cierre personalizado */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 px-8 py-6 border-b-4 border-blue-700 dark:border-blue-600 flex items-start justify-between">
            <DialogHeader className="space-y-1 flex-1">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                {editingCycle ? (
                  <>
                    <PencilIcon className="w-6 h-6" strokeWidth={2.5} />
                    Editar Ciclo Escolar
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-6 h-6" strokeWidth={2.5} />
                    Crear Nuevo Ciclo Escolar
                  </>
                )}
              </DialogTitle>
              <p className="text-sm text-blue-100">
                {editingCycle 
                  ? `Modificando: ${editingCycle.name}` 
                  : 'Completa los datos para crear un nuevo ciclo académico'}
              </p>
            </DialogHeader>
            <button
              onClick={() => setFormDialogOpen(false)}
              className="ml-4 p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors duration-200 flex-shrink-0"
            >
              <X className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin-blue">
            <SchoolCycleForm
              cycle={editingCycle || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setFormDialogOpen(false);
                setEditingCycle(null);
              }}
              isLoading={actionLoading}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <SchoolCycleDetailDialog
        cycle={selectedCycle}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      {/* ✅ NUEVO: Archive Reason Dialog */}
      <ArchiveReasonDialog
        cycle={cycleToArchive}
        open={archiveDialogOpen}
        onConfirm={handleArchiveConfirm}
        onCancel={() => {
          setArchiveDialogOpen(false);
          setCycleToArchive(null);
        }}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        type="danger"
        title="Eliminar Ciclo Escolar"
        description={`¿Estás seguro de que deseas eliminar "${cycleToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={actionLoading}
        onConfirm={handleDeleteConfirm}
      />

      {/* Activate Confirmation Dialog */}
      <ConfirmDialog
        open={activateConfirmOpen}
        onOpenChange={setActivateConfirmOpen}
        type="warning"
        title="Activar Ciclo Escolar"
        description={`¿Activar el ciclo "${cycleToActivate?.name}"? Esto desactivará todos los demás ciclos.`}
        confirmText="Activar"
        cancelText="Cancelar"
        isLoading={actionLoading}
        onConfirm={handleActivateConfirm}
      />

      {/* Loading overlay */}
      {actionLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center pointer-events-none z-40">
          <Loader className="w-8 h-8 text-white animate-spin" />
        </div>
      )}
    </div>
  );
}