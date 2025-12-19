// src/components/features/attendance-statuses/AttendanceStatusesPageContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, AlertCircle, Grid3x3, List, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AttendanceStatus } from '@/types/attendance-status.types';
import { useAttendanceStatuses } from '@/hooks/data';
import { attendanceStatusesService } from '@/services/attendance-statuses.service';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

import { AttendanceStatusCard } from './AttendanceStatusCard';
import { AttendanceStatusTable } from './AttendanceStatusTable';
import { AttendanceStatusForm } from './AttendanceStatusForm';
import { AttendanceStatusFilters } from './AttendanceStatusFilters';
import { DeleteStatusDialog } from './DeleteStatusDialog';

type ViewMode = 'list' | 'grid' | 'form';

/**
 * Props interface para AttendanceStatusesPageContent
 * 
 * Recibe 4 permisos desde la página principal:
 * - canReadOne: Ver detalles de un estado
 * - canCreate: Crear nuevos estados
 * - canUpdate: Actualizar estados existentes
 * - canDelete: Eliminar estados
 */
interface AttendanceStatusesPageContentProps {
  canReadOne?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export const AttendanceStatusesPageContent = ({
  canReadOne = true,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}: AttendanceStatusesPageContentProps) => {
  // ============================================
  // ESTADO
  // ============================================
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingStatus, setEditingStatus] = useState<AttendanceStatus | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [isOperating, setIsOperating] = useState(false);

  // ============================================
  // DATOS
  // ============================================
  const {
    statuses,
    isLoading,
    error,
    successMessage,
    pagination,
    query,
    refresh,
    updateQuery,
    getStatuses,
    clearError,
    clearSuccess,
  } = useAttendanceStatuses();

  // Load data on mount
  useEffect(() => {
    getStatuses();
  }, [getStatuses]);

  // ============================================
  // HANDLERS - CREATE
  // ============================================
  const handleCreate = async (data: any) => {
    try {
      setIsOperating(true);
      await attendanceStatusesService.createStatus(data);
      toast.success('Estado creado correctamente');
      setEditingStatus(undefined);
      setViewMode('list');
      refresh();
    } catch (error: any) {
      console.error('Error creating status:', error);
      // Re-lanzar el error para que el formulario lo capture y muestre
      throw new Error(
        error?.response?.data?.message || 
        error?.message || 
        'Error al crear el estado'
      );
    } finally {
      setIsOperating(false);
    }
  };

  // ============================================
  // HANDLERS - UPDATE
  // ============================================
  const handleUpdate = async (data: any) => {
    if (!editingStatus) return;
    try {
      setIsOperating(true);
      await attendanceStatusesService.updateStatus(editingStatus.id, data);
      toast.success('Estado actualizado correctamente');
      // Solo si es exitoso:
      setEditingStatus(undefined);
      setViewMode('list');
      refresh();
    } catch (error: any) {
      console.error('Error updating status:', error);
      // Re-lanzar el error para que el formulario lo capture y muestre
      throw new Error(
        error?.response?.data?.message || 
        error?.message || 
        'Error al actualizar el estado'
      );
    } finally {
      setIsOperating(false);
    }
  };

  // ============================================
  // HANDLERS - DELETE
  // ============================================
  const handleDeleteClick = (id: number, name: string) => {
    setDeleteTarget({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsOperating(true);
      await attendanceStatusesService.deleteStatus(deleteTarget.id);
      toast.success('Estado eliminado correctamente');
      // Solo si es exitoso:
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      refresh();
    } catch (error: any) {
      console.error('Error deleting status:', error);
      // Para delete, mostrar el error en un toast en el diálogo
      toast.error(
        error?.response?.data?.message || 
        error?.message || 
        'Error al eliminar el estado'
      );
    } finally {
      setIsOperating(false);
    }
  };

  // ============================================
  // HANDLERS - TOGGLE ACTIVE
  // ============================================
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      setIsOperating(true);
      if (isActive) {
        await attendanceStatusesService.activateStatus(id);
      } else {
        await attendanceStatusesService.deactivateStatus(id);
      }
      refresh();
    } catch (error: any) {
      console.error('Error toggling status:', error);
      // Re-lanzar el error para que la tabla lo capture y muestre
      throw new Error(
        error?.response?.data?.message || 
        error?.message || 
        'Error al cambiar el estado'
      );
    } finally {
      setIsOperating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ============================================
          SECCIÓN: HEADER
          ============================================ */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full mb-3">
            Configuración de Asistencia
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Estados de Asistencia
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-base">
            Configura los estados disponibles para el registro diario de asistencia.
          </p>
        </div>

        {/* Botón Crear (solo visible si no estamos en formulario) */}
        {viewMode !== 'form' && canCreate && (
          <Button
            onClick={() => {
              setEditingStatus(undefined);
              setViewMode('form');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear Estado
          </Button>
        )}

        {/* Botón Volver (solo visible si estamos en formulario) */}
        {viewMode === 'form' && (
          <Button
            variant="outline"
            onClick={() => {
              setViewMode('list');
              setEditingStatus(undefined);
            }}
            className="border-slate-200 dark:border-slate-700"
          >
            Volver a Lista
          </Button>
        )}
      </div>

      {/* ============================================
          SECCIÓN: FORMULARIO
          ============================================ */}
      {viewMode === 'form' && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <AttendanceStatusForm
            initialData={editingStatus}
            onSubmit={editingStatus ? handleUpdate : handleCreate}
            onCancel={() => {
              setViewMode('list');
              setEditingStatus(undefined);
            }}
            isLoading={isOperating}
          />
        </div>
      )}

      {/* ============================================
          SECCIÓN: LISTA/GRID
          ============================================ */}
      {viewMode !== 'form' && (
        <div className="space-y-6">
          {/* FILTROS */}
          <AttendanceStatusFilters filters={query} onFilterChange={updateQuery} />

          {/* CONTROLES - Vista */}
          <div className="flex justify-end">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-auto">
              <TabsList className="grid grid-cols-2 bg-slate-100 dark:bg-slate-800">
                <TabsTrigger value="list" className="gap-2 text-xs sm:text-sm">
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Lista</span>
                  <span className="sm:hidden">Lista</span>
                </TabsTrigger>
                <TabsTrigger value="grid" className="gap-2 text-xs sm:text-sm">
                  <Grid3x3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                  <span className="sm:hidden">Grid</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* ESTADO DE ERROR */}
          {error && (
            <Card className="border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20">
              <CardContent className="flex items-center gap-4 p-4">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-700 dark:text-red-400">Error al cargar</h3>
                  <p className="text-sm text-red-600 dark:text-red-400/80">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CONTENIDO */}
          {!error && (
            <>
              {/* VISTA LISTA */}
              {viewMode === 'list' && (
                <div className="animate-in fade-in duration-300">
                  <AttendanceStatusTable
                    statuses={statuses}
                    loading={isLoading}
                    onEdit={canUpdate ? (status) => {
                      setEditingStatus(status);
                      setViewMode('form');
                    } : undefined}
                    onDelete={canDelete ? (id) => {
                      const status = statuses.find((s) => s.id === id);
                      if (status) handleDeleteClick(id, status.name);
                    } : undefined}
                    onToggleActive={canUpdate ? handleToggleActive : undefined}
                    onAdd={canCreate ? () => {
                      setEditingStatus(undefined);
                      setViewMode('form');
                    } : undefined}
                  />
                </div>
              )}

              {/* VISTA GRID */}
              {viewMode === 'grid' && (
                <div className="animate-in fade-in duration-300">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-56 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                      ))}
                    </div>
                  ) : statuses.length === 0 ? (
                    <Card className="border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="p-4 rounded-xl bg-blue-100 dark:bg-blue-950/30 mb-4">
                          <ShieldCheck className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No hay estados registrados</h3>
                        <p className="text-slate-600 dark:text-slate-400 max-w-sm mb-6">
                          Comienza creando los estados que utilizarás para registrar la asistencia.
                        </p>
                        {canCreate && (
                          <Button onClick={() => setViewMode('form')} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Crear primer estado
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {statuses.map((status) => (
                        <AttendanceStatusCard
                          key={status.id}
                          status={status}
                          onEdit={canUpdate ? (s) => {
                            setEditingStatus(s);
                            setViewMode('form');
                          } : undefined}
                          onDelete={canDelete ? (id) => {
                            const status = statuses.find((s) => s.id === id);
                            if (status) handleDeleteClick(id, status.name);
                          } : undefined}
                          onToggleActive={canUpdate ? handleToggleActive : undefined}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* PAGINACIÓN */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Página {pagination.page} de {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuery({ page: Math.max(1, (pagination.page || 1) - 1) })}
                  disabled={pagination.page === 1}
                  className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuery({ page: Math.min(pagination.totalPages, (pagination.page || 1) + 1) })}
                  disabled={pagination.page === pagination.totalPages}
                  className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DIÁLOGO CONFIRMACIÓN ELIMINACIÓN */}
      <DeleteStatusDialog
        isOpen={deleteDialogOpen}
        statusName={deleteTarget?.name || ''}
        isLoading={isOperating}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};