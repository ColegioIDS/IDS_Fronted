'use client';

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search, BookOpen, Calendar as CalendarDay, BarChart3, BarChart4 } from 'lucide-react';
import {
  AttendanceHistoryResponse,
  AttendanceBimonthlyHistoryResponse,
  PeriodType,
  CourseAttendanceHistoryRecords,
  CourseBimonthlyAttendanceHistoryRecords,
} from '@/types/attendance-reports.types';
import { Bimester, AcademicWeek } from '@/types/attendance-reports.types';
import { Skeleton } from '@/components/ui/skeleton';

interface AttendanceHistoryViewProps {
  gradeId?: number;
  sectionId?: number;
  bimesters: Bimester[];
  academicWeeks: AcademicWeek[];
  isLoading: boolean;
  data?: AttendanceHistoryResponse | AttendanceBimonthlyHistoryResponse;
  
  // Period state - controlled component
  periodType: PeriodType;
  selectedDate: Date;
  selectedWeekId: string;
  selectedBimesterId: string;
  
  // Handlers
  onPeriodTypeChange: (periodType: PeriodType) => void;
  onDateChange: (date: Date | undefined) => void;
  onWeekChange: (weekId: string) => void;
  onBimesterChange: (bimesterId: string) => void;
  onApplyFilter: (period: PeriodType, selectedDate?: Date, weekId?: string | number, bimesterId?: number) => void;
}

const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    'A': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'I': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'T': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'J': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

const getStatusAbbrev = (status: string) => {
  const abbrevMap: Record<string, string> = {
    'A': 'A',
    'I': 'A',
    'T': 'T',
    'J': 'J',
  };
  return abbrevMap[status] || status;
};

const CourseAttendanceTable = ({ course, academicWeeks, selectedWeekId, periodType }: { course: CourseAttendanceHistoryRecords, academicWeeks?: any[], selectedWeekId?: string, periodType?: PeriodType }) => {
  if (!course.records || course.records.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">No hay datos de asistencia</p>
      </div>
    );
  }

  const allDates = Array.from(
    new Set(
      course.records.flatMap(r => r.attendances.map(a => a.date))
    )
  ).sort();

  // Get week range for header
  const getWeekRangeText = () => {
    if (!selectedWeekId || periodType !== 'week') return null;
    const week = academicWeeks?.find(w => w.id.toString() === selectedWeekId);
    if (!week) return null;
    return `${format(parseISO(week.startDate), 'dd/MM/yyyy', { locale: es })} - ${format(parseISO(week.endDate), 'dd/MM/yyyy', { locale: es })}`;
  };

  const weekRangeText = getWeekRangeText();

  return (
    <div className="overflow-x-auto">
      {weekRangeText && (
        <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            Semana: {weekRangeText}
          </p>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
            <TableHead className="min-w-[200px] py-4 px-6 font-semibold text-gray-900 dark:text-white">Estudiante</TableHead>
            {allDates.map(date => {
              const dateObj = parseISO(date);
              const dayName = format(dateObj, 'EEEE', { locale: es });
              const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
              return (
                <TableHead key={date} className="text-center text-xs py-4 px-2 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                  <div>{format(dateObj, 'dd/MM', { locale: es })}</div>
                  <div className="text-xs font-normal text-gray-600 dark:text-gray-400">{capitalizedDayName}</div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {course.records.map((student, idx) => (
            <TableRow 
              key={student.studentId}
              className={`border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <TableCell className="font-medium py-4 px-6">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{student.givenNames}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{student.lastNames}</p>
                </div>
              </TableCell>
              {allDates.map(date => {
                const attendance = student.attendances.find(a => a.date === date);
                return (
                  <TableCell key={`${student.studentId}-${date}`} className="text-center py-4 px-2">
                    {attendance ? (
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shadow-sm ${getStatusColor(attendance.status)}`}
                        title={attendance.statusName}
                      >
                        {getStatusAbbrev(attendance.status)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
        </Table>
    </div>
  );
};

const CourseBimonthlyTable = ({ course }: { course: CourseBimonthlyAttendanceHistoryRecords }) => {
  if (!course.bimonthlyRecords || course.bimonthlyRecords.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">No hay datos de asistencia</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
            <TableHead className="min-w-[200px] py-4 px-6 font-semibold text-gray-900 dark:text-white">Estudiante</TableHead>
            <TableHead className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">Total %</TableHead>
            {course.bimonthlyRecords[0]?.weeklyAttendances.map((_, idx) => (
              <TableHead key={`week-${idx}`} className="text-center text-xs py-4 px-2 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                Sem {idx + 1}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {course.bimonthlyRecords.map((student, idx) => (
            <TableRow 
              key={student.studentId}
              className={`border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <TableCell className="font-medium py-4 px-6">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{student.givenNames}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{student.lastNames}</p>
                </div>
              </TableCell>
              <TableCell className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                {student.totalPercentage.toFixed(1)}%
              </TableCell>
              {student.weeklyAttendances.map((week, idx) => (
                <TableCell key={`${student.studentId}-week-${idx}`} className="text-center py-4 px-2">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold shadow-sm ${
                      week.percentage >= 90
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : week.percentage >= 70
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                    title={`${week.percentage.toFixed(1)}% - ${week.totalAttended}/${week.totalDays} días`}
                  >
                    {week.percentage.toFixed(0)}%
                  </span>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const AttendanceHistoryView: React.FC<AttendanceHistoryViewProps> = ({
  gradeId,
  sectionId,
  bimesters,
  academicWeeks,
  isLoading,
  data,
  periodType,
  selectedDate,
  selectedWeekId,
  selectedBimesterId,
  onPeriodTypeChange,
  onDateChange,
  onWeekChange,
  onBimesterChange,
  onApplyFilter,
}) => {
  const [tempPeriodType, setTempPeriodType] = useState<PeriodType>(periodType);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date>(selectedDate);
  const [tempSelectedWeekId, setTempSelectedWeekId] = useState<string>(selectedWeekId);
  const [tempBimesterId, setTempBimesterId] = useState<string>(selectedBimesterId);

  const handlePeriodTypeChange = (newType: PeriodType) => {
    setTempPeriodType(newType);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setTempSelectedDate(date);
    }
  };

  const handleWeekChange = (weekId: string) => {
    setTempSelectedWeekId(weekId);
  };

  const handleBimesterChange = (bimesterId: string) => {
    setTempBimesterId(bimesterId);
  };

  const handleApplyFilter = () => {
    switch (tempPeriodType) {
      case 'day':
        onApplyFilter('day', tempSelectedDate);
        break;
      case 'week':
        onApplyFilter('week', undefined, tempSelectedWeekId);
        break;
      case 'bimonthly':
        onApplyFilter('bimonthly', undefined, undefined, parseInt(tempBimesterId));
        break;
    }
  };

  // Sync internal state when props change
  React.useEffect(() => {
    setTempPeriodType(periodType);
    setTempSelectedDate(selectedDate);
    setTempSelectedWeekId(selectedWeekId);
    setTempBimesterId(selectedBimesterId);
  }, [periodType, selectedDate, selectedWeekId, selectedBimesterId]);

  if (!gradeId || !sectionId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Asistencia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Selecciona Grado y Sección para ver el historial
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtrar por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {/* Period Type Select */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Período:</label>
              <Select value={tempPeriodType} onValueChange={(value) => handlePeriodTypeChange(value as PeriodType)}>
                <SelectTrigger className="w-[160px] border-2 border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-950">
                  <SelectValue placeholder="Selecciona período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">
                    <span className="flex items-center gap-2">
                      <CalendarDay className="w-4 h-4" />
                      Día
                    </span>
                  </SelectItem>
                  <SelectItem value="week">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Semana
                    </span>
                  </SelectItem>
                  <SelectItem value="bimonthly">
                    <span className="flex items-center gap-2">
                      <BarChart4 className="w-4 h-4" />
                      Bimestre
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date/Period Selector */}
            <div className="flex items-center gap-2">
              {tempPeriodType === 'day' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {format(tempSelectedDate, 'dd/MM/yyyy', { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tempSelectedDate}
                      onSelect={handleDateChange}
                      disabled={(date) => date > new Date()}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              )}

              {tempPeriodType === 'week' && (
                <Select value={tempSelectedWeekId} onValueChange={handleWeekChange}>
                  <SelectTrigger className="w-[280px] border-2 border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-950">
                    <SelectValue placeholder="Selecciona semana" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicWeeks.length > 0 ? (
                      academicWeeks.map(week => (
                        <SelectItem key={week.id} value={week.id.toString()}>
                          Sem {week.number}: {format(parseISO(week.startDate), 'dd/MM', { locale: es })} - {format(parseISO(week.endDate), 'dd/MM/yyyy', { locale: es })}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled value="">No hay semanas disponibles</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}

              {tempPeriodType === 'bimonthly' && (
                <Select value={tempBimesterId} onValueChange={handleBimesterChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Selecciona bimestre" />
                  </SelectTrigger>
                  <SelectContent>
                    {bimesters.map(bimester => (
                      <SelectItem key={bimester.id} value={bimester.id.toString()}>
                        {bimester.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Search Button */}
            <Button 
              onClick={handleApplyFilter}
              disabled={isLoading}
              className="ml-auto gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-semibold"
            >
              <Search className="w-4 h-4" />
              {isLoading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      )}

      {/* Attendance Records with Accordion */}
      {!isLoading && data && 'courses' in data && (data as any).courses.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cursos ({(data as any).courses.length})
            </h3>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {periodType === 'bimonthly' ? (
              <>
                {(data as AttendanceBimonthlyHistoryResponse).courses.map((course, index) => (
                  <AccordionItem 
                    key={course.courseId} 
                    value={`course-${course.courseId}`}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex items-center justify-between w-full text-left">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {course.courseName}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {course.courseCode} • Prof. {course.teacherName}
                          </div>
                        </div>
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mr-4">
                          {course.bimonthlyRecords?.length || 0} estudiantes
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 py-0">
                      <CourseBimonthlyTable course={course} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </>
            ) : (
              <>
                {(data as AttendanceHistoryResponse).courses.map((course, index) => (
                  <AccordionItem 
                    key={course.courseId} 
                    value={`course-${course.courseId}`}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex items-center justify-between w-full text-left">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {course.courseName}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {course.courseCode} • Prof. {course.teacherName}
                          </div>
                        </div>
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mr-4">
                          {course.records?.length || 0} estudiantes
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 py-0">
                      <CourseAttendanceTable course={course} academicWeeks={academicWeeks} selectedWeekId={selectedWeekId} periodType={periodType} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </>
            )}
          </Accordion>
        </div>
      )}

      {!isLoading && (!data || !('courses' in data) || (data as any).courses.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sin datos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No hay registros de asistencia para el período seleccionado
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
