// src/components/features/attendance-statuses/AttendanceStatusFilters.tsx
'use client';

import { AttendanceStatusQuery } from '@/types/attendance-status.types';
import { Search, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ATTENDANCE_THEME } from '@/constants/attendance-statuses-theme';
import { BaseCard } from '@/components/features/attendance-statuses/card/base-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface AttendanceStatusFiltersProps {
  onFilterChange: (filters: AttendanceStatusQuery) => void;
  filters: AttendanceStatusQuery;
}

export const AttendanceStatusFilters = ({
  onFilterChange,
  filters,
}: AttendanceStatusFiltersProps) => {
  // ============================================
  // ESTADO DE FILTROS
  // ============================================
  const hasActiveFilters =
    filters.search ||
    filters.isActive !== undefined ||
    filters.isNegative !== undefined ||
    filters.requiresJustification !== undefined;

  // ============================================
  // HANDLERS - BÚSQUEDA
  // ============================================
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value || undefined, page: 1 });
  };

  // ============================================
  // HANDLERS - ESTADO
  // ============================================
  const handleActiveChange = (value: string) => {
    const isActive = value === 'all' ? undefined : value === 'true';
    onFilterChange({ ...filters, isActive, page: 1 });
  };

  // ============================================
  // HANDLERS - TIPO (NEGATIVO/AUSENCIA)
  // ============================================
  const handleNegativeChange = (value: string) => {
    const isNegative = value === 'all' ? undefined : value === 'true';
    onFilterChange({ ...filters, isNegative, page: 1 });
  };

  // ============================================
  // HANDLERS - JUSTIFICACIÓN
  // ============================================
  const handleJustificationChange = (value: string) => {
    const requiresJustification = value === 'all' ? undefined : value === 'true';
    onFilterChange({ ...filters, requiresJustification, page: 1 });
  };

  // ============================================
  // HANDLERS - ORDENAR
  // ============================================
  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split(':') as [
      'code' | 'name' | 'order' | 'createdAt' | 'updatedAt',
      'asc' | 'desc'
    ];
    onFilterChange({ ...filters, sortBy, sortOrder, page: 1 });
  };

  // ============================================
  // HANDLERS - LIMPIAR FILTROS
  // ============================================
  const handleReset = () => {
    onFilterChange({ page: 1, limit: 10 });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 space-y-5">
      {/* ============================================
          SECCIÓN: HEADER CON TÍTULO Y BOTÓN LIMPIAR
          ============================================ */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Filtros y Ordenamiento
        </h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* ============================================
          SECCIÓN: GRID DE FILTROS
          ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* ============================================
            FILTRO 1: BÚSQUEDA
            ============================================ */}
        <div className="md:col-span-2 lg:col-span-2">
          <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Búsqueda
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500 dark:text-slate-400" />
            <Input
              type="text"
              placeholder="Código, nombre..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* ============================================
            FILTRO 2: ESTADO (ACTIVO/INACTIVO)
            ============================================ */}
        <div>
          <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Estado
          </label>
          <Select
            value={filters.isActive === undefined ? 'all' : filters.isActive ? 'true' : 'false'}
            onValueChange={handleActiveChange}
          >
            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Activos</SelectItem>
              <SelectItem value="false">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ============================================
            FILTRO 3: TIPO (AUSENCIA/PRESENCIA)
            ============================================ */}
        <div>
          <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Tipo
          </label>
          <Select
            value={filters.isNegative === undefined ? 'all' : filters.isNegative ? 'true' : 'false'}
            onValueChange={handleNegativeChange}
          >
            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Ausencias</SelectItem>
              <SelectItem value="false">Presencias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ============================================
            FILTRO 4: JUSTIFICACIÓN REQUERIDA
            ============================================ */}
        <div>
          <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Justificación
          </label>
          <Select
            value={filters.requiresJustification === undefined ? 'all' : filters.requiresJustification ? 'true' : 'false'}
            onValueChange={handleJustificationChange}
          >
            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Requieren</SelectItem>
              <SelectItem value="false">No requieren</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ============================================
            FILTRO 5: ORDENAMIENTO
            ============================================ */}
        <div>
          <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Ordenar
          </label>
          <Select
            value={`${filters.sortBy || 'order'}:${filters.sortOrder || 'asc'}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order:asc">Orden ↑</SelectItem>
              <SelectItem value="order:desc">Orden ↓</SelectItem>
              <SelectItem value="code:asc">Código A-Z</SelectItem>
              <SelectItem value="code:desc">Código Z-A</SelectItem>
              <SelectItem value="name:asc">Nombre A-Z</SelectItem>
              <SelectItem value="name:desc">Nombre Z-A</SelectItem>
              <SelectItem value="createdAt:desc">Más recientes</SelectItem>
              <SelectItem value="createdAt:asc">Más antiguos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};