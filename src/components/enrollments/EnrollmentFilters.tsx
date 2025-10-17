// src/components/enrollments/EnrollmentFilters.tsx
'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EnrollmentFiltersProps {
  grades: Array<{
    id: number;
    name: string;
    level: string;
    sections: Array<{
      id: number;
      name: string;
    }>;
  }>;
  onFilterChange: (filters: FilterValues) => void;
  isLoading?: boolean;
}

interface FilterValues {
  gradeId?: string;
  sectionId?: string;
  status?: string;
  searchTerm?: string;
}

export function EnrollmentFilters({
  grades,
  onFilterChange,
  isLoading = false
}: EnrollmentFiltersProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [filters, setFilters] = useState<FilterValues>({
    gradeId: '',
    sectionId: '',
    status: '',
    searchTerm: ''
  });

  const [selectedGradeId, setSelectedGradeId] = useState<number>(0);

  // Obtener secciones del grado seleccionado
  const availableSections = selectedGradeId > 0
    ? grades.find(g => g.id === selectedGradeId)?.sections || []
    : [];

  // Handlers
  const handleGradeChange = (gradeId: string) => {
    setSelectedGradeId(parseInt(gradeId) || 0);
    const newFilters = {
      ...filters,
      gradeId,
      sectionId: '' // Reset sección
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSectionChange = (sectionId: string) => {
    const newFilters = {
      ...filters,
      sectionId
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusChange = (status: string) => {
    const newFilters = {
      ...filters,
      status
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    const newFilters = {
      ...filters,
      searchTerm
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterValues = {
      gradeId: '',
      sectionId: '',
      status: '',
      searchTerm: ''
    };
    setFilters(clearedFilters);
    setSelectedGradeId(0);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = 
    filters.gradeId || 
    filters.sectionId || 
    filters.status || 
    filters.searchTerm;

  const activeFilterCount = [
    filters.gradeId,
    filters.sectionId,
    filters.status,
    filters.searchTerm
  ].filter(Boolean).length;

  return (
    <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className={`h-5 w-5 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <h3 className={`font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Filtros
              </h3>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className={
                  isDark 
                    ? 'bg-blue-900/30 text-blue-400' 
                    : 'bg-blue-100 text-blue-700'
                }>
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                disabled={isLoading}
                className={isDark ? 'hover:bg-gray-700' : ''}
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="search" className={
                isDark ? 'text-gray-300' : 'text-gray-700'
              }>
                Buscar
              </Label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <Input
                  id="search"
                  type="text"
                  placeholder="Nombre del estudiante..."
                  value={filters.searchTerm}
                  onChange={handleSearchChange}
                  disabled={isLoading}
                  className={`pl-10 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Grado */}
            <div className="space-y-2">
              <Label htmlFor="grade" className={
                isDark ? 'text-gray-300' : 'text-gray-700'
              }>
                Grado
              </Label>
              <Select
                value={filters.gradeId}
                onValueChange={handleGradeChange}
                disabled={isLoading}
              >
                <SelectTrigger 
                  id="grade"
                  className={isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                  }
                >
                  <SelectValue placeholder="Todos los grados" />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                  <SelectItem value="" className={isDark ? 'focus:bg-gray-700' : ''}>
                    Todos los grados
                  </SelectItem>
                  {grades.map(grade => (
                    <SelectItem 
                      key={grade.id} 
                      value={grade.id.toString()}
                      className={isDark ? 'focus:bg-gray-700' : ''}
                    >
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sección */}
            <div className="space-y-2">
              <Label htmlFor="section" className={
                isDark ? 'text-gray-300' : 'text-gray-700'
              }>
                Sección
              </Label>
              <Select
                value={filters.sectionId}
                onValueChange={handleSectionChange}
                disabled={!selectedGradeId || isLoading}
              >
                <SelectTrigger 
                  id="section"
                  className={isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                  }
                >
                  <SelectValue placeholder={
                    selectedGradeId 
                      ? "Todas las secciones" 
                      : "Seleccione un grado"
                  } />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                  <SelectItem value="" className={isDark ? 'focus:bg-gray-700' : ''}>
                    Todas las secciones
                  </SelectItem>
                  {availableSections.map(section => (
                    <SelectItem 
                      key={section.id} 
                      value={section.id.toString()}
                      className={isDark ? 'focus:bg-gray-700' : ''}
                    >
                      Sección {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="status" className={
                isDark ? 'text-gray-300' : 'text-gray-700'
              }>
                Estado
              </Label>
              <Select
                value={filters.status}
                onValueChange={handleStatusChange}
                disabled={isLoading}
              >
                <SelectTrigger 
                  id="status"
                  className={isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                  }
                >
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                  <SelectItem value="" className={isDark ? 'focus:bg-gray-700' : ''}>
                    Todos los estados
                  </SelectItem>
                  <SelectItem value="active" className={isDark ? 'focus:bg-gray-700' : ''}>
                    Activo
                  </SelectItem>
                  <SelectItem value="graduated" className={isDark ? 'focus:bg-gray-700' : ''}>
                    Graduado
                  </SelectItem>
                  <SelectItem value="transferred" className={isDark ? 'focus:bg-gray-700' : ''}>
                    Transferido
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className={`flex flex-wrap gap-2 pt-2 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <span className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Filtrando por:
              </span>
              {filters.searchTerm && (
                <Badge variant="outline" className={
                  isDark 
                    ? 'bg-gray-700 text-gray-300 border-gray-600' 
                    : 'bg-gray-100 text-gray-700'
                }>
                  Búsqueda: "{filters.searchTerm}"
                </Badge>
              )}
              {filters.gradeId && (
                <Badge variant="outline" className={
                  isDark 
                    ? 'bg-gray-700 text-gray-300 border-gray-600' 
                    : 'bg-gray-100 text-gray-700'
                }>
                  Grado: {grades.find(g => g.id.toString() === filters.gradeId)?.name}
                </Badge>
              )}
              {filters.sectionId && (
                <Badge variant="outline" className={
                  isDark 
                    ? 'bg-gray-700 text-gray-300 border-gray-600' 
                    : 'bg-gray-100 text-gray-700'
                }>
                  Sección: {availableSections.find(s => s.id.toString() === filters.sectionId)?.name}
                </Badge>
              )}
              {filters.status && (
                <Badge variant="outline" className={
                  isDark 
                    ? 'bg-gray-700 text-gray-300 border-gray-600' 
                    : 'bg-gray-100 text-gray-700'
                }>
                  Estado: {filters.status === 'active' ? 'Activo' : filters.status === 'graduated' ? 'Graduado' : 'Transferido'}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}