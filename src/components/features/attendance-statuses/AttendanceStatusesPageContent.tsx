// src/components/features/attendance-statuses/AttendanceStatusesPageContent.tsx
'use client';

import { useState } from 'react';
import { Plus, AlertCircle, Grid3x3, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceStatus, AttendanceStatusQuery } from '@/types/attendance-status.types';
import { useAttendanceStatuses, useAttendanceStatusPermissions } from '@/hooks/data';
import { attendanceStatusesService } from '@/services/attendance-statuses.service';
import { ATTENDANCE_THEME } from '@/constants/attendance-statuses-theme';
import { BaseCard } from '@/components/features/attendance-statuses/card/base-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { AttendanceStatusCard } from './AttendanceStatusCard';
import { AttendanceStatusTable } from './AttendanceStatusTable';
import { AttendanceStatusForm } from './AttendanceStatusForm';
import { AttendanceStatusFilters } from './AttendanceStatusFilters';
import { DeleteStatusDialog } from './DeleteStatusDialog';

type ViewMode = 'list' | 'grid' | 'form';

export const AttendanceStatusesPageContent = () => {
  const { canReadStatuses, canCreateStatus, canUpdateStatus, canDeleteStatus } =
    useAttendanceStatusPermissions();

  // ============================================
  // ESTADO
  // ============================================
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<AttendanceStatusQuery>({ page: 1, limit: 10 });
  const [editingStatus, setEditingStatus] = useState<AttendanceStatus | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [isOperating, setIsOperating] = useState(false);

  // ============================================
  // DATOS
  // ============================================
  const { data: statusesData, isLoading, error, refresh, updateQuery } = useAttendanceStatuses(filters);

  const statuses = statusesData?.data || [];
  const meta = statusesData?.meta;

  // ============================================
  // HANDLERS - CREATE
  // ============================================
  const handleCreate = async (data: any) => {
    try {
      setIsOperating(true);
      await attendanceStatusesService.createStatus(data);
      setViewMode('list');
      refresh();
    } catch (error) {
      console.error('Error creating status:', error);
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
      setEditingStatus(undefined);
      setViewMode('list');
      refresh();
    } catch (error) {
      console.error('Error updating status:', error);
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
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      refresh();
    } catch (error) {
      console.error('Error deleting status:', error);
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
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setIsOperating(false);
    }
  };

  // ============================================
  // VALIDACIÓN DE PERMISOS
  // ============================================
  if (!canReadStatuses) {
    return (
      <BaseCard className={cn(
        'flex items-center gap-4 p-6',
        ATTENDANCE_THEME.operations.delete.bg,
        'border',
        ATTENDANCE_THEME.operations.delete.border
      )}>
        <div className={cn(
          'p-3 rounded-lg',
          ATTENDANCE_THEME.operations.delete.bg
        )}>
          <AlertCircle className={cn(
            'w-6 h-6',
            ATTENDANCE_THEME.operations.delete.muted
          )} />
        </div>
        <div>
          <h3 className={cn('font-semibold', ATTENDANCE_THEME.base.text.primary)}>
            Acceso Denegado
          </h3>
          <p className={ATTENDANCE_THEME.base.text.muted}>
            No tienes permisos para ver los estados de asistencia
          </p>
        </div>
      </BaseCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============================================
          SECCIÓN: HEADER
          ============================================ */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className={cn('text-3xl font-bold', ATTENDANCE_THEME.base.text.primary)}>
            Estados de Asistencia
          </h1>
          <p className={cn('mt-2', ATTENDANCE_THEME.base.text.muted)}>
            Gestiona los estados de asistencia disponibles en el sistema
          </p>
        </div>

        {/* Botón Crear (solo visible si no estamos en formulario) */}
        {viewMode !== 'form' && canCreateStatus && (
          <Button
            onClick={() => {
              setEditingStatus(undefined);
              setViewMode('form');
            }}
            className={cn(
              ATTENDANCE_THEME.operations.create.button,
              'text-white gap-2'
            )}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Crear Estado</span>
            <span className="sm:hidden">Crear</span>
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
          >
            Volver a Lista
          </Button>
        )}
      </div>

      {/* ============================================
          SECCIÓN: FORMULARIO
          ============================================ */}
      {viewMode === 'form' && (
        <AttendanceStatusForm
          initialData={editingStatus}
          onSubmit={editingStatus ? handleUpdate : handleCreate}
          onCancel={() => {
            setViewMode('list');
            setEditingStatus(undefined);
          }}
          isLoading={isOperating}
        />
      )}

      {/* ============================================
          SECCIÓN: LISTA/GRID
          ============================================ */}
      {viewMode !== 'form' && (
        <>
          {/* FILTROS */}
          <AttendanceStatusFilters filters={filters} onFilterChange={setFilters} />

          {/* TOGGLE DE VISTA (TABS) - PEQUEÑO A LA DERECHA */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full">
            <TabsList className={cn(
              'grid grid-cols-2 w-fit ml-auto gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700'
            )}>
              <TabsTrigger 
                value="list" 
                className={cn(
                  'gap-1 py-1.5 px-2.5 text-xs transition-all',
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-slate-700 shadow-sm' 
                    : ''
                )}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lista</span>
              </TabsTrigger>
              <TabsTrigger 
                value="grid" 
                className={cn(
                  'gap-1 py-1.5 px-2.5 text-xs transition-all',
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-slate-700 shadow-sm' 
                    : ''
                )}
              >
                <Grid3x3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cuadrícula</span>
              </TabsTrigger>
            </TabsList>

            {/* ESTADO DE ERROR */}
            {error && (
              <BaseCard className={cn(
                'flex items-center gap-4 p-4',
                ATTENDANCE_THEME.operations.delete.bg,
                'border',
                ATTENDANCE_THEME.operations.delete.border
              )}>
                <AlertCircle className={cn(
                  'w-5 h-5 flex-shrink-0',
                  ATTENDANCE_THEME.operations.delete.muted
                )} />
                <div>
                  <h3 className={cn('font-semibold', ATTENDANCE_THEME.operations.delete.text)}>
                    Error al cargar
                  </h3>
                  <p className={cn('text-sm', ATTENDANCE_THEME.operations.delete.muted)}>
                    {error}
                  </p>
                </div>
              </BaseCard>
            )}

            {/* CONTENIDO */}
            {!error && (
              <>
                {/* VISTA LISTA */}
                <TabsContent value="list" className="space-y-4">
                  <AttendanceStatusTable
                    statuses={statuses}
                    loading={isLoading}
                    onEdit={(status) => {
                      setEditingStatus(status);
                      setViewMode('form');
                    }}
                    onDelete={(id) => {
                      const status = statuses.find((s) => s.id === id);
                      if (status) handleDeleteClick(id, status.name);
                    }}
                    onToggleActive={handleToggleActive}
                  />
                </TabsContent>

                {/* VISTA GRID */}
                <TabsContent value="grid">
                  {isLoading ? (
                    <BaseCard className="flex flex-col items-center justify-center py-16 px-6">
                      <div className="relative mb-6">
                        <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-400"></div>
                        <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-blue-600/20 opacity-20"></div>
                      </div>
                      <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                        Cargando estados de asistencia...
                      </p>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Por favor espera un momento
                      </p>
                    </BaseCard>
                  ) : statuses.length === 0 ? (
                    <BaseCard className="flex flex-col items-center justify-center py-16 px-6 border-dashed">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-2xl opacity-50"></div>
                        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-5 rounded-full">
                          <Grid3x3 className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No hay estados registrados
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                        Aún no se han creado estados de asistencia. Comienza agregando tu primer estado.
                      </p>
                      
                      {canCreateStatus && (
                        <Button
                          onClick={() => {
                            setEditingStatus(undefined);
                            setViewMode('form');
                          }}
                          className={cn(
                            ATTENDANCE_THEME.operations.create.button,
                            'text-white'
                          )}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Crear primer estado
                        </Button>
                      )}
                    </BaseCard>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {statuses.map((status) => (
                        <AttendanceStatusCard
                          key={status.id}
                          status={status}
                          onEdit={(s) => {
                            setEditingStatus(s);
                            setViewMode('form');
                          }}
                          onDelete={(id) => {
                            const status = statuses.find((s) => s.id === id);
                            if (status) handleDeleteClick(id, status.name);
                          }}
                          onToggleActive={handleToggleActive}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>

          {/* ============================================
              SECCIÓN: PAGINACIÓN
              ============================================ */}
          {meta && meta.totalPages > 1 && (
            <BaseCard className="flex items-center justify-between flex-wrap gap-4 p-4">
              <p className={cn('text-sm', ATTENDANCE_THEME.base.text.muted)}>
                Página {meta.page} de {meta.totalPages} ({meta.total} registros)
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    updateQuery({
                      page: Math.max(1, (filters.page || 1) - 1),
                    })
                  }
                  disabled={meta.page === 1}
                  variant={meta.page === 1 ? 'ghost' : 'outline'}
                >
                  Anterior
                </Button>
                <Button
                  onClick={() =>
                    updateQuery({
                      page: Math.min(meta.totalPages, (filters.page || 1) + 1),
                    })
                  }
                  disabled={meta.page === meta.totalPages}
                  variant={meta.page === meta.totalPages ? 'ghost' : 'outline'}
                >
                  Siguiente
                </Button>
              </div>
            </BaseCard>
          )}
        </>
      )}

      {/* ============================================
          SECCIÓN: DIÁLOGO CONFIRMACIÓN ELIMINACIÓN
          ============================================ */}
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