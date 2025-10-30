// src/components/features/academic-weeks/AcademicWeekList.tsx

'use client';

import React from 'react';
import { Calendar, Clock, Edit2, Trash2, Eye, CheckCircle2, XCircle, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AcademicWeek, WEEK_TYPE_LABELS } from '@/types/academic-week.types';
import { getWeekTypeTheme } from '@/config/theme.config';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AcademicWeekListProps {
  weeks: AcademicWeek[];
  isLoading?: boolean;
  onView?: (week: AcademicWeek) => void;
  onEdit?: (week: AcademicWeek) => void;
  onDelete?: (week: AcademicWeek) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  // Paginación
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  // Ordenamiento
  sortBy?: 'weekNumber' | 'startDate' | 'name';
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: 'weekNumber' | 'startDate' | 'name') => void;
}

/**
 * 📃 Vista de Lista compacta para Academic Weeks
 * 
 * Lista densa con ordenamiento y paginación
 */
export function AcademicWeekList({
  weeks,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  currentPage,
  totalPages,
  onPageChange,
  sortBy = 'weekNumber',
  sortOrder = 'asc',
  onSort,
}: AcademicWeekListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (weeks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No se encontraron semanas académicas
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No hay semanas académicas que coincidan con los filtros seleccionados.
        </p>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="space-y-4">
      {/* Header de la tabla */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400">
        <div className="col-span-1 flex items-center gap-1 cursor-pointer" onClick={() => onSort?.('weekNumber')}>
          #
          {sortBy === 'weekNumber' && <ArrowUpDown className="h-3 w-3" />}
        </div>
        <div className="col-span-3 flex items-center gap-1 cursor-pointer" onClick={() => onSort?.('name')}>
          Nombre
          {sortBy === 'name' && <ArrowUpDown className="h-3 w-3" />}
        </div>
        <div className="col-span-2">Tipo</div>
        <div className="col-span-2 flex items-center gap-1 cursor-pointer" onClick={() => onSort?.('startDate')}>
          Inicio
          {sortBy === 'startDate' && <ArrowUpDown className="h-3 w-3" />}
        </div>
        <div className="col-span-2">Fin</div>
        <div className="col-span-1">Estado</div>
        <div className="col-span-1 text-right">Acciones</div>
      </div>

      {/* Filas */}
      <div className="space-y-2">
        {weeks.map((week) => {
          const theme = getWeekTypeTheme(week.weekType);
          const start = new Date(week.startDate);
          const end = new Date(week.endDate);
          const isInProgress = now >= start && now <= end;

          return (
            <div
              key={week.id}
              className={cn(
                'grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border-l-4 transition-all duration-200',
                'hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800',
                week.isActive
                  ? `${theme.border} bg-white dark:bg-gray-900`
                  : 'border-l-gray-300 dark:border-l-gray-600 bg-gray-50 dark:bg-gray-800',
              )}
            >
              {/* Número */}
              <div className="col-span-1 flex items-center">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {week.weekNumber}
                </span>
              </div>

              {/* Nombre */}
              <div className="col-span-3 flex items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {week.name}
                  </p>
                  {isInProgress && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                      <Clock className="h-3 w-3" />
                      En curso
                    </span>
                  )}
                </div>
              </div>

              {/* Tipo */}
              <div className="col-span-2 flex items-center">
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', theme.badge)}>
                  {WEEK_TYPE_LABELS[week.weekType]}
                </span>
              </div>

              {/* Fecha inicio */}
              <div className="col-span-2 flex items-center">
                <div className="flex items-center gap-2">
                  <Calendar className={cn('h-4 w-4', theme.icon)} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {format(start, 'd MMM yyyy', { locale: es })}
                  </span>
                </div>
              </div>

              {/* Fecha fin */}
              <div className="col-span-2 flex items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {format(end, 'd MMM yyyy', { locale: es })}
                </span>
              </div>

              {/* Estado */}
              <div className="col-span-1 flex items-center">
                {week.isActive ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                )}
              </div>

              {/* Acciones */}
              <div className="col-span-1 flex items-center justify-end gap-1">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(week)}
                    className="h-7 w-7 p-0"
                    title="Ver detalles"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                )}
                {canEdit && onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(week)}
                    className="h-7 w-7 p-0 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Editar"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                {canDelete && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(week)}
                    className="h-7 w-7 p-0 hover:text-red-600 dark:hover:text-red-400"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Página {currentPage} de {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            {/* Números de página */}
            <div className="hidden md:flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum: number;
                
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={i}
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AcademicWeekList;
