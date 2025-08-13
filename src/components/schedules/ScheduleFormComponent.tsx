"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar, BookOpen, Users } from "lucide-react";
import { useScheduleContext } from "@/context/ScheduleContext";
import { useSectionContext } from "@/context/SectionContext";
import { useCourseContext } from "@/context/CourseContext";
import { useTeacherContext } from "@/context/TeacherContext";
import { TeacherSelector } from "./TeacherSelector";
import { ScheduleFormValues, DayOfWeek, Schedule } from "@/types/schedules";
import { User } from "@/types/user";

// Esquema de validación con Zod
const scheduleSchema = z.object({
  sectionId: z.number().min(1, "Debe seleccionar una sección"),
  courseId: z.number().min(1, "Debe seleccionar un curso"),
  teacherId: z.number().nullable(),
  dayOfWeek: z.number().min(1).max(7) as z.ZodType<DayOfWeek>,
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  classroom: z.string().optional(),
}).refine((data) => {
  // Validación personalizada: hora de inicio debe ser menor que hora de fin
  if (data.startTime && data.endTime) {
    const start = new Date(`2000-01-01T${data.startTime}:00`);
    const end = new Date(`2000-01-01T${data.endTime}:00`);
    return start < end;
  }
  return true;
}, {
  message: "La hora de inicio debe ser menor que la hora de fin",
  path: ["endTime"],
});

interface ScheduleFormComponentProps {
  schedule?: Schedule | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DAYS_OF_WEEK = [
  { value: 1 as DayOfWeek, label: "Lunes" },
  { value: 2 as DayOfWeek, label: "Martes" },
  { value: 3 as DayOfWeek, label: "Miércoles" },
  { value: 4 as DayOfWeek, label: "Jueves" },
  { value: 5 as DayOfWeek, label: "Viernes" },
  { value: 6 as DayOfWeek, label: "Sábado" },
  { value: 7 as DayOfWeek, label: "Domingo" },
];

export function ScheduleFormComponent({ 
  schedule, 
  onSuccess, 
  onCancel 
}: ScheduleFormComponentProps) {
  const { handleSubmit: contextHandleSubmit, form: contextForm } = useScheduleContext();
  const { sections, isLoadingSections: sectionsLoading, sectionsError: sectionsError } = useSectionContext();
  const { courses, isLoadingCourses: coursesLoading, coursesError: coursesError } = useCourseContext();
  const { teachers, isLoading: teachersLoading, error: teachersError } = useTeacherContext();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      sectionId: schedule?.sectionId || 0,
      courseId: schedule?.courseId || 0,
      teacherId: schedule?.teacherId || null,
      dayOfWeek: schedule?.dayOfWeek || 1,
      startTime: schedule?.startTime || "",
      endTime: schedule?.endTime || "",
      classroom: schedule?.classroom || "",
    },
  });

  // Sincronizar con el formulario del contexto si existe
  useEffect(() => {
    if (schedule && contextForm) {
      contextForm.reset({
        sectionId: schedule.sectionId,
        courseId: schedule.courseId,
        teacherId: schedule.teacherId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        classroom: schedule.classroom || "",
      });
    }
  }, [schedule, contextForm]);

  const onSubmit = async (data: ScheduleFormValues) => {
    try {
      if (contextHandleSubmit) {
        await contextHandleSubmit(data);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error al guardar horario:", error);
    }
  };

  const isLoading = sectionsLoading || coursesLoading || teachersLoading;
  const hasErrors = sectionsError || coursesError || teachersError;

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasErrors) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
            Error al cargar los datos necesarios
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {schedule ? "Editar Horario" : "Nuevo Horario"}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sección */}
              <FormField
                control={form.control}
                name="sectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      Sección
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                          <SelectValue placeholder="Seleccionar sección" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/95 backdrop-blur-sm">
                        {sections?.map((section) => (
                          <SelectItem key={section.id} value={section.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {section.name}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Curso */}
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-green-500" />
                      Curso
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                          <SelectValue placeholder="Seleccionar curso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/95 backdrop-blur-sm">
                        {courses?.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Docente */}
              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <p className="h-4 w-4 text-purple-500" >
                      Docente
                      </p>
                    </FormLabel>
                    <TeacherSelector
                      teachers={teachers as User[]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Seleccionar docente"
                      loading={teachersLoading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Día de la semana */}
              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      Día de la semana
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value) as DayOfWeek)}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                          <SelectValue placeholder="Seleccionar día" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/95 backdrop-blur-sm">
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hora de inicio */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      Hora de inicio
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        className="bg-white/80 backdrop-blur-sm border-gray-200/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hora de fin */}
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-500" />
                      Hora de fin
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        className="bg-white/80 backdrop-blur-sm border-gray-200/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Aula */}
              <FormField
                control={form.control}
                name="classroom"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-pink-500" />
                      Aula (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Aula 201, Laboratorio de Ciencias"
                        className="bg-white/80 backdrop-blur-sm border-gray-200/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  className="hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              )}
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Guardando..." : schedule ? "Actualizar" : "Crear"} Horario
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}