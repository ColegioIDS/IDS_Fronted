'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import { useAttendanceSummary, useStudentsAttendance } from '@/hooks/data/attendance-reports';
import { AttendanceSummaryCharts } from './AttendanceSummaryCharts';
import { ExportStudentsTab } from './ExportStudentsTab';
import { GradesSelector, SectionsSelector, CoursesSelector, BimestersSelector, AcademicWeeksSelector, StudentsTable } from './shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, BookOpen, TrendingUp, AlertTriangle, Clock, Layers, ChevronDown, ChevronUp, Users, BarChart3, FileText, Download, X } from 'lucide-react';

export function AttendanceReportsPageContent() {
  const [selectedGradeId, setSelectedGradeId] = useState<number | undefined>();
  const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>();
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>();
  const [selectedBimesterId, setSelectedBimesterId] = useState<number | undefined>();
  const [selectedWeekId, setSelectedWeekId] = useState<number | undefined>();
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Contraer automáticamente cuando los 3 primeros selectores se completen
  useEffect(() => {
    if (selectedGradeId && selectedSectionId && selectedCourseId && isFilterOpen) {
      setIsFilterOpen(false);
    }
  }, [selectedGradeId, selectedSectionId, selectedCourseId, isFilterOpen]);

  const { data: cycle, isLoading, error } = useQuery({
    queryKey: ['attendance-reports', 'active-cycle'],
    queryFn: () => attendanceReportsService.getActiveCycle(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Hook para obtener el resumen de asistencia
  const {
    data: attendanceSummary,
    isLoading: isSummaryLoading,
    error: summaryError,
    isError: summaryIsError,
  } = useAttendanceSummary({
    gradeId: selectedGradeId,
    sectionId: selectedSectionId,
    courseId: selectedCourseId,
    bimesterId: selectedBimesterId,
    academicWeekId: selectedWeekId,
  });

  useEffect(() => {
    console.log('📊 Summary hook triggered:', {
      gradeId: selectedGradeId,
      sectionId: selectedSectionId,
      courseId: selectedCourseId,
      bimesterId: selectedBimesterId,
      academicWeekId: selectedWeekId,
    });
  }, [selectedGradeId, selectedSectionId, selectedCourseId, selectedBimesterId, selectedWeekId]);

  useEffect(() => {
    console.log('📊 Summary data updated:', { data: attendanceSummary, loading: isSummaryLoading, error: summaryError });
  }, [attendanceSummary, isSummaryLoading, summaryError]);

  // Hook para obtener los detalles de asistencia de estudiantes
  const {
    data: studentsAttendance,
    isLoading: isStudentsLoading,
    error: studentsError,
    isError: studentsIsError,
  } = useStudentsAttendance({
    gradeId: selectedGradeId,
    sectionId: selectedSectionId,
    courseId: selectedCourseId,
    bimesterId: selectedBimesterId,
    academicWeekId: selectedWeekId,
  });

  useEffect(() => {
    console.log('👥 Students hook triggered:', {
      gradeId: selectedGradeId,
      sectionId: selectedSectionId,
      courseId: selectedCourseId,
      bimesterId: selectedBimesterId,
      academicWeekId: selectedWeekId,
    });
  }, [selectedGradeId, selectedSectionId, selectedCourseId, selectedBimesterId, selectedWeekId]);

  useEffect(() => {
    console.log('👥 Students data updated:', { data: studentsAttendance, loading: isStudentsLoading, error: studentsError });
  }, [studentsAttendance, isStudentsLoading, studentsError]);

  const calculateProgress = () => {
    if (!cycle) return 0;
    const start = new Date(cycle.startDate).getTime();
    const end = new Date(cycle.endDate).getTime();
    const now = new Date().getTime();
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-8 pb-8">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-900 dark:via-blue-800 dark:to-indigo-900 p-8 shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_1px)] bg-[length:40px_40px]" />
        </div>

        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">Reportes de Asistencia</h1>
                <p className="text-blue-100 text-lg mt-1">Monitoreo integral de asistencia estudiantil</p>
              </div>
            </div>
          </div>

          {/* Stats badges */}
          <div className="hidden md:flex gap-2 flex-col text-right">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              Ciclo Activo
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              Sistema en Línea
            </Badge>
          </div>
        </div>
      </div>

      {/* Active Cycle Card */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ciclo Escolar Activo</h2>
        </div>

        {isLoading ? (
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-24 w-full bg-gray-200 dark:bg-gray-700" />
            </CardContent>
          </Card>
        ) : error ? (
          <Alert variant="destructive" className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Error al cargar el ciclo escolar activo</AlertDescription>
          </Alert>
        ) : cycle ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Card - 2 columns */}
            <Card className="lg:col-span-2 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      {cycle.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                      {cycle.description}
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm">
                    Activo
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso del Ciclo</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Inicio</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {new Date(cycle.startDate).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(cycle.startDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-950 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Fin</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {new Date(cycle.endDate).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(cycle.endDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Side Card - Year */}
            <Card className="border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 border-0">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                <div className="space-y-4">
                  <div className="text-6xl font-bold text-white">{cycle.year}</div>
                  <div className="text-blue-100">Año Académico</div>
                  <div className="w-12 h-1 bg-white/30 mx-auto rounded-full" />
                  <div className="text-sm text-blue-100">
                    {Math.ceil(
                      (new Date(cycle.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    )}{' '}
                    días restantes
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No hay ciclo escolar activo</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selectors Section */}
      {cycle && (
        <div className="space-y-4">
          {/* SECTION 1: Grades, Sections, Courses */}
          <div className="space-y-4">
            {/* Collapsed View - When first 3 filters are selected */}
            {selectedGradeId && selectedSectionId && selectedCourseId && !isFilterOpen && (
              <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 dark:text-green-100">Filtros Base Aplicados</p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Grado • Sección • Curso seleccionados
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsFilterOpen(true);
                      setSelectedGradeId(undefined);
                      setSelectedSectionId(undefined);
                      setSelectedCourseId(undefined);
                    }}
                    className="text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40"
                  >
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Cambiar
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Expanded View - When filters are not selected or user opens */}
            {isFilterOpen && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                      <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Filtros Base</h2>
                  </div>
                </div>

                <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {/* Row: Grades, Sections, Courses */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Grades Selector */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                              1
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">Grado</h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Nivel educativo</p>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800 transition-all hover:border-blue-400 dark:hover:border-blue-600">
                            <GradesSelector
                              cycleId={cycle.id}
                              value={selectedGradeId}
                              onChange={setSelectedGradeId}
                            />
                          </div>
                          {selectedGradeId && (
                            <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                              <span className="inline-block w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
                              Seleccionado
                            </div>
                          )}
                        </div>

                        {/* Sections Selector */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm transition-all ${
                                selectedGradeId
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              2
                            </div>
                            <div>
                              <h3 className={`font-semibold transition-colors ${
                                selectedGradeId ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                Sección
                              </h3>
                              <p className={`text-xs transition-colors ${
                                selectedGradeId ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                              }`}>
                                {selectedGradeId ? 'Grupo de estudiantes' : 'Selecciona grado primero'}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`rounded-lg p-4 border-2 transition-all ${
                              selectedGradeId
                                ? 'bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600'
                                : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <SectionsSelector
                              gradeId={selectedGradeId}
                              value={selectedSectionId}
                              onChange={setSelectedSectionId}
                              disabled={!selectedGradeId}
                            />
                          </div>
                          {selectedSectionId && (
                            <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                              <span className="inline-block w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
                              Seleccionado
                            </div>
                          )}
                        </div>

                        {/* Courses Selector */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm transition-all ${
                                selectedSectionId
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              3
                            </div>
                            <div>
                              <h3 className={`font-semibold transition-colors ${
                                selectedSectionId ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                Curso
                              </h3>
                              <p className={`text-xs transition-colors ${
                                selectedSectionId ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                              }`}>
                                {selectedSectionId ? 'Materia a consultar' : 'Selecciona sección primero'}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`rounded-lg p-4 border-2 transition-all ${
                              selectedSectionId
                                ? 'bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600'
                                : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <CoursesSelector
                              sectionId={selectedSectionId}
                              value={selectedCourseId}
                              onChange={setSelectedCourseId}
                              disabled={!selectedSectionId}
                            />
                          </div>
                          {selectedCourseId && (
                            <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                              <span className="inline-block w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
                              Seleccionado
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Summary - First 3 selectors */}
                      {selectedGradeId && selectedSectionId && selectedCourseId && (
                        <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Filtros Base Completos</h4>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                  Ahora selecciona bimestre y semana en la siguiente sección
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* SECTION 2: Bimesters and Academic Weeks (only visible when Section 1 is complete) */}
          {selectedGradeId && selectedSectionId && selectedCourseId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Filtros Temporales</h2>
              </div>

              <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Row: Bimesters and Academic Weeks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Bimesters Selector */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            4
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Bimestre</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Período educativo</p>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-amber-200 dark:border-amber-800 transition-all hover:border-amber-400 dark:hover:border-amber-600">
                          <BimestersSelector
                            cycleId={cycle.id}
                            value={selectedBimesterId}
                            onChange={setSelectedBimesterId}
                          />
                        </div>
                        {selectedBimesterId && (
                          <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
                            Seleccionado
                          </div>
                        )}
                      </div>

                      {/* Academic Weeks Selector */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm transition-all ${
                              selectedBimesterId
                                ? 'bg-rose-500 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            5
                          </div>
                          <div>
                            <h3 className={`font-semibold transition-colors ${
                              selectedBimesterId ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              Semana
                            </h3>
                            <p className={`text-xs transition-colors ${
                              selectedBimesterId ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {selectedBimesterId ? 'Semana académica' : 'Selecciona bimestre primero'}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`rounded-lg p-4 border-2 transition-all ${
                            selectedBimesterId
                              ? 'bg-white dark:bg-gray-800 border-rose-200 dark:border-rose-800 hover:border-rose-400 dark:hover:border-rose-600'
                              : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <AcademicWeeksSelector
                            bimesterId={selectedBimesterId}
                            value={selectedWeekId}
                            onChange={setSelectedWeekId}
                            disabled={!selectedBimesterId}
                          />
                        </div>
                        {selectedWeekId && (
                          <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
                            Seleccionado
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Summary - All selectors */}
                    {selectedBimesterId && selectedWeekId && (
                      <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm">¡Todos los Filtros Listos!</h4>
                              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                Puedes ver el reporte de asistencia
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Summary Error */}
      {summaryIsError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {summaryError?.message || 'Error al cargar el resumen de asistencia'}
          </AlertDescription>
        </Alert>
      )}

      {/* Students Attendance Details Error */}
      {studentsIsError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {studentsError?.message || 'Error al cargar el detalle de estudiantes'}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs for Reports */}
      {selectedGradeId && selectedSectionId && selectedCourseId && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mr-auto">Análisis de Asistencia</h2>
          </div>

          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="detailed" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Estudiantes</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            {isSummaryLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 rounded-lg" />
                <Skeleton className="h-96 rounded-lg" />
                <Skeleton className="h-72 rounded-lg" />
              </div>
            ) : attendanceSummary ? (
              <AttendanceSummaryCharts data={attendanceSummary} isLoading={isSummaryLoading} />
            ) : null}
          </TabsContent>

          {/* Detailed Tab */}
          <TabsContent value="detailed" className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Asistencia Detallada por Estudiante</h3>
            </div>

            {isStudentsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 rounded-lg" />
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : studentsAttendance ? (
              <StudentsTable
                students={studentsAttendance.students}
                totalClasses={studentsAttendance.summary.totalClasses}
                averageAttendance={studentsAttendance.summary.averageAttendance}
                isLoading={isStudentsLoading}
              />
            ) : null}
          </TabsContent>
          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <ExportStudentsTab
              students={studentsAttendance?.students || []}
              isLoading={isStudentsLoading}
              gradeId={selectedGradeId}
              sectionId={selectedSectionId}
              courseId={selectedCourseId}
              bimesterId={selectedBimesterId}
              academicWeekId={selectedWeekId}
              cycleId={cycle?.id}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Placeholder for future content */}
      {(!selectedGradeId || !selectedSectionId || !selectedCourseId) && (
        <Card className="border-gray-200 dark:border-gray-700 border-dashed">
          <CardContent className="p-12 text-center">
            <div className="space-y-2">
              <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Completa los filtros base</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Selecciona grado, sección y curso para ver el reporte</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
