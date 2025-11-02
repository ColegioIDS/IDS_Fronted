// src/components/features/sections/SectionForm.tsx

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSectionSchema } from '@/schemas/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  School, 
  Users, 
  GraduationCap, 
  UserCheck, 
  Save, 
  X,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CreateSectionDto, UpdateSectionDto } from '@/types/sections.types';
import { z } from 'zod';

type SectionFormValues = z.infer<typeof createSectionSchema>;

interface SectionFormProps {
  defaultValues?: Partial<CreateSectionDto>;
  onSubmit: (data: CreateSectionDto | UpdateSectionDto) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  grades?: Array<{ id: number; name: string; level: string }>;
  teachers?: Array<{ id: number; givenNames: string; lastNames: string }>;
  currentEnrollments?: number;
}

/**
 * Formulario para crear/editar secciones
 */
export function SectionForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  grades = [],
  teachers = [],
  currentEnrollments = 0,
}: SectionFormProps) {
  const form = useForm<SectionFormValues>({
    resolver: zodResolver(createSectionSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      capacity: defaultValues?.capacity || 30,
      gradeId: defaultValues?.gradeId ? defaultValues.gradeId.toString() : '',
      teacherId: defaultValues?.teacherId ? defaultValues.teacherId.toString() : undefined,
    },
  });

  const handleSubmit = async (data: SectionFormValues) => {
    const payload: CreateSectionDto | UpdateSectionDto = {
      name: data.name.trim(),
      capacity: Number(data.capacity),
      gradeId: Number(data.gradeId),
      teacherId: data.teacherId ? Number(data.teacherId) : undefined,
    };
    
    await onSubmit(payload);
  };

  const capacityValue = form.watch('capacity');
  const showCapacityWarning = mode === 'edit' && capacityValue < currentEnrollments;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header Card */}
        <Card className="border-2 border-fuchsia-200 dark:border-fuchsia-800">
          <CardHeader className="bg-fuchsia-50 dark:bg-fuchsia-950/30 border-b-2 border-fuchsia-200 dark:border-fuchsia-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/50 border-2 border-fuchsia-300 dark:border-fuchsia-700">
                <School className="w-6 h-6 text-fuchsia-700 dark:text-fuchsia-300" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {mode === 'create' ? 'Crear Nueva Sección' : 'Editar Sección'}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
                <Hash className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Información Básica
                </h3>
              </div>

              {/* Nombre de la sección */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <School className="w-4 h-4" />
                      Nombre de la Sección *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ej: A, B, 1-A, 2-B, etc."
                        disabled={isLoading}
                        className="h-12 text-base border-2 focus:border-fuchsia-400 dark:focus:border-fuchsia-600"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                      Identificador único de la sección (1-100 caracteres)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Capacidad */}
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Capacidad Máxima *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        max="100"
                        disabled={isLoading}
                        className="h-12 text-base border-2 focus:border-fuchsia-400 dark:focus:border-fuchsia-600"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                      Número máximo de estudiantes permitidos (1-100)
                    </FormDescription>
                    <FormMessage />
                    
                    {showCapacityWarning && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          La capacidad no puede ser menor a {currentEnrollments} (estudiantes actuales matriculados)
                        </AlertDescription>
                      </Alert>
                    )}
                  </FormItem>
                )}
              />
            </div>

            {/* Asignaciones */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
                <GraduationCap className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Asignaciones
                </h3>
              </div>

              {/* Grado - Ancho completo */}
              <FormField
                control={form.control}
                name="gradeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Grado *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base border-2 hover:border-fuchsia-300 dark:hover:border-fuchsia-700">
                          <SelectValue placeholder="Selecciona un grado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {grades.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No hay grados disponibles
                          </div>
                        ) : (
                          grades.map((grade) => (
                            <SelectItem 
                              key={grade.id} 
                              value={grade.id.toString()}
                              className="text-base py-3"
                            >
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <span className="font-medium">{grade.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({grade.level})
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                      Selecciona el grado al que pertenece esta sección
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Profesor - Ancho completo */}
              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Profesor Asignado (Opcional)
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value === "none" ? undefined : value);
                      }}
                      value={field.value || "none"}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base border-2 hover:border-fuchsia-300 dark:hover:border-fuchsia-700">
                          <SelectValue placeholder="Sin profesor asignado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none" className="text-base py-3">
                          <div className="flex items-center gap-2">
                            <X className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">Sin profesor</span>
                          </div>
                        </SelectItem>
                        {teachers.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No hay profesores disponibles
                          </div>
                        ) : (
                          teachers.map((teacher) => (
                            <SelectItem 
                              key={teacher.id} 
                              value={teacher.id.toString()}
                              className="text-base py-3"
                            >
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                <span className="font-medium">
                                  {teacher.givenNames} {teacher.lastNames}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                      Profesor titular que guiará esta sección
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-800">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="h-12 px-6 text-base border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 mr-2" />
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 px-8 text-base bg-fuchsia-600 hover:bg-fuchsia-700 text-white border-2 border-fuchsia-700 dark:border-fuchsia-500"
          >
            <Save className="w-5 h-5 mr-2" />
            {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear Sección' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
