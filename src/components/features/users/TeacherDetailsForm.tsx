'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TeacherDetails, UpdateTeacherDetailsDto } from '@/types/users.types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  BookOpen,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
  Users,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';

// Validation schema
const updateTeacherDetailsSchema = z.object({
  hiredDate: z.date().optional(),
  isHomeroomTeacher: z.boolean().optional(),
  academicDegree: z.string().optional().nullable(),
});

type UpdateTeacherDetailsFormData = z.infer<typeof updateTeacherDetailsSchema>;

interface TeacherDetailsFormProps {
  teacherDetails?: TeacherDetails | null;
  userId: number;
  isLoading?: boolean;
  onSubmit: (data: UpdateTeacherDetailsDto) => Promise<void>;
  onCancel?: () => void;
}

export function TeacherDetailsForm({
  teacherDetails,
  userId,
  isLoading,
  onSubmit,
  onCancel,
}: TeacherDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateTeacherDetailsFormData>({
    resolver: zodResolver(updateTeacherDetailsSchema),
    defaultValues: {
      hiredDate: teacherDetails?.hiredDate ? new Date(teacherDetails.hiredDate) : undefined,
      isHomeroomTeacher: teacherDetails?.isHomeroomTeacher,
      academicDegree: teacherDetails?.academicDegree || undefined,
    },
  });

  const handleFormSubmit = async (data: UpdateTeacherDetailsFormData) => {
    setIsSubmitting(true);
    try {
      // Convert date to ISO format if provided
      const cleanData: UpdateTeacherDetailsDto = {
        ...(data.hiredDate && { hiredDate: data.hiredDate.toISOString() }),
        isHomeroomTeacher: data.isHomeroomTeacher,
        ...(data.academicDegree && { academicDegree: data.academicDegree }),
      };

      await onSubmit(cleanData);
      toast.success('Detalles del docente actualizados correctamente');
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Header */}
        <Card className="border border-emerald-200/30 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/50 to-emerald-50/30 dark:from-emerald-950/20 dark:to-emerald-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <GraduationCap className="w-5 h-5" />
              Detalles del Docente
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Información profesional y académica del maestro
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Employment Information */}
        <Card className="border border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Información de Empleo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="hiredDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-slate-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Fecha de Contratación
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading || isSubmitting}
                      placeholder="Seleccionar fecha de contratación"
                    />
                  </FormControl>
                  <FormDescription className="dark:text-slate-400">
                    La fecha se estableció automáticamente al crear el usuario
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card className="border border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              Información Académica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="academicDegree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-slate-300 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-500" />
                    Grado Académico
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="ej: Licenciatura, Maestría"
                      disabled={isLoading || isSubmitting}
                      className="dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-white dark:placeholder-slate-400 transition-all duration-300"
                    />
                  </FormControl>
                  <FormDescription className="dark:text-slate-400">
                    Especifica el grado académico más alto del docente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Classroom Role */}
        <Card className="border border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Rol en el Aula
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Is Homeroom Teacher */}
            <FormField
              control={form.control}
              name="isHomeroomTeacher"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border border-indigo-200/30 dark:border-indigo-800/30 rounded-lg bg-gradient-to-br from-indigo-50/50 to-indigo-50/30 dark:from-indigo-950/20 dark:to-indigo-950/10">
                  <div className="space-y-0.5">
                    <FormLabel className="dark:text-slate-300 font-semibold">
                      ¿Es maestro guía/director de grado?
                    </FormLabel>
                    <FormDescription className="dark:text-slate-400">
                      {field.value ? 'Sí, es maestro guía' : 'No es maestro guía'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isLoading || isSubmitting}
                      className="w-6 h-6 rounded dark:bg-slate-800 dark:border-slate-600 cursor-pointer transition-all duration-300"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert className="border border-emerald-200/50 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="dark:text-slate-300 text-slate-700">
            <strong>Nota:</strong> Los detalles del docente se crean automáticamente cuando un usuario se asigna el rol de TEACHER.
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-slate-200/30 dark:border-slate-700/30">
          <Button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
              className="flex-1 h-11 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300/80 dark:hover:border-slate-600/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 font-bold transition-all duration-300 rounded-lg"
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
