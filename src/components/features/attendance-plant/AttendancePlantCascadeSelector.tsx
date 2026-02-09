'use client';

/**
 * ====================================================================
 * AttendancePlantCascadeSelector - Selector de cascada
 * ====================================================================
 * 
 * Componente que muestra:
 * - Ciclo escolar actual
 * - Bimestre actual
 * - Semana actual
 * - Selector de grado
 * - Selector de sección
 */

import React, { useState } from 'react';
import { useAttendancePlantCascadeData } from '@/hooks/data/attendance-plant';
import type { AttendancePlantCascadeData } from '@/types/attendance-plant.types';
import { Calendar, BookOpen, BarChart3, CalendarDays, Search, Check } from 'lucide-react';

interface CascadeSelectorProps {
  onSelectionChange?: (selection: {
    gradeId?: number;
    sectionId?: number;
    gradeName?: string;
    sectionName?: string;
  }) => void;
}

/**
 * Parsear fecha ISO a formato local sin ajustes de zona horaria
 */
function formatISODate(isoString: string): string {
  const date = isoString.split('T')[0]; // "2026-02-02"
  const [year, month, day] = date.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
}

export function AttendancePlantCascadeSelector({ onSelectionChange }: CascadeSelectorProps) {
  const { data, isLoading, error, currentBimester, currentWeek } =
    useAttendancePlantCascadeData();

  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);

  const handleGradeChange = (gradeId: number) => {
    setSelectedGrade(gradeId);
    setSelectedSection(null); // Reset sección al cambiar grado
    onSelectionChange?.({
      gradeId,
      gradeName: data?.grades?.find((g: { id: number; name: string }) => g.id === gradeId)?.name,
    });
  };

  const handleSectionChange = (sectionId: number) => {
    setSelectedSection(sectionId);
    onSelectionChange?.({
      gradeId: selectedGrade || undefined,
      sectionId,
      gradeName: data?.grades?.find((g: { id: number; name: string }) => g.id === selectedGrade)?.name,
      sectionName: data?.sections?.find((s: { id: number; name: string }) => s.id === sectionId)?.name,
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* INFORMACIÓN ACTUAL - DISEÑO MEJORADO */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Período Académico Actual</h2>
          <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <Calendar className="text-white" size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ciclo Escolar */}
          <div className="group relative bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-slate-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  Ciclo Escolar
                </p>
                <p className="text-2xl font-bold text-slate-900">{data?.cycle?.name}</p>
                <p className="text-sm text-slate-600 mt-2">
                  {data?.cycle?.startDate ? formatISODate(data.cycle.startDate) : ''} -{' '}
                  {data?.cycle?.endDate ? formatISODate(data.cycle.endDate) : ''}
                </p>
              </div>
              <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                <BookOpen size={28} />
              </div>
            </div>
          </div>

          {/* Bimestre Actual */}
          <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-blue-200 hover:border-blue-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
                  Bimestre Actual
                </p>
                <p className="text-2xl font-bold text-blue-900">{currentBimester?.name}</p>
                <p className="text-sm text-blue-700 mt-2">
                  {currentBimester?.startDate ? formatISODate(currentBimester.startDate) : ''} -{' '}
                  {currentBimester?.endDate ? formatISODate(currentBimester.endDate) : ''}
                </p>
              </div>
              <div className="text-blue-300 group-hover:text-blue-600 transition-colors">
                <BarChart3 size={28} />
              </div>
            </div>
          </div>

          {/* Semana Actual */}
          <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-emerald-200 hover:border-emerald-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">
                  Semana Actual
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  Semana {currentWeek?.number}
                </p>
                <p className="text-sm text-emerald-700 mt-2">
                  {currentWeek?.startDate ? formatISODate(currentWeek.startDate) : ''} -{' '}
                  {currentWeek?.endDate ? formatISODate(currentWeek.endDate) : ''}
                </p>
              </div>
              <div className="text-emerald-300 group-hover:text-emerald-600 transition-colors">
                <CalendarDays size={28} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SELECTORES - DISEÑO MEJORADO */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Filtrar Registros</h2>
            <p className="text-slate-600 text-sm mt-1">Selecciona grado y sección para ver la asistencia</p>
          </div>
          <div className="h-10 w-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
            <Search className="text-white" size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selector de Grado */}
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Selecciona un Grado</label>
            <div className="relative">
              <select
                value={selectedGrade || ''}
                onChange={(e) => handleGradeChange(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white transition-all appearance-none cursor-pointer font-medium text-slate-700"
              >
                <option value="">-- Seleccionar grado --</option>
                {data?.grades?.map((grade: { id: number; name: string }) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-600">
                ▼
              </div>
            </div>
          </div>

          {/* Selector de Sección */}
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Selecciona una Sección</label>
            <div className="relative">
              <select
                value={selectedSection || ''}
                onChange={(e) => handleSectionChange(Number(e.target.value))}
                disabled={!selectedGrade}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white transition-all appearance-none cursor-pointer font-medium text-slate-700 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                <option value="">-- Seleccionar sección --</option>
                {data?.sections
                  ?.filter((s: { id: number; name: string; gradeId: number }) => s.gradeId === selectedGrade)
                  .map((section: { id: number; name: string; gradeId: number }) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-600">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Selección */}
        {selectedGrade && selectedSection && (
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500 rounded-xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <Check className="text-indigo-600" size={24} />
              <div>
                <p className="text-sm text-slate-600">Mostrando registros para:</p>
                <p className="text-lg font-bold text-slate-900">
                  <span className="text-indigo-600">
                    {data?.grades?.find((g: { id: number; name: string }) => g.id === selectedGrade)?.name}
                  </span>
                  {' - '}
                  <span className="text-indigo-600">
                    {data?.sections?.find((s: { id: number; name: string }) => s.id === selectedSection)?.name}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
