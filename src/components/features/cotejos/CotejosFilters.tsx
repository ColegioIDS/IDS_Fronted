'use client';

import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CascadeResponse } from '@/types/cotejos.types';

interface CotejosFiltersProps {
  cascade: CascadeResponse | null;
  filters: {
    cycleId: number | null;
    bimesterId: number | null;
    gradeId: number | null;
    sectionId: number | null;
    courseId: number | null;
  };
  onFilterChange: (filters: {
    cycleId: number | null;
    bimesterId: number | null;
    gradeId: number | null;
    sectionId: number | null;
    courseId: number | null;
  }) => void;
  loading: boolean;
}

/**
 * Componente de filtros en cascada para cotejos
 * Permite seleccionar ciclo, bimestre, grado, sección y curso
 */
export const CotejosFilters = ({
  cascade,
  filters,
  onFilterChange,
  loading,
}: CotejosFiltersProps) => {
  // Obtener datos del cascade
  const cycle = cascade?.data?.cycle;
  const bimestres = cascade?.data?.activeBimester ? [cascade.data.activeBimester] : [];
  const grades = cascade?.data?.grades ?? [];
  const gradesSections = cascade?.data?.gradesSections ?? {};

  // Secciones filtradas por grado
  const filteredSections = useMemo(() => {
    if (!filters.gradeId || !gradesSections[filters.gradeId]) {
      return [];
    }
    return gradesSections[filters.gradeId];
  }, [filters.gradeId, gradesSections]);

  // Cursos filtrados por sección
  const filteredCourses = useMemo(() => {
    if (!filters.sectionId) {
      return [];
    }
    const section = filteredSections.find((s) => s.id === filters.sectionId);
    return section?.courseAssignments ?? [];
  }, [filters.sectionId, filteredSections]);

  const handleGradeChange = (value: string) => {
    const gradeId = parseInt(value);
    onFilterChange({
      ...filters,
      gradeId,
      sectionId: null,
      courseId: null,
    });
  };

  const handleSectionChange = (value: string) => {
    const sectionId = parseInt(value);
    onFilterChange({
      ...filters,
      sectionId,
      courseId: null,
    });
  };

  const handleCourseChange = (value: string) => {
    const courseId = parseInt(value);
    onFilterChange({
      ...filters,
      courseId,
    });
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-card border rounded-lg">
      {/* Grado */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Grado</label>
        <Select value={filters.gradeId?.toString() ?? ''} onValueChange={handleGradeChange}>
          <SelectTrigger disabled={loading || grades.length === 0}>
            <SelectValue placeholder="Seleccionar grado" />
          </SelectTrigger>
          <SelectContent>
            {grades
              .filter((g) => g.isActive)
              .map((g) => (
                <SelectItem key={g.id} value={g.id.toString()}>
                  {g.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sección */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Sección</label>
        <Select value={filters.sectionId?.toString() ?? ''} onValueChange={handleSectionChange}>
          <SelectTrigger
            disabled={loading || !filters.gradeId || filteredSections.length === 0}
          >
            <SelectValue placeholder="Seleccionar sección" />
          </SelectTrigger>
          <SelectContent>
            {filteredSections.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Curso */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Curso</label>
        <Select value={filters.courseId?.toString() ?? ''} onValueChange={handleCourseChange}>
          <SelectTrigger
            disabled={loading || !filters.sectionId || filteredCourses.length === 0}
          >
            <SelectValue placeholder="Seleccionar curso" />
          </SelectTrigger>
          <SelectContent>
            {filteredCourses.map((ca) => (
              <SelectItem key={ca.id} value={ca.course.id.toString()}>
                {ca.course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
