// src/app/(admin)/erica-history/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { EricaHistoryFilterResponse, BimesterCompleteResponse } from '@/types/erica-history';
import { SelectionGrid } from '@/components/features/erica-evaluations';
import { HistoryEvaluationTable } from '@/components/features/erica-history/history-evaluation-table';
import { BimesterCompleteView } from '@/components/features/erica-history/bimestre-complete-view';

export default function EricaHistoryPage() {
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
  const [bimesterData, setBimesterData] = useState<BimesterCompleteResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [skipWeek, setSkipWeek] = useState(false); // Para saltar selección de semana

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

  useEffect(() => {
    if (!isReadyToLoadHistory) {
      setHistoryData(null);
      setBimesterData(null);
      setHistoryError(null);
      return;
    }

    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        // Siempre cargar evaluaciones filtradas (con o sin semana específica)
        const result = await ericaHistoryService.getEvaluationsByFilters({
          bimesterId: selected.bimester?.id,
          weekId: selected.week?.id, // undefined si skipWeek es true
          gradeId: selected.grade?.id,
          sectionId: selected.section?.id,
          courseId: selected.course?.id,
        });
        setHistoryData(result);
        setBimesterData(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar historial';
        setHistoryError(errorMessage);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [isReadyToLoadHistory, selected, skipWeek]);

  // Función para retroceder un paso
  const goBack = () => {
    if (selected.course) {
      selectCourse(null);
    } else if (selected.section) {
      selectSection(null);
    } else if (selected.grade) {
      selectGrade(null);
    } else if (skipWeek || selected.week) {
      if (selected.week) {
        selectWeek(null);
      } else {
        setSkipWeek(false);
      }
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
              {cascadeData?.cycle.name} - Ciclo Activo
            </p>
          </div>
        </div>
        
        <Button variant="outline" onClick={refreshCascade}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Breadcrumb de selección */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        {selected.bimester && (
          <>
            <Badge variant="outline" className="bg-blue-50">
              <Calendar className="h-3 w-3 mr-1" />
              {selected.bimester.name}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
        {selected.week && (
          <>
            <Badge variant="outline" className="bg-purple-50">
              Semana {selected.week.number}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
        {skipWeek && !selected.week && selected.bimester && (
          <>
            <Badge variant="outline" className="bg-purple-50">
              Todas las semanas
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
        {selected.grade && (
          <>
            <Badge variant="outline" className="bg-green-50">
              <GraduationCap className="h-3 w-3 mr-1" />
              {selected.grade.name}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
        {selected.section && (
          <>
            <Badge variant="outline" className="bg-yellow-50">
              <Users className="h-3 w-3 mr-1" />
              {selected.section.name}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
        {selected.course && (
          <Badge variant="outline" className="bg-orange-50">
            <BookOpen className="h-3 w-3 mr-1" />
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

      {currentStep === 2 && (
        <div className="space-y-4">
          <SelectionGrid
            title="Selecciona una Semana (Opcional)"
            icon={<Calendar className="h-5 w-5" />}
            items={getWeeks().map(w => ({
              id: w.id,
              name: `Semana ${w.number}`,
              subtitle: `${new Date(w.startDate).toLocaleDateString()} - ${new Date(w.endDate).toLocaleDateString()}`,
              onClick: () => selectWeek(w),
            }))}
          />
          
          <Card>
            <CardContent className="pt-6">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setSkipWeek(true)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Ver todas las semanas del bimestre
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

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
                  <span className="ml-2 text-gray-500">Cargando historial...</span>
                </div>
              </CardContent>
            </Card>
          ) : historyError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{historyError}</AlertDescription>
            </Alert>
          ) : bimesterData ? (
            // Mostrar vista completa del bimestre
            <BimesterCompleteView data={bimesterData} />
          ) : historyData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Total Evaluaciones</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {historyData.stats.totalEvaluations}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Total Estudiantes</p>
                  <p className="text-2xl font-bold text-green-900">
                    {historyData.stats.totalStudents}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-600 mb-1">Semanas Evaluadas</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {historyData.stats.totalWeeks}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-xs text-gray-600 mb-1">Promedio Puntos</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {historyData.stats.averagePoints.toFixed(2)}
                  </p>
                </div>
              </div>
              <HistoryEvaluationTable 
                weeks={historyData.weeks}
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
