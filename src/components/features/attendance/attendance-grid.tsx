// src/components/features/attendance/attendance-grid.tsx - REFACTORIZADO FASE 2
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Monitor, Grid3X3, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  useAttendanceData,
  useAttendanceFilters,
  useAttendanceActions,
  useHolidaysData,
} from '@/hooks/attendance';
import { useStudentsBySection } from '@/hooks/data';
import { AttendanceStatusProvider } from '@/context/AttendanceStatusContext';
import AttendanceHeader from './components/header/AttendanceHeader';
import AttendanceTable from './components/table/AttendanceTable';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';

function AttendanceGridContent() {
  // ========== NUEVOS HOOKS FASE 2 ==========
  const { attendances, stats, loading, error, fetchAttendances } = useAttendanceData();
  const { filters, setFilter } = useAttendanceFilters();
  const { getHolidayInfo, isHoliday: isHolidayDate } = useHolidaysData();

  // ========== ESTADOS LOCALES ==========
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // ========== CARGAR ESTUDIANTES DE LA SECCIÓN ==========
  const { students, loading: loadingStudents, error: studentsError } = useStudentsBySection(selectedGradeId, selectedSectionId);

  // DEBUG: Log del estado principal
  console.log('🎯 Estado de attendance-grid:', {
    selectedGradeId,
    selectedSectionId,
    selectedDate: selectedDate.toISOString().split('T')[0],
    studentsCount: students.length,
    attendancesCount: attendances.length,
    loading,
    loadingStudents,
    error,
    studentsError,
  });

  // ========== VERIFICACIÓN DE FESTIVOS ==========
  const currentHoliday = useMemo(() => {
    return getHolidayInfo(selectedDate);
  }, [selectedDate, getHolidayInfo]);

  const isHoliday = useMemo(() => {
    return !!currentHoliday;
  }, [currentHoliday]);

  // ========== FUSIONAR ESTUDIANTES CON ASISTENCIAS ==========
  // Empezar con lista de estudiantes (todos de la sección)
  // Para cada uno, buscar si tiene asistencia registrada ese día
  // Si tiene, combinar datos; si no, devolver estudiante sin marcar
  const mergedAttendanceData = useMemo(() => {
    console.log('[Attendance] Fusionando datos:', {
      studentsCount: students.length,
      attendancesCount: attendances.length,
    });

    // Si no hay estudiantes, no hay nada que mostrar
    if (students.length === 0) {
      console.log('[Attendance] ❌ Sin estudiantes cargados');
      return [];
    }

    // Fusionar: Para cada estudiante, buscar asistencia registrada
    const merged = students.map((student) => {
      // Buscar asistencia para este estudiante en esta fecha
      const attendance = attendances.find(
        (att) => att.enrollmentId === student.enrollmentId
      );

      // Si hay asistencia, combinar datos
      if (attendance) {
        console.log(`[Attendance] ✅ ${student.studentName}: Asistencia encontrada - ${attendance.attendanceStatusId}`);
        return {
          ...attendance,      // id, date, attendanceStatusId, recordedAt, etc
          ...student,         // Sobrescribir con datos del estudiante original (incluido studentName correcto)
          enrollmentId: student.enrollmentId, // Asegurar que enrollmentId sea del estudiante
        };
      }

      // Si no hay asistencia, devolver estudiante sin marcar
      console.log(`[Attendance] ⭕ ${student.studentName}: Sin marcar`);
      return student;
    });

    console.log('[Attendance] 📊 Datos fusionados:', merged.length, 'estudiantes');
    return merged;
  }, [students, attendances]);

  // ========== CARGAR ASISTENCIAS CUANDO CAMBIA SECCIÓN/FECHA ==========
  useEffect(() => {
    if (!selectedSectionId) {
      console.log('⚠️ No hay sección seleccionada');
      return;
    }

    // Construir query con fecha seleccionada
    const isoDate = selectedDate.toISOString().split('T')[0];
    console.log('🔄 Cargando asistencias:', {
      sectionId: selectedSectionId,
      dateFrom: isoDate,
      dateTo: isoDate,
    });
    
    fetchAttendances({
      sectionId: selectedSectionId,
      dateFrom: isoDate,
      dateTo: isoDate,
      page: 1,
      limit: 50,
    });
  }, [selectedSectionId, selectedDate, fetchAttendances]);

  // ========== HANDLERS ==========
  const handleGradeChange = (gradeId: number | null) => {
    console.log('📍 handleGradeChange:', gradeId);
    setSelectedGradeId(gradeId);
    setSelectedSectionId(null);
  };

  const handleSectionChange = (sectionId: number | null) => {
    console.log('📍 handleSectionChange:', sectionId);
    setSelectedSectionId(sectionId);
  };

  const handleDateChange = (date: Date) => {
    console.log('📍 handleDateChange:', date);
    setSelectedDate(date);
  };

  const handleGoHome = () => {
    setSelectedGradeId(null);
    setSelectedSectionId(null);
    setSelectedDate(new Date());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 📋 Header con selectores y filtros */}
        <AttendanceHeader
          selectedGradeId={selectedGradeId}
          selectedSectionId={selectedSectionId}
          selectedDate={selectedDate}
          onGradeChange={handleGradeChange}
          onSectionChange={handleSectionChange}
          onDateChange={handleDateChange}
        />

        {/* 🎯 Área principal */}
        <div className="space-y-6">
          {/* Estado: Sin grado seleccionado */}
          {!selectedGradeId && (
            <EmptyState message="Selecciona un grado para ver la asistencia" />
          )}

          {/* Estado: Sin sección seleccionada */}
          {selectedGradeId && !selectedSectionId && (
            <EmptyState message="Selecciona una sección para ver la asistencia" />
          )}

          {/* Contenido principal: Tabla */}
          {selectedGradeId && selectedSectionId && (
            <div className="space-y-4">
              {/* Toggle de vista */}
              <TooltipProvider>
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-5 border-2 border-slate-200 dark:border-slate-700 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800">
                      <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Modo de vista
                      </h3>
                      <Badge variant="outline" className="text-xs mt-1 bg-slate-100 dark:bg-slate-800">
                        {viewMode === 'table' ? 'Tabla' : 'Cards'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'table' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('table')}
                          className={`flex items-center gap-2 border-2 ${viewMode === 'table' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : ''}`}
                          aria-label="Vista de tabla"
                        >
                          <Monitor className="h-4 w-4" />
                          <span className="hidden sm:inline">Tabla</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">Vista de tabla</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'cards' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('cards')}
                          className={`flex items-center gap-2 border-2 ${viewMode === 'cards' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : ''}`}
                          aria-label="Vista de tarjetas"
                        >
                          <Grid3X3 className="h-4 w-4" />
                          <span className="hidden sm:inline">Cards</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">Vista de tarjetas (próximamente)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </TooltipProvider>

              {/* Estados de carga */}
              {loading && <LoadingState />}
              {error && <ErrorState error={error} />}

              {/* Componentes de asistencia */}
              {!loading && viewMode === 'table' && (
                <AttendanceTable
                  data={mergedAttendanceData}
                  selectedDate={selectedDate}
                />
              )}

              {/* Cards view - para futura implementación */}
              {!loading && viewMode === 'cards' && (
                <EmptyState message="Vista en cards próximamente disponible" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper que proporciona el contexto de estados de asistencia
 * a todos los componentes hijos
 */
export default function AttendancePageWrapper() {
  return (
    <AttendanceStatusProvider>
      <AttendanceGridContent />
    </AttendanceStatusProvider>
  );
}