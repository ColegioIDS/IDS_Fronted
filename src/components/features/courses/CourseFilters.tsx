// src/components/features/courses/CourseFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  X,
  Filter,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react';
import { CourseFilters as CourseFiltersType } from '@/types/courses';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CourseFiltersProps {
  filters: CourseFiltersType;
  onFiltersChange: (filters: CourseFiltersType) => void;
  onReset: () => void;
  totalResults?: number;
}

const courseAreas = [
  'Científica',
  'Humanística',
  'Sociales',
  'Tecnológica',
  'Artística',
  'Idiomas',
  'Educación Física',
];

export function CourseFilters({
  filters,
  onFiltersChange,
  onReset,
  totalResults = 0,
}: CourseFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');
  const [selectedArea, setSelectedArea] = useState<string>(filters.area || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(
    filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.searchQuery) {
        onFiltersChange({
          ...filters,
          searchQuery: searchInput || undefined,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, filters, onFiltersChange]);

  const handleAreaChange = (value: string) => {
    setSelectedArea(value);
    onFiltersChange({
      ...filters,
      area: value === 'all' ? undefined : (value as any),
    });
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    onFiltersChange({
      ...filters,
      isActive: value === 'all' ? undefined : value === 'active',
    });
  };

  const hasActiveFilters =
    filters.searchQuery || filters.area || filters.isActive !== undefined;

  const activeFiltersCount = [
    filters.searchQuery,
    filters.area,
    filters.isActive !== undefined,
  ].filter(Boolean).length;

  return (
    <TooltipProvider>
      <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
        <CardContent className="p-6 space-y-6">
        {/* Header con contador de resultados */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Filtros de búsqueda
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <Badge className="bg-indigo-600 text-white">
                {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {hasActiveFilters && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onReset}
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpiar todo
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Eliminar todos los filtros y mostrar todos los cursos</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Barra de búsqueda destacada */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar por nombre o código del curso..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-12 pr-12 h-12 text-base bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros en grid mejorado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Área del curso */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-500" />
              Área
            </label>
            <Select value={selectedArea} onValueChange={handleAreaChange}>
              <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                <SelectValue placeholder="Seleccionar área" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900">
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    Todas las áreas
                  </span>
                </SelectItem>
                {courseAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      {area}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado del curso */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-500" />
              Estado
            </label>
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900">
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    Todos los estados
                  </span>
                </SelectItem>
                <SelectItem value="active">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" />
                    Activos
                  </span>
                </SelectItem>
                <SelectItem value="inactive">
                  <span className="flex items-center gap-2">
                    <XCircle className="w-3 h-3" />
                    Inactivos
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Espaciador en desktop, no visible en mobile */}
          <div className="hidden md:block" />
        </div>

        {/* Filtros activos display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Filtros activos:
            </span>
            {filters.searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Búsqueda: {filters.searchQuery}
                <button
                  onClick={() => {
                    setSearchInput('');
                    onFiltersChange({ ...filters, searchQuery: undefined });
                  }}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.area && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Área: {filters.area}
                <button
                  onClick={() => {
                    setSelectedArea('all');
                    onFiltersChange({ ...filters, area: undefined });
                  }}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.isActive !== undefined && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Estado: {filters.isActive ? 'Activo' : 'Inactivo'}
                <button
                  onClick={() => {
                    setSelectedStatus('all');
                    onFiltersChange({ ...filters, isActive: undefined });
                  }}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
