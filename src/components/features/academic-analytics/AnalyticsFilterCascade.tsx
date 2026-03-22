// src/components/features/academic-analytics/AnalyticsFilterCascade.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckSquare2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAnalyticsData } from '@/hooks/data/academic-analytics/useAnalyticsData';
import { AnalyticsFilterState } from '@/types/academic-analytics.types';

interface AnalyticsFilterCascadeProps {
  filterState: AnalyticsFilterState;
  onFilterChange: (filters: Partial<AnalyticsFilterState>) => void;
}

/**
 * Componente de filtros con selección múltiple
 * Permite seleccionar: Ciclo (único) → Grados (múltiple) → Secciones (múltiple)
 * 
 * Todos los filtros excepto Ciclo son opcionales.
 * Si no se especifica grados o secciones, se muestran todos.
 * 
 * Nota: Bimestres está oculto de momento (puede activarse más adelante)
 */
export function AnalyticsFilterCascade({
  filterState,
  onFilterChange,
}: AnalyticsFilterCascadeProps) {
  const { data, isLoading, error } = useAnalyticsData();
  const [gradesSections, setGradesSections] = useState<Record<number, any[]>>({});
  const [gradesMap, setGradesMap] = useState<Record<number, string>>({});
  const [isGradesPopoverOpen, setIsGradesPopoverOpen] = useState(false);
  const [isSectionsPopoverOpen, setIsSectionsPopoverOpen] = useState(false);

  useEffect(() => {
    if (data?.gradesSections) {
      setGradesSections(data.gradesSections);
    }
    if (data?.grades) {
      const map: Record<number, string> = {};
      data.grades.forEach(grade => {
        map[grade.id] = grade.name;
      });
      setGradesMap(map);
    }
  }, [data?.gradesSections, data?.grades]);

  // Get available sections based on selected grades
  const availableSections = useMemo(() => {
    if (filterState.gradeIds.length === 0) {
      // Si no hay grados seleccionados, mostrar todas las secciones
      return Object.values(gradesSections).flat();
    }
    // Mostrar solo las secciones de los grados seleccionados
    return filterState.gradeIds
      .flatMap(gradeId => gradesSections[gradeId] || []);
  }, [filterState.gradeIds, gradesSections]);

  // Get section with grade name for display
  const getSectionWithGrade = (section: any): { section: any; gradeName: string } => {
    // Find which grade this section belongs to
    for (const [gradeId, sections] of Object.entries(gradesSections)) {
      if ((sections as any[]).some(s => s.id === section.id)) {
        return {
          section,
          gradeName: gradesMap[parseInt(gradeId)] || 'Grado desconocido',
        };
      }
    }
    return { section, gradeName: 'Grado desconocido' };
  };

  // Handle cycle change
  const handleCycleChange = (cycleId: string) => {
    onFilterChange({
      cycleId: parseInt(cycleId),
    });
  };

  // Handle grade checkbox toggle
  const handleGradeToggle = (gradeId: number) => {
    const newGradeIds = filterState.gradeIds.includes(gradeId)
      ? filterState.gradeIds.filter(id => id !== gradeId)
      : [...filterState.gradeIds, gradeId];

    onFilterChange({
      gradeIds: newGradeIds,
      // Reset sections si desseleccionan grados que contienen esas secciones
      sectionIds: filterState.sectionIds.filter(sectionId =>
        newGradeIds.some(gradeId => 
          gradesSections[gradeId]?.some(s => s.id === sectionId)
        )
      ),
    });
  };

  // Toggle all grades
  const handleToggleAllGrades = () => {
    if (!data?.grades) return;

    const allSelected = filterState.gradeIds.length === data.grades.length;

    onFilterChange({
      gradeIds: allSelected ? [] : data.grades.map(g => g.id),
    });
  };

  // Handle section checkbox toggle
  const handleSectionToggle = (sectionId: number) => {
    const newSectionIds = filterState.sectionIds.includes(sectionId)
      ? filterState.sectionIds.filter(id => id !== sectionId)
      : [...filterState.sectionIds, sectionId];

    onFilterChange({
      sectionIds: newSectionIds,
    });
  };

  // Toggle all sections
  const handleToggleAllSections = () => {
    const allSelected = filterState.sectionIds.length === availableSections.length;

    onFilterChange({
      sectionIds: allSelected ? [] : availableSections.map(s => s.id),
    });
  };

  // Handle bimester checkbox toggle (Oculto por ahora)
  // const handleBimesterToggle = (bimesterId: number) => {
  //   const newBimesterIds = filterState.bimesterIds.includes(bimesterId)
  //     ? filterState.bimesterIds.filter(id => id !== bimesterId)
  //     : [...filterState.bimesterIds, bimesterId];

  //   onFilterChange({
  //     bimesterIds: newBimesterIds,
  //   });
  // };

  // // Toggle all bimesters
  // const handleToggleAllBimesters = () => {
  //   if (!data?.bimesters) return;

  //   const allSelected =
  //     filterState.bimesterIds.length === data.bimesters.length;

  //   onFilterChange({
  //     bimesterIds: allSelected
  //       ? []
  //       : data.bimesters.map(b => b.id),
  //   });
  // };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Loading state
  if (isLoading || !data) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6 dark:bg-slate-900 dark:border-slate-700">
      {/* Cycle Section - Header */}
      <div className="pb-6 border-b-2 dark:border-slate-700">
        <Select value={filterState.cycleId?.toString() || ''} onValueChange={handleCycleChange}>
          <SelectTrigger className="mb-3">
            <SelectValue placeholder="Selecciona ciclo escolar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key={data.cycle.id} value={data.cycle.id.toString()}>
              {data.cycle.name}
            </SelectItem>
          </SelectContent>
        </Select>
        {filterState.cycleId && (
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 space-y-1">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {data.cycle.name}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {new Date(data.cycle.startDate).toLocaleDateString('es-ES')} -{' '}
              {new Date(data.cycle.endDate).toLocaleDateString('es-ES')}
            </p>
          </div>
        )}
      </div>

      {/* Filters Section - Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Grades Multi-Select */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Grados</Label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {filterState.gradeIds.length > 0 ? `${filterState.gradeIds.length} sel.` : 'Opcional'}
            </span>
          </div>
          <Popover open={isGradesPopoverOpen} onOpenChange={setIsGradesPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={!filterState.cycleId}
              >
                {filterState.gradeIds.length > 0 ? (
                  <>
                    <CheckSquare2 className="w-4 h-4 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="truncate">
                      {filterState.gradeIds.length} grado{filterState.gradeIds.length !== 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-gray-500">Mostrar todos</span>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4">
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs w-full justify-center"
                  onClick={handleToggleAllGrades}
                >
                  {data?.grades && filterState.gradeIds.length === data.grades.length
                    ? '↺ Deseleccionar todo'
                    : '✓ Seleccionar todo'}
                </Button>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {data?.grades && data.grades.length > 0
                    ? data.grades.map(grade => (
                        <div
                          key={grade.id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                          onClick={() => handleGradeToggle(grade.id)}
                        >
                          <Checkbox
                            id={`grade-${grade.id}`}
                            checked={filterState.gradeIds.includes(grade.id)}
                            onCheckedChange={() => handleGradeToggle(grade.id)}
                          />
                          <Label htmlFor={`grade-${grade.id}`} className="text-sm cursor-pointer flex-1 font-normal">
                            {grade.name}
                          </Label>
                        </div>
                      ))
                    : (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          No disponible
                        </p>
                      )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Sections Multi-Select */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Secciones</Label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {filterState.sectionIds.length > 0 ? `${filterState.sectionIds.length} sel.` : 'Opcional'}
            </span>
          </div>
          <Popover open={isSectionsPopoverOpen} onOpenChange={setIsSectionsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={!filterState.cycleId}
              >
                {filterState.sectionIds.length > 0 ? (
                  <>
                    <CheckSquare2 className="w-4 h-4 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="truncate">
                      {filterState.sectionIds.length} secc.{filterState.sectionIds.length !== 1 ? '' : ''}
                    </span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-gray-500">Mostrar todas</span>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs w-full justify-center"
                  onClick={handleToggleAllSections}
                  disabled={availableSections.length === 0}
                >
                  {filterState.sectionIds.length === availableSections.length
                    ? '↺ Deseleccionar todo'
                    : '✓ Seleccionar todo'}
                </Button>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableSections.length > 0
                    ? availableSections.map(section => {
                        const { gradeName } = getSectionWithGrade(section);
                        return (
                          <div
                            key={section.id}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                            onClick={() => handleSectionToggle(section.id)}
                          >
                            <Checkbox
                              id={`section-${section.id}`}
                              checked={filterState.sectionIds.includes(section.id)}
                              onCheckedChange={() => handleSectionToggle(section.id)}
                            />
                            <Label htmlFor={`section-${section.id}`} className="text-sm cursor-pointer flex-1 font-normal">
                              <span className="font-semibold">{section.name}</span>
                              <span className="text-gray-600 dark:text-gray-400 ml-2 text-xs">
                                ({gradeName})
                              </span>
                            </Label>
                          </div>
                        );
                      })
                    : (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {filterState.gradeIds.length === 0
                            ? 'Selecciona grados para ver secciones'
                            : 'No hay secciones disponibles'}
                        </p>
                      )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );
}
