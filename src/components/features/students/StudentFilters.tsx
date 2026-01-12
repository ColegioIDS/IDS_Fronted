'use client';

import React from 'react';
import { 
  Filter, Search, ArrowUp, ArrowDown, Users, BookOpen, 
  SortAsc, Zap, X, RotateCcw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Grade } from '@/types/students.types';

interface StudentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: 'givenNames' | 'lastNames' | 'codeSIRE' | 'createdAt';
  onSortByChange: (value: 'givenNames' | 'lastNames' | 'codeSIRE' | 'createdAt') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  enrollmentFilter: 'all' | 'enrolled' | 'not-enrolled';
  onEnrollmentFilterChange: (value: 'all' | 'enrolled' | 'not-enrolled') => void;
  gradeFilter?: number | null;
  onGradeFilterChange?: (value: number | null) => void;
  grades?: Grade[];
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  enrollmentFilter,
  onEnrollmentFilterChange,
  gradeFilter = null,
  onGradeFilterChange,
  grades = [],
}) => {
  const getEnrollmentBadgeColor = (filter: string) => {
    switch (filter) {
      case 'enrolled':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'not-enrolled':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800';
    }
  };

  const getSortIcon = () => {
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5" />
    );
  };

  // Obtener nombre del grado seleccionado
  const getGradeName = (id: number | null) => {
    if (!id) return null;
    return grades.find(g => g.id === id)?.name || null;
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = search || enrollmentFilter !== 'all' || gradeFilter !== null;

  // Limpiar todos los filtros
  const handleClearAllFilters = () => {
    onSearchChange('');
    onEnrollmentFilterChange('all');
    if (onGradeFilterChange) {
      onGradeFilterChange(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header con ícono y título */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Filtros y Búsqueda</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Personaliza tu vista de estudiantes</p>
          </div>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAllFilters}
            className="gap-1.5 border-slate-300 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-slate-200 via-slate-200 to-transparent dark:from-slate-700 dark:via-slate-700 dark:to-transparent" />

      {/* Grid de Filtros */}
      <div className="space-y-4">
        {/* Búsqueda - Full Width */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10" />
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500 dark:text-blue-400" />
            <Input
              placeholder="Buscar por nombre, apellido o código SIRE..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-11 bg-gradient-to-r from-slate-50 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-900/30 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-lg"
            />
          </div>
        </div>

        {/* Filtros secundarios - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filtro de Grado */}
          {grades && grades.length > 0 && (
            <div className="group">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">Grado</label>
              <Select value={gradeFilter?.toString() || 'all'} onValueChange={(value) => {
                if (onGradeFilterChange) {
                  onGradeFilterChange(value === 'all' ? null : parseInt(value));
                }
              }}>
                <SelectTrigger className="h-10 bg-gradient-to-r from-purple-50 to-purple-50/50 dark:from-purple-900/20 dark:to-purple-900/10 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700 focus:ring-purple-500/20 rounded-lg font-medium text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <SelectValue placeholder="Todos los grados" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Grados</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id.toString()}>
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        {grade.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filtro de Estado de Inscripción */}
          <div className="group">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">Estado</label>
            <Select value={enrollmentFilter} onValueChange={(value: any) => onEnrollmentFilterChange(value)}>
              <SelectTrigger className="h-10 bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-900/20 dark:to-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 focus:ring-emerald-500/20 rounded-lg font-medium text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <SelectValue placeholder="Filtrar estado..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-blue-500" />
                    Todos los Estudiantes
                  </span>
                </SelectItem>
                <SelectItem value="enrolled">
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    Solo Inscritos
                  </span>
                </SelectItem>
                <SelectItem value="not-enrolled">
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Solo Pendientes
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Badge className={`mt-2 ${getEnrollmentBadgeColor(enrollmentFilter)} border`}>
              {enrollmentFilter === 'all' && 'Mostrando todos'}
              {enrollmentFilter === 'enrolled' && 'Solo inscritos activos'}
              {enrollmentFilter === 'not-enrolled' && 'Solo pendientes'}
            </Badge>
          </div>

          {/* Ordenar por */}
          <div className="group">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">Ordenar Por</label>
            <Select value={sortBy} onValueChange={(value: any) => onSortByChange(value)}>
              <SelectTrigger className="h-10 bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-200/50 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700 focus:ring-amber-500/20 rounded-lg font-medium text-sm">
                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <SelectValue placeholder="Elegir campo..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="givenNames">
                  <span className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    Nombre
                  </span>
                </SelectItem>
                <SelectItem value="lastNames">
                  <span className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    Apellido
                  </span>
                </SelectItem>
                <SelectItem value="codeSIRE">
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    Código SIRE
                  </span>
                </SelectItem>
                <SelectItem value="createdAt">
                  <span className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5" />
                    Fecha Creación
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orden Ascendente/Descendente */}
          <div className="group">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">Dirección</label>
            <Select value={sortOrder} onValueChange={(value: any) => onSortOrderChange(value)}>
              <SelectTrigger className="h-10 bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 focus:ring-blue-500/20 rounded-lg font-medium text-sm">
                <div className="flex items-center gap-2">
                  <ArrowUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <SelectValue placeholder="Elegir orden..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">
                  <span className="flex items-center gap-2">
                    <ArrowUp className="w-4 h-4" />
                    Ascendente
                  </span>
                </SelectItem>
                <SelectItem value="desc">
                  <span className="flex items-center gap-2">
                    <ArrowDown className="w-4 h-4" />
                    Descendente
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              {getSortIcon()}
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {sortOrder === 'asc' ? 'Orden Ascendente' : 'Orden Descendente'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges de Filtros Activos - DEBAJO */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700">
          {search && (
            <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 gap-1.5">
              <Search className="w-3 h-3" />
              Búsqueda: {search}
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {gradeFilter && (
            <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 gap-1.5">
              <BookOpen className="w-3 h-3" />
              Grado: {getGradeName(gradeFilter)}
              <button
                onClick={() => onGradeFilterChange?.(null)}
                className="ml-1 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {enrollmentFilter !== 'all' && (
            <Badge className={`${getEnrollmentBadgeColor(enrollmentFilter)} gap-1.5`}>
              <Users className="w-3 h-3" />
              {enrollmentFilter === 'enrolled' ? 'Solo Inscritos' : 'Solo Pendientes'}
              <button
                onClick={() => onEnrollmentFilterChange('all')}
                className="ml-1 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
