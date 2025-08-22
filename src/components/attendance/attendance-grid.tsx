// src/components/attendance/attendance-grid.tsx - ACTUALIZADO con estados
"use client";

import { useState, useMemo } from 'react';
import { Monitor, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AttendanceHeader from './components/attendance-header/AttendanceHeader';
import AttendanceTable from './components/attendance-grid/AttendanceTable';
import AttendanceCards from './components/attendance-grid/AttendanceCards';
import { useHolidayContext } from '@/context/HolidaysContext';

// 🎯 IMPORTAR NUEVOS ESTADOS - CORREGIDO
import { 
  NoGradeSelectedState, 
  NoSectionSelectedState
} from './components/attendance-states/EmptyState';

import { 
  LoadingStudents 
} from './components/attendance-states/LoadingState';

import { 
  ServerError 
} from './components/attendance-states/ErrorState';

export default function AttendancePageWrapper() {
  // 🎯 Estados existentes
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // 🎉 Verificación de días festivos
  const { state: { holidays } } = useHolidayContext();
  const currentHoliday = useMemo(() => {
    return holidays.find(holiday => 
      new Date(holiday.date).toDateString() === selectedDate.toDateString()
    );
  }, [holidays, selectedDate]);

  const isHoliday = useMemo(() => {
    return !!currentHoliday;
  }, [currentHoliday]);

  const [totalStudents] = useState(0);

  // 🎯 Handlers
  const handleGradeChange = (gradeId: number | null) => {
    setSelectedGradeId(gradeId);
    setSelectedSectionId(null);
  };

  const handleSectionChange = (sectionId: number | null) => {
    setSelectedSectionId(sectionId);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // 🔄 Función para recargar (para casos de error)
  const handleRetry = () => {
    window.location.reload();
  };

  // 🏠 Función para ir al inicio
  const handleGoHome = () => {
    setSelectedGradeId(null);
    setSelectedSectionId(null);
    setSelectedDate(new Date());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 📋 Header existente */}
        <AttendanceHeader
          selectedGradeId={selectedGradeId}
          selectedSectionId={selectedSectionId}
          selectedDate={selectedDate}
          onGradeChange={handleGradeChange}
          onSectionChange={handleSectionChange}
          onDateChange={handleDateChange}
          totalStudents={totalStudents}
        />

        {/* 🎯 Área principal - ACTUALIZADA con nuevos estados */}
        <div className="space-y-6">
          
          {/* 📝 NUEVO: Estado cuando no hay grado seleccionado */}
          {!selectedGradeId && (
            <NoGradeSelectedState 
              action={{
                label: "Ver ayuda",
                onClick: () => alert("Selecciona un grado del menú superior para comenzar"),
                variant: "outline"
              }}
            />
          )}

          {/* 📚 NUEVO: Estado cuando no hay sección seleccionada */}
          {selectedGradeId && !selectedSectionId && (
            <NoSectionSelectedState 
              action={{
                label: "Cambiar grado",
                onClick: () => setSelectedGradeId(null),
                variant: "outline"
              }}
            />
          )}

          {/* 📊 ACTUALIZADO: Toggle de vista + Componentes de asistencia */}
          {selectedGradeId && selectedSectionId && (
            <div className="space-y-4">
              {/* 🔄 Toggle para cambiar entre vista tabla y cards */}
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
                  {/* 🖥️ Vista Tabla */}
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="flex items-center space-x-2"
                  >
                    <Monitor className="h-4 w-4" />
                    <span className="hidden sm:inline">Tabla</span>
                  </Button>

                  {/* 📱 Vista Cards */}
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

              {/* 📊 Renderizar componente según el modo seleccionado */}
              {/* NOTA: Los estados de loading/error ya están manejados dentro de cada componente */}
              {viewMode === 'table' ? (
                <AttendanceTable
                  sectionId={selectedSectionId}
                  selectedDate={selectedDate}
                  isHoliday={isHoliday}
                  holiday={currentHoliday}
                  onDateChange={handleDateChange}
                />
              ) : (
                <AttendanceCards
                  sectionId={selectedSectionId}
                  selectedDate={selectedDate}
                  isHoliday={isHoliday}
                  holiday={currentHoliday}
                  onDateChange={handleDateChange}
                />
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}