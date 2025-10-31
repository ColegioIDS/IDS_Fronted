// src/components/features/sections/SectionFilters.tsx

'use client';

import React from 'react';
import { Search, X, BookOpen, User, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionFilters as SectionFiltersType } from '@/types/sections.types';

interface SectionFiltersProps {
  filters: SectionFiltersType;
  onFilterChange: (filters: SectionFiltersType) => void;
  onReset: () => void;
  grades?: Array<{ id: number; name: string; level: string }>;
  teachers?: Array<{ id: number; givenNames: string; lastNames: string }>;
}

/**
 * 🔍 Componente de filtros para secciones sin gradientes
 */
export function SectionFilters({ 
  filters, 
  onFilterChange, 
  onReset,
  grades = [],
  teachers = [],
}: SectionFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value || undefined });
  };

  const handleGradeChange = (value: string) => {
    onFilterChange({
      ...filters,
      gradeId: value === 'all' ? undefined : parseInt(value),
    });
  };

  const handleTeacherChange = (value: string) => {
    if (value === 'all') {
      onFilterChange({ ...filters, teacherId: undefined, hasTeacher: undefined });
    } else if (value === 'with-teacher') {
      onFilterChange({ ...filters, teacherId: undefined, hasTeacher: true });
    } else if (value === 'without-teacher') {
      onFilterChange({ ...filters, teacherId: undefined, hasTeacher: false });
    } else {
      onFilterChange({ ...filters, teacherId: parseInt(value), hasTeacher: undefined });
    }
  };

  const handleMinCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFilterChange({ 
      ...filters, 
      minCapacity: value ? parseInt(value) : undefined 
    });
  };

  const handleMaxCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFilterChange({ 
      ...filters, 
      maxCapacity: value ? parseInt(value) : undefined 
    });
  };

  const hasActiveFilters = 
    filters.gradeId || 
    filters.teacherId || 
    filters.hasTeacher !== undefined ||
    filters.minCapacity ||
    filters.maxCapacity ||
    filters.search;

  const getTeacherValue = () => {
    if (filters.teacherId) return filters.teacherId.toString();
    if (filters.hasTeacher === true) return 'with-teacher';
    if (filters.hasTeacher === false) return 'without-teacher';
    return 'all';
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div className="relative group lg:col-span-2">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/30 group-focus-within:bg-primary-100 dark:group-focus-within:bg-primary-900/30 transition-colors">
            <Search className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar por nombre de sección..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="pl-12 h-11 border-2 focus:border-primary-400 dark:focus:border-primary-600 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/30 transition-all"
          />
        </div>

        {/* Filtro por Grado */}
        <Select
          value={filters.gradeId?.toString() || 'all'}
          onValueChange={handleGradeChange}
        >
          <SelectTrigger className="h-11 border-2 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
            <SelectValue placeholder="Todos los grados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-medium">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span>Todos los grados</span>
              </div>
            </SelectItem>
            {grades.map((grade) => (
              <SelectItem key={grade.id} value={grade.id.toString()} className="font-medium">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>{grade.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por Profesor */}
        <Select
          value={getTeacherValue()}
          onValueChange={handleTeacherChange}
        >
          <SelectTrigger className="h-11 border-2 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
            <SelectValue placeholder="Todos los profesores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-medium">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span>Todos</span>
              </div>
            </SelectItem>
            <SelectItem value="with-teacher" className="font-medium">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Con profesor</span>
              </div>
            </SelectItem>
            <SelectItem value="without-teacher" className="font-medium">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-600 dark:text-amber-400">Sin profesor</span>
              </div>
            </SelectItem>
            {teachers.length > 0 && (
              <div className="border-t my-1 pt-1">
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id.toString()} className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>{teacher.givenNames} {teacher.lastNames}</span>
                    </div>
                  </SelectItem>
                ))}
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Filtros de capacidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Capacidad mínima
          </label>
          <Input
            type="number"
            min="1"
            max="100"
            placeholder="Ej: 20"
            value={filters.minCapacity || ''}
            onChange={handleMinCapacityChange}
            className="h-11 border-2 focus:border-primary-400 dark:focus:border-primary-600"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Capacidad máxima
          </label>
          <Input
            type="number"
            min="1"
            max="100"
            placeholder="Ej: 40"
            value={filters.maxCapacity || ''}
            onChange={handleMaxCapacityChange}
            className="h-11 border-2 focus:border-primary-400 dark:focus:border-primary-600"
          />
        </div>
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
          {filters.gradeId && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-800">
              <BookOpen className="h-3 w-3" />
              Grado filtrado
            </span>
          )}
          {filters.hasTeacher === true && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
              <User className="h-3 w-3" />
              Con profesor
            </span>
          )}
          {filters.hasTeacher === false && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold border border-amber-200 dark:border-amber-800">
              <Users className="h-3 w-3" />
              Sin profesor
            </span>
          )}
          {(filters.minCapacity || filters.maxCapacity) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold border border-purple-200 dark:border-purple-800">
              <Filter className="h-3 w-3" />
              Capacidad: {filters.minCapacity || '0'}-{filters.maxCapacity || '∞'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default SectionFilters;
