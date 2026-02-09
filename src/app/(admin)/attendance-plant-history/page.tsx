'use client';

/**
 * ====================================================================
 * ATTENDANCE PLANT HISTORY PAGE
 * ====================================================================
 * 
 * Página para ver el historial de asistencia de un estudiante por bimestre
 */

import React, { useState } from 'react';
import { useAttendancePlantCascadeData } from '@/hooks/data/attendance-plant';
import { AttendanceHistorySelector, AttendanceHistoryView } from '@/components/features/attendance-plant-history';

export default function AttendancePlantHistoryPage() {
  const [selectedParams, setSelectedParams] = useState<{
    gradeId?: number;
    gradeName?: string;
    sectionId?: number;
    sectionName?: string;
    bimesterId?: number;
    bimesterName?: string;
    cycleId?: number;
  }>({});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Historial de Asistencia</h1>
        <p className="text-slate-600">
          Consulta el historial de asistencia de los estudiantes por bimestre
        </p>
      </div>

      {/* Selector */}
      <AttendanceHistorySelector onSelect={setSelectedParams} />

      {/* History View */}
      {selectedParams.gradeId && selectedParams.sectionId && selectedParams.bimesterId && selectedParams.cycleId && (
        <AttendanceHistoryView
          gradeId={selectedParams.gradeId}
          gradeName={selectedParams.gradeName || ''}
          sectionId={selectedParams.sectionId}
          sectionName={selectedParams.sectionName || ''}
          bimesterId={selectedParams.bimesterId}
          bimesterName={selectedParams.bimesterName || ''}
          cycleId={selectedParams.cycleId}
        />
      )}
    </div>
  );
}
