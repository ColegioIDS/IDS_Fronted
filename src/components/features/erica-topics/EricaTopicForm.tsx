// src/components/features/erica-topics/EricaTopicForm.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { cascadeDataService } from '@/services/cascade-data.service';
import { CascadeDataResponse, Section, CourseAssignment } from '@/types/cascade-data.types';
import { CascadeDataError, CascadeErrorCode } from '@/utils/cascade-data-error';
import { EmptyState } from '@/components/shared/EmptyState';

const ericaTopicSchema = z.object({
  courseId: z.string().pipe(z.coerce.number().positive('Debe seleccionar un curso')),
  academicWeekId: z.string().pipe(z.coerce.number().positive('Debe seleccionar una semana')),
  sectionId: z.string().pipe(z.coerce.number().positive('Debe seleccionar una sección')),
  teacherId: z.string().pipe(z.coerce.number().positive('Debe seleccionar un docente')),
  title: z.string().min(1, 'Título es requerido').max(255, 'Máximo 255 caracteres'),
  weekTheme: z.string().min(1, 'Tema de la semana es requerido').max(255, 'Máximo 255 caracteres'),
  description: z.string().optional(),
  objectives: z.string().optional(),
  materials: z.string().optional(),
  isActive: z.boolean().default(true),
  isCompleted: z.boolean().default(false),
});

type EricaTopicFormValues = z.infer<typeof ericaTopicSchema>;

interface EricaTopicFormProps {
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
  defaultValues?: Partial<EricaTopicFormValues>;
}

export function EricaTopicForm({
  onSubmit,
  loading = false,
  isEdit = false,
  defaultValues,
}: EricaTopicFormProps) {
  const [cascadeData, setCascadeData] = useState<CascadeDataResponse | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<CascadeErrorCode | null>(null);
  
  // Estados para selección en cascada
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedCourseAssignment, setSelectedCourseAssignment] = useState<CourseAssignment | null>(null);

  const form = useForm<any>({
    resolver: zodResolver(ericaTopicSchema),
    defaultValues: {
      isActive: true,
      isCompleted: false,
      ...defaultValues,
    },
  });

  // Cargar datos en cascada
  useEffect(() => {
    const loadCascadeData = async () => {
      try {
        setLoadingData(true);
        setDataError(null);
        setErrorCode(null);
        const data = await cascadeDataService.getAllCascadeData();
        setCascadeData(data);
      } catch (error) {
        if (error instanceof CascadeDataError) {
          setDataError(error.message);
          setErrorCode(error.code);
        } else if (error instanceof Error) {
          setDataError(error.message);
          setErrorCode('UNKNOWN');
        } else {
          setDataError('Error al cargar datos académicos');
          setErrorCode('UNKNOWN');
        }
        console.error('[EricaTopicForm] Error loading cascade data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadCascadeData();
  }, []);

  // Obtener secciones del grado seleccionado
  const sections = useMemo(() => {
    if (!selectedGrade || !cascadeData) return [];
    return cascadeData.gradesSections[selectedGrade.toString()] || [];
  }, [selectedGrade, cascadeData]);

  // Obtener la sección seleccionada
  const currentSection = useMemo(() => {
    if (!selectedSection) return null;
    return sections.find(s => s.id === selectedSection) || null;
  }, [selectedSection, sections]);

  // Obtener cursos de la sección seleccionada
  const courseAssignments = useMemo(() => {
    if (!currentSection) return [];
    return currentSection.courseAssignments || [];
  }, [currentSection]);

  // Handlers para cambios en cascada
  const handleGradeChange = (gradeId: string) => {
    const gradeIdNum = parseInt(gradeId);
    setSelectedGrade(gradeIdNum);
    setSelectedSection(null);
    setSelectedCourseAssignment(null);
    // Reset form values
    form.setValue('sectionId', '');
    form.setValue('courseId', '');
    form.setValue('teacherId', '');
  };

  const handleSectionChange = (sectionId: string) => {
    const sectionIdNum = parseInt(sectionId);
    setSelectedSection(sectionIdNum);
    setSelectedCourseAssignment(null);
    form.setValue('sectionId', sectionId);
    form.setValue('courseId', '');
    form.setValue('teacherId', '');
  };

  const handleCourseAssignmentChange = (assignmentId: string) => {
    const assignment = courseAssignments.find(ca => ca.id.toString() === assignmentId);
    if (assignment) {
      setSelectedCourseAssignment(assignment);
      form.setValue('courseId', assignment.course.id.toString());
      form.setValue('teacherId', assignment.teacher.id.toString());
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (loadingData) {
    return (
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          <span className="ml-2 text-slate-600 dark:text-slate-400">
            Cargando datos académicos...
          </span>
        </div>
      </Card>
    );
  }

  if (dataError) {
    // ✅ Detectar tipo de error usando errorCode directamente
    if (errorCode === 'NO_ACTIVE_CYCLE') {
      return (
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <EmptyState type="no-active-cycle" />
        </Card>
      );
    }
    if (errorCode === 'NO_ACTIVE_BIMESTER') {
      return (
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <EmptyState type="no-active-bimester" />
        </Card>
      );
    }
    if (errorCode === 'NO_WEEKS') {
      return (
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <EmptyState type="no-weeks" />
        </Card>
      );
    }
    if (errorCode === 'NO_GRADES') {
      return (
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <EmptyState type="no-grades" />
        </Card>
      );
    }
    if (errorCode === 'NO_COURSES') {
      return (
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <EmptyState type="no-courses" />
        </Card>
      );
    }

    return (
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <EmptyState type="error" message={dataError} />
      </Card>
    );
  }

  if (!cascadeData) {
    return (
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <EmptyState type="no-data" />
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Selección en cascada: Grado → Sección → Curso (con Docente) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Grado */}
            <FormField
              control={form.control}
              name="gradeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grado</FormLabel>
                  <Select value={selectedGrade?.toString() || ''} onValueChange={handleGradeChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cascadeData.grades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id.toString()}>
                          {grade.name} ({grade.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sección */}
            <FormField
              control={form.control}
              name="sectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sección</FormLabel>
                  <Select 
                    value={field.value?.toString() || ''} 
                    onValueChange={handleSectionChange}
                    disabled={!selectedGrade}
                  >
                    <FormControl>
                      <SelectTrigger disabled={!selectedGrade || sections.length === 0}>
                        <SelectValue placeholder={
                          !selectedGrade 
                            ? "Seleccione un grado" 
                            : sections.length === 0 
                              ? "Sin secciones" 
                              : "Seleccionar sección"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sections.length > 0 ? (
                        sections.map((section) => (
                          <SelectItem key={section.id} value={section.id.toString()}>
                            Sección {section.name} {section.teacher ? `(${section.teacher.givenNames} ${section.teacher.lastNames})` : ''}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          {selectedGrade ? 'Sin secciones para este grado' : 'Seleccione un grado'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedGrade && sections.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Sin secciones para este grado.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Curso y Docente (viene de courseAssignments) */}
            <FormItem>
              <FormLabel>Curso y Docente</FormLabel>
              <Select 
                value={selectedCourseAssignment?.id.toString() || ''} 
                onValueChange={handleCourseAssignmentChange}
                disabled={!selectedSection}
              >
                <SelectTrigger disabled={!selectedSection || courseAssignments.length === 0}>
                  <SelectValue placeholder={
                    !selectedSection 
                      ? "Seleccione una sección" 
                      : courseAssignments.length === 0 
                        ? "Sin cursos asignados" 
                        : "Seleccionar curso"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {courseAssignments.length > 0 ? (
                    courseAssignments.map((ca) => (
                      <SelectItem key={ca.id} value={ca.id.toString()}>
                        {ca.course.name} - {ca.teacher.givenNames} {ca.teacher.lastNames}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>
                      {selectedSection ? 'Sin cursos asignados a esta sección' : 'Seleccione una sección'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {selectedSection && courseAssignments.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Esta sección no tiene cursos asignados.
                </p>
              )}
            </FormItem>
          </div>

          {/* Información seleccionada (readonly) */}
          {selectedCourseAssignment && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Curso:</strong> {selectedCourseAssignment.course.name} ({selectedCourseAssignment.course.code})
                <br />
                <strong>Docente:</strong> {selectedCourseAssignment.teacher.givenNames} {selectedCourseAssignment.teacher.lastNames}
                {selectedCourseAssignment.teacher.email && (
                  <> - {selectedCourseAssignment.teacher.email}</>
                )}
              </p>
            </div>
          )}

          {/* Hidden fields for courseId and teacherId */}
          <input type="hidden" {...form.register('courseId')} />
          <input type="hidden" {...form.register('teacherId')} />

          {/* Semana Académica */}
          <FormField
            control={form.control}
            name="academicWeekId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semana Académica</FormLabel>
                <FormDescription>
                  {cascadeData.activeBimester?.name || 'Sin bimestre activo'}
                </FormDescription>
                <Select value={field.value?.toString() || ''} onValueChange={(val) => field.onChange(val)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar semana" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cascadeData.weeks.length > 0 ? (
                      cascadeData.weeks.map((week) => (
                        <SelectItem key={week.id} value={week.id.toString()}>
                          Semana {week.number} ({new Date(week.startDate).toLocaleDateString('es-ES')} - {new Date(week.endDate).toLocaleDateString('es-ES')})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="empty" disabled>
                        Sin semanas disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contenido Principal */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título del Tema" {...field} />
                </FormControl>
                <FormMessage />

              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weekTheme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tema de la Semana</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Sumas y Restas" {...field} />
                </FormControl>
                <FormDescription>
                  Describe el contexto temático principal de evaluación ERICA
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contenido Opcional */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Descripción detallada del tema..."
                    className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:placeholder:text-slate-600"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="objectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objetivos de Aprendizaje</FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Objetivos que deben alcanzar los estudiantes..."
                    className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:placeholder:text-slate-600"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="materials"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Materiales y Recursos</FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Libros, capítulos, enlaces, etc..."
                    className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:placeholder:text-slate-600"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select value={field.value ? 'true' : 'false'} onValueChange={(v: string) => field.onChange(v === 'true')}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEdit && (
              <FormField
                control={form.control}
                name="isCompleted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completado</FormLabel>
                    <Select value={field.value ? 'true' : 'false'} onValueChange={(v: string) => field.onChange(v === 'true')}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Sí</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Actualizar Tema' : 'Crear Tema'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
