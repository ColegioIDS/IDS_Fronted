'use client';

/**
 * ====================================================================
 * FilterPanel Component
 * ====================================================================
 *
 * Panel de selectores en cascada para filtrar reportes de asistencia
 * Mantiene la cadena: Ciclo → Bimestre → Grado → Sección → Semana
 */

import React from 'react';
import {
  useCascadeAttendanceFilters,
  useBimesterOptions,
  useGradeOptions,
  useSectionOptions,
  useWeekOptions,
  useActiveCycle,
} from '@/hooks/data/attendance';
import type {
  BimesterOption,
  GradeOption,
  SectionOption,
  WeekOption,
} from '@/services/attendance-reports.service';

export interface FilterPanelProps {
  onFiltersChange?: (filters: any) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onFiltersChange }) => {
  const {
    filters,
    setCycle,
    setBimester,
    setGrade,
    setSection,
    setWeek,
  } = useCascadeAttendanceFilters();

  // Cargar datos del ciclo activo
  const { cycle: activeCycleData, loading: activeCycleLoading } = useActiveCycle();

  // Cargar opciones de bimestres (cuando ciclo está seleccionado)
  const { data: bimesterOptions, loading: bimesterLoading } = useBimesterOptions(
    filters.cycleId
  );

  // Cargar opciones de grados (cuando bimestre está seleccionado)
  const { data: gradeOptions, loading: gradeLoading } = useGradeOptions(
    filters.bimesterId
  );

  // Cargar opciones de secciones (cuando grado está seleccionado)
  const { data: sectionOptions, loading: sectionLoading } = useSectionOptions(
    filters.gradeId,
    filters.bimesterId
  );

  // Cargar opciones de semanas (opcional, cuando bimestre está seleccionado)
  const { data: weekOptions, loading: weekLoading } = useWeekOptions(
    filters.bimesterId
  );

  // Notificar cambios al padre
  React.useEffect(() => {
    console.log('📋 [FilterPanel] Filters changed in FilterPanel:', filters);
    onFiltersChange?.(filters);
  }, [filters]);

  // Si hay ciclo activo y no hay ciclo seleccionado, usar el activo
  React.useEffect(() => {
    if (activeCycleData?.id && !filters.cycleId) {
      setCycle(activeCycleData.id);
    }
  }, [activeCycleData, filters.cycleId, setCycle]);

  return (
    <div className="space-y-4 p-4 bg-white border rounded-lg">
      <h3 className="font-semibold text-lg">Filtros</h3>

      {/* Ciclo - Lectura: Ciclo Activo */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Ciclo Escolar
        </label>
        {activeCycleLoading ? (
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
        ) : (
          <div className="p-3 bg-gray-50 rounded border text-gray-600 text-sm">
            {activeCycleData?.name || 'Cargando...'}
          </div>
        )}
      </div>

      {/* Bimestre - Select */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Bimestre {bimesterLoading && <span className="text-xs text-gray-500">(cargando...)</span>}
        </label>
        <select
          value={filters.bimesterId || ''}
          onChange={(e) => setBimester(e.target.value ? Number(e.target.value) : null)}
          disabled={!filters.cycleId || bimesterLoading}
          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Seleccionar bimestre...</option>
          {bimesterOptions?.bimesters && Array.isArray(bimesterOptions.bimesters) && bimesterOptions.bimesters.length > 0 ? (
            bimesterOptions.bimesters.map((bimester: BimesterOption) => (
              <option key={bimester.id} value={bimester.id}>
                {bimester.name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              {bimesterLoading ? 'Cargando...' : 'No hay bimestres disponibles'}
            </option>
          )}
        </select>
      </div>

      {/* Grado - Select */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Grado {gradeLoading && <span className="text-xs text-gray-500">(cargando...)</span>}
        </label>
        <select
          value={filters.gradeId || ''}
          onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : null)}
          disabled={!filters.bimesterId || gradeLoading}
          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Seleccionar grado...</option>
          {gradeOptions?.grades && Array.isArray(gradeOptions.grades) && gradeOptions.grades.length > 0 ? (
            gradeOptions.grades.map((grade: GradeOption) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              {gradeLoading ? 'Cargando...' : 'No hay grados disponibles'}
            </option>
          )}
        </select>
      </div>

      {/* Sección - Select */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Sección {sectionLoading && <span className="text-xs text-gray-500">(cargando...)</span>}
        </label>
        <select
          value={filters.sectionId || ''}
          onChange={(e) => {
            console.log('🎯 [FilterPanel] Sección select changed to:', e.target.value);
            setSection(e.target.value ? Number(e.target.value) : null);
          }}
          disabled={!filters.gradeId || sectionLoading}
          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Seleccionar sección...</option>
          {sectionOptions?.sections && Array.isArray(sectionOptions.sections) && sectionOptions.sections.length > 0 ? (
            sectionOptions.sections.map((section: SectionOption) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              {sectionLoading ? 'Cargando...' : 'No hay secciones disponibles'}
            </option>
          )}
        </select>
      </div>

      {/* Semana - Select (Opcional) */}
      {weekOptions && weekOptions.weeks.length > 0 && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Semana (Opcional) {weekLoading && <span className="text-xs text-gray-500">(cargando...)</span>}
          </label>
          <select
            value={filters.weekId || ''}
            onChange={(e) => setWeek(e.target.value ? Number(e.target.value) : null)}
            disabled={!filters.bimesterId || weekLoading}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Todas las semanas</option>
            {weekOptions?.weeks && Array.isArray(weekOptions.weeks) && weekOptions.weeks.length > 0 ? (
              weekOptions.weeks.map((week: WeekOption) => (
                <option key={week.id} value={week.id}>
                  Semana {week.number} ({week.startDate})
                </option>
              ))
            ) : (
              <option value="" disabled>
                {weekLoading ? 'Cargando...' : 'No hay semanas disponibles'}
              </option>
            )}
          </select>
        </div>
      )}
    </div>
  );
};
