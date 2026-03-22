// src/components/features/academic-analytics/AcademicAnalyticsPageContent.tsx

'use client';

import { useState, useMemo } from 'react';
import { BarChart3, AlertCircle, Users, TrendingUp, Target, Download, RefreshCw, LineChart, AlertTriangle, PieChart, Trophy } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Breadcrumb from '@/components/common/Breadcrumb';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { AnalyticsFilterCascade } from './AnalyticsFilterCascade';
import { StudentsSummaryNestedAccordion } from './StudentsSummaryNestedAccordion';
import { PerformanceReportModal } from './PerformanceReportModal';
import { ComparativeAnalyticsModal } from './ComparativeAnalyticsModal';
import { AtRiskStudentsPanel } from './AtRiskStudentsPanel';
import { GradeStatisticsPanel } from './GradeStatisticsPanel';
import { TopStudentsPanel } from './TopStudentsPanel';
import { useStudentsSummary } from '@/hooks/data/academic-analytics/useStudentsSummary';
import { useGradeRanges } from '@/hooks/data/academic-analytics/useGradeRanges';
import { usePerformanceReport } from '@/hooks/data/academic-analytics/usePerformanceReport';
import { useComparativeAnalytics } from '@/hooks/data/academic-analytics/useComparativeAnalytics';
import { useAtRiskStudents } from '@/hooks/data/academic-analytics/useAtRiskStudents';
import { useGradeStatistics } from '@/hooks/data/academic-analytics/useGradeStatistics';
import { useTopStudents } from '@/hooks/data/academic-analytics/useTopStudents';
import { AnalyticsFilterState } from '@/types/academic-analytics.types';

interface AcademicAnalyticsPageContentProps {
  canView?: boolean;
  canViewOwn?: boolean;
}

/**
 * 📊 Página Principal de Analítica Académica (Rediseñada)
 * 
 * Nuevo layout:
 * - Header con título y acciones
 * - Stats cards mostrando métricas importantes
 * - Filtros horizontales
 * - Tabla de estudiantes a pantalla completa
 */
export function AcademicAnalyticsPageContent({
  canView = false,
  canViewOwn = false,
}: AcademicAnalyticsPageContentProps) {
  // Filter state
  const [filterState, setFilterState] = useState<AnalyticsFilterState>({
    cycleId: null,
    gradeIds: [],
    sectionIds: [],
    bimesterIds: [],
    isLoading: false,
    error: null,
  });

  // Modal states
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isComparativeModalOpen, setIsComparativeModalOpen] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('comparative');
  const [topLimit, setTopLimit] = useState<number>(10);

  // Fetch students summary
  const { data: studentsSummary, isLoading: summaryLoading, error: summaryError, refresh } =
    useStudentsSummary({
      cycleId: filterState.cycleId,
      gradeIds: filterState.gradeIds,
      sectionIds: filterState.sectionIds,
      bimesterIds: filterState.bimesterIds,
    });

  // Fetch grade ranges for dynamic coloring
  const { data: gradeRanges } = useGradeRanges();

  // Fetch performance report
  const { data: performanceReport, isLoading: performanceLoading, error: performanceError } =
    usePerformanceReport(selectedEnrollmentId, isPerformanceModalOpen);

  // Fetch comparative analytics
  const { data: comparativeData, isLoading: comparativeLoading, error: comparativeError } =
    useComparativeAnalytics(selectedGradeId, selectedSectionId, undefined, isComparativeModalOpen);

  // Fetch at-risk students
  const { data: atRiskData, isLoading: atRiskLoading, error: atRiskError } =
    useAtRiskStudents(selectedGradeId, selectedSectionId, activeAnalysisTab === 'at-risk');

  // Fetch grade statistics
  const { data: statsData, isLoading: statsLoading, error: statsError } =
    useGradeStatistics(selectedGradeId, selectedSectionId, undefined, undefined, activeAnalysisTab === 'statistics');

  // Fetch top students
  const { data: topStudentsData, isLoading: topStudentsLoading, error: topStudentsError } =
    useTopStudents(filterState.cycleId, topLimit, filterState.bimesterIds, filterState.gradeIds, filterState.sectionIds, activeAnalysisTab === 'top-students');

  // Update filter state
  const handleFilterChange = (updates: Partial<AnalyticsFilterState>) => {
    setFilterState(prev => ({ ...prev, ...updates }));
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!studentsSummary || studentsSummary.length === 0) {
      return {
        totalStudents: 0,
        averageScore: '--',
        atRiskStudents: 0,
        improvingStudents: 0,
      };
    }

    let totalStudents = 0;
    let totalScore = 0;
    let scoreCount = 0;
    let atRisk = 0;
    let improving = 0;

    studentsSummary.forEach(grade => {
      grade.sections.forEach(section => {
        section.students.forEach(student => {
          totalStudents++;
          
          // Calcular promedio
          if (student.cumulativeAverages.promedio !== null) {
            totalScore += student.cumulativeAverages.promedio;
            scoreCount++;
          }

          // Contar estudiantes en riesgo
          if (student.academicStatus === 'AT_RISK' || student.academicStatus === 'FAILING') {
            atRisk++;
          }

          // Contar estudiantes mejorando
          if (student.trend === 'IMPROVING') {
            improving++;
          }
        });
      });
    });

    return {
      totalStudents,
      averageScore: scoreCount > 0 ? (totalScore / scoreCount).toFixed(2) : '--',
      atRiskStudents: atRisk,
      improvingStudents: improving,
    };
  }, [studentsSummary]);

  // Determine what to show
  const hasViewPermission = canView;
  const hasOwnViewPermission = canViewOwn;

  if (!hasViewPermission && !hasOwnViewPermission) {
    return (
      <div className="space-y-4">
        <Breadcrumb
          pageTitle="Analítica Académica"
          icon={<BarChart3 className="h-6 w-6" />}
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Analítica Académica', href: '/academic-analytics' },
          ]}
        />
        <NoPermissionCard
          title="Acceso Denegado"
          description="No tienes permisos para ver la analítica académica"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        pageTitle="Analítica Académica"
        icon={<BarChart3 className="h-6 w-6" />}
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Analítica Académica', href: '/academic-analytics' },
        ]}
      />

      {/* Header con título y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analítica Académica</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Visualiza el desempeño académico de estudiantes con análisis detallados
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            disabled={!filterState.cycleId}
            className="dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {filterState.cycleId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Estudiantes */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-lg/20 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalStudents}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Promedio General */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-lg/20 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Promedio General</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.averageScore}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* En Riesgo */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-lg/20 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">En Riesgo</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.atRiskStudents}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          {/* Mejorando */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-lg/20 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Mejorando</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.improvingStudents}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros (ahora horizontal) */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
        <AnalyticsFilterCascade
          filterState={filterState}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Info alert cuando no hay selección */}
      {!filterState.cycleId && (
        <Alert className="dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selecciona un ciclo escolar para ver el análisis académico de los estudiantes
          </AlertDescription>
        </Alert>
      )}

      {/* Tabla de Estudiantes - Full width */}
      {filterState.cycleId && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Resumen Académico de Estudiantes</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Promedios acumulativos, tendencia y estado académico por estudiante
              </p>
            </div>
            <div className="p-6">
              <StudentsSummaryNestedAccordion
                data={studentsSummary}
                isLoading={summaryLoading}
                error={summaryError}
                gradeRanges={gradeRanges}
                onStudentSelect={(enrollmentId) => {
                  setSelectedEnrollmentId(enrollmentId);
                  setIsPerformanceModalOpen(true);
                }}
              />
            </div>
          </div>

          {/* Análisis Avanzado - Tabs */}
          {studentsSummary && studentsSummary.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Análisis Avanzado</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Comparativas, riesgos y estadísticas detalladas
                </p>
              </div>
              <div className="p-6">
                <Tabs value={activeAnalysisTab} onValueChange={setActiveAnalysisTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-slate-700">
                    <TabsTrigger value="comparative" className="dark:text-slate-300">
                      <LineChart className="w-4 h-4 mr-2" />
                      Comparativo
                    </TabsTrigger>
                    <TabsTrigger value="at-risk" className="dark:text-slate-300">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      En Riesgo
                    </TabsTrigger>
                    <TabsTrigger value="statistics" className="dark:text-slate-300">
                      <PieChart className="w-4 h-4 mr-2" />
                      Estadísticas
                    </TabsTrigger>
                    <TabsTrigger value="top-students" className="dark:text-slate-300">
                      <Trophy className="w-4 h-4 mr-2" />
                      Top Estudiantes
                    </TabsTrigger>
                    <TabsTrigger value="help" className="dark:text-slate-300">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Info
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab: Análisis Comparativo */}
                  <TabsContent value="comparative" className="mt-4">
                    <div className="space-y-4">
                      <Alert className="dark:bg-blue-950/20 dark:border-blue-900/50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Selecciona un grado y sección para ver el análisis comparativo de la clase
                        </AlertDescription>
                      </Alert>
                      
                      {filterState.gradeIds.length > 0 && filterState.sectionIds.length > 0 ? (
                        <>
                          <Button
                            onClick={() => {
                              setSelectedGradeId(filterState.gradeIds[0]);
                              setSelectedSectionId(filterState.sectionIds[0]);
                              setIsComparativeModalOpen(true);
                            }}
                            className="dark:bg-blue-600 dark:hover:bg-blue-700"
                          >
                            <LineChart className="w-4 h-4 mr-2" />
                            Ver Análisis Comparativo
                          </Button>
                          <ComparativeAnalyticsModal
                            isOpen={isComparativeModalOpen}
                            onOpenChange={setIsComparativeModalOpen}
                            comparative={comparativeData}
                            isLoading={comparativeLoading}
                            error={comparativeError}
                          />
                        </>
                      ) : (
                        <Alert variant="destructive" className="dark:bg-red-950/20 dark:border-red-900/50">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Selecciona un grado y sección en los filtros para ver el análisis comparativo
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </TabsContent>

                  {/* Tab: Estudiantes en Riesgo */}
                  <TabsContent value="at-risk" className="mt-4">
                    {filterState.gradeIds.length > 0 && filterState.sectionIds.length > 0 ? (
                      <AtRiskStudentsPanel
                        data={atRiskData}
                        isLoading={atRiskLoading}
                        error={atRiskError}
                      />
                    ) : (
                      <Alert variant="destructive" className="dark:bg-red-950/20 dark:border-red-900/50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Selecciona un grado y sección en los filtros para ver estudiantes en riesgo
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  {/* Tab: Estadísticas */}
                  <TabsContent value="statistics" className="mt-4">
                    {filterState.gradeIds.length > 0 ? (
                      <GradeStatisticsPanel
                        data={statsData}
                        isLoading={statsLoading}
                        error={statsError}
                      />
                    ) : (
                      <Alert variant="destructive" className="dark:bg-red-950/20 dark:border-red-900/50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Selecciona al menos un grado en los filtros para ver estadísticas
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  {/* Tab: Top Estudiantes */}
                  <TabsContent value="top-students" className="mt-4">
                    {filterState.cycleId ? (
                      <TopStudentsPanel
                        data={topStudentsData}
                        isLoading={topStudentsLoading}
                        error={topStudentsError}
                        topLimit={topLimit}
                        onTopLimitChange={setTopLimit}
                      />
                    ) : (
                      <Alert variant="destructive" className="dark:bg-red-950/20 dark:border-red-900/50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Selecciona un ciclo en los filtros para ver los mejores estudiantes
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  {/* Tab: Ayuda */}
                  <TabsContent value="help" className="mt-4">
                    <div className="space-y-4">
                      <Alert className="dark:bg-blue-950/20 dark:border-blue-900/50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Análisis Disponibles:</strong>
                        </AlertDescription>
                      </Alert>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📊 Reporte de Desempeño</h4>
                          <p className="text-sm text-blue-800 dark:text-blue-400">
                            Haz clic en un estudiante en la tabla para ver su reporte detallado con gráficas de desempeño, trend académico y predicción de nota final.
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                          <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">📈 Análisis Comparativo</h4>
                          <p className="text-sm text-green-800 dark:text-green-400">
                            Compara el desempeño de un grado/sección: promedio, mediana, top 5 y estudiantes en riesgo.
                          </p>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                          <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">⚠️ Estudiantes en Riesgo</h4>
                          <p className="text-sm text-red-800 dark:text-red-400">
                            Identifica estudiantes con riesgo académico o de asistencia con niveles crítico, alto, medio y bajo.
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-800">
                          <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">📊 Estadísticas</h4>
                          <p className="text-sm text-purple-800 dark:text-purple-400">
                            Analiza la distribución de calificaciones con medidas de tendencia central, dispersión y gráficas.
                          </p>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                          <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">🏆 Top Estudiantes</h4>
                          <p className="text-sm text-amber-800 dark:text-amber-400">
                            Visualiza los 10 mejores estudiantes de cada grado y sección, ordenados por promedio descendente con tendencias académicas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Report Modal */}
      <PerformanceReportModal
        isOpen={isPerformanceModalOpen}
        onOpenChange={setIsPerformanceModalOpen}
        report={performanceReport}
        isLoading={performanceLoading}
        error={performanceError}
      />
    </div>
  );
}
