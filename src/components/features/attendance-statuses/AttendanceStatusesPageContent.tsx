// src/components/features/attendance-statuses/AttendanceStatusesPageContent.tsx
'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Plus, AlertCircle } from 'lucide-react';
import { AttendanceStatus, AttendanceStatusQuery } from '@/types/attendance-status.types';
import { useAttendanceStatuses, useAttendanceStatusPermissions } from '@/hooks/data';
import { attendanceStatusesService } from '@/services/attendance-statuses.service';
import { AttendanceStatusCard } from './AttendanceStatusCard';
import { AttendanceStatusTable } from './AttendanceStatusTable';
import { AttendanceStatusForm } from './AttendanceStatusForm';
import { AttendanceStatusFilters } from './AttendanceStatusFilters';
import { DeleteStatusDialog } from './DeleteStatusDialog';

type ViewMode = 'list' | 'grid' | 'form';

export const AttendanceStatusesPageContent = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { canReadStatuses, canCreateStatus, canUpdateStatus, canDeleteStatus } =
    useAttendanceStatusPermissions();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<AttendanceStatusQuery>({ page: 1, limit: 10 });
  const [editingStatus, setEditingStatus] = useState<AttendanceStatus | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [isOperating, setIsOperating] = useState(false);

  const { data: statusesData, isLoading, error, refresh, updateQuery } = useAttendanceStatuses(filters);

  const statuses = statusesData?.data || [];
  const meta = statusesData?.meta;

  // Handlers
  const handleCreate = async (data: any) => {
    try {
      setIsOperating(true);
      await attendanceStatusesService.createStatus(data);
      setViewMode('list');
      refresh();
    } catch (error) {
      console.error('Error creating status:', error);
      alert('Error al crear estado');
    } finally {
      setIsOperating(false);
    }
  };

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
      alert('Error al actualizar estado');
    } finally {
      setIsOperating(false);
    }
  };

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
      alert('Error al eliminar estado');
    } finally {
      setIsOperating(false);
    }
  };

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
      alert('Error al cambiar estado');
    } finally {
      setIsOperating(false);
    }
  };

  // Theme variables
  const bgColor = isDark ? 'bg-slate-900' : 'bg-white';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const mutedColor = isDark ? 'text-slate-400' : 'text-slate-600';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';

  // Check permissions
  if (!canReadStatuses) {
    return (
      <div className={`flex items-center gap-3 p-6 rounded-lg border ${borderColor} ${bgColor}`}>
        <AlertCircle className="w-5 h-5 text-orange-500" />
        <div>
          <h3 className={`font-semibold ${textColor}`}>Acceso Denegado</h3>
          <p className={mutedColor}>No tienes permisos para ver los estados de asistencia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${textColor}`}>Estados de Asistencia</h1>
          <p className={`mt-1 ${mutedColor}`}>Gestiona los estados de asistencia del sistema</p>
        </div>

        <div className="flex gap-2">
          {viewMode !== 'form' && canCreateStatus && (
            <button
              onClick={() => {
                setEditingStatus(undefined);
                setViewMode('form');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear Estado
            </button>
          )}

          {viewMode === 'form' && (
            <button
              onClick={() => {
                setViewMode('list');
                setEditingStatus(undefined);
              }}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
              }`}
            >
              Volver
            </button>
          )}
        </div>
      </div>

      {/* Form View */}
      {viewMode === 'form' && (
        <div>
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

      {/* List/Grid View */}
      {viewMode !== 'form' && (
        <>
          {/* Filters */}
          <AttendanceStatusFilters filters={filters} onFilterChange={setFilters} />

          {/* View Toggle */}
          <div className={`flex gap-2 p-3 rounded-lg border ${borderColor} ${bgColor}`}>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Cuadrícula
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className={`flex items-center gap-3 p-4 rounded-lg border ${borderColor} ${bgColor}`}>
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <h3 className={`font-semibold ${textColor}`}>Error al cargar</h3>
                <p className={mutedColor}>{error}</p>
              </div>
            </div>
          )}

          {/* Content */}
          {!error && (
            <>
              {viewMode === 'list' ? (
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? (
                    <p className={mutedColor}>Cargando...</p>
                  ) : (
                    statuses.map((status) => (
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
                      />
                    ))
                  )}
                </div>
              )}

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div
                  className={`flex items-center justify-between p-4 rounded-lg border ${borderColor} ${bgColor}`}
                >
                  <p className={`text-sm ${mutedColor}`}>
                    Página {meta.page} de {meta.totalPages} ({meta.total} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateQuery({
                          page: Math.max(1, (filters.page || 1) - 1),
                        })
                      }
                      disabled={meta.page === 1}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        meta.page === 1
                          ? isDark
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isDark
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() =>
                        updateQuery({
                          page: Math.min(meta.totalPages, (filters.page || 1) + 1),
                        })
                      }
                      disabled={meta.page === meta.totalPages}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        meta.page === meta.totalPages
                          ? isDark
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isDark
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Delete Dialog */}
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
