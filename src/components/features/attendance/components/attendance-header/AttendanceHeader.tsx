// src/components/attendance/components/attendance-header/AttendanceHeader.tsx - CON DATOS MOCKUP
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

// 🎯 Importar datos mockup
import {
  getActiveSchoolCycle,
  getActiveBimester,
  getActiveBimesterProgress,
  isHolidayDate,
  getUpcomingHolidays,
  MOCK_HOLIDAYS
} from '../../data/mockData';

interface AttendanceHeaderProps {
  selectedGradeId: number | null;
  selectedSectionId: number | null;
  selectedDate: Date;
  onGradeChange: (gradeId: number | null) => void;
  onSectionChange: (sectionId: number | null) => void;
  onDateChange: (date: Date) => void;
  totalStudents?: number;
  stats?: any; // AttendanceStats from hook
}

export default function AttendanceHeader({
  selectedGradeId,
  selectedSectionId,
  selectedDate,
  onGradeChange,
  onSectionChange,
  onDateChange,
  totalStudents = 0,
  stats
}: AttendanceHeaderProps) {
  // 🔄 Datos automáticos de mockups
  const activeCycle = getActiveSchoolCycle();
  const activeBimester = getActiveBimester();
  const { progress, daysRemaining } = getActiveBimesterProgress();

  const hasCycle = !!activeCycle;
  const hasBimester = !!activeBimester;

  // 📅 Verificar si la fecha seleccionada es día festivo
  const currentHoliday = useMemo(() => {
    return isHolidayDate(selectedDate);
  }, [selectedDate]);

  const isHoliday = !!currentHoliday;

  // 🎉 Próximos días festivos (siguientes 7 días)
  const upcomingHolidays = useMemo(() => {
    return getUpcomingHolidays(selectedDate);
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* 📋 Header Principal */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Control de Asistencia
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Registro diario de estudiantes
              </p>
            </div>
          </div>

          {/* 🔄 Indicador de estado del sistema */}
          <div className="flex items-center space-x-2">
            {hasCycle && hasBimester ? (
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Sistema Activo
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Configuración Incompleta
              </Badge>
            )}
          </div>
        </div>

        {/* ⚠️ Alerta si falta configuración */}
        {(!hasCycle || !hasBimester) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {!hasCycle && "No hay un ciclo escolar activo. "}
              {!hasBimester && "No hay un bimestre activo. "}
              Contacte al administrador del sistema.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* 📊 Información Automática del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 📚 Ciclo Escolar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
              Ciclo Escolar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {activeCycle?.name || 'No definido'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {activeCycle?.isActive ? 'Activo' : 'Inactivo'}
            </div>
          </CardContent>
        </Card>

        {/* 📖 Bimestre */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-purple-500" />
              Bimestre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {activeBimester?.name || 'No definido'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Finalizado'}
            </div>
            {/* 📊 Barra de progreso del bimestre */}
            {progress > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {Math.round(progress)}% completado
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ⏰ Información de Tiempo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-green-500" />
              Fecha Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {selectedDate.toLocaleDateString('es-GT', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isHoliday ? '🎉 Día Festivo' : '📚 Día Lectivo'}
            </div>
          </CardContent>
        </Card>

        {/* 👥 Estudiantes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-orange-500" />
              Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {totalStudents}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {selectedSectionId ? 'En sección seleccionada' : 'Seleccione sección'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🎉 Alerta de Día Festivo */}
      {isHoliday && currentHoliday && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <Calendar className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Día Festivo:</strong> {currentHoliday.description}
            {currentHoliday.isRecovered && (
              <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                Día Recuperado
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* 📅 Próximos Días Festivos */}
      {upcomingHolidays.length > 0 && !isHoliday && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>Próximo día festivo:</strong> {upcomingHolidays[0].description} - {' '}
            {new Date(upcomingHolidays[0].date).toLocaleDateString('es-GT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Primera fila: Grado y Sección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* 🎓 Selector de Grado */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Grado
            </label>
            <div className="w-full">
              <GradeSelector
                selectedGradeId={selectedGradeId}
                onGradeChange={onGradeChange}
              />
            </div>
          </div>

          {/* 📝 Selector de Sección */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sección
            </label>
            <div className="w-full">
              <SectionSelector
                selectedGradeId={selectedGradeId}
                selectedSectionId={selectedSectionId}
                onSectionChange={onSectionChange}
              />
            </div>
          </div>
        </div>

        {/* Segunda fila: Solo la Fecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* 📅 Selector de Fecha */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha
            </label>
            <div className="w-full">
              <DatePicker
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                holidays={MOCK_HOLIDAYS}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Estadísticas de Asistencia */}
      {selectedSectionId && !isHoliday && (
        <AttendanceStats
          sectionId={selectedSectionId}
          date={selectedDate}
          bimesterId={activeBimester?.id}
        />
      )}
    </div>
  );
}
