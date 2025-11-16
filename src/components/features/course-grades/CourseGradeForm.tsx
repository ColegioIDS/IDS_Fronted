// src/components/features/course-grades/CourseGradeForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  CreateCourseGradeDto,
  UpdateCourseGradeDto,
  CourseGradeDetail,
  AvailableCourse,
  AvailableGrade,
} from '@/types/course-grades.types';
import { courseGradesService } from '@/services/course-grades.service';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { X, Save, BookOpen, GraduationCap, CheckCircle, Loader2, XCircle, CheckCircle2 } from 'lucide-react';

interface CourseGradeFormProps {
  courseGrade?: CourseGradeDetail | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CourseGradeForm({
  courseGrade,
  onClose,
  onSuccess,
}: CourseGradeFormProps) {
  const isEditing = !!courseGrade;

  const [formData, setFormData] = useState<CreateCourseGradeDto>({
    courseId: courseGrade?.courseId || 0,
    gradeId: courseGrade?.gradeId || 0,
    isCore: courseGrade?.isCore ?? true,
  });

  const [courses, setCourses] = useState<AvailableCourse[]>([]);
  const [grades, setGrades] = useState<AvailableGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAvailableData();
  }, []);

  const loadAvailableData = async () => {
    try {
      const [coursesData, gradesData] = await Promise.all([
        courseGradesService.getAvailableCourses(),
        courseGradesService.getAvailableGrades(),
      ]);
      setCourses(coursesData);
      setGrades(gradesData);
    } catch (error: any) {
      toast.error('Error al cargar datos', {
        description: error.message || 'No se pudieron cargar cursos y grados',
        icon: <XCircle className="w-5 h-5" />,
        duration: 5000,
      });
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isEditing) {
      if (!formData.courseId || formData.courseId <= 0) {
        newErrors.courseId = 'Seleccione un curso';
      }
      if (!formData.gradeId || formData.gradeId <= 0) {
        newErrors.gradeId = 'Seleccione un grado';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Formulario incompleto', {
        description: 'Por favor corrija los errores marcados en rojo',
        icon: <XCircle className="w-5 h-5" />,
      });
      return;
    }

    setLoading(true);

    try {
      if (isEditing && courseGrade) {
        await courseGradesService.updateCourseGrade(courseGrade.id, {
          isCore: formData.isCore,
        });
        toast.success('Asignación actualizada', {
          description: 'Los cambios se guardaron correctamente',
          icon: <CheckCircle2 className="w-5 h-5" />,
          duration: 4000,
        });
      } else {
        await courseGradesService.createCourseGrade(formData as CreateCourseGradeDto);
        toast.success('Asignación creada', {
          description: 'La nueva asignación curso-grado se creó exitosamente',
          icon: <CheckCircle2 className="w-5 h-5" />,
          duration: 4000,
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      const message = error.message || 'Error al guardar la asignación';
      toast.error('Error al guardar', {
        description: message,
        icon: <XCircle className="w-5 h-5" />,
        duration: 5000,
      });
      
      // Handle specific errors
      if (message.includes('existe')) {
        setErrors({
          courseId: 'Esta combinación de curso y grado ya existe',
          gradeId: 'Esta combinación de curso y grado ya existe',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateCourseGradeDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
        <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">Cargando datos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
        <div className="w-full max-w-2xl rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b-2 border-gray-200 dark:border-gray-800 bg-indigo-50 dark:bg-indigo-950 px-6 py-4 rounded-t-xl sticky top-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900 shadow-sm">
                  <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {isEditing ? 'Editar Asignación' : 'Nueva Asignación Curso-Grado'}
                </h3>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    type="button"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">Cerrar sin guardar</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-5">
          {/* Course Select - Only for creating */}
          {!isEditing && (
            <div>
              <label className="mb-2.5 block text-sm font-medium text-gray-900 dark:text-gray-100">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Curso <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                value={formData.courseId || ''}
                onChange={(e) => handleChange('courseId', Number(e.target.value))}
                className={`w-full rounded-lg border-2 ${
                  errors.courseId 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700'
                } bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 outline-none transition focus:border-indigo-500 dark:focus:border-indigo-400 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900`}
                disabled={loading}
              >
                <option value="">Seleccione un curso</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    [{course.code}] {course.name}
                    {course.area ? ` - ${course.area}` : ''}
                  </option>
                ))}
              </select>
              {errors.courseId && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.courseId}</p>
              )}
            </div>
          )}

          {/* Grade Select - Only for creating */}
          {!isEditing && (
            <div>
              <label className="mb-2.5 block text-sm font-medium text-gray-900 dark:text-gray-100">
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Grado <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                value={formData.gradeId || ''}
                onChange={(e) => handleChange('gradeId', Number(e.target.value))}
                className={`w-full rounded-lg border-2 ${
                  errors.gradeId 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700'
                } bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 outline-none transition focus:border-indigo-500 dark:focus:border-indigo-400 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900`}
                disabled={loading}
              >
                <option value="">Seleccione un grado</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name} ({grade.level})
                  </option>
                ))}
              </select>
              {errors.gradeId && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.gradeId}</p>
              )}
            </div>
          )}

          {/* Show current course and grade when editing */}
          {isEditing && courseGrade && (
            <div className="space-y-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Curso</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  [{courseGrade.course.code}] {courseGrade.course.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Grado</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {courseGrade.grade.name} ({courseGrade.grade.level})
                </p>
              </div>
            </div>
          )}

          {/* Is Core Toggle */}
          <div>
            <label className="mb-2.5 block text-sm font-medium text-gray-900 dark:text-gray-100">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Tipo de Curso
              </span>
            </label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 px-4 py-3 hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors">
                <input
                  type="radio"
                  checked={formData.isCore === true}
                  onChange={() => handleChange('isCore', true)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  disabled={loading}
                />
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  Curso Núcleo (Obligatorio)
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 px-4 py-3 hover:border-amber-500 dark:hover:border-amber-400 transition-colors">
                <input
                  type="radio"
                  checked={formData.isCore === false}
                  onChange={() => handleChange('isCore', false)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                  disabled={loading}
                />
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  Curso Electivo
                </span>
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Los cursos núcleo son obligatorios para todos los estudiantes del grado.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 pt-4 -mx-6 px-6 -mb-6 pb-6 rounded-b-xl">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-2.5 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm hover:shadow"
                disabled={loading}
              >
                Cancelar
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">Descartar cambios y cerrar</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 font-medium text-white transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditing ? 'Actualizar' : 'Crear'} Asignación
                  </>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">{isEditing ? 'Guardar cambios' : 'Crear nueva asignación'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </form>
      </div>
    </div>
  </TooltipProvider>
  );
}
