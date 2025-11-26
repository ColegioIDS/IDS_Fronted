// src/components/features/grades/GradeFilters.tsx

'use client';

import React from 'react';
import { Search, X, BookOpen, Library, School, GraduationCap, CheckCircle2, Circle, Filter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { GradeFilters as GradeFiltersType, EDUCATION_LEVELS } from '@/types/grades.types';

interface GradeFiltersProps {
  filters: GradeFiltersType;
  onFilterChange: (filters: GradeFiltersType) => void;
  onReset: () => void;
}

/**
 * 🔍 Componente de filtros para grados con tooltips y diseño premium
 */
export function GradeFilters({ filters, onFilterChange, onReset }: GradeFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value || undefined });
  };

  const handleLevelChange = (value: string) => {
    onFilterChange({
      ...filters,
      level: value === 'all' ? undefined : value,
    });
  };

  const handleStatusChange = (value: string) => {
    const isActive = value === 'all' ? undefined : value === 'true';
    onFilterChange({ ...filters, isActive });
  };

  const hasActiveFilters = filters.level || filters.isActive !== undefined || filters.search;
  const activeFilterCount = [filters.level, filters.isActive !== undefined, filters.search].filter(Boolean).length;

  return (
    <TooltipProvider>
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-lg
        hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-100 dark:bg-primary-900/20 rounded-full opacity-30" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-100 dark:bg-purple-900/20 rounded-full opacity-30" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl
                    bg-primary-100 dark:bg-primary-950
                    border-2 border-primary-300 dark:border-primary-700
                    shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-help">
                    <Filter className="h-6 w-6 text-primary-700 dark:text-primary-300" strokeWidth={2.5} />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">Sistema de filtros avanzado</p>
                </TooltipContent>
              </Tooltip>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Filtros de Búsqueda
                  {activeFilterCount > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-primary-600 text-white border-0 px-2 py-0.5 cursor-help animate-pulse">
                          {activeFilterCount}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                        <p className="font-semibold">{activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''} activo{activeFilterCount > 1 ? 's' : ''}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Refina tus resultados
                </p>
              </div>
            </div>

            {hasActiveFilters && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50
                      dark:hover:bg-red-950/30 font-semibold border-2 border-transparent
                      hover:border-red-300 dark:hover:border-red-700 transition-all"
                  >
                    <X className="h-4 w-4 mr-1.5" strokeWidth={2.5} />
                    Limpiar Filtros
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">Remover todos los filtros aplicados</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda mejorada con tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center
                    w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/30
                    group-focus-within:bg-primary-100 dark:group-focus-within:bg-primary-900/40
                    border-2 border-transparent group-focus-within:border-primary-300 dark:group-focus-within:border-primary-700
                    transition-all duration-200">
                    <Search className="h-4 w-4 text-primary-600 dark:text-primary-400" strokeWidth={2.5} />
                  </div>
                  <Input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={filters.search || ''}
                    onChange={handleSearchChange}
                    className="pl-14 h-12 border-2 border-gray-200 dark:border-gray-700
                      focus:border-primary-400 dark:focus:border-primary-600
                      focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/30
                      transition-all font-medium"
                  />
                  {filters.search && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Badge className="bg-primary-100 text-primary-700 border-0 px-2 py-0.5 text-xs">
                        {filters.search.length}
                      </Badge>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Busca grados por nombre</p>
              </TooltipContent>
            </Tooltip>

            {/* Filtro por Nivel con tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Select
                    value={filters.level || 'all'}
                    onValueChange={handleLevelChange}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700
                      hover:border-primary-300 dark:hover:border-primary-700
                      focus:border-primary-400 dark:focus:border-primary-600
                      transition-all font-medium">
                      <SelectValue placeholder="Todos los niveles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-medium">
                        <div className="flex items-center gap-2">
                          <Library className="h-4 w-4 text-primary-600 dark:text-primary-400" strokeWidth={2.5} />
                          <span>Todos los niveles</span>
                        </div>
                      </SelectItem>
                      {EDUCATION_LEVELS.map((level) => (
                        <SelectItem key={level} value={level} className="font-medium">
                          <div className="flex items-center gap-2">
                            {level === 'Primaria' && <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />}
                            {level === 'Secundaria' && <School className="h-4 w-4 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />}
                            {level === 'Preparatoria' && <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />}
                            <span>{level}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Filtra por nivel educativo</p>
              </TooltipContent>
            </Tooltip>

            {/* Filtro por Estado con tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Select
                    value={
                      filters.isActive === undefined
                        ? 'all'
                        : filters.isActive
                          ? 'true'
                          : 'false'
                    }
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700
                      hover:border-primary-300 dark:hover:border-primary-700
                      focus:border-primary-400 dark:focus:border-primary-600
                      transition-all font-medium">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-medium">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400" strokeWidth={2.5} />
                          <span>Todos los estados</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="true" className="font-medium">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                          <span className="text-emerald-600 dark:text-emerald-400">Solo activos</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="false" className="font-medium">
                        <div className="flex items-center gap-2">
                          <Circle className="h-4 w-4 text-gray-600 dark:text-gray-400" strokeWidth={2.5} />
                          <span className="text-gray-600 dark:text-gray-400">Solo inactivos</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Filtra por estado de activación</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Indicadores de filtros activos mejorados */}
          {hasActiveFilters && (
            <div className="mt-5 pt-5 border-t-2 border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Filtros aplicados:
                </span>
                {filters.search && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="inline-flex items-center gap-1.5 px-3 py-1.5
                        bg-primary-100 dark:bg-primary-950/40
                        text-primary-700 dark:text-primary-300
                        border-2 border-primary-200 dark:border-primary-800
                        hover:scale-105 transition-transform cursor-help
                        text-xs font-bold shadow-sm">
                        <Search className="h-3.5 w-3.5" strokeWidth={2.5} />
                        "{filters.search}"
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                      <p className="font-semibold">Término de búsqueda activo</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {filters.level && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="inline-flex items-center gap-1.5 px-3 py-1.5
                        bg-secondary-100 dark:bg-secondary-950/40
                        text-secondary-700 dark:text-secondary-300
                        border-2 border-secondary-200 dark:border-secondary-800
                        hover:scale-105 transition-transform cursor-help
                        text-xs font-bold shadow-sm">
                        {filters.level === 'Primaria' && <BookOpen className="h-3.5 w-3.5" strokeWidth={2.5} />}
                        {filters.level === 'Secundaria' && <School className="h-3.5 w-3.5" strokeWidth={2.5} />}
                        {filters.level === 'Preparatoria' && <GraduationCap className="h-3.5 w-3.5" strokeWidth={2.5} />}
                        {filters.level}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                      <p className="font-semibold">Nivel educativo seleccionado</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {filters.isActive !== undefined && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className={`inline-flex items-center gap-1.5 px-3 py-1.5
                        border-2 hover:scale-105 transition-transform cursor-help
                        text-xs font-bold shadow-sm ${
                        filters.isActive
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      }`}>
                        {filters.isActive ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                            Activos
                          </>
                        ) : (
                          <>
                            <Circle className="h-3.5 w-3.5" strokeWidth={2.5} />
                            Inactivos
                          </>
                        )}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                      <p className="font-semibold">Estado de activación filtrado</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default GradeFilters;
