'use client';

import React, { useState, useMemo } from 'react';
import { useSchedules } from '@/hooks/useSchedules';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calendar, Users, Clock, Filter, BookOpen, MapPin, AlertCircle, Info } from 'lucide-react';
import { Schedule, ScheduleConfig, ScheduleTimeGenerator, TimeSlot } from '@/types/schedules.types';

/**
 * SchedulesViewContent - Read-only schedule viewer
 * Displays schedules in a timetable grid format
 */
export default function SchedulesViewContent() {
  const {
    schedules,
    config,
    formData,
    isLoadingSchedules,
    isLoadingConfigs,
    isLoadingFormData,
    loadSchedulesBySection,
    loadConfig,
  } = useSchedules({ autoLoadFormData: true });

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================

  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  // =========================================================================
  // DATA PROCESSING
  // =========================================================================

  // Get available sections
  const sections = useMemo(() => {
    return formData?.sections || [];
  }, [formData?.sections]);

  // Get available cycles
  const cycles = useMemo(() => {
    return formData?.cycles || [];
  }, [formData?.cycles]);

  // Get grades filtered by selected cycle
  const grades = useMemo(() => {
    if (!selectedCycle || !formData?.gradeCycles || !formData?.grades) return [];
    
    const gradeIds = formData.gradeCycles
      .filter(gc => gc.cycleId === selectedCycle)
      .map(gc => gc.gradeId);
    
    return formData.grades.filter(g => gradeIds.includes(g.id));
  }, [selectedCycle, formData?.gradeCycles, formData?.grades]);

  // Get sections filtered by selected grade
  const filteredSections = useMemo(() => {
    if (!selectedGrade) return sections;
    return sections.filter(s => s.gradeId === selectedGrade);
  }, [sections, selectedGrade]);

  // Get unique teachers from schedules
  const teachers = useMemo(() => {
    if (!schedules.length) return [];
    
    const teacherMap = new Map();
    schedules.forEach(schedule => {
      const assignment = schedule.courseAssignment;
      if (assignment?.teacher) {
        teacherMap.set(assignment.teacher.id, assignment.teacher);
      }
    });
    
    return Array.from(teacherMap.values());
  }, [schedules]);

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      if (selectedTeacherId && schedule.courseAssignment?.teacher?.id.toString() !== selectedTeacherId) {
        return false;
      }
      if (selectedDay !== 'all' && schedule.dayOfWeek.toString() !== selectedDay) {
        return false;
      }
      return true;
    });
  }, [schedules, selectedTeacherId, selectedDay]);

  // Generate time slots from config
  const timeSlots = useMemo(() => {
    if (!config) return [];
    return ScheduleTimeGenerator.generateTimeSlots(config);
  }, [config]);

  // Get days of week
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const workingDays = useMemo(() => {
    if (!config) return daysOfWeek;
    return config.workingDays
      .sort((a, b) => a - b)
      .map(day => daysOfWeek[day]);
  }, [config]);

  // Build schedule grid
  const scheduleGrid = useMemo(() => {
    const grid: { [key: string]: Schedule } = {};
    
    filteredSchedules.forEach(schedule => {
      const key = `${schedule.dayOfWeek}-${schedule.startTime}`;
      grid[key] = schedule;
    });
    
    return grid;
  }, [filteredSchedules]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleCycleChange = (cycleId: number) => {
    setSelectedCycle(cycleId);
    setSelectedGrade(null);
    setSelectedSectionId(null);
  };

  const handleGradeChange = (gradeId: number) => {
    setSelectedGrade(gradeId);
    setSelectedSectionId(null);
  };

  const handleSectionChange = async (sectionId: number) => {
    setSelectedSectionId(sectionId);
    setSelectedTeacherId(null);
    setSelectedDay('all');
    
    await Promise.all([
      loadConfig(sectionId),
      loadSchedulesBySection(sectionId),
    ]);
  };

  // =========================================================================
  // RENDER HELPERS
  // =========================================================================

  const getScheduleAtSlot = (dayOfWeek: number, startTime: string): Schedule | null => {
    const key = `${dayOfWeek}-${startTime}`;
    return scheduleGrid[key] || null;
  };

  const getDayNumber = (dayName: string): number => {
    return daysOfWeek.indexOf(dayName);
  };

  const getScheduleBackgroundColor = (schedule: Schedule): string => {
    if (schedule.courseAssignment?.course) {
      const courseId = schedule.courseAssignment.course.id;
      const hue = ((courseId * 137.5) % 360); // Golden angle for color distribution
      return `hsl(${hue}, 70%, 85%)`;
    }
    return 'hsl(0, 0%, 90%)';
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* SECTION SELECTOR CARD - ALWAYS VISIBLE */}
      <Card className="border-2 shadow-lg overflow-hidden">
        <div className="p-6 bg-blue-600 dark:bg-blue-950 border-b-4 border-blue-700 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-700 dark:bg-blue-900 rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">Visualizar Horarios</h3>
              <p className="text-sm text-blue-100 dark:text-blue-300">Selecciona una sección para ver su cuadro de horarios</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900">
          {isLoadingFormData ? (
            <div className="flex items-center justify-center py-8 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Cargando datos...</span>
            </div>
          ) : cycles.length === 0 || sections.length === 0 ? (
            <Alert className="bg-amber-50 dark:bg-amber-950 border-2 border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200 font-medium">
                No hay datos disponibles. Verifica que existan ciclos y secciones creadas.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cycle selector */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Ciclo Escolar
                </label>
                <Combobox
                  options={cycles.map(cycle => ({
                    label: cycle.name,
                    value: cycle.id,
                  }))}
                  value={selectedCycle || 0}
                  onValueChange={(value: string | number) => handleCycleChange(Number(value))}
                  placeholder="Selecciona un ciclo..."
                  searchPlaceholder="Buscar ciclo..."
                />
              </div>

              {/* Grade selector */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Grado
                </label>
                <Combobox
                  options={grades.map(grade => ({
                    label: grade.name,
                    value: grade.id,
                  }))}
                  value={selectedGrade || 0}
                  onValueChange={(value: string | number) => handleGradeChange(Number(value))}
                  placeholder="Selecciona un grado..."
                  searchPlaceholder="Buscar grado..."
                  disabled={!selectedCycle}
                />
              </div>

              {/* Section selector */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Sección
                </label>
                <Combobox
                  options={filteredSections.map(section => ({
                    label: `${section.name}`,
                    value: section.id,
                  }))}
                  value={selectedSectionId || 0}
                  onValueChange={(value: string | number) => handleSectionChange(Number(value))}
                  placeholder="Selecciona una sección..."
                  searchPlaceholder="Buscar sección..."
                  disabled={!selectedGrade}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* SHOW ONLY IF SECTION IS SELECTED */}
      {!selectedSectionId ? (
        <Card className="p-12 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-950 rounded-full">
              <Calendar className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Ninguna sección seleccionada
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Selecciona una sección arriba para ver el cuadro de horarios
              </p>
            </div>
          </div>
        </Card>
      ) : isLoadingSchedules || isLoadingConfigs ? (
        <Card className="p-12 flex items-center justify-center min-h-96 border-2">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-base font-medium text-slate-600 dark:text-slate-300">Cargando horarios...</p>
          </div>
        </Card>
      ) : !config ? (
        <Card className="p-12 border-2">
          <Alert className="bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200 font-medium">
              Esta sección no tiene configuración de horarios
            </AlertDescription>
          </Alert>
        </Card>
      ) : (
        <>
          {/* FILTERS CARD */}
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Filtros de Vista
              </h3>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Day filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Día de la Semana
                  </label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="Todos los días" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los días</SelectItem>
                      {workingDays.map((day, index) => (
                        <SelectItem key={index} value={getDayNumber(day).toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Teacher filter */}
                {teachers.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Docente
                    </label>
                    <Combobox
                      options={[
                        { value: 'all', label: 'Todos los docentes' },
                        ...teachers.map(teacher => ({
                          value: teacher.id.toString(),
                          label: `${teacher.givenNames} ${teacher.lastNames}`,
                        })),
                      ]}
                      value={selectedTeacherId || 'all'}
                      onValueChange={(value: string | number) => setSelectedTeacherId(value === 'all' ? null : String(value))}
                      placeholder="Buscar docente..."
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

      {/* SCHEDULE GRID */}
      <Card className="border-2 shadow-lg overflow-hidden">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Cuadro de Horarios
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900">
          {filteredSchedules.length === 0 ? (
            <div className="p-12">
              <Alert className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
                <Info className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <AlertDescription className="text-slate-700 dark:text-slate-300 font-medium">
                  No hay horarios disponibles con los filtros seleccionados
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-200 dark:bg-slate-800 border-b-2 border-slate-300 dark:border-slate-700">
                    <th className="px-4 py-3 text-left font-bold text-slate-900 dark:text-slate-100 w-28 sticky left-0 bg-slate-200 dark:bg-slate-800 z-20">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Hora
                      </div>
                    </th>
                    {(selectedDay === 'all' ? workingDays : [daysOfWeek[parseInt(selectedDay)]]).map(
                      (day) => (
                        <th
                          key={day}
                          className="px-4 py-3 text-left font-bold text-slate-900 dark:text-slate-100 min-w-[200px] border-l-2 border-slate-300 dark:border-slate-700"
                        >
                          {day}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot: TimeSlot) => {
                    const dayNumbers = selectedDay === 'all'
                      ? workingDays.map(d => getDayNumber(d))
                      : [parseInt(selectedDay)];

                    return (
                      <tr key={`${slot.start}-${slot.end}`} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        {/* Time slot */}
                        <td className={`px-4 py-3 font-bold sticky left-0 z-10 border-r-2 border-slate-300 dark:border-slate-700 ${
                          slot.isBreak
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                        }`}>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm">{slot.start}</span>
                            <span className="text-xs opacity-60">{slot.end}</span>
                          </div>
                        </td>

                        {/* Schedule cells */}
                        {dayNumbers.map((dayNum) => {
                          const schedule = getScheduleAtSlot(dayNum, slot.start);
                          const bgColor = schedule ? getScheduleBackgroundColor(schedule) : '';

                          return (
                            <td
                              key={`${dayNum}-${slot.start}`}
                              className={`px-4 py-3 border-l-2 border-slate-200 dark:border-slate-700 ${
                                slot.isBreak ? 'bg-slate-50 dark:bg-slate-800/50' : ''
                              }`}
                            >
                              {slot.isBreak ? (
                                <div className="text-center">
                                  <Badge variant="secondary" className="font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-0">
                                    {slot.label}
                                  </Badge>
                                </div>
                              ) : schedule ? (
                                <div
                                  className="space-y-2 p-3 rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow"
                                  style={{
                                    backgroundColor: bgColor,
                                    borderColor: bgColor,
                                  }}
                                >
                                  <div className="font-bold text-sm text-slate-900 dark:text-slate-900 line-clamp-2">
                                    {schedule.courseAssignment?.course?.name}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-800">
                                    <Users className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="truncate">
                                      {schedule.courseAssignment?.teacher?.givenNames}{' '}
                                      {schedule.courseAssignment?.teacher?.lastNames}
                                    </span>
                                  </div>
                                  {schedule.classroom && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-700 font-medium">
                                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                      <span>{schedule.classroom}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center text-slate-300 dark:text-slate-700 font-medium">-</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </div>
      </Card>

      {/* LEGEND */}
      <Card className="border-2 shadow-lg overflow-hidden">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Información
          </h3>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-slate-200 dark:border-slate-700">
              <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
                <Badge variant="secondary" className="font-semibold bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 border-0">
                  RECREO
                </Badge>
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">Descansos</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Períodos de receso</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-slate-200 dark:border-slate-700">
              <div className="p-3 rounded-lg border-2 shadow-sm" style={{ backgroundColor: 'hsl(200, 70%, 85%)', borderColor: 'hsl(200, 70%, 85%)' }}>
                <BookOpen className="h-5 w-5 text-slate-900" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">Clases</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Períodos de asignatura</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-slate-200 dark:border-slate-700">
              <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
                <span className="text-2xl text-slate-400 dark:text-slate-500 font-bold">-</span>
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">Sin asignar</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Horario libre</div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-900 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-200">
                <span className="font-semibold">Nota:</span> Cada curso tiene un color único generado automáticamente.
                Los colores se mantienen consistentes para el mismo curso en toda la tabla.
              </div>
            </div>
          </div>
        </div>
      </Card>
        </>
      )}
    </div>
  );
}
