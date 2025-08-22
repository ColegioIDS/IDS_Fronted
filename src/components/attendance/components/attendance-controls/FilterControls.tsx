// src/components/attendance/components/attendance-controls/FilterControls.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  Users, 
  BarChart3, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  RotateCcw,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { AttendanceStatus } from '@/types/attendance.types';

// 🎯 Tipos para los filtros
export interface AttendanceFilters {
  // Búsqueda básica
  searchQuery: string;
  
  // Filtros por estado
  attendanceStatus: AttendanceStatus[];
  
  // Filtros por fechas
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  
  // Filtros por porcentaje de asistencia
  attendancePercentage: {
    min: number;
    max: number;
  };
  
  // Filtros booleanos
  onlyWithIssues: boolean;        // Solo estudiantes con problemas
  onlyPerfectAttendance: boolean; // Solo asistencia perfecta
  excludeJustified: boolean;      // Excluir justificados del cálculo
  
  // Filtros rápidos predefinidos
  quickFilter: string;
}

interface FilterControlsProps {
  filters: AttendanceFilters;
  onFiltersChange: (filters: AttendanceFilters) => void;
  totalStudents: number;
  filteredStudents: number;
  className?: string;
}

// 🎨 Configuración de estados de asistencia
const ATTENDANCE_CONFIG = {
  present: {
    label: 'Presentes',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20'
  },
  absent: {
    label: 'Ausentes',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20'
  },
  late: {
    label: 'Tardíos',
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
  },
  excused: {
    label: 'Justificados',
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20'
  }
};

// 🚀 Filtros rápidos predefinidos
const QUICK_FILTERS = {
  all: {
    label: 'Todos los estudiantes',
    description: 'Mostrar todos sin filtros'
  },
  issues: {
    label: 'Con problemas',
    description: 'Estudiantes con baja asistencia o ausencias frecuentes'
  },
  perfect: {
    label: 'Asistencia perfecta',
    description: 'Estudiantes con 100% de asistencia'
  },
  recent_absences: {
    label: 'Ausencias recientes',
    description: 'Estudiantes ausentes en los últimos días'
  },
  frequent_late: {
    label: 'Tardanzas frecuentes',
    description: 'Estudiantes con múltiples tardanzas'
  }
};

export default function FilterControls({
  filters,
  onFiltersChange,
  totalStudents,
  filteredStudents,
  className = ''
}: FilterControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 📊 Calcular cantidad de filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    
    if (filters.searchQuery.trim()) count++;
    if (filters.attendanceStatus.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.attendancePercentage.min > 0 || filters.attendancePercentage.max < 100) count++;
    if (filters.onlyWithIssues) count++;
    if (filters.onlyPerfectAttendance) count++;
    if (filters.excludeJustified) count++;
    if (filters.quickFilter && filters.quickFilter !== 'all') count++;
    
    return count;
  }, [filters]);

  // 🧹 Función para limpiar todos los filtros
  const clearAllFilters = () => {
    const cleanFilters: AttendanceFilters = {
      searchQuery: '',
      attendanceStatus: [],
      dateRange: { from: null, to: null },
      attendancePercentage: { min: 0, max: 100 },
      onlyWithIssues: false,
      onlyPerfectAttendance: false,
      excludeJustified: false,
      quickFilter: 'all'
    };
    
    onFiltersChange(cleanFilters);
  };

  // 🎯 Aplicar filtro rápido
  const applyQuickFilter = (quickFilter: string) => {
    let updatedFilters = { ...filters, quickFilter };
    
    switch (quickFilter) {
      case 'issues':
        updatedFilters = {
          ...updatedFilters,
          onlyWithIssues: true,
          attendancePercentage: { min: 0, max: 80 }
        };
        break;
        
      case 'perfect':
        updatedFilters = {
          ...updatedFilters,
          onlyPerfectAttendance: true,
          attendancePercentage: { min: 100, max: 100 }
        };
        break;
        
      case 'recent_absences':
        updatedFilters = {
          ...updatedFilters,
          attendanceStatus: ['absent' as AttendanceStatus]
        };
        break;
        
      case 'frequent_late':
        updatedFilters = {
          ...updatedFilters,
          attendanceStatus: ['late' as AttendanceStatus]
        };
        break;
        
      case 'all':
      default:
        // No aplicar filtros adicionales
        break;
    }
    
    onFiltersChange(updatedFilters);
  };

  // 🔄 Manejar cambios en filtros individuales
  const updateFilter = (key: keyof AttendanceFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleAttendanceStatus = (status: AttendanceStatus) => {
    const newStatuses = filters.attendanceStatus.includes(status)
      ? filters.attendanceStatus.filter(s => s !== status)
      : [...filters.attendanceStatus, status];
    
    updateFilter('attendanceStatus', newStatuses);
  };

  return (
    <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Filter className="h-4 w-4 text-blue-500" />
            <span>Filtros y Búsqueda</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {/* 📊 Contador de resultados */}
            <Badge variant="outline" className="text-xs">
              {filteredStudents} de {totalStudents}
            </Badge>
            
            {/* 🧹 Limpiar filtros */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 px-2 text-gray-500 hover:text-gray-700"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                <span className="text-xs">Limpiar</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 🔍 Búsqueda básica */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar estudiante por nombre o código..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 🚀 Filtros rápidos */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtros rápidos
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {Object.entries(QUICK_FILTERS).map(([key, config]) => (
              <Button
                key={key}
                variant={filters.quickFilter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyQuickFilter(key)}
                className="text-xs h-8"
                title={config.description}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 📋 Estados de asistencia */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtrar por estado
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(ATTENDANCE_CONFIG).map(([status, config]) => {
              const Icon = config.icon;
              const isSelected = filters.attendanceStatus.includes(status as AttendanceStatus);
              
              return (
                <Button
                  key={status}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleAttendanceStatus(status as AttendanceStatus)}
                  className={`flex items-center space-x-2 h-9 ${isSelected ? config.bgColor : ''}`}
                >
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span className="text-xs">{config.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* 🔧 Filtros avanzados (colapsible) */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Sliders className="h-4 w-4" />
                <span>Filtros avanzados</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            {/* 📈 Filtro por porcentaje de asistencia */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Porcentaje de asistencia: {filters.attendancePercentage.min}% - {filters.attendancePercentage.max}%
              </label>
              <div className="px-3">
                <Slider
                  value={[filters.attendancePercentage.min, filters.attendancePercentage.max]}
                  onValueChange={([min, max]) => 
                    updateFilter('attendancePercentage', { min, max })
                  }
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* ⚙️ Opciones booleanas */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Opciones especiales
              </label>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onlyWithIssues"
                    checked={filters.onlyWithIssues}
                    onCheckedChange={(checked) => updateFilter('onlyWithIssues', checked)}
                  />
                  <label 
                    htmlFor="onlyWithIssues" 
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Solo estudiantes con problemas de asistencia
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onlyPerfectAttendance"
                    checked={filters.onlyPerfectAttendance}
                    onCheckedChange={(checked) => updateFilter('onlyPerfectAttendance', checked)}
                  />
                  <label 
                    htmlFor="onlyPerfectAttendance" 
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Solo asistencia perfecta (100%)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="excludeJustified"
                    checked={filters.excludeJustified}
                    onCheckedChange={(checked) => updateFilter('excludeJustified', checked)}
                  />
                  <label 
                    htmlFor="excludeJustified" 
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Excluir justificados del cálculo de porcentaje
                  </label>
                </div>
              </div>
            </div>

            {/* 📅 Filtro por rango de fechas */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rango de fechas (próximamente)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Desde</label>
                  <Input
                    type="date"
                    value={filters.dateRange.from?.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      updateFilter('dateRange', { ...filters.dateRange, from: date });
                    }}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Hasta</label>
                  <Input
                    type="date"
                    value={filters.dateRange.to?.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      updateFilter('dateRange', { ...filters.dateRange, to: date });
                    }}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 📊 Resumen de filtros activos */}
        {activeFiltersCount > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Mostrando {filteredStudents} de {totalStudents} estudiantes
              </span>
              
              {filteredStudents < totalStudents && (
                <Badge variant="outline" className="text-xs">
                  {Math.round((filteredStudents / totalStudents) * 100)}% visible
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 🎯 Hook personalizado para manejar filtros
export const useAttendanceFilters = (initialFilters?: Partial<AttendanceFilters>) => {
  const [filters, setFilters] = useState<AttendanceFilters>({
    searchQuery: '',
    attendanceStatus: [],
    dateRange: { from: null, to: null },
    attendancePercentage: { min: 0, max: 100 },
    onlyWithIssues: false,
    onlyPerfectAttendance: false,
    excludeJustified: false,
    quickFilter: 'all',
    ...initialFilters
  });

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      attendanceStatus: [],
      dateRange: { from: null, to: null },
      attendancePercentage: { min: 0, max: 100 },
      onlyWithIssues: false,
      onlyPerfectAttendance: false,
      excludeJustified: false,
      quickFilter: 'all'
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery.trim() !== '' ||
      filters.attendanceStatus.length > 0 ||
      filters.dateRange.from !== null ||
      filters.dateRange.to !== null ||
      filters.attendancePercentage.min > 0 ||
      filters.attendancePercentage.max < 100 ||
      filters.onlyWithIssues ||
      filters.onlyPerfectAttendance ||
      filters.excludeJustified ||
      (filters.quickFilter && filters.quickFilter !== 'all')
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters
  };
};