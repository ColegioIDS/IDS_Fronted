// src/components/features/grades/GradeFilters.tsx

'use client';

import React from 'react';
import { Search, X, BookOpen, Library, School, GraduationCap, CheckCircle2, Circle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GradeFilters as GradeFiltersType, EDUCATION_LEVELS } from '@/types/grades.types';

interface GradeFiltersProps {
  filters: GradeFiltersType;
  onFilterChange: (filters: GradeFiltersType) => void;
  onReset: () => void;
}

/**
 * 🔍 Componente de filtros para grados
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

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 border-2 border-primary-300 dark:border-primary-700">
            <Search className="h-5 w-5 text-primary-700 dark:text-primary-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Filtros de Búsqueda
          </h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium"
          >
            <X className="h-4 w-4 mr-1.5" />
            Limpiar Filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Búsqueda mejorada */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/30 group-focus-within:bg-primary-100 dark:group-focus-within:bg-primary-900/30 transition-colors">
            <Search className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="pl-12 h-11 border-2 focus:border-primary-400 dark:focus:border-primary-600 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/30 transition-all"
          />
        </div>

        {/* Filtro por Nivel con estilo mejorado */}
        <Select
          value={filters.level || 'all'}
          onValueChange={handleLevelChange}
        >
          <SelectTrigger className="h-11 border-2 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
            <SelectValue placeholder="Todos los niveles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-medium">
              <div className="flex items-center gap-2">
                <Library className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span>Todos los niveles</span>
              </div>
            </SelectItem>
            {EDUCATION_LEVELS.map((level) => (
              <SelectItem key={level} value={level} className="font-medium">
                <div className="flex items-center gap-2">
                  {level === 'Primaria' && <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                  {level === 'Secundaria' && <School className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                  {level === 'Preparatoria' && <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                  <span>{level}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por Estado con estilo mejorado */}
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
          <SelectTrigger className="h-11 border-2 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-medium">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span>Todos los estados</span>
              </div>
            </SelectItem>
            <SelectItem value="true" className="font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Solo activos</span>
              </div>
            </SelectItem>
            <SelectItem value="false" className="font-medium">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Solo inactivos</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Indicadores de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Filtros activos:
          </span>
          {filters.search && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-semibold border border-primary-200 dark:border-primary-800">
              <Search className="h-3 w-3" />
              "{filters.search}"
            </span>
          )}
          {filters.level && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary-100 dark:bg-secondary-950/40 text-secondary-700 dark:text-secondary-300 rounded-lg text-xs font-semibold border border-secondary-200 dark:border-secondary-800">
              {filters.level === 'Primaria' && <BookOpen className="h-3 w-3" />}
              {filters.level === 'Secundaria' && <School className="h-3 w-3" />}
              {filters.level === 'Preparatoria' && <GraduationCap className="h-3 w-3" />}
              {filters.level}
            </span>
          )}
          {filters.isActive !== undefined && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
              filters.isActive 
                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}>
              {filters.isActive ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Activos
                </>
              ) : (
                <>
                  <Circle className="h-3 w-3" />
                  Inactivos
                </>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default GradeFilters;
