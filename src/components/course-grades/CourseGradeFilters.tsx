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
import { useGrade } from '@/hooks/useGrade';
import { useCourse } from '@/hooks/useCourse';
import { useDebounce } from '@/hooks/useDebounce';

interface CourseGradeFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

/**
 * Enhanced filters component for course-grade relationships
 * Features: search, level filtering, grade filtering, type filtering, URL sync
 */
export function CourseGradeFilters({
  filters,
  onFiltersChange,
}: CourseGradeFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { grades } = useGrade();
  const { courses } = useCourse();

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

  return (
    <div className="space-y-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filtros de Búsqueda</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200">
              {activeFilterCount} {activeFilterCount === 1 ? 'filtro activo' : 'filtros activos'}
            </Badge>
          )}
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={handleReset} className="shadow-sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Limpiar Filtros
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar curso, código o grado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 shadow-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Level Filter */}
        <Select value={filters.level || 'all'} onValueChange={handleLevelChange}>
          <SelectTrigger className="shadow-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Todos los niveles" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400" />
                Todos los niveles
              </div>
            </SelectItem>
            {uniqueLevels.sort().map((level) => (
              <SelectItem key={level} value={level}>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    level === 'Kinder' ? 'bg-pink-500' :
                    level === 'Primaria' ? 'bg-blue-500' :
                    level === 'Secundaria' ? 'bg-green-500' :
                    level === 'Bachillerato' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`} />
                  {level}
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
          <SelectTrigger className="shadow-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={filters.level ? "Seleccionar grado" : "Primero selecciona nivel"} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400" />
                Todos los grados
              </div>
            </SelectItem>
            {filteredGrades
              .filter(grade => grade.isActive)
              .sort((a, b) => a.order - b.order)
              .map((grade) => (
              <SelectItem key={grade.id} value={grade.id.toString()}>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    grade.level === 'Kinder' ? 'bg-pink-500' :
                    grade.level === 'Primaria' ? 'bg-blue-500' :
                    grade.level === 'Secundaria' ? 'bg-green-500' :
                    grade.level === 'Bachillerato' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`} />
                  {grade.name}
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
            className="data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-800 data-[state=on]:border-indigo-200"
          >
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-gray-400" />
              Todas
            </div>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="core" 
            size="sm"
            className="data-[state=on]:bg-green-100 data-[state=on]:text-green-800 data-[state=on]:border-green-200"
          >
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Principales
            </div>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="elective" 
            size="sm"
            className="data-[state=on]:bg-amber-100 data-[state=on]:text-amber-800 data-[state=on]:border-amber-200"
          >
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              Electivas
            </div>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Filtros activos:</span>
            {filters.search && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Búsqueda: "{filters.search}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-blue-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.level && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Nivel: {filters.level}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLevelChange('all')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-purple-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.gradeId && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Grado: {grades.find(g => g.id === filters.gradeId)?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGradeChange('all')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-green-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.type !== 'all' && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Tipo: {filters.type === 'core' ? 'Principal' : 'Electiva'}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTypeChange('all')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-orange-100"
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