/**
 * Componente AssignmentsCascadeForm
 * Formulario de cascada: Grade -> Section -> Course -> Bimester
 * Completamente reutilizable y aislado
 */

'use client';

import { FC, useState } from 'react';
import {
  GradeOption,
  SectionOption,
  CourseOption,
  BimesterOption,
} from '@/types/assignments.types';
import { useAssignmentsCascade } from '@/hooks/useAssignmentsCascade';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, RotateCcw, BookOpen, Tag, BookMarked, CheckCircle, ChevronRight } from 'lucide-react';

interface AssignmentsCascadeFormProps {
  onComplete?: (data: {
    gradeId: number;
    sectionId: number;
    courseId: number;
    bimesterId: number;
    gradeName: string;
    sectionName: string;
    courseName: string;
    bimesterName: string;
  }) => void;
  onError?: (error: string) => void;
}

export const AssignmentsCascadeForm: FC<AssignmentsCascadeFormProps> = ({
  onComplete,
  onError,
}) => {
  const { state, actions, getSelectedValues, isFormComplete, isLoading } = useAssignmentsCascade();
  const [showCompletion, setShowCompletion] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormComplete()) {
      if (onError) {
        onError('Por favor completa todos los campos');
      }
      return;
    }

    const values = getSelectedValues();
    if (
      values.gradeId &&
      values.sectionId &&
      values.courseId &&
      values.bimesterId
    ) {
      setShowCompletion(true);
      if (onComplete) {
        onComplete({
          gradeId: values.gradeId,
          sectionId: values.sectionId,
          courseId: values.courseId,
          bimesterId: values.bimesterId,
          gradeName: state.selectedGrade?.name || '',
          sectionName: state.selectedSection?.name || '',
          courseName: state.selectedCourse?.name || '',
          bimesterName: state.selectedBimester?.name || '',
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* ERROR */}
      {state.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* CONTENEDOR PRINCIPAL CON CARD */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        
        {/* HEADER CON GRADIENTE AZUL */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6">
          <h2 className="text-2xl font-bold text-white mb-1">Seleccionar Contexto</h2>
          <p className="text-blue-100 text-sm">Elige el grado, sección y curso para crear tareas</p>
        </div>

        {/* CONTENIDO */}
        <div className="p-8">
          
          {/* GRADO Y SECCIÓN - DOS COLUMNAS */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* GRADO */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Grado<span className="text-red-500 ml-1">*</span>
              </label>
              <Select
                value={state.selectedGrade?.id.toString() || ''}
                onValueChange={(value) => {
                  const gradeId = parseInt(value);
                  const grade = state.grades.find(g => g.id === gradeId) || null;
                  actions.setSelectedGrade(grade);
                }}
                disabled={state.isLoadingGrades || state.grades.length === 0}
              >
                <SelectTrigger className="w-full h-12 px-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-medium transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Selecciona un grado" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                  {state.grades.map(grade => (
                    <SelectItem key={grade.id} value={grade.id.toString()}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.isLoadingGrades && (
                <div className="mt-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cargando grados...</p>
                </div>
              )}
            </div>

            {/* SECCIÓN */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                Sección<span className="text-red-500 ml-1">*</span>
              </label>
              <Select
                value={state.selectedSection?.id.toString() || ''}
                onValueChange={(value) => {
                  const sectionId = parseInt(value);
                  const section = state.sections.find(s => s.id === sectionId) || null;
                  actions.setSelectedSection(section);
                }}
                disabled={!state.selectedGrade || state.isLoadingSections || state.sections.length === 0}
              >
                <SelectTrigger className="w-full h-12 px-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-medium transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800">
                  <SelectValue placeholder={
                    !state.selectedGrade ? 'Selecciona grado primero' : 'Selecciona una sección'
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                  {state.sections.map(section => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.isLoadingSections && (
                <div className="mt-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cargando secciones...</p>
                </div>
              )}
            </div>
          </div>

          {/* CURSO - ANCHO COMPLETO */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-blue-600" />
              Curso<span className="text-red-500 ml-1">*</span>
            </label>
            <Select
              value={state.selectedCourse?.id.toString() || ''}
              onValueChange={(value) => {
                const courseId = parseInt(value);
                const course = state.courses.find(c => c.id === courseId) || null;
                actions.setSelectedCourse(course);
              }}
              disabled={!state.selectedSection || state.isLoadingCourses || state.courses.length === 0}
            >
              <SelectTrigger className="w-full h-12 px-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-medium transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800">
                <SelectValue placeholder={
                  !state.selectedSection
                    ? 'Selecciona sección primero'
                    : 'Selecciona un curso'
                } />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                {state.courses.map(course => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    <span className="font-medium">{course.name}</span>
                    <span className="text-gray-500 ml-2">({course.code})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.isLoadingCourses && (
              <div className="mt-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Cargando cursos...</p>
              </div>
            )}
          </div>

          {/* DIVIDER */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mb-8"></div>

          {/* CICLO Y BIMESTRE */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-4">Ciclo Escolar Actual</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between items-center py-2 px-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <dt className="text-blue-700 dark:text-blue-300 text-sm font-semibold">Ciclo:</dt>
                    <dd className="text-blue-900 dark:text-blue-100 font-bold text-sm">
                      {state.cycleName || 'Cargando...'}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <dt className="text-blue-700 dark:text-blue-300 text-sm font-semibold">Bimestre:</dt>
                    <dd className="text-blue-900 dark:text-blue-100 font-bold text-sm">
                      {state.selectedBimester?.name || 'Cargando...'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN SELECCIONADA */}
          {isFormComplete() && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8 animate-in fade-in-50 duration-300">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <h3 className="font-bold text-green-900 dark:text-green-100 text-sm">Tu Selección</h3>
              </div>
              <dl className="space-y-3">
                <div className="flex justify-between items-center py-2 px-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <dt className="text-green-700 dark:text-green-300 text-sm font-semibold">Grado:</dt>
                  <dd className="text-green-900 dark:text-green-100 font-bold">{state.selectedGrade?.name}</dd>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <dt className="text-green-700 dark:text-green-300 text-sm font-semibold">Sección:</dt>
                  <dd className="text-green-900 dark:text-green-100 font-bold">{state.selectedSection?.name}</dd>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <dt className="text-green-700 dark:text-green-300 text-sm font-semibold">Curso:</dt>
                  <dd className="text-green-900 dark:text-green-100 font-bold">{state.selectedCourse?.name}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* INDICADOR DE PROGRESO */}
          <div className="mb-8">
            <div className="flex gap-2 mb-3">
              {[1, 2, 3].map((step, index) => {
                let isComplete = false;
                if (step === 1 && state.selectedGrade) isComplete = true;
                if (step === 2 && state.selectedSection) isComplete = true;
                if (step === 3 && state.selectedCourse) isComplete = true;

                return (
                  <div key={index} className="flex-1">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isComplete 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Progreso
              </p>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {[state.selectedGrade, state.selectedSection, state.selectedCourse].filter(Boolean).length}/3 campos
              </p>
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => actions.reset()}
              className="flex-1 h-12 px-4 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold rounded-xl transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-700 hover:shadow-md flex items-center justify-center gap-2 uppercase text-sm tracking-wide"
            >
              <RotateCcw className="w-4 h-4" />
              Limpiar
            </button>
            <button
              type="submit"
              disabled={!isFormComplete() || isLoading()}
              className="flex-1 h-12 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/40 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 uppercase text-sm tracking-wide disabled:hover:from-blue-600 disabled:hover:to-blue-500 disabled:hover:shadow-none"
            >
              {isLoading() ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Continuando...
                </>
              ) : (
                <>
                  <span>Continuar</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
