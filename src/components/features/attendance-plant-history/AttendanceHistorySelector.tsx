'use client';

/**
 * ====================================================================
 * AttendanceHistorySelector - Selector de sección y bimestre
 * ====================================================================
 * 
 * Componente para seleccionar:
 * - Grado
 * - Sección
 * - Bimestre (automático)
 * - Ciclo (automático)
 * 
 * El backend retorna automáticamente todos los estudiantes de la sección
 */

import React, { useState, useMemo } from 'react';
import { useAttendancePlantCascadeData } from '@/hooks/data/attendance-plant';
import { AlertCircle, Loader } from 'lucide-react';

interface AttendanceHistorySelectorProps {
  onSelect: (params: {
    gradeId: number;
    gradeName: string;
    sectionId: number;
    sectionName: string;
    bimesterId: number;
    bimesterName: string;
    cycleId: number;
  }) => void;
}

export function AttendanceHistorySelector({ onSelect }: AttendanceHistorySelectorProps) {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: cascadeData, isLoading: cascadeLoading, error: cascadeError } = useAttendancePlantCascadeData();

  const grades = useMemo(() => {
    if (!cascadeData) return [];
    return cascadeData.grades;
  }, [cascadeData]);

  const sections = useMemo(() => {
    if (!cascadeData || !selectedGrade) return [];
    return cascadeData.sections.filter((s: any) => s.gradeId === selectedGrade);
  }, [cascadeData, selectedGrade]);

  if (cascadeLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-center gap-3 py-12">
          <Loader size={24} className="animate-spin text-blue-500" />
          <p className="text-slate-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (cascadeError) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="p-6 bg-amber-50 border-l-4 border-amber-500 rounded-xl">
          <div className="flex items-start gap-4">
            <AlertCircle size={28} className="text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-amber-900 mb-1">Error al cargar datos</h3>
              <p className="text-amber-800">{cascadeError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cascadeData) {
    return null;
  }

  const handleSearch = async () => {
    if (!selectedGrade || !selectedSection) {
      alert('Por favor selecciona grado y sección');
      return;
    }

    setIsSearching(true);

    try {
      const selectedGradeObj = grades.find((g: any) => g.id === selectedGrade);
      const selectedSectionObj = sections.find((s: any) => s.id === selectedSection);

      if (!selectedGradeObj || !selectedSectionObj) {
        throw new Error('Grado o sección no válido');
      }

      onSelect({
        gradeId: selectedGrade,
        gradeName: selectedGradeObj.name,
        sectionId: selectedSection,
        sectionName: selectedSectionObj.name,
        bimesterId: cascadeData.activeBimester.id,
        bimesterName: cascadeData.activeBimester.name,
        cycleId: cascadeData.cycle.id,
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Consultar Historial de Asistencia</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Ciclo Escolar (solo lectura) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Ciclo Escolar
          </label>
          <input
            type="text"
            value={cascadeData.cycle.name}
            disabled
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed"
          />
        </div>

        {/* Bimestre (solo lectura) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Bimestre
          </label>
          <input
            type="text"
            value={cascadeData.activeBimester.name}
            disabled
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed"
          />
        </div>

        {/* Grado */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Grado <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedGrade || ''}
            onChange={(e) => {
              setSelectedGrade(e.target.value ? Number(e.target.value) : null);
              setSelectedSection(null);
            }}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecciona grado...</option>
            {grades.map((grade: any) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sección */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Sección <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedSection || ''}
            onChange={(e) => setSelectedSection(e.target.value ? Number(e.target.value) : null)}
            disabled={!selectedGrade}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">Selecciona sección...</option>
            {sections.map((section: any) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botón de búsqueda */}
      <button
        onClick={handleSearch}
        disabled={!selectedGrade || !selectedSection || isSearching}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
          selectedGrade && selectedSection && !isSearching
            ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
        }`}
      >
        {isSearching ? (
          <>
            <Loader size={20} className="animate-spin" />
            Cargando historial...
          </>
        ) : (
          'Ver Historial de la Sección'
        )}
      </button>

      <p className="text-xs text-slate-500 mt-4">
        💡 Selecciona grado y sección para ver el historial de asistencia de todos los estudiantes
      </p>
    </div>
  );
}
