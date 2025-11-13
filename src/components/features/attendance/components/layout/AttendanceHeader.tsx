"use client";

import { useMemo } from 'react';
import { Calendar, GraduationCap, Users, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import GradeSelector from './GradeSelector';
import SectionSelector from './SectionSelector';
import DatePicker from './DatePicker';
import AttendanceStats from './AttendanceStats';
import { useAttendanceConfig } from '@/hooks/attendance-hooks';
import { formatDateISO } from '@/hooks/useAttendanceUtils';

interface AttendanceHeaderProps {
  selectedGradeId: number | null;
  selectedSectionId: number | null;
  selectedDate: Date;
  onGradeChange: (gradeId: number | null) => void;
  onSectionChange: (sectionId: number | null) => void;
  onDateChange: (date: Date) => void;
  totalStudents?: number;
  stats?: any;
}

export default function AttendanceHeader({
  selectedGradeId,
  selectedSectionId,
  selectedDate,
  onGradeChange,
  onSectionChange,
  onDateChange,
  totalStudents = 0,
  stats,
}: AttendanceHeaderProps) {
  // Obtener configuración (estatuses, grados, secciones, días festivos)
  const { holidays, isHoliday: checkIsHoliday, getHolidayByDate, isLoading, error } = useAttendanceConfig();

  // 📅 Verificar si la fecha seleccionada es día festivo
  const currentHoliday = useMemo(() => {
    const dateISO = formatDateISO(selectedDate);
    return getHolidayByDate(dateISO);
  }, [selectedDate, getHolidayByDate]);

  const isHoliday = !!currentHoliday;

  // 🎉 Próximos días festivos (siguientes 7 días)
  const upcomingHolidaysList = useMemo(() => {
    if (!holidays || holidays.length === 0) return [];
    
    const today = new Date(selectedDate);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return holidays.filter((holiday: any) => {
      const holidayDate = new Date(holiday.date);
      return holidayDate > today && holidayDate <= nextWeek;
    });
  }, [selectedDate, holidays]);

  return (
    <div className="space-y-4">
      {/* 🚨 Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message || 'Error al cargar configuración'}</AlertDescription>
        </Alert>
      )}

      {isHoliday && currentHoliday && (
        <Alert className="border-orange-200 bg-orange-50">
          <Calendar className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            ⚠️ {currentHoliday.name || 'Día festivo'} - No hay asistencia
          </AlertDescription>
        </Alert>
      )}

      {upcomingHolidaysList.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Calendar className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            📅 Próximos {upcomingHolidaysList.length} día(s) festivo(s) esta semana
          </AlertDescription>
        </Alert>
      )}

      {/* Tarjeta Principal */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Control de Asistencia</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {totalStudents} estudiantes
              </Badge>
              {isHoliday && (
                <Badge variant="destructive">
                  <Calendar className="h-3 w-3 mr-1" />
                  Día Festivo
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Grado</label>
              <GradeSelector selectedGradeId={selectedGradeId} onGradeChange={onGradeChange} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Sección</label>
              <SectionSelector selectedGradeId={selectedGradeId} selectedSectionId={selectedSectionId} onSectionChange={onSectionChange} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Fecha</label>
              <DatePicker selectedDate={selectedDate} onDateChange={onDateChange} disabled={isHoliday} />
            </div>

            <div className="flex items-end">
              <AttendanceStats stats={stats} isLoading={isLoading} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
