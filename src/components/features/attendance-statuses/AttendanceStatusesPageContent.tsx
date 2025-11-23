```typescript
// src/components/features/attendance-statuses/AttendanceStatusesPageContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, AlertCircle, Grid3x3, List, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceStatus } from '@/types/attendance-status.types';
import { useAttendanceStatuses, useAttendanceStatusPermissions } from '@/hooks/data';
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

export const AttendanceStatusesPageContent = () => {
  const { canReadStatuses, canCreateStatus, canUpdateStatus, canDeleteStatus } =
    useAttendanceStatusPermissions();

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
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-destructive">Acceso Denegado</h3>
            <p className="text-muted-foreground">
              No tienes permisos para ver los estados de asistencia
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ============================================
          SECCIÓN: HEADER
          ============================================ */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Estados de Asistencia
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Configura los estados disponibles para el registro diario.
          </p>
        </div>

        {/* Botón Crear (solo visible si no estamos en formulario) */}
        {viewMode !== 'form' && canCreateStatus && (
          <Button
            onClick={() => {
              setEditingStatus(undefined);
              setViewMode('form');
            }}
            className="shadow-sm hover:shadow-md transition-all"
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
          {/* CONTROLES SUPERIORES */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <AttendanceStatusFilters filters={query} onFilterChange={updateQuery} />
            
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-2 sm:w-[200px]">
                <TabsTrigger value="list" className="gap-2">
                  <List className="w-4 h-4" />
                  Lista
                </TabsTrigger>
                <TabsTrigger value="grid" className="gap-2">
                  <Grid3x3 className="w-4 h-4" />
                  Grid
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* ESTADO DE ERROR */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="flex items-center gap-4 p-4">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">Error al cargar</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
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
                    onEdit={(status) => {
                      setEditingStatus(status);
                      setViewMode('form');
                    }}
                    onDelete={(id) => {
                      const status = statuses.find((s) => s.id === id);
                      if (status) handleDeleteClick(id, status.name);
                    }}
                    onToggleActive={handleToggleActive}
                    onAdd={() => {
                      setEditingStatus(undefined);
                      setViewMode('form');
                    }}
                  />
                </div>
              )}

              {/* VISTA GRID */}
              {viewMode === 'grid' && (
                <div className="animate-in fade-in duration-300">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-muted/50 animate-pulse" />
                      ))}
                    </div>
                  ) : statuses.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="p-4 rounded-full bg-primary/5 mb-4">
                          <ShieldCheck className="h-10 w-10 text-primary/50" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No hay estados registrados</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                          Comienza creando los estados que utilizarás para registrar la asistencia.
                        </p>
                        {canCreateStatus && (
                          <Button onClick={() => setViewMode('form')}>
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
                </div>
              )}
            </>
          )}

          {/* PAGINACIÓN */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuery({ page: Math.max(1, (pagination.page || 1) - 1) })}
                  disabled={pagination.page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuery({ page: Math.min(pagination.totalPages, (pagination.page || 1) + 1) })}
                  disabled={pagination.page === pagination.totalPages}
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
```