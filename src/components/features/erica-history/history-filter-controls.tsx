// src/components/features/erica-history/history-filter-controls.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, Search } from 'lucide-react';
import { EricaHistoryFilters, CascadeOption } from '@/types/erica-history';

interface HistoryFilterControlsProps {
  cascadeData: {
    bimesters: CascadeOption[];
    courses: CascadeOption[];
    sections: CascadeOption[];
    academicWeeks: CascadeOption[];
  };
  onFiltersChange: (filters: EricaHistoryFilters) => void;
  isLoading?: boolean;
}

export const HistoryFilterControls: React.FC<HistoryFilterControlsProps> = ({
  cascadeData = {
    bimesters: [],
    courses: [],
    sections: [],
    academicWeeks: [],
  },
  onFiltersChange,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<EricaHistoryFilters>({});

  const handleFilterChange = useCallback(
    (key: keyof EricaHistoryFilters, value: string | undefined) => {
      const updatedFilters = {
        ...filters,
        [key]: value ? parseInt(value, 10) : undefined,
      };
      setFilters(updatedFilters);
    },
    [filters]
  );

  const handleApplyFilters = useCallback(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    onFiltersChange({});
  }, [onFiltersChange]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bimestre */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bimestre
            </label>
            <Select
              value={filters.bimesterId?.toString() || ''}
              onValueChange={(value) => handleFilterChange('bimesterId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar bimestre" />
              </SelectTrigger>
              <SelectContent>
                {cascadeData.bimesters.map((bimester) => (
                  <SelectItem key={bimester.id} value={bimester.id.toString()}>
                    {bimester.name} (B{bimester.number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Curso */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Curso
            </label>
            <Select
              value={filters.courseId?.toString() || ''}
              onValueChange={(value) => handleFilterChange('courseId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar curso" />
              </SelectTrigger>
              <SelectContent>
                {cascadeData.courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name} ({course.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sección */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sección
            </label>
            <Select
              value={filters.sectionId?.toString() || ''}
              onValueChange={(value) => handleFilterChange('sectionId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sección" />
              </SelectTrigger>
              <SelectContent>
                {cascadeData.sections.map((section) => (
                  <SelectItem key={section.id} value={section.id.toString()}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Semana Académica */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Semana Académica
            </label>
            <Select
              value={filters.weekId?.toString() || ''}
              onValueChange={(value) => handleFilterChange('weekId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar semana" />
              </SelectTrigger>
              <SelectContent>
                {cascadeData.academicWeeks.map((week) => (
                  <SelectItem key={week.id} value={week.id.toString()}>
                    Semana {week.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 mt-6 justify-end flex-wrap">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            disabled={isLoading}
            className="text-xs sm:text-sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
          <Button
            onClick={handleApplyFilters}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
