'use client';

import { useMemo, useEffect } from 'react';
import { BookOpen, Layers, BookMarked } from 'lucide-react';
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

  // Auto-seleccionar grado si solo hay 1
  useEffect(() => {
    const activeGrades = grades.filter((g) => g.isActive);
    if (activeGrades.length === 1 && !filters.gradeId) {
      onFilterChange({
        ...filters,
        gradeId: activeGrades[0].id,
        sectionId: null,
        courseId: null,
      });
    }
  }, [grades, filters.gradeId, onFilterChange, filters]);

  // Auto-seleccionar sección si solo hay 1
  useEffect(() => {
    if (filteredSections.length === 1 && !filters.sectionId) {
      onFilterChange({
        ...filters,
        sectionId: filteredSections[0].id,
        courseId: null,
      });
    }
  }, [filteredSections, filters.sectionId, onFilterChange, filters]);

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

  const activeGrades = grades.filter((g) => g.isActive);

  return (
    <div className="space-y-2">
      {/* Contenedor principal con estilo mejorado */}
      <div className="grid grid-cols-3 gap-5 p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        {/* Grado */}
        <div className="space-y-3 group">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Grado</label>
              {filters.gradeId && activeGrades.find(g => g.id === filters.gradeId) && (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {activeGrades.find(g => g.id === filters.gradeId)?.name}
                </p>
              )}
            </div>
          </div>
          <Select value={filters.gradeId?.toString() ?? ''} onValueChange={handleGradeChange}>
            <SelectTrigger className="h-11 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-500 transition-all rounded-lg font-medium" disabled={loading || activeGrades.length === 0}>
              <SelectValue placeholder="Selecciona un grado" />
            </SelectTrigger>
            <SelectContent>
              {activeGrades.map((g) => (
                <SelectItem key={g.id} value={g.id.toString()}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sección */}
        <div className="space-y-3 group">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
              <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sección</label>
              {filters.sectionId && filteredSections.find(s => s.id === filters.sectionId) && (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {filteredSections.find(s => s.id === filters.sectionId)?.name}
                </p>
              )}
            </div>
          </div>
          <Select value={filters.sectionId?.toString() ?? ''} onValueChange={handleSectionChange}>
            <SelectTrigger className="h-11 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-purple-400 dark:hover:border-purple-600 focus:border-purple-500 dark:focus:border-purple-500 transition-all rounded-lg font-medium disabled:opacity-50" disabled={loading || !filters.gradeId || filteredSections.length === 0}>
              <SelectValue placeholder="Selecciona una sección" />
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
        <div className="space-y-3 group">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors">
              <BookMarked className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Curso</label>
              {filters.courseId && filteredCourses.find(ca => ca.course.id === filters.courseId) && (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {filteredCourses.find(ca => ca.course.id === filters.courseId)?.course.name}
                </p>
              )}
            </div>
          </div>
          <Select value={filters.courseId?.toString() ?? ''} onValueChange={handleCourseChange}>
            <SelectTrigger className="h-11 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-600 focus:border-amber-500 dark:focus:border-amber-500 transition-all rounded-lg font-medium disabled:opacity-50" disabled={loading || !filters.sectionId || filteredCourses.length === 0}>
              <SelectValue placeholder="Selecciona un curso" />
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
    </div>
  );
};
