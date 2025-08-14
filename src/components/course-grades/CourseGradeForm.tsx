// components/course-grade/CourseGradeForm.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2 } from 'lucide-react';
import { useCourse } from '@/hooks/useCourse';
import { useGrade } from '@/hooks/useGrade';
import { useCourseGrade } from '@/hooks/useCourseGrade';

const formSchema = z.object({
  courseId: z.number().min(1, 'Selecciona un curso'),
  gradeId: z.number().min(1, 'Selecciona un grado'),
  isCore: z.boolean()
});

type FormValues = z.infer<typeof formSchema>;

interface CourseGradeFormProps {
  editingId?: number | null;
  onSubmit: (data: FormValues) => Promise<void>;
  onCancel: () => void;
}

/**
 * Form component for creating/editing course-grade relationships
 * Features: validation, async course/grade loading, edit mode
 */
export function CourseGradeForm({
  editingId,
  onSubmit,
  onCancel,
}: CourseGradeFormProps) {
  const { courses, fetchCourses } = useCourse();
  const { grades, fetchGrades } = useGrade();
  const { 
    currentCourseGrade, 
    isSubmitting 
  } = useCourseGrade(!!editingId, editingId || undefined);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: 0,
      gradeId: 0,
      isCore: true,
    },
  });

  useEffect(() => {
    fetchCourses();
    fetchGrades();
  }, []);

  useEffect(() => {
    if (currentCourseGrade && editingId) {
      form.reset({
        courseId: currentCourseGrade.courseId,
        gradeId: currentCourseGrade.gradeId,
        isCore: currentCourseGrade.isCore,
      });
    } else {
      form.reset({
        courseId: 0,
        gradeId: 0,
        isCore: true,
      });
    }
  }, [currentCourseGrade, editingId, form]);

  const handleSubmit = async (data: FormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Group grades by level
  const gradesByLevel = grades.reduce((acc, grade) => {
    if (!acc[grade.level]) {
      acc[grade.level] = [];
    }
    acc[grade.level].push(grade);
    return acc;
  }, {} as Record<string, typeof grades>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingId ? 'Editar Relación' : 'Nueva Relación Curso-Grado'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un curso" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses
                        .filter(course => course.isActive)
                        .map((course) => (
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
                            .filter(grade => grade.isActive)
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
                    Selecciona el grado a relacionar con el curso
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
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting && (
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
