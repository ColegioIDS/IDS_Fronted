// components/course-grade/CourseGradeFilters.tsx
'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  X, 
  Search, 
  Filter, 
  RefreshCw,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { CourseGradeFilters as FilterType } from '@/types/course-grade.types';
import { useCourseGrade } from '@/hooks/useCourseGrade';
import { useDebounce } from '@/hooks/useDebounce';

interface CourseGradeFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

/**
 * Enhanced filters component for course-grade relationships
 * Features: search, level filtering, grade filtering, type filtering, dark mode
 */
export function CourseGradeFilters({
  filters,
  onFiltersChange,
}: CourseGradeFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // ✅ Hook actualizado - obtener datos del formData
  const { formData, fetchFormData } = useCourseGrade(false);

  // ✅ Cargar datos al montar
  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  // ✅ Obtener grados del formData
  const grades = formData?.grades || [];

  useEffect(() => {
    onFiltersChange({
      ...filters,
      search: debouncedSearch,
    });
  }, [debouncedSearch]);

  const handleLevelChange = (level: string) => {
    onFiltersChange({
      ...filters,
      level: level === 'all' ? '' : level,
      gradeId: undefined, // Reset grade filter when level changes
    });
  };

  const handleGradeChange = (gradeId: string) => {
    onFiltersChange({
      ...filters,
      gradeId: gradeId === 'all' ? undefined : parseInt(gradeId),
    });
  };

  const handleTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      type: type as 'core' | 'elective' | 'all',
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    onFiltersChange({
      search: '',
      level: '',
      type: 'all',
      gradeId: undefined,
    });
  };

  const uniqueLevels = Array.from(new Set(grades.map(grade => grade.level)));
  
  // Filter grades by selected level
  const filteredGrades = filters.level 
    ? grades.filter(grade => grade.level === filters.level)
    : grades;

  const hasActiveFilters = filters.search || filters.level || filters.type !== 'all' || filters.gradeId;
  const activeFilterCount = [
    filters.search,
    filters.level,
    filters.type !== 'all' ? filters.type : null,
    filters.gradeId
  ].filter(Boolean).length;

  // ✅ Helper para colores de nivel
  const getLevelColor = (level: string) => {
    const colors = {
      'Kinder': 'bg-pink-500 dark:bg-pink-400',
      'Primaria': 'bg-blue-500 dark:bg-blue-400',
      'Secundaria': 'bg-green-500 dark:bg-green-400',
      'Bachillerato': 'bg-purple-500 dark:bg-purple-400',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500 dark:bg-gray-400';
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filtros de Búsqueda</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
              {activeFilterCount} {activeFilterCount === 1 ? 'filtro activo' : 'filtros activos'}
            </Badge>
          )}
        </div>

        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset} 
            className="shadow-sm border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Limpiar Filtros
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Buscar curso, código o grado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 shadow-sm border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Level Filter */}
        <Select value={filters.level || 'all'} onValueChange={handleLevelChange}>
          <SelectTrigger className="shadow-sm border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <SelectValue placeholder="Todos los niveles" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                <span className="text-gray-900 dark:text-gray-100">Todos los niveles</span>
              </div>
            </SelectItem>
            {uniqueLevels.sort().map((level) => (
              <SelectItem key={level} value={level}>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${getLevelColor(level)}`} />
                  <span className="text-gray-900 dark:text-gray-100">{level}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Grade Filter */}
        <Select 
          value={filters.gradeId?.toString() || 'all'} 
          onValueChange={handleGradeChange}
          disabled={!filters.level}
        >
          <SelectTrigger className="shadow-sm border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <SelectValue placeholder={filters.level ? "Seleccionar grado" : "Primero selecciona nivel"} />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                <span className="text-gray-900 dark:text-gray-100">Todos los grados</span>
              </div>
            </SelectItem>
            {filteredGrades
              .sort((a, b) => a.order - b.order)
              .map((grade) => (
              <SelectItem key={grade.id} value={grade.id.toString()}>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${getLevelColor(grade.level)}`} />
                  <span className="text-gray-900 dark:text-gray-100">{grade.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tipo de Asignatura
        </label>
        <ToggleGroup
          type="single"
          value={filters.type}
          onValueChange={handleTypeChange}
          className="justify-start gap-1"
        >
          <ToggleGroupItem 
            value="all" 
            size="sm" 
            className="border border-gray-200 dark:border-gray-600 data-[state=on]:bg-indigo-100 dark:data-[state=on]:bg-indigo-950/50 data-[state=on]:text-indigo-800 dark:data-[state=on]:text-indigo-300 data-[state=on]:border-indigo-200 dark:data-[state=on]:border-indigo-800"
          >
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
              Todas
            </div>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="core" 
            size="sm"
            className="border border-gray-200 dark:border-gray-600 data-[state=on]:bg-green-100 dark:data-[state=on]:bg-green-950/30 data-[state=on]:text-green-800 dark:data-[state=on]:text-green-300 data-[state=on]:border-green-200 dark:data-[state=on]:border-green-800"
          >
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
              Principales
            </div>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="elective" 
            size="sm"
            className="border border-gray-200 dark:border-gray-600 data-[state=on]:bg-amber-100 dark:data-[state=on]:bg-amber-950/30 data-[state=on]:text-amber-800 dark:data-[state=on]:text-amber-300 data-[state=on]:border-amber-200 dark:data-[state=on]:border-amber-800"
          >
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400" />
              Electivas
            </div>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filtros activos:</span>
            {filters.search && (
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                Búsqueda: "{filters.search}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.level && (
              <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                Nivel: {filters.level}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLevelChange('all')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.gradeId && (
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                Grado: {grades.find(g => g.id === filters.gradeId)?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGradeChange('all')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-green-100 dark:hover:bg-green-900/50"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.type !== 'all' && (
              <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                Tipo: {filters.type === 'core' ? 'Principal' : 'Electiva'}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTypeChange('all')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-orange-100 dark:hover:bg-orange-900/50"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}