// components/academic-weeks/week-filters.tsx
"use client";

import React from 'react';
import { X, Filter, Calendar, Hash, Target, RotateCcw, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AcademicWeekFilters } from '@/types/academic-week.types';
import { useBimesterContext } from '@/context/newBimesterContext';
import { cn } from '@/lib/utils';

interface WeekFiltersProps {
  filters: AcademicWeekFilters;
  onFiltersChange: (filters: AcademicWeekFilters) => void;
  onClose: () => void;
}

export function WeekFilters({ filters, onFiltersChange, onClose }: WeekFiltersProps) {
  const { bimesters, isLoading } = useBimesterContext();

  const handleBimesterChange = (value: string) => {
    onFiltersChange({
      ...filters,
      bimesterId: value === 'all' ? undefined : parseInt(value)
    });
  };

  const handleNumberChange = (value: string) => {
    onFiltersChange({
      ...filters,
      number: value ? parseInt(value) : undefined
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value as 'completed' | 'active' | 'upcoming'
    });
  };

  const handleObjectivesFilterChange = (value: string) => {
    onFiltersChange({
      ...filters,
      hasObjectives: value === 'all' ? undefined : value === 'with-objectives'
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const getFilterCount = () => {
    return Object.keys(filters).filter(key => filters[key as keyof AcademicWeekFilters] !== undefined).length;
  };

  const getSelectedBimester = () => {
    if (!filters.bimesterId) return null;
    return bimesters.find(b => b.id === filters.bimesterId);
  };

  const getStatusLabel = () => {
    switch (filters.status) {
      case 'completed': return 'Completadas';
      case 'active': return 'En curso';
      case 'upcoming': return 'Próximas';
      default: return null;
    }
  };

  const filterCount = getFilterCount();

  return (
    <Card className="bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-950/50 dark:to-background border-0 shadow-lg">
      <CardHeader className="pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Filtros Avanzados
              </CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Personaliza la vista de semanas académicas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {filterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
              >
                {filterCount} {filterCount === 1 ? 'filtro' : 'filtros'}
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <X className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Filtro por bimestre */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Bimestre
            </Label>
            <Select
              value={filters.bimesterId?.toString() || 'all'}
              onValueChange={handleBimesterChange}
              disabled={isLoading}
            >
              <SelectTrigger className="h-11 bg-white dark:bg-background border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                <SelectValue placeholder={isLoading ? "Cargando..." : "Todos los bimestres"} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-background border-slate-200 dark:border-slate-700">
                <SelectItem value="all" className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Todos los bimestres
                  </div>
                </SelectItem>
                {bimesters.map((bimester) => (
                  <SelectItem 
                      key={bimester.id} 
                      value={bimester.id?.toString() || ''} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{bimester.name}</span>
                      {bimester.isActive && (
                        <Badge 
                          variant="secondary" 
                          className="ml-2 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-xs"
                        >
                          Activo
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por número de semana */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Hash className="h-4 w-4 text-purple-500" />
              Número de Semana
            </Label>
            <Input
              type="number"
              min="1"
              max="20"
              placeholder="Ej: 1, 2, 3..."
              value={filters.number || ''}
              onChange={(e) => handleNumberChange(e.target.value)}
              className="h-11 bg-white dark:bg-background border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Filtro por estado */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-500" />
              Estado
            </Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="h-11 bg-white dark:bg-background border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-background border-slate-200 dark:border-slate-700">
                <SelectItem value="all" className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  Todos los estados
                </SelectItem>
                <SelectItem value="completed" className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Completadas
                  </div>
                </SelectItem>
                <SelectItem value="active" className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    En curso
                  </div>
                </SelectItem>
                <SelectItem value="upcoming" className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Próximas
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por objetivos */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" />
              Objetivos
            </Label>
            <Select
              value={filters.hasObjectives === undefined ? 'all' : (filters.hasObjectives ? 'with-objectives' : 'without-objectives')}
              onValueChange={handleObjectivesFilterChange}
            >
              <SelectTrigger className="h-11 bg-white dark:bg-background border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors">
                <SelectValue placeholder="Todas las semanas" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-background border-slate-200 dark:border-slate-700">
                <SelectItem value="all" className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  Todas las semanas
                </SelectItem>
                <SelectItem value="with-objectives" className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-amber-500" />
                    Con objetivos
                  </div>
                </SelectItem>
                <SelectItem value="without-objectives" className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600"></div>
                    Sin objetivos
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botón para limpiar filtros */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {filterCount > 0 ? `${filterCount} ${filterCount === 1 ? 'filtro activo' : 'filtros activos'}` : 'Sin filtros aplicados'}
          </div>
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={filterCount === 0}
            className={cn(
              "h-10 px-4 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
              filterCount === 0 && "opacity-50 cursor-not-allowed"
            )}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </Button>
        </div>

        {/* Resumen de filtros activos */}
        {filterCount > 0 && (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Filtros aplicados:
              </span>
              {getSelectedBimester() && (
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  {getSelectedBimester()?.name}
                </Badge>
              )}
              {filters.number && (
                <Badge 
                  variant="secondary" 
                  className="bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                >
                  <Hash className="h-3 w-3 mr-1" />
                  Semana {filters.number}
                </Badge>
              )}
              {getStatusLabel() && (
                <Badge 
                  variant="secondary" 
                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {getStatusLabel()}
                </Badge>
              )}
              {filters.hasObjectives !== undefined && (
                <Badge 
                  variant="secondary" 
                  className="bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                >
                  <Target className="h-3 w-3 mr-1" />
                  {filters.hasObjectives ? 'Con objetivos' : 'Sin objetivos'}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}