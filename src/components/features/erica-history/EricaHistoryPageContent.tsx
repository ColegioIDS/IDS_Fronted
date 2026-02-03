'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Calendar, 
  GraduationCap, 
  Users, 
  BookOpen, 
  FileText,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { useEricaHistoryCascade } from '@/hooks/data/erica-history';
import { ericaHistoryService } from '@/services/erica-history.service';
import { EricaHistoryFilterResponse } from '@/types/erica-history';
import { SelectionGrid } from '@/components/features/erica-evaluations';
import { EvaluationTable } from '@/components/features/erica-history/evaluation-table';

/**
 * Componente de contenido para la página de Historial ERICA
 * Maneja toda la lógica de navegación en cascada y carga de datos
 */
export function EricaHistoryPageContent() {
  const {
    cascadeData,
    isLoading,
    error,
    selected,
    selectBimester,
    selectWeek,
    selectGrade,
    selectSection,
    selectCourse,
    getBimesters,
    getWeeks,
    getGrades,
    getSections,
    getCourses,
    isSelectionComplete,
    resetSelection,
    refreshCascade,
  } = useEricaHistoryCascade();

  // Estado para evaluaciones históricas
  const [historyData, setHistoryData] = useState<EricaHistoryFilterResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [skipWeek, setSkipWeek] = useState(true); // Por defecto: todas las semanas

  // Determinar paso actual
  const currentStep = useMemo(() => {
    if (!selected.bimester) return 1;
    if (!skipWeek && !selected.week) return 2;
    if (!selected.grade) return 3;
    if (!selected.section) return 4;
    if (!selected.course) return 5;
    return 6;
  }, [selected, skipWeek]);

  // Cargar datos de historial cuando la selección está completa (con o sin semana)
  const isReadyToLoadHistory = Boolean(
    selected.bimester && 
    (skipWeek || selected.week) && 
    selected.grade && 
    selected.section && 
    selected.course
  );

    // Función para recargar datos de historial
  const reloadHistoryData = useCallback(async () => {
    if (!isReadyToLoadHistory) {
      setHistoryData(null);
      setHistoryError(null);
      return;
    }

    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const result = await ericaHistoryService.getEvaluationsByFilters({
        bimesterId: selected.bimester?.id,
        weekId: selected.week?.id,
        gradeId: selected.grade?.id,
        sectionId: selected.section?.id,
        courseId: selected.course?.id,
      });
      setHistoryData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar historial';
      setHistoryError(errorMessage);
    } finally {
      setHistoryLoading(false);
    }
  }, [isReadyToLoadHistory, selected, skipWeek]);

  useEffect(() => {
    reloadHistoryData();
  }, [reloadHistoryData]);

  // Función para retroceder un paso
  const goBack = () => {
    if (selected.course) {
      selectCourse(null);
    } else if (selected.section) {
      selectSection(null);
    } else if (selected.grade) {
      selectGrade(null);
    } else if (selected.bimester) {
      selectBimester(null);
    }
  };

  // Renderizar loading inicial
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  // Renderizar error
  if (error) {
    const getEmptyStateType = (errorCode?: string): 'no-active-cycle' | 'no-active-bimester' | 'no-weeks' | 'no-grades' | 'no-courses' | 'error' => {
      switch (errorCode) {
        case 'NO_ACTIVE_CYCLE':
          return 'no-active-cycle';
        case 'NO_ACTIVE_BIMESTER':
          return 'no-active-bimester';
        case 'NO_WEEKS':
          return 'no-weeks';
        case 'NO_GRADES':
          return 'no-grades';
        case 'NO_COURSES':
          return 'no-courses';
        default:
          return 'error';
      }
    };

    const emptyStateType = getEmptyStateType(error.errorCode);

    return (
      <div className="p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Historial ERICA
          </h1>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <EmptyState
              type={emptyStateType}
              message={error.message}
              action={{
                label: 'Reintentar',
                onClick: refreshCascade,
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentStep > 1 && (
            <Button variant="outline" size="sm" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Atrás
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Historial ERICA
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              {cascadeData?.cycles?.[0]?.name || cascadeData?.cycle?.name} - Ciclo Activo
            </p>
          </div>
        </div>
        
        <Button variant="outline" onClick={() => { refreshCascade(); reloadHistoryData(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Breadcrumb de selección */}
      <div className="flex items-center gap-2 text-sm flex-wrap py-3 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        {selected.bimester && (
          <>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              <Calendar className="h-3 w-3 mr-1.5" />
              {selected.bimester.name}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600" />
          </>
        )}
        {selected.week && (
          <>
            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
              <Clock className="h-3 w-3 mr-1.5" />
              Semana {selected.week.number}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600" />
          </>
        )}
        {/* Por defecto: todas las semanas (no mostrar en breadcrumb) */}

        {selected.grade && (
          <>
            <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
              <GraduationCap className="h-3 w-3 mr-1.5" />
              {selected.grade.name}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600" />
          </>
        )}
        {selected.section && (
          <>
            <Badge variant="outline" className="bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300">
              <Users className="h-3 w-3 mr-1.5" />
              {selected.section.name}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600" />
          </>
        )}
        {selected.course && (
          <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300">
            <BookOpen className="h-3 w-3 mr-1.5" />
            {selected.course.name}
          </Badge>
        )}
      </div>

      {/* Contenido según paso */}
      {currentStep === 1 && (
        <SelectionGrid
          title="Selecciona un Bimestre"
          icon={<Calendar className="h-5 w-5" />}
          items={getBimesters().map(b => ({
            id: b.id,
            name: b.name,
            subtitle: b.weeksCount ? `${b.weeksCount} semanas` : 'Bimestre activo',
            onClick: () => selectBimester(b),
          }))}
        />
      )}

      {/* Paso 2: Selector de semana - OMITIDO (por defecto: todas las semanas) */}

      {currentStep === 3 && (
        <SelectionGrid
          title="Selecciona un Grado"
          icon={<GraduationCap className="h-5 w-5" />}
          items={getGrades().map(g => ({
            id: g.id,
            name: g.name,
            subtitle: g.level || `Orden ${g.order}`,
            onClick: () => selectGrade(g),
          }))}
        />
      )}

      {currentStep === 4 && (
        getSections().length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                type="no-sections"
                message={`El grado "${selected.grade?.name}" no tiene secciones`}
                description="Este grado no tiene secciones asignadas. Contacta al administrador para agregar secciones."
                action={{
                  label: 'Seleccionar otro grado',
                  onClick: () => selectGrade(null),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <SelectionGrid
            title="Selecciona una Sección"
            icon={<Users className="h-5 w-5" />}
            items={getSections().map(s => ({
              id: s.id,
              name: s.name,
              subtitle: s.courseAssignments ? `${s.courseAssignments.length} cursos` : 'Sección',
              onClick: () => selectSection(s),
            }))}
          />
        )
      )}

      {currentStep === 5 && (
        getCourses().length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                type="no-courses"
                message={`La sección "${selected.section?.name}" no tiene cursos`}
                description="Esta sección no tiene cursos asignados. Contacta al administrador para agregar cursos."
                action={{
                  label: 'Seleccionar otra sección',
                  onClick: () => selectSection(null),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <SelectionGrid
            title="Selecciona un Curso"
            icon={<BookOpen className="h-5 w-5" />}
            items={getCourses().map(c => ({
              id: c.id,
              name: c.name,
              subtitle: c.code || '',
              onClick: () => selectCourse(c),
            }))}
          />
        )
      )}

      {/* Historial de evaluaciones */}
      {currentStep === 6 && (
        <div className="space-y-6">
          {historyLoading ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Cargando evaluaciones...</span>
                </div>
              </CardContent>
            </Card>
          ) : historyError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{historyError}</AlertDescription>
            </Alert>
          ) : historyData ? (
            <div className="space-y-6">
              {/* Resumen */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Total Semanas</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {historyData.summary.totalWeeks}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Total Evaluaciones</p>
                  <p className="text-2xl font-bold text-green-900">
                    {historyData.summary.totalEvaluations}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-600 mb-1">Total Estudiantes</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {historyData.summary.totalStudents}
                  </p>
                </div>
              </div>

              {/* Tabla de evaluaciones */}
              <EvaluationTable 
                weeks={historyData.weeks}
                qnas={historyData.qnas}
                months={historyData.months}
                bimester={historyData.bimester}
                isLoading={historyLoading}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No hay datos disponibles</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
