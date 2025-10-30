// src/components/features/academic-weeks/AcademicWeekForm.tsx

'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { WeekType, AcademicMonth, WEEK_TYPE_LABELS, MONTH_LABELS } from '@/types/academic-week.types';
import { getWeekTypeTheme } from '@/config/theme.config';

// Esquema de validación
const academicWeekFormSchema = z.object({
  cycleId: z.number({ required_error: 'El ciclo escolar es requerido' }),
  bimesterId: z.number({ required_error: 'El bimestre es requerido' }),
  number: z.number({ required_error: 'El número de semana es requerido' }).min(1).max(52),
  weekType: z.nativeEnum(WeekType, { required_error: 'El tipo de semana es requerido' }),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  startDate: z.date({ required_error: 'La fecha de inicio es requerida' }),
  endDate: z.date({ required_error: 'La fecha de fin es requerida' }),
  isActive: z.boolean(),
  year: z.number().optional(),
  month: z.nativeEnum(AcademicMonth).optional(),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  },
  {
    message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
    path: ['endDate'],
  }
);

type AcademicWeekFormValues = z.infer<typeof academicWeekFormSchema>;

interface AcademicWeekFormProps {
  initialData?: Partial<AcademicWeekFormValues>;
  onSubmit: (data: AcademicWeekFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode: 'create' | 'edit';
  availableCycles: Array<{ id: number; name: string }>;
  availableBimesters: Array<{ id: number; name: string; number: number }>;
  bimesterDateRange?: { startDate: string; endDate: string } | null;
}

/**
 * 📝 Formulario de creación/edición de Semanas Académicas
 * 
 * Features:
 * - Validación con Zod
 * - Auto-cálculo de año/mes desde fechas
 * - Sugerencia de número de semana
 * - Validación de rangos de fechas contra bimestre
 */
export function AcademicWeekForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode,
  availableCycles,
  availableBimesters,
  bimesterDateRange,
}: AcademicWeekFormProps) {
  const form = useForm<AcademicWeekFormValues>({
    resolver: zodResolver(academicWeekFormSchema),
    defaultValues: {
      cycleId: initialData?.cycleId,
      bimesterId: initialData?.bimesterId,
      number: initialData?.number || 1,
      weekType: initialData?.weekType || WeekType.REGULAR,
      name: initialData?.name || '',
      startDate: initialData?.startDate,
      endDate: initialData?.endDate,
      year: initialData?.year,
      month: initialData?.month,
      notes: initialData?.notes || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const selectedCycleId = form.watch('cycleId');
  const selectedBimesterId = form.watch('bimesterId');
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');

  // Auto-calcular año y mes cuando cambian las fechas
  useEffect(() => {
    if (startDate) {
      const year = startDate.getFullYear();
      const monthIndex = startDate.getMonth();
      const monthKey = Object.keys(MONTH_LABELS)[monthIndex] as AcademicMonth;

      form.setValue('year', year);
      form.setValue('month', monthKey);
    }
  }, [startDate, form]);

  // Validar fechas contra rango del bimestre
  const isDateInBimesterRange = (date: Date | undefined): boolean => {
    if (!date || !bimesterDateRange) return true;

    const bimesterStart = new Date(bimesterDateRange.startDate);
    const bimesterEnd = new Date(bimesterDateRange.endDate);

    return date >= bimesterStart && date <= bimesterEnd;
  };

  const handleSubmit = async (data: AcademicWeekFormValues) => {
    console.log('Submitting form data:', data);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Ciclo Escolar */}
        <FormField
          control={form.control}
          name="cycleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ciclo Escolar *</FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => {
                  field.onChange(parseInt(value));
                  form.setValue('bimesterId', undefined as any); // Reset bimestre
                }}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ciclo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableCycles.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id.toString()}>
                      {cycle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bimestre */}
        <FormField
          control={form.control}
          name="bimesterId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bimestre *</FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
                disabled={isSubmitting || !selectedCycleId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar bimestre" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableBimesters.map((bimester) => (
                    <SelectItem key={bimester.id} value={bimester.id.toString()}>
                      Bimestre {bimester.number} - {bimester.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedCycleId && (
                <FormDescription>Primero selecciona un ciclo escolar</FormDescription>
              )}
              {bimesterDateRange && (
                <FormDescription className="text-blue-600 dark:text-blue-400">
                  📅 Rango: {format(new Date(bimesterDateRange.startDate), 'd MMM', { locale: es })} -{' '}
                  {format(new Date(bimesterDateRange.endDate), 'd MMM yyyy', { locale: es })}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Grid: Número y Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Número de Semana */}
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Semana *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={52}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>1-52</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo de Semana */}
          <FormField
            control={form.control}
            name="weekType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Semana *</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(WEEK_TYPE_LABELS).map(([key, label]) => {
                      const theme = getWeekTypeTheme(key as WeekType);
                      return (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <div className={cn('w-2 h-2 rounded-full', theme.icon)} />
                            {label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Nombre */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input
                  placeholder="ej. Semana de introducción"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>3-100 caracteres</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Grid: Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha Inicio */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Inicio *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value ? (
                          format(field.value, "d 'de' MMMM, yyyy", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date('1900-01-01') ||
                        !isDateInBimesterRange(date)
                      }
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                {!isDateInBimesterRange(field.value) && (
                  <FormDescription className="text-red-600 dark:text-red-400">
                    ⚠️ Fecha fuera del rango del bimestre
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha Fin */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Fin *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value ? (
                          format(field.value, "d 'de' MMMM, yyyy", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date('1900-01-01') ||
                        !isDateInBimesterRange(date) ||
                        (startDate && date < startDate)
                      }
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                {!isDateInBimesterRange(field.value) && (
                  <FormDescription className="text-red-600 dark:text-red-400">
                    ⚠️ Fecha fuera del rango del bimestre
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notas */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notas adicionales sobre esta semana académica..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>Máximo 500 caracteres</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estado Activo */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  className="h-4 w-4 mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Semana activa</FormLabel>
                <FormDescription>
                  Si está activa, esta semana será visible para estudiantes y maestros
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Crear Semana' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default AcademicWeekForm;
