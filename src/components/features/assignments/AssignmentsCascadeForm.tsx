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
import { AlertCircle, Loader2, RotateCcw } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
      {/* ERROR */}
      {state.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* GRADO Y SECCIÓN EN LA MISMA FILA */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* GRADO */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Grado<span className="text-red-500">*</span>
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
            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <SelectValue placeholder="Grado" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              {state.grades.map(grade => (
                <SelectItem key={grade.id} value={grade.id.toString()}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.isLoadingGrades && (
            <p className="text-blue-600 dark:text-blue-400 text-xs mt-1 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Cargando...
            </p>
          )}
        </div>

        {/* SECCIÓN */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Sección<span className="text-red-500">*</span>
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
            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <SelectValue placeholder={
                !state.selectedGrade ? 'Elige grado' : 'Sección'
              } />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              {state.sections.map(section => (
                <SelectItem key={section.id} value={section.id.toString()}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.isLoadingSections && (
            <p className="text-blue-600 dark:text-blue-400 text-xs mt-1 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Cargando...
            </p>
          )}
        </div>
      </div>

      {/* CURSO */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Curso<span className="text-red-500">*</span>
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
          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <SelectValue placeholder={
              !state.selectedSection
                ? 'Selecciona primero una sección'
                : 'Selecciona un curso'
            } />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
            {state.courses.map(course => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.name} ({course.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.isLoadingCourses && (
          <p className="text-blue-600 dark:text-blue-400 text-xs mt-1 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Cargando datos...
          </p>
        )}
      </div>

      {/* CICLO Y BIMESTRE ACTUAL */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 text-sm mb-2">
              Ciclo y Bimestre Actual
            </h3>
            <dl className="space-y-2">
              <div className="flex justify-between items-center">
                <dt className="text-purple-700 dark:text-purple-300 text-xs font-medium">Ciclo:</dt>
                <dd className="text-purple-900 dark:text-purple-100 text-sm font-semibold">
                  {state.cycleName || 'Cargando...'}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-purple-700 dark:text-purple-300 text-xs font-medium">Bimestre:</dt>
                <dd className="text-purple-900 dark:text-purple-100 text-sm font-semibold">
                  {state.selectedBimester?.name || 'Cargando...'}
                </dd>
              </div>
            </dl>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2">
            <svg className="w-5 h-5 text-purple-700 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* INFORMACIÓN SELECCIONADA */}
      {isFormComplete() && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-sm">Contexto Seleccionado</h3>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between">
              <dt className="text-blue-700 dark:text-blue-300 font-medium">Ciclo:</dt>
              <dd className="text-blue-600 dark:text-blue-400">{state.cycleName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-blue-700 dark:text-blue-300 font-medium">Bimestre:</dt>
              <dd className="text-blue-600 dark:text-blue-400">{state.selectedBimester?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-blue-700 dark:text-blue-300 font-medium">Grado:</dt>
              <dd className="text-blue-600 dark:text-blue-400">{state.selectedGrade?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-blue-700 dark:text-blue-300 font-medium">Sección:</dt>
              <dd className="text-blue-600 dark:text-blue-400">{state.selectedSection?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-blue-700 dark:text-blue-300 font-medium">Curso:</dt>
              <dd className="text-blue-600 dark:text-blue-400 text-right">
                {state.selectedCourse?.name}<br/><span className="text-xs text-blue-500 dark:text-blue-400">{state.selectedCourse?.code}</span>
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* INDICADOR DE PROGRESO */}
      <div className="mb-6">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((step, index) => {
            let isComplete = false;
            if (step === 1 && state.selectedGrade) isComplete = true;
            if (step === 2 && state.selectedSection) isComplete = true;
            if (step === 3 && state.selectedCourse) isComplete = true;

            return (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition ${
                  isComplete 
                    ? 'bg-blue-600 dark:bg-blue-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            );
          })}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
          Paso {[state.selectedGrade, state.selectedSection, state.selectedCourse].filter(Boolean).length + 1} de 3
        </p>
      </div>

      {/* BOTONES */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => actions.reset()}
          className="flex-1 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Limpiar
        </Button>
        <Button
          type="submit"
          disabled={!isFormComplete() || isLoading()}
          className="flex-1"
        >
          {isLoading() ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Cargando...
            </>
          ) : (
            'Continuar'
          )}
        </Button>
      </div>
    </form>
  );
};
