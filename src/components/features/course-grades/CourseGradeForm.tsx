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
      <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
        <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 p-10 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center justify-center gap-5 text-center">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 shadow-lg">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100 block">Cargando datos...</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 mt-1 block">Preparando el formulario</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
        <div className="w-full max-w-3xl rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="border-b-2 border-gray-200 dark:border-gray-800 bg-indigo-50 dark:bg-indigo-950 px-8 py-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-600 dark:bg-indigo-500 shadow-lg">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {isEditing ? 'Editar Asignación' : 'Nueva Asignación'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {isEditing ? 'Actualice los detalles de la asignación' : 'Configure la asignación de curso al grado'}
                  </p>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onClose}
                    className="p-2.5 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all shadow-sm hover:shadow-md"
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
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-6">
          {/* Course Select - Only for creating */}
          {!isEditing && (
            <div className="space-y-2.5">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                <span className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Curso <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              <select
                value={formData.courseId || ''}
                onChange={(e) => handleChange('courseId', Number(e.target.value))}
                className={`w-full rounded-xl border-2 ${
                  errors.courseId
                    ? 'border-red-500 dark:border-red-500 focus:border-red-600 dark:focus:border-red-400'
                    : 'border-gray-300 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400'
                } bg-white dark:bg-gray-800 px-4 py-3.5 text-gray-900 dark:text-gray-100 outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900 shadow-sm hover:shadow-md disabled:hover:shadow-sm`}
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
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" />
                  {errors.courseId}
                </p>
              )}
            </div>
          )}

          {/* Grade Select - Only for creating */}
          {!isEditing && (
            <div className="space-y-2.5">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                <span className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                    <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Grado <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              <select
                value={formData.gradeId || ''}
                onChange={(e) => handleChange('gradeId', Number(e.target.value))}
                className={`w-full rounded-xl border-2 ${
                  errors.gradeId
                    ? 'border-red-500 dark:border-red-500 focus:border-red-600 dark:focus:border-red-400'
                    : 'border-gray-300 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400'
                } bg-white dark:bg-gray-800 px-4 py-3.5 text-gray-900 dark:text-gray-100 outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900 shadow-sm hover:shadow-md disabled:hover:shadow-sm`}
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
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" />
                  {errors.gradeId}
                </p>
              )}
            </div>
          )}

          {/* Show current course and grade when editing */}
          {isEditing && courseGrade && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800/50 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Curso Asignado</p>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 ml-12">
                  [{courseGrade.course.code}] {courseGrade.course.name}
                </p>
              </div>
              <div className="p-5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-800/50 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                    <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">Grado Asignado</p>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 ml-12">
                  {courseGrade.grade.name} ({courseGrade.grade.level})
                </p>
              </div>
            </div>
          )}

          {/* Is Core Toggle */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
              <span className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Tipo de Curso
              </span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
                formData.isCore === true
                  ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 shadow-lg shadow-emerald-500/20'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="radio"
                  checked={formData.isCore === true}
                  onChange={() => handleChange('isCore', true)}
                  className="sr-only"
                  disabled={loading}
                />
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-3 rounded-xl ${
                    formData.isCore === true
                      ? 'bg-emerald-100 dark:bg-emerald-900/40'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <CheckCircle2 className={`h-7 w-7 ${
                      formData.isCore === true
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-bold text-base ${
                      formData.isCore === true
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Curso Núcleo
                    </p>
                    <p className={`text-xs mt-1 ${
                      formData.isCore === true
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      Obligatorio
                    </p>
                  </div>
                </div>
                {formData.isCore === true && (
                  <div className="absolute top-3 right-3">
                    <div className="p-1 rounded-full bg-emerald-600 dark:bg-emerald-500">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </label>

              <label className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
                formData.isCore === false
                  ? 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-950/30 shadow-lg shadow-amber-500/20'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="radio"
                  checked={formData.isCore === false}
                  onChange={() => handleChange('isCore', false)}
                  className="sr-only"
                  disabled={loading}
                />
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-3 rounded-xl ${
                    formData.isCore === false
                      ? 'bg-amber-100 dark:bg-amber-900/40'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Circle className={`h-7 w-7 ${
                      formData.isCore === false
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-bold text-base ${
                      formData.isCore === false
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Curso Electivo
                    </p>
                    <p className={`text-xs mt-1 ${
                      formData.isCore === false
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      Opcional
                    </p>
                  </div>
                </div>
                {formData.isCore === false && (
                  <div className="absolute top-3 right-3">
                    <div className="p-1 rounded-full bg-amber-600 dark:bg-amber-500">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
              <span className="font-medium">Nota:</span> Los cursos núcleo son obligatorios para todos los estudiantes del grado.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 border-t-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-8 py-6 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-8 py-3 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="flex items-center gap-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-8 py-3 font-semibold text-white transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
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
