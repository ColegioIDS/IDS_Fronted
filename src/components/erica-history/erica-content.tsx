// src/components/erica-history/erica-content.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, RotateCcw, Calendar, GraduationCap, Users, User2, BookOpen, BarChart3, Check } from 'lucide-react';

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
import { useQnaContext } from '@/context/QnaContext';

// Types
import { SchoolCycle } from '@/types/SchoolCycle';
import { Bimester } from '@/types/SchoolBimesters';
import { Grade } from '@/types/student';
import { Section } from '@/types/student';
import { User } from '@/types/user';
import { Course } from '@/types/courses';

// Componentes de selección
import BimesterSelection from './selection-flow/bimester-selection';
import GradeSelection from './selection-flow/grade-selection';
import SectionSelection from './selection-flow/section-selection';
import TeacherSelection from './selection-flow/teacher-selection';
import CourseSelection from './selection-flow/course-selection';

// Componente de grid QNA
import QnaGridMain from './qna-grid/qna-grid-main';

// Componente de contexto académico
import AcademicContextInfo from './shared/academic-context-info';

// ==================== TIPOS ====================
interface SelectionState {
  cycle: SchoolCycle | null;
  bimester: Bimester | null;
  grade: Grade | null;
  section: Section | null;
  teacher: User | null;
  course: Course | null;
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
export default function EricaContent() {
  const { fetchSectionsByGrade } = useSectionContext();
  const { fetchGradeCyclesByCycle } = useGradeCycleContext();
  const { fetchAllTeachers } = useTeacherContext();
  const { fetchTeacherCourses, fetchSectionAssignments } = useCourseAssignmentContext();
const { getWeeksByBimester } = useAcademicWeekContext();
  const { fetchTopics } = useEricaTopicsContext();

  // ========== CONTEXTS ==========
  const {
    activeCycle,
    isLoading: loadingCycle,
    isError: errorCycle,
    error: cycleError
  } = useSchoolCycleContext();

  const {
    bimesters,
    isLoading: isLoadingBimesters
  } = useBimesterContext();

  const {
    currentWeek,
    weeks: academicWeeks
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
    state: qnaState,
    fetchQnaGrid
  } = useQnaContext();

  // ========== ESTADO LOCAL ==========
  const [selection, setSelection] = useState<SelectionState>({
    cycle: null,
    bimester: null,
    grade: null,
    section: null,
    teacher: null,
    course: null,
    currentStep: 1
  });

  // ========== COMPUTED VALUES ==========
  const activeGradeCycles = useMemo(() => {
    if (!selection.cycle) return [];
    return gradeCycles.filter(gc => gc.cycleId === selection.cycle!.id);
  }, [gradeCycles, selection.cycle]);

  // Bimestres disponibles del ciclo activo
const availableBimesters = useMemo(() => {
  if (!selection.cycle?.id) return []; // Cambio: agregar ?. operator
  return bimesters.filter(b => b.cycleId === selection.cycle!.id);
}, [bimesters, selection.cycle]);

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
    return loadingCycle || isLoadingBimesters || loadingGrades || 
           loadingSections || loadingAssignments || loadingUsers || loadingCourses;
  }, [loadingCycle, isLoadingBimesters, loadingGrades, loadingSections, 
      loadingAssignments, loadingUsers, loadingCourses]);

  const hasError = useMemo(() => {
    return errorCycle || qnaState.error;
  }, [errorCycle, qnaState.error]);

  const errorMessage = useMemo(() => {
    return cycleError?.message || qnaState.error;
  }, [cycleError, qnaState.error]);

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
      title: 'Bimestre',
      icon: Calendar,
      completed: !!selection.bimester,
      active: selection.currentStep === 2
    },
    {
      number: 3,
      title: 'Grado',
      icon: GraduationCap,
      completed: !!selection.grade,
      active: selection.currentStep === 3
    },
    {
      number: 4,
      title: 'Sección',
      icon: Users,
      completed: !!selection.section,
      active: selection.currentStep === 4
    },
    {
      number: 5,
      title: 'Profesor',
      icon: User2,
      completed: !!selection.teacher,
      active: selection.currentStep === 5
    },
    {
      number: 6,
      title: 'Curso',
      icon: BookOpen,
      completed: !!selection.course,
      active: selection.currentStep === 6
    },
    {
      number: 7,
      title: 'Ver QNA',
      icon: BarChart3,
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
      }
      if (nextStep <= 3) {
        newSelection.section = null;
        newSelection.teacher = null;
        newSelection.course = null;
      }
      if (nextStep <= 4) {
        newSelection.teacher = null;
        newSelection.course = null;
      }
      if (nextStep <= 5) {
        newSelection.course = null;
      }

      return newSelection;
    });

    // Trigger data fetching based on selection
    if (key === 'bimester' && value) {
      getWeeksByBimester(value.id);
    }

    if (key === 'grade' && value) {
      fetchSectionsByGrade(value.id);
    }

    if (key === 'section' && value) {
      fetchSectionAssignments(value.id);
    }

    if (key === 'teacher' && value && selection.section) {
      fetchTeacherCourses(value.id, selection.section.id);
    }

    if (key === 'course' && value && selection.bimester && selection.section && selection.teacher) {
      // Cargar temas para mostrar en el grid
      fetchTopics({
        courseId: value.id,
        sectionId: selection.section.id,
        teacherId: selection.teacher.id,
        bimesterId: selection.bimester.id
      });

      // Cargar grid QNA

      if (key === 'course' && value && selection.bimester && selection.section && selection.teacher) {
  // Cargar temas para mostrar en el grid
  fetchTopics({
    courseId: value.id,
    sectionId: selection.section.id,
    teacherId: selection.teacher.id,
    bimesterId: selection.bimester.id
  });

  // Cargar grid QNA - Cambio: validar todos los IDs requeridos
  if (selection.cycle?.id && selection.bimester?.id && selection.grade?.id && 
    selection.section?.id && selection.teacher?.id) {
  
  const params = {
    cycleId: parseInt(String(selection.cycle.id), 10),
    bimesterId: parseInt(String(selection.bimester.id), 10),
    gradeId: parseInt(String(selection.grade.id), 10),
    sectionId: parseInt(String(selection.section.id), 10),
    courseId: parseInt(String(value.id), 10),
    teacherId: parseInt(String(selection.teacher.id), 10),
    includeCalculated: true,
    forceRecalculate: false
  };

  // Validar que todas las conversiones fueron exitosas
  const hasValidIds = Object.values(params).slice(0, 6).every(id => !isNaN(id as number));
  
  if (hasValidIds) {
    fetchQnaGrid(params);
  } else {
    console.error('Error: IDs inválidos detectados', params);
  }
}




}
      
    }

  }, [getWeeksByBimester, fetchSectionsByGrade, fetchSectionAssignments, 
      fetchTeacherCourses, fetchTopics, fetchQnaGrid, selection]);

  const goBackToStep = useCallback((step: number) => {
    setSelection(prev => ({
      ...prev,
      currentStep: step,
      // Reset selecciones basado en el paso
      ...(step <= 1 && {
        cycle: null, bimester: null, grade: null, section: null,
        teacher: null, course: null
      }),
      ...(step <= 2 && {
        bimester: null, grade: null, section: null, teacher: null, course: null
      }),
      ...(step <= 3 && {
        grade: null, section: null, teacher: null, course: null
      }),
      ...(step <= 4 && {
        section: null, teacher: null, course: null
      }),
      ...(step <= 5 && {
        teacher: null, course: null
      }),
      ...(step <= 6 && {
        course: null
      })
    }));
  }, []);

  const resetAllSelections = useCallback(() => {
    setSelection({
      cycle: null,
      bimester: null,
      grade: null,
      section: null,
      teacher: null,
      course: null,
      currentStep: 1
    });
    // Reset QNA state if needed
  }, []);

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
            Error al cargar el sistema de historial ERICA: {errorMessage}
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
            Historial ERICA
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Consulta y análisis de evaluaciones por competencias
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
      <AcademicContextInfo 
        cycle={selection.cycle}
        bimester={selection.bimester}
        academicWeeks={academicWeeks}
      />

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
                    {step.completed && <Badge variant="secondary" className="ml-1 text-xs"><Check className="w-3 h-3" /></Badge>}
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

      {/* ========== MENSAJES DE ESTADO ========== */}
      {!activeCycle && (
        <Alert>
          <AlertDescription>
            No hay un ciclo escolar activo. Configure un ciclo escolar antes de consultar evaluaciones.
          </AlertDescription>
        </Alert>
      )}

      {/* ========== FLUJO DE SELECCIÓN ========== */}
      <div className="space-y-6">

        {/* PASO 1: CICLO (automático) */}
        {selection.currentStep >= 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Paso 1: Ciclo Escolar
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
                        Ciclo activo seleccionado
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Cargando ciclo escolar activo...
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* PASO 2: BIMESTRE */}
        {selection.cycle && selection.currentStep >= 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Paso 2: Seleccionar Bimestre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BimesterSelection
                selectedCycle={selection.cycle}
                availableBimesters={availableBimesters}
                selectedBimester={selection.bimester}
                onSelect={(bimester) => handleSelection('bimester', bimester, 3)}
                isCompleted={selection.currentStep > 2}
                onEdit={() => goBackToStep(2)}
              />
            </CardContent>
          </Card>
        )}

        {/* PASO 3: GRADO */}
        {selection.bimester && selection.currentStep >= 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Paso 3: Seleccionar Grado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GradeSelection
                selectedCycle={selection.cycle!}
                selectedGrade={selection.grade}
                onSelect={(grade) => handleSelection('grade', grade, 4)}
                isCompleted={selection.currentStep > 3}
                onEdit={() => goBackToStep(3)}
              />
            </CardContent>
          </Card>
        )}

        {/* PASO 4: SECCIÓN */}
        {selection.grade && selection.currentStep >= 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Paso 4: Seleccionar Sección
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SectionSelection
                selectedGrade={selection.grade}
                selectedSection={selection.section}
                onSelect={(section) => handleSelection('section', section, 5)}
                isCompleted={selection.currentStep > 4}
                onEdit={() => goBackToStep(4)}
              />
            </CardContent>
          </Card>
        )}

        {/* PASO 5: PROFESOR */}
        {selection.section && selection.currentStep >= 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User2 className="h-5 w-5" />
                Paso 5: Seleccionar Profesor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeacherSelection
                selectedSection={selection.section}
                selectedTeacher={selection.teacher}
                onSelect={(teacher) => handleSelection('teacher', teacher, 6)}
                isCompleted={selection.currentStep > 5}
                onEdit={() => goBackToStep(5)}
              />
            </CardContent>
          </Card>
        )}

        {/* PASO 6: CURSO */}
        {selection.teacher && selection.section && selection.currentStep >= 6 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Paso 6: Seleccionar Curso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CourseSelection
                selectedTeacher={selection.teacher}
                selectedSection={selection.section}
                selectedCourse={selection.course}
                onSelect={(course) => handleSelection('course', course, 7)}
                isCompleted={selection.currentStep > 6}
                onEdit={() => goBackToStep(6)}
              />
            </CardContent>
          </Card>
        )}

        {/* PASO 7: GRID QNA */}
        {selection.course && selection.currentStep >= 7 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Grid QNA - Sistema de Cálculos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QnaGridMain
                selection={{
                  cycle: selection.cycle!,
                  bimester: selection.bimester!,
                  grade: selection.grade!,
                  section: selection.section!,
                  teacher: selection.teacher!,
                  course: selection.course!
                }}
                academicWeeks={academicWeeks}
              />
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}