// src/components/erica-evaluations/erica-evaluations-content.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, RotateCcw, Calendar, GraduationCap, Users, User2, BookOpen, FileText } from 'lucide-react';

// Context hooks
import { useSchoolCycleContext } from '@/context/SchoolCycleContext';
import { useBimesterContext } from '@/context/newBimesterContext';
import { useAcademicWeekContext } from '@/context/AcademicWeeksContext';
import { useGradeCycleContext } from '@/context/GradeCycleContext';
import { useSectionContext } from '@/context/SectionsContext';
import { useCourseAssignmentContext } from '@/context/CourseAssignmentContext';
import { useTeacherContext } from '@/context/TeacherContext';
import { useCourseContext } from '@/context/CourseContext';
import { useEricaTopicsContext } from '@/context/EricaTopicsContext';
import { useEricaEvaluationContext } from '@/context/EricaEvaluationContext';

// Types
import { SchoolCycle } from '@/types/SchoolCycle';
import { Bimester } from '@/types/SchoolBimesters';
import { AcademicWeek } from '@/types/academic-week.types';
import { Grade } from '@/types/student';
import { Section } from '@/types/student';
import { User } from '@/types/user';
import { Course } from '@/types/courses';
import { EricaTopic } from '@/types/erica-topics';

// Componentes de selección
import GradeSelection from './selection-flow/grade-selection';
import SectionSelection from './selection-flow/section-selection';
import TeacherSelection from './selection-flow/teacher-selection';
import CourseSelection from './selection-flow/course-selection';
import TopicSelection from './selection-flow/topic-selection';
import EvaluationGrid from './evaluation-grid/evaluation-grid';

// ==================== TIPOS ====================
interface SelectionState {
  cycle: SchoolCycle | null;
  grade: Grade | null;
  section: Section | null;
  teacher: User | null;
  course: Course | null;
  topic: EricaTopic | null;
  currentStep: number; // 1-7
}

interface StepInfo {
  number: number;
  title: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  active: boolean;
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function EricaEvaluationsContent() {
  const { fetchSectionsByGrade } = useSectionContext();
  const { fetchGradeCyclesByCycle } = useGradeCycleContext();
  const { fetchAllTeachers } = useTeacherContext();
  const { fetchTeacherCourses, fetchSectionAssignments } = useCourseAssignmentContext();
  const { fetchTopics } = useEricaTopicsContext();

  // ========== CONTEXTS ==========
  const {
    activeCycle,
    isLoading: loadingCycle,
    isError: errorCycle,
    error: cycleError
  } = useSchoolCycleContext();

  const {
    bimesters: activeBimesters,
    isLoading: isLoadingActiveBimesters,
    cycleId: activeCycleId
  } = useBimesterContext();

  const {
    currentWeek,
    isLoading: loadingWeek
  } = useAcademicWeekContext();

  const {
    state: { gradeCycles, loading: loadingGrades }
  } = useGradeCycleContext();

  const {
    state: { sections, loading: loadingSections }
  } = useSectionContext();

  const {
    state: { assignments: courseAssignments, loading: loadingAssignments }
  } = useCourseAssignmentContext();

  const {
    state: { teachers: users, loading: loadingUsers }
  } = useTeacherContext();

  const {
    state: { courses, loading: loadingCourses }
  } = useCourseContext();

  const {
    state: { topics, loading: loadingTopics }
  } = useEricaTopicsContext();

  const {
    state: evaluationState,
    resetState
  } = useEricaEvaluationContext();


  console.log("current Week:", currentWeek);

  // ========== ESTADO LOCAL ==========
  const [selection, setSelection] = useState<SelectionState>({
    cycle: null,
    grade: null,
    section: null,
    teacher: null,
    course: null,
    topic: null,
    currentStep: 1
  });

  // ========== COMPUTED VALUES ==========
  const activeBimester = useMemo(() => {
    return activeBimesters.find(bimester => bimester.isActive) || null;
  }, [activeBimesters]);

  const activeGradeCycles = useMemo(() => {
    if (!selection.cycle) return [];
    return gradeCycles.filter(gc => gc.cycleId === selection.cycle!.id);
  }, [gradeCycles, selection.cycle]);

  // ========== EFECTOS ==========
  useEffect(() => {
    if (activeCycle && !selection.cycle && !loadingCycle) {
      setSelection(prev => ({
        ...prev,
        cycle: activeCycle,
        currentStep: 2
      }));

      fetchGradeCyclesByCycle(activeCycle.id);
      fetchAllTeachers();
    }
  }, [activeCycle, selection.cycle, loadingCycle, fetchGradeCyclesByCycle, fetchAllTeachers]);

  // ========== COMPUTED VALUES ==========
  const isLoading = useMemo(() => {
    return loadingCycle || isLoadingActiveBimesters || loadingWeek ||
      loadingGrades || loadingSections || loadingAssignments ||
      loadingUsers || loadingCourses || loadingTopics;
  }, [loadingCycle, isLoadingActiveBimesters, loadingWeek, loadingGrades,
    loadingSections, loadingAssignments, loadingUsers, loadingCourses, loadingTopics]);

  const hasError = useMemo(() => {
    return errorCycle || evaluationState.error;
  }, [errorCycle, evaluationState.error]);

  const errorMessage = useMemo(() => {
    return cycleError?.message || evaluationState.error;
  }, [cycleError, evaluationState.error]);

  // Información de pasos para breadcrumbs
  const stepsInfo = useMemo((): StepInfo[] => [
    {
      number: 1,
      title: 'Ciclo',
      icon: Calendar,
      completed: !!selection.cycle,
      active: selection.currentStep === 1
    },
    {
      number: 2,
      title: 'Grado',
      icon: GraduationCap,
      completed: !!selection.grade,
      active: selection.currentStep === 2
    },
    {
      number: 3,
      title: 'Sección',
      icon: Users,
      completed: !!selection.section,
      active: selection.currentStep === 3
    },
    {
      number: 4,
      title: 'Profesor',
      icon: User2,
      completed: !!selection.teacher,
      active: selection.currentStep === 4
    },
    {
      number: 5,
      title: 'Curso',
      icon: BookOpen,
      completed: !!selection.course,
      active: selection.currentStep === 5
    },
    {
      number: 6,
      title: 'Tema',
      icon: FileText,
      completed: !!selection.topic,
      active: selection.currentStep === 6
    },
    {
      number: 7,
      title: 'Evaluar',
      icon: FileText,
      completed: false,
      active: selection.currentStep === 7
    }
  ], [selection]);

  // ========== FUNCIONES ==========
  const handleSelection = useCallback((
    key: keyof SelectionState,
    value: any,
    nextStep: number
  ) => {
    setSelection(prev => {
      const newSelection = { ...prev, [key]: value, currentStep: nextStep };

      // Reset selecciones posteriores
      if (nextStep <= 2) {
        newSelection.grade = null;
        newSelection.section = null;
        newSelection.teacher = null;
        newSelection.course = null;
        newSelection.topic = null;
      }
      if (nextStep <= 3) {
        newSelection.section = null;
        newSelection.teacher = null;
        newSelection.course = null;
        newSelection.topic = null;
      }
      if (nextStep <= 4) {
        newSelection.teacher = null;
        newSelection.course = null;
        newSelection.topic = null;
      }
      if (nextStep <= 5) {
        newSelection.course = null;
        newSelection.topic = null;
      }
      if (nextStep <= 6) {
        newSelection.topic = null;
      }

      return newSelection;
    });

    // Trigger data fetching based on selection
    if (key === 'grade' && value) {
      fetchSectionsByGrade(value.id);
    }

    if (key === 'section' && value) {
      fetchSectionAssignments(value.id);
    }

    if (key === 'teacher' && value && selection.section) {
      fetchTeacherCourses(value.id, selection.section.id);
    }

    if (key === 'course' && value && currentWeek && selection.section && selection.teacher) {
      fetchTopics({
        courseId: value.id,
        academicWeekId: currentWeek.id,
        sectionId: selection.section.id,
        teacherId: selection.teacher.id
      });
    }

  }, [fetchSectionsByGrade, fetchSectionAssignments, fetchTeacherCourses, fetchTopics, selection.section, selection.teacher, currentWeek]);

  const goBackToStep = useCallback((step: number) => {
    setSelection(prev => ({
      ...prev,
      currentStep: step,
      // Reset selecciones basado en el paso
      ...(step <= 1 && {
        cycle: null, grade: null, section: null,
        teacher: null, course: null, topic: null
      }),
      ...(step <= 2 && {
        grade: null, section: null, teacher: null,
        course: null, topic: null
      }),
      ...(step <= 3 && {
        section: null, teacher: null, course: null, topic: null
      }),
      ...(step <= 4 && {
        teacher: null, course: null, topic: null
      }),
      ...(step <= 5 && {
        course: null, topic: null
      }),
      ...(step <= 6 && {
        topic: null
      })
    }));
  }, []);

  const resetAllSelections = useCallback(() => {
    setSelection({
      cycle: null,
      grade: null,
      section: null,
      teacher: null,
      course: null,
      topic: null,
      currentStep: 1
    });
    resetState();
  }, [resetState]);

  // ========== RENDERIZADO CONDICIONAL ==========
  if (isLoading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar el sistema de evaluaciones: {errorMessage}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* ========== HEADER ========== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Evaluaciones ERICA
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sistema de evaluación por competencias
          </p>
        </div>
        <Button
          onClick={resetAllSelections}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reiniciar Selección
        </Button>
      </div>

      {/* ========== CONTEXTO ACADÉMICO ========== */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Ciclo Escolar</div>
                <div className="font-semibold text-blue-900 dark:text-blue-100">
                  {activeCycle?.name || 'No definido'}
                </div>
              </div>
              <div className="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Bimestre</div>
                <div className="font-semibold text-blue-900 dark:text-blue-100">
                  {activeBimester?.name || 'No definido'}
                </div>
              </div>
              <div className="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Semana Académica</div>
                <div className="font-semibold text-blue-900 dark:text-blue-100">
                  {currentWeek ? `Semana ${currentWeek.number}` : 'No definido'}
                </div>
                {currentWeek && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {currentWeek.startDate ? new Date(currentWeek.startDate).toLocaleDateString() : ''} - {' '}
                    {currentWeek.endDate ? new Date(currentWeek.endDate).toLocaleDateString() : ''}
                  </div>
                )}
              </div>
            </div>
            <div className="text-3xl">📚</div>
          </div>
        </CardContent>
      </Card>

      {/* ========== BREADCRUMBS ========== */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {stepsInfo.map((step, index) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.number}>
                  <button
                    onClick={() => goBackToStep(step.number)}
                    disabled={!step.completed && !step.active}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                      ${step.completed
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                        : step.active
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{step.number}. {step.title}</span>
                    {step.completed && <Badge variant="secondary" className="ml-1 text-xs">✓</Badge>}
                  </button>
                  {index < stepsInfo.length - 1 && (
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ========== MENSAJE DE ESTADO ========== */}
      {!activeCycle && (
        <Alert>
          <AlertDescription>
            No hay un ciclo escolar activo. Configure un ciclo escolar antes de realizar evaluaciones.
          </AlertDescription>
        </Alert>
      )}

      {!activeBimester && activeCycle && (
        <Alert>
          <AlertDescription>
            No hay un bimestre activo en el ciclo {activeCycle.name}. Configure los bimestres para continuar.
          </AlertDescription>
        </Alert>
      )}

      {!currentWeek && activeBimester && (
        <Alert>
          <AlertDescription>
            No se ha definido la semana académica actual. Configure las semanas académicas para continuar.
          </AlertDescription>
        </Alert>
      )}

      {/* ========== FLUJO DE SELECCIÓN ========== */}
      <div className="space-y-6">

        {/* PASO 1: CICLO */}
        {selection.currentStep >= 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Paso 1: Seleccionar Ciclo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selection.cycle ? (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                      <div className="font-semibold text-green-800 dark:text-green-200">
                        {selection.cycle.name}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Ciclo seleccionado
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => goBackToStep(1)}
                    variant="ghost"
                    size="sm"
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Componente CycleSelection se implementará aquí
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* PASO 2: GRADO */}
        {selection.cycle && selection.currentStep >= 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Paso 2: Seleccionar Grado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GradeSelection
                selectedCycle={selection.cycle}
                selectedGrade={selection.grade}
                onSelect={(grade) => handleSelection('grade', grade, 3)}
                isCompleted={selection.currentStep > 2}
                onEdit={() => goBackToStep(2)}
              />
            </CardContent>
          </Card>
        )}

        {/* PASO 3: SECCIÓN */}
        {selection.grade && selection.currentStep >= 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Paso 3: Seleccionar Sección
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SectionSelection
                selectedGrade={selection.grade}
                selectedSection={selection.section}
                onSelect={(section) => handleSelection('section', section, 4)}
                isCompleted={selection.currentStep > 3}
                onEdit={() => goBackToStep(3)}
              />
            </CardContent>
          </Card>
        )}

        {/* PASO 4: PROFESOR */}
        {selection.section && selection.currentStep >= 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User2 className="h-5 w-5" />
                Paso 4: Seleccionar Profesor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeacherSelection
                selectedSection={selection.section}
                selectedTeacher={selection.teacher}
                onSelect={(teacher) => handleSelection('teacher', teacher, 5)}
                isCompleted={selection.currentStep > 4}
                onEdit={() => goBackToStep(4)}
              />
            </CardContent>
          </Card>
        )}

        {/* PASO 5: CURSO */}
        {selection.teacher && selection.section && selection.currentStep >= 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Paso 5: Seleccionar Curso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CourseSelection
                selectedTeacher={selection.teacher}
                selectedSection={selection.section}
                selectedCourse={selection.course}
                onSelect={(course) => handleSelection('course', course, 6)}
                isCompleted={selection.currentStep > 5}
                onEdit={() => goBackToStep(5)}
              />
            </CardContent>
          </Card>
        )}

        {/* PASO 6: TEMA */}
        {selection.course && selection.currentStep >= 6 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Paso 6: Seleccionar Tema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TopicSelection
                selectedTeacher={selection.teacher!}
                selectedSection={selection.section!}
                selectedCourse={selection.course}
                selectedTopic={selection.topic}
                onSelect={(topic) => handleSelection('topic', topic, 7)}
                isCompleted={selection.currentStep > 6}
                onEdit={() => goBackToStep(6)}
              />
            </CardContent>
          </Card>
        )}

        {/* PASO 7: EVALUACIÓN */}
        {selection.topic && selection.currentStep >= 7 && currentWeek?.id && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Grid de Evaluación ERICA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EvaluationGrid
                selectedTeacher={selection.teacher!}
                selectedSection={selection.section!}
                selectedCourse={selection.course!}
                selectedTopic={selection.topic}
                currentWeek={currentWeek as AcademicWeek}
              />
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}