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
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
 * 📝 Formulario para crear/editar secciones
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
      gradeId: defaultValues?.gradeId?.toString() || '',
      teacherId: defaultValues?.teacherId?.toString() || '',
    },
  });

  const handleSubmit = async (data: SectionFormValues) => {
    const payload: CreateSectionDto = {
      name: data.name.trim(),
      capacity: data.capacity,
      gradeId: parseInt(data.gradeId),
      teacherId: data.teacherId ? parseInt(data.teacherId) : null,
    };
    
    await onSubmit(payload);
  };

  const capacityValue = form.watch('capacity');
  const showCapacityWarning = mode === 'edit' && capacityValue < currentEnrollments;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Nombre de la sección */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 dark:text-white font-semibold">
                Nombre de la Sección *
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ej: A, B, 1-A, etc."
                  disabled={isLoading}
                  className="h-11"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Grado */}
        <FormField
          control={form.control}
          name="gradeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 dark:text-white font-semibold">
                Grado *
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecciona un grado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {grades.map((grade) => (
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

        {/* Capacidad */}
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 dark:text-white font-semibold">
                Capacidad (estudiantes) *
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  max="100"
                  placeholder="30"
                  disabled={isLoading}
                  className="h-11"
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
              {showCapacityWarning && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">
                  ⚠️ La capacidad no puede ser menor que los {currentEnrollments} estudiantes actuales
                </p>
              )}
              {mode === 'edit' && !showCapacityWarning && currentEnrollments > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Estudiantes inscritos actualmente: {currentEnrollments}
                </p>
              )}
            </FormItem>
          )}
        />

        {/* Profesor (opcional) */}
        <FormField
          control={form.control}
          name="teacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 dark:text-white font-semibold">
                Profesor Asignado (Opcional)
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sin profesor asignado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Sin profesor</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.givenNames} {teacher.lastNames}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || showCapacityWarning}
            className="min-w-[100px] bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear Sección' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
