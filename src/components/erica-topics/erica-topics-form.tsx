// components/erica-topics/erica-topics-form.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Calendar,
  Users,
  GraduationCap,
  Target,
  Package,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  School,
  User,
} from "lucide-react";
import { useEricaTopicsForm } from "@/context/EricaTopicsContext";
import { useSectionList } from "@/context/SectionsContext";
import { useAcademicWeekContext } from "@/context/AcademicWeeksContext";
import { useSchoolCycleContext } from "@/context/SchoolCycleContext";
import { useGradeCycleContext } from "@/context/GradeCycleContext";
import { useCourseAssignmentContext, useTeacherCoursesContext } from "@/context/CourseAssignmentContext";

// Schema actualizado con el nuevo flujo
const topicFormSchema = z.object({
  cycleId: z.coerce.number().min(1, "Selecciona un ciclo"),
  gradeId: z.coerce.number().min(1, "Selecciona un grado"),
  sectionId: z.coerce.number().min(1, "Selecciona una sección"),
  teacherId: z.coerce.number().min(1, "Selecciona un maestro"),
  courseId: z.coerce.number().min(1, "Selecciona un curso"),
  academicWeekId: z.coerce.number().min(1, "Selecciona una semana académica"),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(200),
  description: z.string().max(1000).optional().or(z.literal("")),
  objectives: z.string().max(1000).optional().or(z.literal("")),
  materials: z.string().max(500).optional().or(z.literal("")),
  isActive: z.boolean()
});

type FormValues = z.infer<typeof topicFormSchema>;

interface EricaTopicsFormProps {
  open?: boolean;
  onClose: () => void;
  topicId?: number;
}

export function EricaTopicsForm({ open = true, onClose, topicId }: EricaTopicsFormProps) {
  // Estados locales para el flujo en cascada
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);

  const {
    submitting,
    formMode,
    currentTopic,
    validationResults,
    handleSubmit,
    startEdit,
    startCreate,
    cancelForm,
    validateCreation
  } = useEricaTopicsForm();

  // Contexts principales
  const { activeCycle, activeCycleId } = useSchoolCycleContext();
  const {
    state: { availableGrades, loadingAvailableGrades },
    fetchAvailableGradesForEnrollment
  } = useGradeCycleContext();
  const { sections, loading: sectionsLoading, refetch: refetchSections } = useSectionList();
  const { weeks, isLoading: weeksLoading, refetchAll: refetchWeeks } = useAcademicWeekContext();

  // Context para asignaciones de cursos y maestros
  const { fetchSectionAssignments, state: assignmentState } = useCourseAssignmentContext();
  const {
    teacherCourses,
    loading: loadingTeacherCourses,
    loadTeacherCourses
  } = useTeacherCoursesContext();

  const form = useForm<FormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      cycleId: 0,
      gradeId: 0,
      sectionId: 0,
      teacherId: 0,
      courseId: 0,
      academicWeekId: 0,
      title: "",
      description: "",
      objectives: "",
      materials: "",
      isActive: true,
    },
  });

  // Cargar ciclo activo al abrir el formulario
  useEffect(() => {
    if (open && activeCycleId) {
      console.log('🔍 Ciclo activo detectado:', activeCycleId);
      setSelectedCycle(activeCycleId as number);
      form.setValue('cycleId', activeCycleId as number);
      fetchAvailableGradesForEnrollment(activeCycleId as number);
    }
  }, [open, activeCycleId, form, fetchAvailableGradesForEnrollment]);

  // LOG para debuggear availableGrades
  useEffect(() => {
    console.log('📊 availableGrades cambió:', {
      availableGrades,
      type: typeof availableGrades,
      isArray: Array.isArray(availableGrades),
      length: availableGrades?.length,
      loadingAvailableGrades
    });
  }, [availableGrades, loadingAvailableGrades]);

  // Cargar datos iniciales cuando se abre el formulario
  useEffect(() => {
    if (open) {
      if (sections.length === 0) refetchSections?.();
      if (weeks.length === 0) refetchWeeks?.();
    }
  }, [open, sections.length, weeks.length]);

  // Cargar datos para edición
  useEffect(() => {
    if (topicId && formMode === null) {
      startEdit(topicId);
    } else if (!topicId && formMode === null) {
      startCreate();
    }
  }, [topicId, formMode, startEdit, startCreate]);

  // Llenar formulario con datos del topic actual
  useEffect(() => {
    if (currentTopic && (formMode === 'edit' || formMode === 'duplicate')) {
      const topicSection = sections.find((s: any) => s.id === currentTopic.sectionId);
      const gradeId = topicSection?.grade?.id;

      form.reset({
        cycleId: selectedCycle || (activeCycleId as number),
        gradeId: gradeId || 0,
        sectionId: currentTopic.sectionId,
        teacherId: currentTopic.teacherId,
        courseId: currentTopic.courseId,
        academicWeekId: currentTopic.academicWeekId,
        title: formMode === 'duplicate' ? `${currentTopic.title} (Copia)` : currentTopic.title,
        description: currentTopic.description || "",
        objectives: currentTopic.objectives || "",
        materials: currentTopic.materials || "",
        isActive: currentTopic.isActive,
      });

      setSelectedGrade(gradeId || null);
      setSelectedSection(currentTopic.sectionId);
      setSelectedTeacher(currentTopic.teacherId);
    }
  }, [currentTopic, formMode, form, sections, selectedCycle, activeCycleId]);

  // Validar cuando cambian course, section, week
 // Validar cuando cambian course, section, week (con debounce)
const watchedValues = form.watch(['courseId', 'sectionId', 'academicWeekId']);
useEffect(() => {
  const [courseId, sectionId, academicWeekId] = watchedValues;
  
  if (courseId && courseId > 0 && sectionId && sectionId > 0 && academicWeekId && academicWeekId > 0 && formMode === 'create') {
    const timeoutId = setTimeout(() => {
      validateCreation(courseId, academicWeekId, sectionId);
    }, 300); // Esperar 300ms antes de validar

    return () => clearTimeout(timeoutId);
  }
}, [watchedValues[0], watchedValues[1], watchedValues[2], formMode]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Remover cycleId del objeto antes de enviar (no existe en el backend para EricaTopic)
      const { cycleId, ...submitValues } = values;
      const result = await handleSubmit(submitValues as any);
      if (result.success) {
        form.reset();
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    cancelForm();
    form.reset();
    setSelectedCycle(null);
    setSelectedGrade(null);
    setSelectedSection(null);
    setSelectedTeacher(null);
    onClose();
  };

  // Filtrar secciones por grado seleccionado
  const availableSections = selectedGrade
    ? sections.filter((section: any) => section.grade?.id === selectedGrade)
    : [];

  // Obtener maestros asignados a la sección seleccionada
  const sectionTeachers = selectedSection
    ? assignmentState.assignments
      .filter((assignment: any) => assignment.sectionId === selectedSection)
      .map((assignment: any) => assignment.teacher)
      .filter((teacher: any, index: number, self: any[]) =>
        index === self.findIndex((t: any) => t.id === teacher.id)
      ) // Eliminar duplicados
    : [];

  // Obtener cursos disponibles para el maestro seleccionado en la sección
  const availableCourses = teacherCourses || [];

  const getFormTitle = () => {
    switch (formMode) {
      case 'edit': return 'Editar Tema';
      case 'duplicate': return 'Duplicar Tema';
      default: return 'Nuevo Tema';
    }
  };

  const getFormDescription = () => {
    switch (formMode) {
      case 'edit': return 'Modifica la información del tema existente';
      case 'duplicate': return 'Crea una copia del tema con nuevos parámetros';
      default: return 'Crea un nuevo tema para la planificación académica';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>

      <DialogContent className="min-w-[90vw] w-[90vw] max-w-[90vw] lg:min-w-[80vw] lg:w-[80vw] lg:max-w-[80vw] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">


        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {formMode === 'edit' ? 'Editar Tema' : formMode === 'duplicate' ? 'Duplicar Tema' : 'Nuevo Tema'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {formMode === 'edit'
              ? 'Modifica la información del tema existente'
              : formMode === 'duplicate'
                ? 'Crea una copia del tema con nuevos parámetros'
                : 'Crea un nuevo tema para la planificación académica'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Status indicators */}
        <div className="space-y-3">
          {/* Icon and additional info */}
          <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-blue-700 dark:text-blue-300">Planificación Académica</span>
          </div>

          {/* Validation Status */}
          {formMode === 'create' && (
            <div className="flex items-center space-x-2 p-3 rounded-lg border">
              {validationResults.canCreate ? (
                <div className="flex items-center text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 p-2 rounded">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Validación exitosa
                </div>
              ) : (
                <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 p-2 rounded">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {validationResults.message || "Verifica los datos seleccionados"}
                </div>
              )}
            </div>
          )}

          {/* Mostrar ciclo activo */}
          {activeCycle && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <School className="h-4 w-4" />
              <span>Ciclo Activo: <strong className="text-gray-900 dark:text-gray-100">{activeCycle.name}</strong></span>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Sección: Asignación Académica */}
            <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Asignación Académica</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 1. CICLO (Solo lectura) */}
                <FormField
                  control={form.control}
                  name="cycleId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center space-x-1">
                        <School className="h-4 w-4" />
                        <span>Ciclo Escolar</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2 p-3 bg-muted/50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                          <Badge variant="default" className="bg-blue-600 dark:bg-blue-500 text-white">
                            {activeCycle?.name || "Ciclo Activo"}
                          </Badge>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {activeCycle && new Date(activeCycle.startDate).toLocaleDateString()} - {activeCycle && new Date(activeCycle.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Se usa automáticamente el ciclo escolar activo
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* 2. GRADO (De GradeCycle) */}
                <FormField
                  control={form.control}
                  name="gradeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1">
                        <GraduationCap className="h-4 w-4" />
                        <span>Grado</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const gradeId = parseInt(value);
                          field.onChange(gradeId);
                          setSelectedGrade(gradeId);
                          // Resetear campos dependientes PRIMERO
                          setSelectedSection(null);
                          setSelectedTeacher(null);
                          form.setValue('sectionId', 0);
                          form.setValue('teacherId', 0);
                          form.setValue('courseId', 0);
                        }}
                        value={field.value?.toString() || ""}
                        disabled={submitting || loadingAvailableGrades}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un grado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingAvailableGrades ? (
                            <div className="p-2 text-sm text-muted-foreground">Cargando grados...</div>
                          ) : availableGrades.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">No hay grados disponibles</div>
                          ) : (
                            availableGrades.map((gradeWithSections: any) => (
                              <SelectItem key={gradeWithSections.grade.id} value={gradeWithSections.grade.id.toString()}>
                                <Badge variant="outline" className="mr-2">
                                  {gradeWithSections.grade.name}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  ({(gradeWithSections.sections && gradeWithSections.sections.length) || 0} secciones)
                                </span>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 3. SECCIÓN */}
                {/* 3. SECCIÓN */}
<FormField
  control={form.control}
  name="sectionId"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="flex items-center space-x-1">
        <Users className="h-4 w-4" />
        <span>Sección</span>
      </FormLabel>
      <Select
        onValueChange={async (value) => {
          const sectionId = parseInt(value);
          field.onChange(sectionId);
          setSelectedSection(sectionId);
          // Resetear campos dependientes Y estados locales
          setSelectedTeacher(null); // ← AGREGAR ESTA LÍNEA
          form.setValue('teacherId', 0);
          form.setValue('courseId', 0);
          // Solo cargar maestros si sectionId es válido
          if (sectionId && !isNaN(sectionId)) {
            await fetchSectionAssignments(sectionId);
          }
        }}
        value={field.value?.toString() || ""}
        disabled={!selectedGrade || sectionsLoading || submitting}
      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una sección" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!selectedGrade ? (
                            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">Primero selecciona un grado</div>
                          ) : availableSections.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">No hay secciones disponibles</div>
                          ) : (
                            availableSections.map((section: any, index: number) => (
                              <SelectItem key={section.id || `section-${index}`} value={section.id?.toString() || ""}>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary">
                                    Sección {section.name}
                                  </Badge>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    (Cap: {section.capacity})
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 4. MAESTRO ASIGNADO */}
               {/* 4. MAESTRO ASIGNADO */}
<FormField
  control={form.control}
  name="teacherId"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="flex items-center space-x-1">
        <User className="h-4 w-4" />
        <span>Maestro</span>
      </FormLabel>
      <Select
        onValueChange={async (value) => {
          const teacherId = parseInt(value);
          field.onChange(teacherId);
          setSelectedTeacher(teacherId);
          // Resetear curso
          form.setValue('courseId', 0);
          // Cargar cursos del maestro en esta sección SOLO si ambos valores son válidos
          if (selectedSection && teacherId && !isNaN(teacherId) && !isNaN(selectedSection)) {
            await loadTeacherCourses(teacherId, selectedSection);
          }
        }}
        value={field.value?.toString() || ""}
        disabled={!selectedSection || assignmentState.loading || submitting}
      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un maestro" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!selectedSection ? (
                            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">Primero selecciona una sección</div>
                          ) : sectionTeachers.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">No hay maestros asignados a esta sección</div>
                          ) : (
                            sectionTeachers.map((teacher: any, index: number) => (
                              <SelectItem key={teacher.id || `teacher-${index}`} value={teacher.id?.toString() || ""}>
                                <div className="flex items-center space-x-2">
                                  <span>{teacher.givenNames} {teacher.lastNames}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {assignmentState.assignments.find((a: any) =>
                                      a.teacherId === teacher.id && a.sectionId === selectedSection
                                    )?.assignmentType === 'titular' ? 'Titular' : 'Especialista'}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Solo maestros asignados a la sección seleccionada
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 5. CURSO DEL MAESTRO */}
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>Curso</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ""}
                        disabled={!selectedTeacher || loadingTeacherCourses || submitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un curso" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!selectedTeacher ? (
                            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">Primero selecciona un maestro</div>
                          ) : loadingTeacherCourses ? (
                            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">Cargando cursos...</div>
                          ) : availableCourses.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">No hay cursos asignados a este maestro</div>
                          ) : (
                            availableCourses
                              .filter((course: any) => course?.id) // Filtrar elementos válidos
                              .map((course: any, index: number) => (
                                <SelectItem key={course.id || `course-${index}`} value={course.id?.toString() || ""}>
                                  <div className="flex items-center space-x-2">
                                    <Badge
                                      variant="outline"
                                      style={{
                                        backgroundColor: (course.color || '#6B7280') + '20',
                                        borderColor: course.color || '#6B7280'
                                      }}
                                    >
                                      {course.code}
                                    </Badge>
                                    <span>{course.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {course.assignmentType}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Solo cursos que el maestro puede enseñar en esta sección
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 6. SEMANA ACADÉMICA */}
                <FormField
                  control={form.control}
                  name="academicWeekId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Semana Académica</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ""}
                        disabled={weeksLoading || submitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una semana" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {weeks.length === 0 && weeksLoading ? (
                            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">Cargando semanas...</div>
                          ) : weeks.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">No hay semanas disponibles</div>
                          ) : (
                            weeks.map((week: any, index: number) => (
                              <SelectItem key={week.id || `week-${index}`} value={week.id?.toString() || ""}>
                                <div className="flex flex-col">
                                  <span>Semana {week.number}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Separator />

            {/* Sección: Contenido del Tema */}
            <Card className="border-l-4 border-l-green-500 dark:border-l-green-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>Contenido del Tema</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Título */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del Tema</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Operaciones básicas de suma"
                          {...field}
                          disabled={submitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Nombre descriptivo y claro del tema a enseñar
                      </FormDescription>
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
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción detallada del tema..."
                          rows={3}
                          {...field}
                          disabled={submitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Explicación detallada de qué se va a enseñar
                      </FormDescription>
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
                      <FormLabel>Objetivos de Aprendizaje</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Objetivos específicos que se esperan alcanzar..."
                          rows={3}
                          {...field}
                          disabled={submitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Metas y competencias que el estudiante debe alcanzar
                      </FormDescription>
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
                      <FormLabel className="flex items-center space-x-1">
                        <Package className="h-4 w-4" />
                        <span>Materiales Necesarios</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Lista de materiales, recursos o herramientas necesarias..."
                          rows={2}
                          {...field}
                          disabled={submitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Recursos físicos o digitales requeridos para la clase
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Separator />

            {/* Estado */}
            <Card className="border-l-4 border-l-purple-500 dark:border-l-purple-400">
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Estado del Tema</FormLabel>
                        <FormDescription>
                          Define si el tema está activo y disponible para evaluaciones
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={submitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={submitting}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </Button>

              <Button
                type="submit"
                disabled={submitting || (formMode === 'create' && !validationResults.canCreate)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Save className="h-4 w-4" />
                <span>
                  {submitting ? 'Guardando...' : formMode === 'edit' ? 'Actualizar' : 'Crear Tema'}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}