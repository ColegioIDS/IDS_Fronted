// src/components/erica-history/qna-grid/qna-grid-main.tsx
"use client";

import React, { useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  RefreshCw, 
  Users, 
  AlertCircle, 
  FileText,
  Calendar,
  BookOpen,
  User2
} from 'lucide-react';

// Context hooks
import { useQnaGrid } from '@/context/QnaContext';
import { useEricaTopicsContext } from '@/context/EricaTopicsContext';

// Types
import { SchoolCycle } from '@/types/SchoolCycle';
import { Bimester } from '@/types/SchoolBimesters';
import { Grade } from '@/types/student';
import { Section } from '@/types/student';
import { User } from '@/types/user';
import { Course } from '@/types/courses';
import { AcademicWeek } from '@/types/academic-week.types';

// Componentes especializados
import QnaGridHeaders from './qna-grid-headers';
import QnaGridStudentRow from './qna-grid-student-row';
import QnaGridStats from './qna-grid-stats';
import QnaUnifiedGrid from './qna-grid';

// ==================== INTERFACES ====================
interface Selection {
  cycle: SchoolCycle;
  bimester: Bimester;
  grade: Grade;
  section: Section;
  teacher: User;
  course: Course;
}

interface QnaGridMainProps {
  selection: Selection;
  academicWeeks: AcademicWeek[];
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function QnaGridMain({
  selection,
  academicWeeks
}: QnaGridMainProps) {

  // ========== CONTEXTS ==========
  const {
    qnaGrid,
    loading: loadingGrid,
    error: gridError,
    refreshGrid,
    clearError
  } = useQnaGrid();

  const {
    state: { topics }
  } = useEricaTopicsContext();

  // ========== EFECTOS ==========
  useEffect(() => {
    if (gridError) {
      console.error('Grid QNA Error:', gridError);
    }
  }, [gridError]);

  // ========== COMPUTED VALUES ==========
  
  // Verificar que tenemos exactamente 8 semanas
  const weeksValidation = useMemo(() => {
    const sortedWeeks = [...academicWeeks].sort((a, b) => a.number - b.number);
    const isValid = sortedWeeks.length === 8 && 
                   sortedWeeks.every((week, index) => week.number === index + 1);
    
    return {
      isValid,
      count: sortedWeeks.length,
      weeks: sortedWeeks
    };
  }, [academicWeeks]);

  // Asociar temas con semanas
  const weeksWithTopics = useMemo(() => {
    if (!weeksValidation.isValid) return [];
    
    return weeksValidation.weeks.map(week => {
      const weekTopic = topics.find(topic => 
        topic.academicWeekId === week.id &&
        topic.courseId === selection.course.id &&
        topic.sectionId === selection.section.id &&
        topic.teacherId === selection.teacher.id
      );
      
      return {
        ...week,
        topic: weekTopic || null
      };
    });
  }, [weeksValidation, topics, selection]);

  // Calcular estadísticas del grid
  const gridStats = useMemo(() => {
    if (!qnaGrid || !qnaGrid.students) return null;
    
    const totalStudents = qnaGrid.students.length;
    const studentsWithEvaluations = qnaGrid.students.filter(
      student => Object.keys(student.weeklyEvaluations || {}).length > 0
    ).length;

    return {
      totalStudents,
      studentsWithEvaluations,
      evaluationRate: totalStudents > 0 ? (studentsWithEvaluations / totalStudents) * 100 : 0
    };
  }, [qnaGrid]);

  // ========== RENDERIZADO CONDICIONAL ==========
  
  if (loadingGrid) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Loading grid */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Headers skeleton */}
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
              
              {/* Rows skeleton */}
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gridError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Error al cargar el grid QNA: {gridError}</span>
          <div className="flex gap-2 ml-4">
            <Button
              onClick={clearError}
              variant="ghost"
              size="sm"
              className="text-red-700 hover:text-red-800"
            >
              Limpiar
            </Button>
            <Button
              onClick={refreshGrid}
              variant="ghost"
              size="sm"
              className="text-red-700 hover:text-red-800"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!weeksValidation.isValid) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          El bimestre debe tener exactamente 8 semanas académicas configuradas. 
          Encontradas: {weeksValidation.count} semanas.
          Configure las semanas académicas antes de consultar el grid QNA.
        </AlertDescription>
      </Alert>
    );
  }

  if (!qnaGrid || !qnaGrid.students) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="h-8 w-8 text-gray-400 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Sin datos de evaluación
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
          No se encontraron evaluaciones ERICA para los parámetros seleccionados.
        </p>
        <Button onClick={refreshGrid} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar Datos
        </Button>
      </div>
    );
  }

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className="space-y-6">
      
      {/* ========== HEADER CON INFORMACIÓN DEL CONTEXTO ========== */}
      <Card className="border-indigo-200 dark:border-indigo-800">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                Grid QNA - {selection.course.name}
              </h2>
              <div className="flex items-center gap-6 text-sm text-indigo-700 dark:text-indigo-300">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{selection.course.code}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Sección {selection.section.name} - {selection.grade.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User2 className="h-4 w-4" />
                  <span>{selection.teacher.givenNames} {selection.teacher.lastNames}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{selection.bimester.name}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={refreshGrid}
                variant="outline"
                size="sm"
                disabled={loadingGrid}
              >
                <RefreshCw className={`h-4 w-4 ${loadingGrid ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========== ESTADÍSTICAS ========== */}
      {gridStats && qnaGrid.stats && (
        <QnaGridStats 
          stats={qnaGrid.stats}
          gridStats={gridStats}
          totalWeeks={weeksWithTopics.length}
        />
      )}

      {/* ========== GRID PRINCIPAL ========== */}


      {/* ========== GRID PRINCIPAL ========== */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <BarChart3 className="h-5 w-5" />
      Matriz QNA Completa
    </CardTitle>
  </CardHeader>
  <CardContent className="p-0">
    
    {/* Grid Unificado */}
    <QnaUnifiedGrid
      weeksWithTopics={weeksWithTopics}
      categories={qnaGrid.categories || []}
      scales={qnaGrid.scales || []}
      students={qnaGrid.students || []}
    />

    {/* Footer con leyenda */}
    <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        
        {/* Escalas ERICA */}
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            Escalas ERICA:
          </h4>
          <div className="space-y-1">
            {(qnaGrid.scales || []).map((scale: any) => (
              <div key={scale.id} className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`
                    text-xs font-medium
                    ${scale.code === 'E' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-600' : ''}
                    ${scale.code === 'B' ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-600' : ''}
                    ${scale.code === 'P' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-600' : ''}
                    ${scale.code === 'C' ? 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-600' : ''}
                    ${scale.code === 'N' ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-600' : ''}
                  `}
                >
                  {scale.code}
                </Badge>
                <span className="text-gray-600 dark:text-gray-400">
                  {scale.name} ({scale.numericValue})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Competencias ERICA */}
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            Competencias ERICA:
          </h4>
          <div className="space-y-1 text-gray-600 dark:text-gray-400">
            <div><strong>E</strong> - Ejecuta</div>
            <div><strong>R</strong> - Retiene</div>
            <div><strong>I</strong> - Interpreta</div>
            <div><strong>C</strong> - Conoce</div>
            <div><strong>A</strong> - Aplica</div>
          </div>
        </div>

        {/* Cálculos QNA */}
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cálculos QNA:
          </h4>
          <div className="space-y-1 text-gray-600 dark:text-gray-400 text-xs">
            <div><strong>QNA1:</strong> Suma de Semanas 1-2</div>
            <div><strong>QNA2:</strong> Suma de Semanas 3-4</div>
            <div><strong>QNA3:</strong> Suma de Semanas 5-6</div>
            <div><strong>QNA4:</strong> Suma de Semanas 7-8</div>
            <div><strong>Mensual 1:</strong> (QNA1 + QNA2) ÷ 2</div>
            <div><strong>Mensual 2:</strong> (QNA3 + QNA4) ÷ 2</div>
          </div>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
 

      {/* ========== INFORMACIÓN ADICIONAL ========== */}
      {weeksWithTopics.some(week => week.topic) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Temas por Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {weeksWithTopics.map((week) => (
                <div 
                  key={week.id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Semana {week.number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()}
                  </div>
                  {week.topic ? (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {week.topic.title}
                      </div>
                      {week.topic.description && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {week.topic.description}
                        </div>
                      )}
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                      >
                        {week.topic.isCompleted ? 'Completado' : 'En progreso'}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      Sin tema asignado
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== MENSAJE DE AYUDA ========== */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema QNA:</strong> Visualización de solo lectura del historial de evaluaciones ERICA. 
          Los cálculos QNA suman las competencias de 2 semanas consecutivas. 
          Los promedios mensuales combinan 2 QNAs cada uno.
        </AlertDescription>
      </Alert>
    </div>
  );
}