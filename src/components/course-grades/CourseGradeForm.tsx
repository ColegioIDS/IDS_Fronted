// components/course-grade/CourseGradeForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, AlertCircle } from 'lucide-react';
import { useCourseGrade } from '@/hooks/useCourseGrade';
import { courseGradeSchema, defaultValues, CourseGradeFormData as FormValues } from '@/schemas/courseGradeSchema';

interface CourseGradeFormProps {
  editingId?: number | null;
  onSubmit: (data: FormValues) => Promise<void>;
  onCancel: () => void;
}

/**
 * Form component for creating/editing course-grade relationships
 * Features: validation, form data from API, edit mode, cycle info
 */
export function CourseGradeForm({
  editingId,
  onSubmit,
  onCancel,
}: CourseGradeFormProps) {
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // ✅ Hook con todas las funcionalidades necesarias
  const { 
    formData,
    currentCourseGrade,
    isLoadingFormData,
    fetchFormData,
    fetchCourseGradeById
  } = useCourseGrade(false); // autoFetch = false

  const form = useForm<FormValues>({
    resolver: zodResolver(courseGradeSchema),
    defaultValues: defaultValues,
  });

  // ✅ Cargar datos del formulario al montar
  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  // ✅ Cargar datos de edición si existe editingId
  useEffect(() => {
    const loadEditData = async () => {
      if (editingId && formData) {
        await fetchCourseGradeById(editingId);
      } else {
        form.reset(defaultValues);
      }
    };

    loadEditData();
  }, [editingId, formData, fetchCourseGradeById, form]);

  // ✅ Actualizar formulario cuando se carga el courseGrade actual
  useEffect(() => {
    if (currentCourseGrade && editingId) {
      form.reset({
        courseId: currentCourseGrade.courseId,
        gradeId: currentCourseGrade.gradeId,
        isCore: currentCourseGrade.isCore,
      });
    }
  }, [currentCourseGrade, editingId, form]);

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsSubmittingForm(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // ✅ Agrupar grados por nivel
  const gradesByLevel = formData?.grades.reduce((acc, grade) => {
    if (!acc[grade.level]) {
      acc[grade.level] = [];
    }
    acc[grade.level].push(grade);
    return acc;
  }, {} as Record<string, typeof formData.grades>) || {};

  // ✅ Mostrar loading mientras carga datos del formulario
  if (isLoadingFormData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm text-muted-foreground">Cargando datos del formulario...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingId ? 'Editar Relación' : 'Nueva Relación Curso-Grado'}
        </CardTitle>
        {/* ✅ Mostrar ciclo activo */}
        {formData?.activeCycle && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Ciclo: {formData.activeCycle.name}
            </Badge>
            <span className="text-xs">
              {new Date(formData.activeCycle.startDate).toLocaleDateString()} - {new Date(formData.activeCycle.endDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* ✅ Alerta si no hay grados disponibles */}
            {formData && formData.grades.length === 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-900">
                      No hay grados disponibles
                    </h4>
                    <p className="mt-1 text-sm text-amber-700">
                      No se encontraron grados asignados al ciclo activo{' '}
                      <strong>{formData.activeCycle.name}</strong>. 
                      Por favor, crea grados para este ciclo antes de continuar.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ Alerta si no hay cursos disponibles */}
            {formData && formData.courses.length === 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-900">
                      No hay cursos disponibles
                    </h4>
                    <p className="mt-1 text-sm text-amber-700">
                      No se encontraron cursos activos. 
                      Por favor, crea cursos activos antes de continuar.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Course Selection */}
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curso</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={!formData || formData.courses.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un curso" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formData?.courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: course.color || '#6366f1' }}
                            />
                            {course.name} ({course.code})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecciona el curso a relacionar con el grado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grade Selection */}
            <FormField
              control={form.control}
              name="gradeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grado</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={!formData || formData.grades.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un grado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(gradesByLevel).map(([level, levelGrades]) => (
                        <div key={level}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                            {level}
                          </div>
                          {levelGrades
                            .sort((a, b) => a.order - b.order)
                            .map((grade) => (
                            <SelectItem key={grade.id} value={grade.id.toString()}>
                              {grade.name}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Grados del ciclo activo: {formData?.activeCycle.name}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Core/Elective Switch */}
            <FormField
              control={form.control}
              name="isCore"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Asignatura Principal
                    </FormLabel>
                    <FormDescription>
                      Determina si esta es una asignatura principal (obligatoria) 
                      o electiva para este grado
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={
                  isSubmittingForm || 
                  !formData || 
                  formData.courses.length === 0 || 
                  formData.grades.length === 0
                }
                className="flex-1"
              >
                {isSubmittingForm && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingId ? 'Actualizar' : 'Crear'} Relación
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}