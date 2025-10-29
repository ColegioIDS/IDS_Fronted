// src/components/features/school-cycles/SchoolCycleFilters.tsx

'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuerySchoolCyclesDto } from '@/types/school-cycle.types';
import { Search, Filter, X, Zap, Lock, Calendar, CheckCircle } from 'lucide-react';
import { getModuleTheme } from '@/config/theme.config';

interface SchoolCycleFiltersProps {
  onFilterChange: (filters: Partial<QuerySchoolCyclesDto>) => void;
  isLoading?: boolean;
}

export function SchoolCycleFilters({
  onFilterChange,
  isLoading = false,
}: SchoolCycleFiltersProps) {
  const theme = getModuleTheme('school-cycle');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    isActive: undefined as boolean | undefined,
isArchived: undefined as boolean | undefined,
    canEnroll: undefined as boolean | undefined, // ← NUEVO
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  });

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      onFilterChange({ search: value || undefined, page: 1 });
    },
    [onFilterChange]
  );

  const handleFilterChange = useCallback(
    (key: keyof typeof filters, value: any) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);

      onFilterChange({
        isActive: newFilters.isActive,
        isArchived: newFilters.isArchived,
        canEnroll: newFilters.canEnroll, // ← NUEVO
        sortBy: newFilters.sortBy,
        sortOrder: newFilters.sortOrder,
        page: 1,
      });
    },
    [filters, onFilterChange]
  );

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setFilters({
      isActive: undefined,
      isArchived: undefined,
      canEnroll: undefined, // ← NUEVO
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    onFilterChange({
      search: undefined,
      isActive: undefined,
      isArchived: undefined,
      canEnroll: undefined, // ← NUEVO
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
    });
  }, [onFilterChange]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    filters.isActive !== undefined ||
    filters.isArchived !== undefined;

  return (
    <Card className="border-0 shadow-md bg-white dark:bg-gray-900">
      <CardContent className="p-4 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2.5} />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isLoading}
            className="pl-10"
          />
        </div>

        {/* Filters toggle */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <Filter className="w-4 h-4" strokeWidth={2.5} />
            Filtros avanzados
          </Button>

          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="ghost"
              size="sm"
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700"
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-1" strokeWidth={2.5} />
              Limpiar
            </Button>
          )}
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            {/* Estado activo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Zap className="w-4 h-4" strokeWidth={2.5} />
                Activo
              </label>
              <select
                value={filters.isActive === undefined ? '' : String(filters.isActive)}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : e.target.value === 'true';
                  handleFilterChange('isActive', value);
                }}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>

            {/* Estado cerrado */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4" strokeWidth={2.5} />
                Cerrado
              </label>
              <select
                value={filters.isArchived === undefined ? '' : String(filters.isArchived)}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : e.target.value === 'true';
                  handleFilterChange('isArchived', value);
                }}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Todos</option>
                <option value="true">Cerrados</option>
                <option value="false">Abiertos</option>
              </select>
            </div>

            {/* Matrículas */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
                Matrículas
              </label>
              <select
                value={filters.canEnroll === undefined ? '' : String(filters.canEnroll)}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : e.target.value === 'true';
                  handleFilterChange('canEnroll', value);
                }}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Todas</option>
                <option value="true">Abiertas</option>
                <option value="false">Cerradas</option>
              </select>
            </div>

            {/* Ordenar por */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" strokeWidth={2.5} />
                Ordenar por
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="createdAt">Creación</option>
                <option value="name">Nombre</option>
                <option value="startDate">Inicio</option>
                <option value="endDate">Fin</option>
              </select>
            </div>

            {/* Orden */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Orden
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}