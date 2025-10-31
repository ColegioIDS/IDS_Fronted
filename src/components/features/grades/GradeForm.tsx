// src/components/features/grades/GradeForm.tsx

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle, Info, GraduationCap, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CreateGradeDto, EDUCATION_LEVELS } from '@/types/grades.types';

// Esquema de validación
const gradeFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  level: z.string().min(2, 'El nivel es requerido'),
  order: z.coerce
    .number()
    .int('Debe ser un número entero')
    .positive('El orden debe ser un número positivo'),
  isActive: z.boolean(),
});

type GradeFormValues = z.infer<typeof gradeFormSchema>;

interface GradeFormProps {
  initialData?: Partial<GradeFormValues & { id: number }>;
  onSubmit: (data: CreateGradeDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode: 'create' | 'edit';
  suggestedOrder?: number;
}

/**
 * 📝 Formulario de creación/edición de grados
 */
export function GradeForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode,
  suggestedOrder,
}: GradeFormProps) {
  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      level: initialData?.level || '',
      order: initialData?.order || suggestedOrder || 1,
      isActive: initialData?.isActive ?? true,
    },
  });

  const handleSubmit = async (data: GradeFormValues) => {
    const submitData: CreateGradeDto = {
      name: data.name,
      level: data.level,
      order: data.order,
      isActive: data.isActive,
    };

    await onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Nivel Educativo */}
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Nivel Educativo *
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EDUCATION_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                Seleccione el nivel educativo al que pertenece el grado
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nombre del Grado */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Grado *</FormLabel>
              <FormControl>
                <Input
                  placeholder="ej. Primer Grado, 1° de Primaria, etc."
                  className="border-gray-300 dark:border-gray-600"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                Mínimo 2 caracteres, máximo 100
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Orden */}
        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Orden *
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  className="border-gray-300 dark:border-gray-600"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                Determina el orden de visualización (número positivo)
              </FormDescription>
              {suggestedOrder && mode === 'create' && (
                <div className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md px-3 py-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Orden sugerido: {suggestedOrder}</span>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estado Activo */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Grado Activo</FormLabel>
                <FormDescription>
                  Si está marcado, el grado estará disponible para ser usado en el sistema
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Información de validación */}
        {mode === 'create' && (
          <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Información importante
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                El nombre del grado debe ser único en el sistema. Asegúrese de usar un nombre descriptivo.
              </p>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-gray-300 dark:border-gray-600"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Crear Grado' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default GradeForm;
