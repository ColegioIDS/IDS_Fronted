// src/components/features/erica-topics/EricaTopicForm.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Type,
  FileText,
  Target,
  Package,
  Power,
  CheckCircle2,
  Save,
  User,
  Lock,
} from 'lucide-react';
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
import { ericaTopicsService, EricaCascadeError } from '@/services/erica-topics.service';
import { 
  EricaCascadeDataResponse, 
  EricaSection, 
  EricaCourseAssignment,
  EricaCascadeErrorCode 
} from '@/types/erica-topics.types';
import { EmptyState } from '@/components/shared/EmptyState';

const ericaTopicSchema = z.object({
  courseId: z.string().min(1, 'Debe seleccionar un curso'),
  academicWeekId: z.string().min(1, 'Debe seleccionar una semana'),
  sectionId: z.string().min(1, 'Debe seleccionar una sección'),
  teacherId: z.string().min(1, 'Debe seleccionar un docente'),
  title: z.string().min(1, 'Título es requerido').max(255, 'Máximo 255 caracteres'),
  weekTheme: z.string().min(1, 'Tema de la semana es requerido').max(255, 'Máximo 255 caracteres'),
  description: z.string().optional(),
  objectives: z.string().optional(),
  materials: z.string().optional(),
  isActive: z.boolean().default(true),
  isCompleted: z.boolean().default(false),
});

interface EricaTopicFormProps {
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
  defaultValues?: {
    courseId?: number | string;
    academicWeekId?: number | string;
    sectionId?: number | string;
    teacherId?: number | string;
    title?: string;
    weekTheme?: string;
    description?: string;
    objectives?: string;
    materials?: string;
    isActive?: boolean;
    isCompleted?: boolean;
  };
}

export function EricaTopicForm({
  onSubmit,
  loading = false,
  isEdit = false,
  defaultValues,
}: EricaTopicFormProps) {
  const [cascadeData, setCascadeData] = useState<EricaCascadeDataResponse | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<EricaCascadeErrorCode | null>(null);
  
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedCourseAssignment, setSelectedCourseAssignment] = useState<EricaCourseAssignment | null>(null);
  const [initialized, setInitialized] = useState(false);

  const formDefaultValues = useMemo(() => ({
    courseId: defaultValues?.courseId?.toString() || '',
    academicWeekId: defaultValues?.academicWeekId?.toString() || '',
    sectionId: defaultValues?.sectionId?.toString() || '',
    teacherId: defaultValues?.teacherId?.toString() || '',
    title: defaultValues?.title || '',
    weekTheme: defaultValues?.weekTheme || '',
    description: defaultValues?.description || '',
    objectives: defaultValues?.objectives || '',
    materials: defaultValues?.materials || '',
    isActive: defaultValues?.isActive ?? true,
    isCompleted: defaultValues?.isCompleted ?? false,
  }), [defaultValues]);

  const form = useForm<any>({
    resolver: zodResolver(ericaTopicSchema),
    defaultValues: formDefaultValues,
  });

  useEffect(() => {
    const loadCascadeData = async () => {
      try {
        setLoadingData(true);
        setDataError(null);
        setErrorCode(null);
        const data = await ericaTopicsService.getCascadeData();
        setCascadeData(data);
      } catch (error) {
        if (error instanceof EricaCascadeError) {
          setDataError(error.message);
          setErrorCode(error.code);
        } else if (error instanceof Error) {
          setDataError(error.message);
          setErrorCode('UNKNOWN');
        } else {
          setDataError('Error al cargar datos académicos');
          setErrorCode('UNKNOWN');
        }
      } finally {
        setLoadingData(false);
      }
    };
    loadCascadeData();
  }, []);

  useEffect(() => {
    if (!cascadeData || !isEdit || !defaultValues || initialized) return;

    const sectionId = defaultValues.sectionId;
    const courseId = defaultValues.courseId;

    if (sectionId) {
      for (const [gradeId, sectionsArray] of Object.entries(cascadeData.gradesSections)) {
        const section = sectionsArray.find((s: EricaSection) => s.id === Number(sectionId));
        if (section) {
          setSelectedGrade(Number(gradeId));
          setSelectedSection(Number(sectionId));
          
          if (section.courseAssignments && courseId) {
            const assignment = section.courseAssignments.find(
              (ca: EricaCourseAssignment) => ca.course.id === Number(courseId)
            );
            if (assignment) {
              setSelectedCourseAssignment(assignment);
            }
          }
          break;
        }
      }
    }
    setInitialized(true);
  }, [cascadeData, isEdit, defaultValues, initialized]);

  const sections = useMemo(() => {
    if (!selectedGrade || !cascadeData) return [];
    return cascadeData.gradesSections[selectedGrade.toString()] || [];
  }, [selectedGrade, cascadeData]);

  const currentSection = useMemo(() => {
    if (!selectedSection) return null;
    return sections.find(s => s.id === selectedSection) || null;
  }, [selectedSection, sections]);

  const courseAssignments = useMemo(() => {
    if (!currentSection) return [];
    return currentSection.courseAssignments || [];
  }, [currentSection]);

  const handleGradeChange = (gradeId: string) => {
    if (!gradeId || gradeId === '') return;
    const gradeIdNum = parseInt(gradeId);
    if (isNaN(gradeIdNum)) return;
    
    setSelectedGrade(gradeIdNum);
    setSelectedSection(null);
    setSelectedCourseAssignment(null);
    form.setValue('sectionId', '');
    form.setValue('courseId', '');
    form.setValue('teacherId', '');
  };

  const handleSectionChange = (sectionId: string) => {
    if (!sectionId || sectionId === '') return;
    const sectionIdNum = parseInt(sectionId);
    if (isNaN(sectionIdNum)) return;
    
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
      const submitData = {
        ...values,
        courseId: parseInt(values.courseId),
        academicWeekId: parseInt(values.academicWeekId),
        sectionId: parseInt(values.sectionId),
        teacherId: parseInt(values.teacherId),
      };
      await onSubmit(submitData);
    } catch (error) {
    }
  };

  if (loadingData) {
    return (
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Cargando datos académicos...</p>
        </CardContent>
      </Card>
    );
  }

  if (dataError) {
    const errorMap: Record<string, 'no-active-cycle' | 'no-active-bimester' | 'no-weeks' | 'no-grades' | 'no-courses'> = {
      'NO_ACTIVE_CYCLE': 'no-active-cycle',
      'NO_ACTIVE_BIMESTER': 'no-active-bimester',
      'NO_WEEKS': 'no-weeks',
      'NO_GRADES': 'no-grades',
      'NO_COURSES': 'no-courses',
    };
    const emptyStateType = errorCode ? errorMap[errorCode] : undefined;
    
    return (
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardContent className="p-6">
          {emptyStateType ? <EmptyState type={emptyStateType} /> : <EmptyState type="error" message={dataError} />}
        </CardContent>
      </Card>
    );
  }

  if (!cascadeData) {
    return (
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardContent className="p-6">
          <EmptyState type="no-data" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Sección: Información Académica */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Información Académica
              {isEdit && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Solo lectura
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Grado, Sección, Curso */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Grado */}
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300">
                  Grado
                </FormLabel>
                <Select 
                  value={selectedGrade?.toString() || ''} 
                  onValueChange={handleGradeChange}
                  disabled={isEdit}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                    <SelectValue placeholder="Seleccionar grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {cascadeData.grades.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id.toString()}>
                        {grade.name} ({grade.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              {/* Sección */}
              <FormField
                control={form.control}
                name="sectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">
                      Sección
                    </FormLabel>
                    <Select 
                      value={field.value?.toString() || ''} 
                      onValueChange={handleSectionChange}
                      disabled={isEdit || !selectedGrade}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                          <SelectValue placeholder={!selectedGrade ? "Seleccione grado" : "Seleccionar sección"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={section.id.toString()}>
                            Sección {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Curso */}
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300">
                  Curso
                </FormLabel>
                <Select 
                  value={selectedCourseAssignment?.id.toString() || ''} 
                  onValueChange={handleCourseAssignmentChange}
                  disabled={isEdit || !selectedSection}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                    <SelectValue placeholder={!selectedSection ? "Seleccione sección" : "Seleccionar curso"} />
                  </SelectTrigger>
                  <SelectContent>
                    {courseAssignments.map((ca) => (
                      <SelectItem key={ca.id} value={ca.id.toString()}>
                        {ca.course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isEdit && form.formState.errors.courseId && (
                  <p className="text-sm text-red-500 mt-1">Debe seleccionar un curso</p>
                )}
              </FormItem>
            </div>

            {/* Info del docente asignado */}
            {selectedCourseAssignment && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 overflow-hidden">
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <User className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-900 dark:text-blue-100 flex-shrink-0">Docente:</span>
                  <span className="text-blue-800 dark:text-blue-200 truncate">
                    {selectedCourseAssignment.teacher.givenNames} {selectedCourseAssignment.teacher.lastNames}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm min-w-0 mt-1.5">
                  <BookOpen className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-900 dark:text-blue-100 flex-shrink-0">Curso:</span>
                  <span className="text-blue-800 dark:text-blue-200 truncate">
                    {selectedCourseAssignment.course.name}
                  </span>
                </div>
              </div>
            )}

            {/* Hidden fields */}
            <input type="hidden" {...form.register('courseId')} />
            <input type="hidden" {...form.register('teacherId')} />

            {/* Semana Académica */}
            <FormField
              control={form.control}
              name="academicWeekId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4" />
                    Semana Académica
                    {isEdit && <Lock className="w-3 h-3 text-slate-400" />}
                  </FormLabel>
                  {cascadeData.activeBimester && (
                    <FormDescription>{cascadeData.activeBimester.name}</FormDescription>
                  )}
                  <Select 
                    value={field.value?.toString() || ''} 
                    onValueChange={(val) => field.onChange(val)}
                    disabled={isEdit}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                        <SelectValue placeholder="Seleccionar semana" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cascadeData.weeks.map((week) => (
                        <SelectItem key={week.id} value={week.id.toString()}>
                          Semana {week.number} ({new Date(week.startDate).toLocaleDateString('es-ES')} - {new Date(week.endDate).toLocaleDateString('es-ES')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Sección: Contenido del Tema */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Contenido del Tema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Type className="w-4 h-4" />
                    Título del Tema
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Introducción a las Fracciones" 
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tema de la Semana */}
            <FormField
              control={form.control}
              name="weekTheme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <BookOpen className="w-4 h-4" />
                    Tema de la Semana
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Operaciones con Fracciones" 
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormDescription>Contexto temático para la evaluación ERICA</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <FileText className="w-4 h-4" />
                    Descripción
                    <span className="text-slate-400 text-xs font-normal">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción detallada del tema..."
                      className="min-h-[100px] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Objetivos */}
            <FormField
              control={form.control}
              name="objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Target className="w-4 h-4" />
                    Objetivos de Aprendizaje
                    <span className="text-slate-400 text-xs font-normal">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="• Objetivo 1&#10;• Objetivo 2&#10;• Objetivo 3"
                      className="min-h-[100px] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Materiales */}
            <FormField
              control={form.control}
              name="materials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Package className="w-4 h-4" />
                    Materiales y Recursos
                    <span className="text-slate-400 text-xs font-normal">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Libros, capítulos, enlaces, materiales didácticos..."
                      className="min-h-[100px] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Sección: Estado */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <Power className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Estado del Tema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estado Activo */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Power className="w-4 h-4" />
                      Estado
                    </FormLabel>
                    <Select 
                      value={field.value ? 'true' : 'false'} 
                      onValueChange={(v) => field.onChange(v === 'true')}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
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

              {/* Completado (solo en edición) */}
              {isEdit && (
                <FormField
                  control={form.control}
                  name="isCompleted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4" />
                        Completado
                      </FormLabel>
                      <Select 
                        value={field.value ? 'true' : 'false'} 
                        onValueChange={(v) => field.onChange(v === 'true')}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
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
          </CardContent>
        </Card>

        {/* Botón Submit */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEdit ? 'Guardando...' : 'Creando...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Guardar Cambios' : 'Crear Tema'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
