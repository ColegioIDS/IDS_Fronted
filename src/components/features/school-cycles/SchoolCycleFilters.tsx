// src/components/features/school-cycles/SchoolCycleFilters.tsx
'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuerySchoolCyclesDto } from '@/types/school-cycle.types';
import {
  Search,
  Filter,
  X,
  Zap,
  Lock,
  CheckCircle,
  Calendar,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';

interface SchoolCycleFiltersProps {
  onFilterChange: (filters: Partial<QuerySchoolCyclesDto>) => void;
  isLoading?: boolean;
  totalResults?: number;
}

export function SchoolCycleFilters({
  onFilterChange,
  isLoading = false,
  totalResults = 0,
}: SchoolCycleFiltersProps) {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    isActive: undefined as boolean | undefined,
    isArchived: undefined as boolean | undefined,
    canEnroll: undefined as boolean | undefined,
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
        canEnroll: newFilters.canEnroll,
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
      canEnroll: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    onFilterChange({
      search: undefined,
      isActive: undefined,
      isArchived: undefined,
      canEnroll: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
    });
  }, [onFilterChange]);

  const activeFiltersCount = [
    search.trim().length > 0,
    filters.isActive !== undefined,
    filters.isArchived !== undefined,
    filters.canEnroll !== undefined,
  ].filter(Boolean).length;

  const hasActiveFilters =
    search.trim().length > 0 ||
    filters.isActive !== undefined ||
    filters.isArchived !== undefined ||
    filters.canEnroll !== undefined;

  return (
    <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-lg">
      <CardContent className="p-6 space-y-6">
        {/* Header con contador de resultados */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30
              border-2 border-blue-200 dark:border-blue-800 shadow-md">
              <Filter className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
              {activeFiltersCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 dark:bg-blue-500
                  rounded-full animate-pulse flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{activeFiltersCount}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Filtros de búsqueda
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="text-red-600 border-red-300 hover:bg-red-50
                dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30
                font-semibold"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
              Limpiar todo
            </Button>
          )}
        </div>

        {/* Barra de búsqueda destacada */}
        <div className="relative group/search">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-transform
            group-focus-within/search:scale-110 duration-200">
            <Search className="w-6 h-6 text-blue-500 dark:text-blue-400" strokeWidth={2.5} />
          </div>
          <Input
            type="text"
            placeholder="Buscar por nombre del ciclo escolar..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isLoading}
            className="pl-14 pr-12 h-14 text-base font-medium
              bg-white dark:bg-gray-900
              border-2 border-gray-300 dark:border-gray-700
              focus:border-blue-500 dark:focus:border-blue-500
              focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30
              shadow-sm focus:shadow-lg
              rounded-xl
              transition-all duration-200"
          />
          {search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2
                p-2 rounded-lg
                bg-gray-100 hover:bg-red-100 dark:bg-gray-800 dark:hover:bg-red-900/30
                text-gray-500 hover:text-red-600 dark:hover:text-red-400
                transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Filtros toggle */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            className={showFilters ? 'bg-blue-600 hover:bg-blue-700' : ''}
            disabled={isLoading}
          >
            <Filter className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Filtros avanzados
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t-2 border-gray-200 dark:border-gray-800">
            {/* Estado activo */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                  <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                </div>
                Estado Activo
              </label>
              <select
                value={filters.isActive === undefined ? '' : String(filters.isActive)}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : e.target.value === 'true';
                  handleFilterChange('isActive', value);
                }}
                disabled={isLoading}
                className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-700
                  rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  text-sm font-medium focus:border-blue-500 dark:focus:border-blue-500
                  focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30
                  transition-all duration-200"
              >
                <option value="">Todos</option>
                <option value="true">✓ Activos</option>
                <option value="false">✗ Inactivos</option>
              </select>
            </div>

            {/* Estado cerrado */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                  <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" strokeWidth={2.5} />
                </div>
                Estado Cerrado
              </label>
              <select
                value={filters.isArchived === undefined ? '' : String(filters.isArchived)}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : e.target.value === 'true';
                  handleFilterChange('isArchived', value);
                }}
                disabled={isLoading}
                className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-700
                  rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  text-sm font-medium focus:border-blue-500 dark:focus:border-blue-500
                  focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30
                  transition-all duration-200"
              >
                <option value="">Todos</option>
                <option value="true">🔒 Cerrados</option>
                <option value="false">🔓 Abiertos</option>
              </select>
            </div>

            {/* Matrículas */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                </div>
                Matrículas
              </label>
              <select
                value={filters.canEnroll === undefined ? '' : String(filters.canEnroll)}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : e.target.value === 'true';
                  handleFilterChange('canEnroll', value);
                }}
                disabled={isLoading}
                className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-700
                  rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  text-sm font-medium focus:border-blue-500 dark:focus:border-blue-500
                  focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30
                  transition-all duration-200"
              >
                <option value="">Todas</option>
                <option value="true">✓ Abiertas</option>
                <option value="false">✗ Cerradas</option>
              </select>
            </div>

            {/* Ordenar por */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                </div>
                Ordenar por
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-700
                  rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  text-sm font-medium focus:border-blue-500 dark:focus:border-blue-500
                  focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30
                  transition-all duration-200"
              >
                <option value="createdAt">📅 Fecha de creación</option>
                <option value="name">🔤 Nombre</option>
                <option value="startDate">▶️ Fecha de inicio</option>
                <option value="endDate">⏹️ Fecha de fin</option>
              </select>
            </div>

            {/* Orden */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30">
                  <ArrowUpDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
                </div>
                Orden
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                disabled={isLoading}
                className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-700
                  rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  text-sm font-medium focus:border-blue-500 dark:focus:border-blue-500
                  focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30
                  transition-all duration-200"
              >
                <option value="desc">⬇️ Descendente</option>
                <option value="asc">⬆️ Ascendente</option>
              </select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
