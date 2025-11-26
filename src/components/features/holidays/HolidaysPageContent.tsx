// src/components/features/holidays/HolidaysPageContent.tsx

'use client';

import React, { useState } from 'react';
import { Plus, Coffee, Calendar, Umbrella } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useHolidays } from '@/hooks/data/useHolidays';
import { useHolidayBreakWeeks } from '@/hooks/data/useHolidayBreakWeeks';
import { holidaysService } from '@/services/holidays.service';
import { CreateHolidayDto, UpdateHolidayDto, Holiday } from '@/types/holidays.types';
import {
  HolidayStats,
  HolidayFilters,
  HolidaysGrid,
  HolidayFormDialog,
  HolidayDetailDialog,
  DeleteHolidayDialog,
  HolidaysCalendar,
} from './index';

/**
 * 🏠 Componente principal de la página de Holidays
 */
export function HolidaysPageContent() {
  const {
    data: holidays,
    meta,
    isLoading,
    error,
    query,
    updateQuery,
    setPage,
    refresh,
  } = useHolidays();

  // Hook para semanas BREAK
  const { breakWeeks, isLoading: loadingBreakWeeks } = useHolidayBreakWeeks(
    query.cycleId,
    query.bimesterId
  );

  // Estados para dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers - CREATE
  const handleOpenCreate = () => {
    setFormMode('create');
    setSelectedHoliday(null);
    setFormDialogOpen(true);
  };

  const handleCreate = async (data: CreateHolidayDto) => {
    setIsSubmitting(true);
    try {
      await holidaysService.create(data);
      toast.success('Día festivo creado correctamente');
      setFormDialogOpen(false);
      refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'No se pudo crear el día festivo. Por favor, intente nuevamente.';
      toast.error(`Error al crear: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers - UPDATE
  const handleOpenEdit = (holiday: Holiday) => {
    setFormMode('edit');
    setSelectedHoliday(holiday);
    setFormDialogOpen(true);
  };

  const handleUpdate = async (data: CreateHolidayDto) => {
    if (!selectedHoliday) return;

    setIsSubmitting(true);
    try {
      const updateData: UpdateHolidayDto = {
        bimesterId: data.bimesterId,
        date: data.date,
        description: data.description,
        isRecovered: data.isRecovered,
      };

      await holidaysService.update(selectedHoliday.id, updateData);
      toast.success('Día festivo actualizado correctamente');
      setFormDialogOpen(false);
      setSelectedHoliday(null);
      refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'No se pudo actualizar el día festivo. Por favor, intente nuevamente.';
      toast.error(`Error al actualizar: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers - DELETE
  const handleOpenDelete = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedHoliday) return;

    setIsSubmitting(true);
    try {
      await holidaysService.delete(selectedHoliday.id);
      toast.success('Día festivo eliminado correctamente');
      setDeleteDialogOpen(false);
      setSelectedHoliday(null);
      refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'No se pudo eliminar el día festivo. Por favor, intente nuevamente.';
      toast.error(`Error al eliminar: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers - DETAIL
  const handleOpenDetail = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setDetailDialogOpen(true);
  };

  // Handlers - FILTERS
  const handleFilterChange = (filters: {
    cycleId?: number;
    bimesterId?: number;
    isRecovered?: boolean | 'all';
  }) => {
    // Convertir 'all' a undefined para el query del backend
    const queryFilters = {
      cycleId: filters.cycleId,
      bimesterId: filters.bimesterId,
      isRecovered: filters.isRecovered === 'all' ? undefined : filters.isRecovered,
    };
    updateQuery({ ...queryFilters, page: 1 });
  };

  const handleResetFilters = () => {
    updateQuery({ page: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Días Festivos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestión de días festivos y recuperables
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Día Festivo
        </Button>
      </div>

      {/* Estadísticas */}
      <HolidayStats holidays={holidays} />

      {/* Semanas BREAK */}
      {query.bimesterId && breakWeeks.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900/50 dark:via-gray-900/30 dark:to-gray-950/50 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gray-200/30 to-transparent dark:from-gray-700/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 shadow-lg">
                  <Umbrella className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2.5">
                  Semanas de Receso
                  <span className="text-xs font-medium px-2.5 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                    BREAK
                  </span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  No se pueden agregar días festivos durante estas semanas de receso académico. Las fechas están bloqueadas automáticamente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {breakWeeks.map((week) => (
                <div
                  key={week.id}
                  className="group bg-white dark:bg-gray-900/60 rounded-lg px-4 py-4 border-2 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                      <Coffee className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Semana {week.number}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">
                      {format(new Date(week.startDate), 'd MMM', { locale: es })} -{' '}
                      {format(new Date(week.endDate), 'd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendario Visual en Accordion */}
      {query.cycleId && holidays.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="calendar" className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    Ver Calendario Mensual
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Visualización mensual de días festivos y semanas de receso
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <HolidaysCalendar 
                holidays={holidays} 
                breakWeeks={breakWeeks}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Filtros */}
      <HolidayFilters
        filters={{
          cycleId: query.cycleId,
          bimesterId: query.bimesterId,
          isRecovered: query.isRecovered,
        }}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300 text-sm font-medium mb-2">
            Error al cargar días festivos
          </p>
          <p className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </p>
          {error.toLowerCase().includes('permiso') || error.toLowerCase().includes('autorizado') ? (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">
              No tienes los permisos necesarios para acceder a esta sección. Contacta al administrador del sistema.
            </p>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="mt-3 border-red-300 dark:border-red-700"
            >
              Reintentar
            </Button>
          )}
        </div>
      )}

      {/* Grid de días festivos */}
      <HolidaysGrid
        holidays={holidays}
        isLoading={isLoading}
        onView={handleOpenDetail}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        canEdit={true}
        canDelete={true}
      />

      {/* Paginación */}
      {!isLoading && holidays.length > 0 && meta && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {(meta.page - 1) * meta.limit + 1} -{' '}
            {Math.min(meta.page * meta.limit, meta.total)} de{' '}
            {meta.total} días festivos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(meta.page - 1)}
              disabled={meta.page <= 1}
              className="border-gray-300 dark:border-gray-600"
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Página {meta.page} de {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="border-gray-300 dark:border-gray-600"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <HolidayFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        mode={formMode}
        holiday={selectedHoliday}
        onSubmit={formMode === 'create' ? handleCreate : handleUpdate}
        isSubmitting={isSubmitting}
      />

      <HolidayDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        holiday={selectedHoliday}
      />

      <DeleteHolidayDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        holiday={selectedHoliday}
        onConfirm={handleDelete}
        isDeleting={isSubmitting}
      />
    </div>
  );
}

export default HolidaysPageContent;
