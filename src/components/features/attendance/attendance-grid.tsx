// src/components/features/attendance/attendance-grid.tsx - REFACTORIZADO FASE 2
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Monitor, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useAttendanceData,
  useAttendanceFilters,
  useAttendanceActions,
  useHolidaysData,
} from '@/hooks/attendance';
import AttendanceHeader from './components/attendance-header/AttendanceHeader';
import AttendanceTable from './components/attendance-grid/AttendanceTable';
import AttendanceCards from './components/attendance-grid/AttendanceCards';
import {
  NoGradeSelectedState,
  NoSectionSelectedState,
} from './components/attendance-states/EmptyState';

export default function AttendancePageWrapper() {
  // ========== NUEVOS HOOKS FASE 2 ==========
  const { attendances, stats, loading, error, fetchAttendances } = useAttendanceData();
  const { filters, setFilter } = useAttendanceFilters();
  const { getHolidayInfo, isHoliday: isHolidayDate } = useHolidaysData();

  // ========== ESTADOS LOCALES ==========
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // DEBUG: Log del estado principal
  console.log('🎯 Estado de attendance-grid:', {
    selectedGradeId,
    selectedSectionId,
    selectedDate: selectedDate.toISOString().split('T')[0],
    attendancesCount: attendances.length,
    loading,
    error,
  });

  // ========== VERIFICACIÓN DE FESTIVOS ==========
  const currentHoliday = useMemo(() => {
    return getHolidayInfo(selectedDate);
  }, [selectedDate, getHolidayInfo]);

  const isHoliday = useMemo(() => {
    return !!currentHoliday;
  }, [currentHoliday]);

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
          totalStudents={attendances.length}
          stats={stats}
        />

        {/* 🎯 Área principal */}
        <div className="space-y-6">
          {/* Estado: Sin grado seleccionado */}
          {!selectedGradeId && (
            <NoGradeSelectedState
              action={{
                label: 'Ver ayuda',
                onClick: () => alert('Selecciona un grado del menú superior para comenzar'),
                variant: 'outline',
              }}
            />
          )}

          {/* Estado: Sin sección seleccionada */}
          {selectedGradeId && !selectedSectionId && (
            <NoSectionSelectedState
              action={{
                label: 'Cambiar grado',
                onClick: () => setSelectedGradeId(null),
                variant: 'outline',
              }}
            />
          )}

          {/* Contenido principal: Tabla o Cards */}
          {selectedGradeId && selectedSectionId && (
            <div className="space-y-4">
              {/* Toggle de vista */}
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Modo de vista:
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {viewMode === 'table' ? 'Tabla' : 'Cards'}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="flex items-center space-x-2"
                  >
                    <Monitor className="h-4 w-4" />
                    <span className="hidden sm:inline">Tabla</span>
                  </Button>

                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="flex items-center space-x-2"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Cards</span>
                  </Button>
                </div>
              </div>

              {/* Componentes de asistencia */}
              {viewMode === 'table' ? (
                <AttendanceTable
                  sectionId={selectedSectionId}
                  selectedDate={selectedDate}
                  isHoliday={isHoliday}
                  holiday={currentHoliday ? {
                    id: currentHoliday.id,
                    date: currentHoliday.date,
                    description: currentHoliday.name,
                    isRecovered: currentHoliday.isRecovered,
                  } : undefined}
                  onDateChange={handleDateChange}
                  data={attendances}
                  loading={loading}
                  error={error}
                />
              ) : (
                <AttendanceCards
                  sectionId={selectedSectionId}
                  selectedDate={selectedDate}
                  isHoliday={isHoliday}
                  holiday={currentHoliday ? {
                    id: currentHoliday.id,
                    date: currentHoliday.date,
                    description: currentHoliday.name,
                    isRecovered: currentHoliday.isRecovered,
                  } : undefined}
                  onDateChange={handleDateChange}
                  data={attendances}
                  loading={loading}
                  error={error}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}