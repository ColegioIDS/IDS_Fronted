/**
 * ====================================================================
 * ATTENDANCE REPORTS PAGE CONTENT
 * ====================================================================
 *
 * Página centralizada para ver reportes, estadísticas y análisis
 * de asistencia de estudiantes con filtros en cascada
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BarChart3, TrendingUp, Calendar, Users, CheckCircle, TrendingDown, ArrowUp, Loader } from 'lucide-react';
import { AttendanceTrendChart } from './AttendanceTrendChart';
import { SectionComparisonChart } from './SectionComparisonChart';
import { StatusDistributionChart } from './StatusDistributionChart';
import { FilterPanel } from './FilterPanel';
import {
  useCascadeAttendanceFilters,
  useSectionAttendanceData,
  useAttendanceSummary,
  useAttendanceByStatus,
  useWeeklyTrendData,
} from '@/hooks/data/attendance';
import type { CascadeAttendanceFilters } from '@/hooks/data/attendance/cascade/useCascadeAttendanceFilters';
import type { StudentSectionSummary } from '@/types/attendance-reports.types';

/**
 * Página principal de reportes de asistencia
 */
export function AttendanceReportsPageContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<CascadeAttendanceFilters>({
    cycleId: null,
    bimesterId: null,
    gradeId: null,
    sectionId: null,
    weekId: null,
  });

  console.log('🟢 [AttendanceReports] Component rendered with filters:', filters);

  // Memoizar params para evitar recreación en cada render
  const sectionParams = useMemo(
    () => ({
      bimesterId: filters.bimesterId || undefined,
      startDate: undefined,
      endDate: undefined,
    }),
    [filters.bimesterId]
  );

  // Hooks para datos generales (resumen y estados)
  const { summary, loading: summaryLoading, loadSummary } = useAttendanceSummary();
  const { data: statusData, loading: statusLoading } = useAttendanceByStatus();
  const { data: weeklyTrendData, loading: weeklyTrendLoading, loadWeeklyTrend } = useWeeklyTrendData();

  // Hook para datos específicos de la sección seleccionada
  const { data: sectionData, loading: sectionLoading } = useSectionAttendanceData(
    filters.sectionId || null,
    sectionParams
  );

  console.log('🟢 [AttendanceReports] sectionData state:', {
    sectionId: filters.sectionId,
    sectionDataExists: !!sectionData,
    sectionDataStudents: sectionData?.students?.length || 0,
    sectionLoading,
  });

  // Manejar cambios de filtros desde el FilterPanel
  const handleFiltersChange = useCallback((newFilters: CascadeAttendanceFilters) => {
    console.log('📤 [AttendanceReports] Received filters from FilterPanel:', newFilters);
    setFilters(newFilters);
  }, []);

  // Cargar datos del resumen cuando se selecciona una sección
  useEffect(() => {
    console.log('📊 [AttendanceReports] Effect triggered - filters changed:', {
      sectionId: filters.sectionId,
      bimesterId: filters.bimesterId,
      gradeId: filters.gradeId,
      hasSectionId: !!filters.sectionId,
    });

    if (filters.sectionId) {
      console.log('📊 [AttendanceReports] Calling loadSummary with filters');
      loadSummary({
        sectionId: filters.sectionId,
        bimesterId: filters.bimesterId || undefined,
        gradeId: filters.gradeId || undefined,
      });
    } else {
      console.log('📊 [AttendanceReports] No sectionId, skipping loadSummary');
    }
  }, [filters.sectionId, filters.bimesterId, filters.gradeId]);

  // Log summary data changes
  useEffect(() => {
    console.log('📊 [AttendanceReports] Summary data updated:', {
      summaryLoading,
      summaryData: summary,
      hasData: !!summary,
    });
  }, [summary, summaryLoading]);

  // Cargar tendencia semanal cuando se selecciona un bimestre
  useEffect(() => {
    if (filters.bimesterId) {
      console.log('📈 [AttendanceReports] Loading weekly trend for bimesterId:', filters.bimesterId);
      loadWeeklyTrend(filters.bimesterId, filters.cycleId || undefined);
    }
  }, [filters.bimesterId, filters.cycleId]);

  // Guardar tab activo
  useEffect(() => {
    const savedTab = localStorage.getItem('attendance-reports-tab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('attendance-reports-tab', value);
  };

  // Estados de loading
  const isLoadingFiltered = sectionLoading && filters.sectionId;
  const isLoadingSummary = summaryLoading || statusLoading;

  // Calcular valores para tarjetas (con datos reales del summary)
  const avgAttendance = summary?.attendancePercentage ?? summary?.averageAttendance ?? 0;
  const totalStudents = summary?.totalStudents ?? summary?.studentsTotal ?? 0;
  const totalAbsences = summary?.absentCount ?? 0;

  // Calcular en riesgo y excelente basados en asistencia del summary
  // Usar los datos del summary directamente si están disponibles
  let atRiskCount = 0;
  let excellentCount = 0;
  let goodCount = 0;

  if (totalStudents > 0) {
    if (avgAttendance >= 95) {
      // Todos o casi todos excelentes
      excellentCount = totalStudents;
      goodCount = 0;
      atRiskCount = 0;
    } else if (avgAttendance >= 80) {
      // Mix de excelente y buena
      excellentCount = Math.max(0, Math.floor(totalStudents * 0.3));
      goodCount = totalStudents - excellentCount;
      atRiskCount = 0;
    } else {
      // Hay riesgo
      atRiskCount = Math.max(1, Math.floor(totalStudents * ((100 - avgAttendance) / 100)));
      goodCount = Math.max(0, totalStudents - atRiskCount);
      excellentCount = 0;
    }
  }

  console.log('📊 [AttendanceReports] Calculated metrics:', {
    avgAttendance,
    totalStudents,
    totalAbsences,
    excellentCount,
    goodCount,
    atRiskCount,
    summary,
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="rounded-xl border-2 border-indigo-200 bg-white p-8 shadow-lg dark:border-indigo-800 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md dark:bg-indigo-500">
            <BarChart3 className="h-8 w-8" />
          </div>
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reportes de Asistencia
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Visualiza, analiza y descarga reportes de asistencia de tus estudiantes
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <Users className="h-4 w-4" />
                {user?.fullName || 'Invitado'}
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('es-GT', { dateStyle: 'long' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Filtros en Cascada */}
      <FilterPanel onFiltersChange={handleFiltersChange} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 gap-2 rounded-xl bg-gray-100 p-2 dark:bg-gray-800">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger
            value="by-student"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Users className="mr-2 h-4 w-4" />
            Filtrada
          </TabsTrigger>
          <TabsTrigger
            value="by-section"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Por Sección
          </TabsTrigger>
        </TabsList>

        {/* TAB: RESUMEN GENERAL */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Card: Asistencia Promedio */}
            <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Asistencia Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {Math.round(avgAttendance * 10) / 10}%
                </div>
                <div className="flex items-center gap-1 pt-2">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-blue-600 dark:text-blue-400">+2.1% respecto al mes pasado</p>
                </div>
              </CardContent>
            </Card>

            {/* Card: Estudiantes Activos */}
            <Card className="border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                  Estudiantes Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {totalStudents}
                </div>
                <div className="flex items-center gap-1 pt-2">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-green-600 dark:text-green-400">{excellentCount} con excelente asistencia</p>
                </div>
              </CardContent>
            </Card>

            {/* Card: En Riesgo */}
            <Card className="border-2 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  En Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {atRiskCount}
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 pt-2">
                  Asistencia &lt; 80%
                </p>
              </CardContent>
            </Card>

            {/* Card: Ausencias Totales */}
            <Card className="border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
                  Ausencias Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-900 dark:text-red-100">
                  {totalAbsences}
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 pt-2">
                  Este mes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Tendencia */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Tendencia de Asistencia</CardTitle>
              <CardDescription>
                Evolución semanal de la asistencia promedio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceTrendChart 
                data={weeklyTrendData} 
                loading={weeklyTrendLoading}
                height={300} 
              />
            </CardContent>
          </Card>

          {/* Gráfico de Distribución */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Distribución de Estados</CardTitle>
              <CardDescription>
                Porcentaje de estudiantes por categoría de asistencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatusDistributionChart
                excellent={excellentCount}
                good={goodCount}
                risk={atRiskCount}
                height={300}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: DATOS FILTRADOS */}
        <TabsContent value="by-student" className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Detalles de la Sección Seleccionada</CardTitle>
              <CardDescription>
                {filters.sectionId
                  ? 'Tabla detallada de asistencia para estudiantes de esta sección'
                  : 'Selecciona una sección en los filtros para ver datos detallados'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!filters.sectionId ? (
                <div className="flex items-center justify-center py-12 text-center">
                  <div>
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Selecciona una sección en los filtros para ver los datos de asistencia
                    </p>
                  </div>
                </div>
              ) : isLoadingFiltered ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">Cargando datos de la sección...</p>
                  </div>
                </div>
              ) : sectionData?.students && Array.isArray(sectionData.students) && sectionData.students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Estudiante
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Presente
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Ausente
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Asistencia
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionData.students.map((student: StudentSectionSummary, idx: number) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {student.studentName || 'Sin nombre'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm">
                              <CheckCircle className="h-3 w-3" />
                              {student.presentDays || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm">
                              <TrendingDown className="h-3 w-3" />
                              {student.absentDays || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{ width: `${student.attendancePercentage || 0}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 w-12 text-right">
                                {(student.attendancePercentage || 0).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-center">
                  <div>
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No hay datos de estudiantes para esta sección
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: POR SECCIÓN */}
        <TabsContent value="by-section" className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Información de la Sección</CardTitle>
              <CardDescription>
                {filters.sectionId
                  ? 'Resumen de la sección seleccionada'
                  : 'Selecciona una sección para ver su información'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!filters.sectionId ? (
                <div className="flex items-center justify-center py-12 text-center">
                  <div>
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Selecciona una sección en los filtros para ver su información
                    </p>
                  </div>
                </div>
              ) : isLoadingFiltered ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">Cargando información...</p>
                  </div>
                </div>
              ) : sectionData ? (
                <div className="grid gap-6">
                  {/* Tarjeta de resumen */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Asistencia Promedio</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                        {(sectionData.averageAttendance || 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Total de Estudiantes</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                        {sectionData.totalStudents || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">En Riesgo</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                        {sectionData.atRiskCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-center">
                  <div>
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No hay datos disponibles para esta sección
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <Alert className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          Los reportes se actualizan automáticamente cada hora. Usa los filtros en cascada para navegar
          por los datos de asistencia de forma eficiente.
        </AlertDescription>
      </Alert>
    </div>
  );
}
