// src/components/features/holidays/HolidayForm.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Loader2, AlertCircle, Info, BookOpen, Coffee, Umbrella } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CreateHolidayDto, BimesterForHoliday } from '@/types/holidays.types';
import { useHolidayCycles } from '@/hooks/data/useHolidayCycles';
import { useHolidayBimesters } from '@/hooks/data/useHolidayBimesters';
import { useHolidayBreakWeeks } from '@/hooks/data/useHolidayBreakWeeks';
import { holidaysService } from '@/services/holidays.service';
import { isDateInRange as isDateInRangeUtil } from '@/utils/dateUtils';

// Esquema de validación
const holidayFormSchema = z.object({
  cycleId: z.number({ required_error: 'El ciclo escolar es requerido' }),
  bimesterId: z.number({ required_error: 'El bimestre es requerido' }),
  date: z.date({ required_error: 'La fecha es requerida' }),
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),
  isRecovered: z.boolean(),
});

type HolidayFormValues = z.infer<typeof holidayFormSchema>;

interface HolidayFormProps {
  initialData?: Partial<HolidayFormValues & { id: number }>;
  onSubmit: (data: CreateHolidayDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode: 'create' | 'edit';
}

/**
 * 📝 Formulario de creación/edición de días festivos
 */
export function HolidayForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode,
}: HolidayFormProps) {
  const [selectedBimester, setSelectedBimester] = useState<BimesterForHoliday | null>(null);

  const { cycles, isLoading: loadingCycles, error: cyclesError } = useHolidayCycles();
  
  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: {
      cycleId: initialData?.cycleId,
      bimesterId: initialData?.bimesterId,
      date: initialData?.date,
      description: initialData?.description || '',
      isRecovered: initialData?.isRecovered ?? false,
    },
  });

  const selectedCycleId = form.watch('cycleId');
  const selectedBimesterId = form.watch('bimesterId');
  const selectedDate = form.watch('date');

  const { bimesters, isLoading: loadingBimesters, error: bimestersError } = useHolidayBimesters(selectedCycleId);
  const { breakWeeks, isDateInBreak, error: breakWeeksError } = useHolidayBreakWeeks(selectedCycleId, selectedBimesterId);

  // Actualizar bimestre seleccionado
  useEffect(() => {
    if (selectedBimesterId && Array.isArray(bimesters) && bimesters.length > 0) {
      const bimester = bimesters.find(b => b.id === selectedBimesterId);
      setSelectedBimester(bimester || null);
    } else {
      setSelectedBimester(null);
    }
  }, [selectedBimesterId, bimesters]);

  // Validar si una fecha está dentro del rango del bimestre (comparación YYYY-MM-DD)
  const isDateInBimesterRange = (date: Date | undefined): boolean => {
    if (!date || !selectedBimester) return true;
    
    // Convertir date a string YYYY-MM-DD
    const dateStr = date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
    
    // Usar la función robusta de comparación
    return isDateInRangeUtil(dateStr, selectedBimester.startDate, selectedBimester.endDate);
  };

  // Función para deshabilitar fechas en el calendario
  const isDateDisabled = (date: Date): boolean => {
    // Deshabilitar si está fuera del rango del bimestre
    if (!isDateInBimesterRange(date)) return true;
    
    // Deshabilitar si está en una semana BREAK
    if (isDateInBreak(date.toISOString())) return true;
    
    return false;
  };

  const handleSubmit = async (data: HolidayFormValues) => {
    const submitData: CreateHolidayDto = {
      bimesterId: data.bimesterId,
      date: format(data.date, 'yyyy-MM-dd'),
      description: data.description,
      isRecovered: data.isRecovered,
    };

    await onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Error de permisos */}
        {cyclesError && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Error al cargar datos del formulario
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {cyclesError}. No tienes los permisos necesarios para crear/editar días festivos.
              </p>
            </div>
          </div>
        )}

        {/* Ciclo Escolar */}
        <FormField
          control={form.control}
          name="cycleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Ciclo Escolar *
              </FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => {
                  field.onChange(parseInt(value));
                  form.setValue('bimesterId', undefined as any);
                }}
                disabled={isSubmitting || loadingCycles}
              >
                <FormControl>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Seleccionar ciclo escolar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cycles && cycles.length > 0 ? (
                    cycles.map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id.toString()}>
                        {cycle.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      No hay ciclos disponibles
                    </SelectItem>
                  )}
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
              <FormLabel className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Bimestre *
              </FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
                disabled={isSubmitting || !selectedCycleId || loadingBimesters || bimestersError !== null}
              >
                <FormControl>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Seleccionar bimestre" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {bimesters && bimesters.length > 0 ? (
                    bimesters.map((bimester) => (
                      <SelectItem key={bimester.id} value={bimester.id.toString()}>
                        Bimestre {bimester.number} - {bimester.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      {bimestersError ? 'Error al cargar bimestres' : 'Selecciona un ciclo primero'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {selectedBimester && (
                <FormDescription className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(selectedBimester.startDate), 'd MMM', { locale: es })} -{' '}
                  {format(new Date(selectedBimester.endDate), 'd MMM yyyy', { locale: es })}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Card de Semanas BREAK */}
        {selectedBimesterId && breakWeeks.length > 0 && (
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900/50 dark:via-gray-900/30 dark:to-gray-950/50 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-200/30 to-transparent dark:from-gray-700/20 rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="flex items-start gap-4 mb-5">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 shadow-md">
                    <Umbrella className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5 flex items-center gap-2">
                    Semanas de Receso
                    <span className="text-xs font-medium px-2 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                      BREAK
                    </span>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Estas fechas están bloqueadas automáticamente. No se pueden agregar días festivos durante las semanas de receso académico.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {breakWeeks.map((week) => (
                  <div 
                    key={week.id} 
                    className="group flex items-center justify-between bg-white dark:bg-gray-900/60 rounded-lg px-4 py-3.5 border-2 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                        <Coffee className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Semana {week.number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {format(new Date(week.startDate), 'd MMM', { locale: es })} - {format(new Date(week.endDate), 'd MMM', { locale: es })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fecha */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                Fecha del Día Festivo *
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal border-gray-300 dark:border-gray-600',
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
                    disabled={isDateDisabled}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              {field.value && !isDateInBimesterRange(field.value) && (
                <div className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Fecha fuera del rango del bimestre</span>
                </div>
              )}
              {field.value && isDateInBreak(field.value.toISOString()) && (
                <div className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Esta fecha está en una semana de receso (BREAK)</span>
                </div>
              )}
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
              <FormLabel>Descripción *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="ej. Navidad, Año Nuevo, Día de la Independencia..."
                  className="resize-none border-gray-300 dark:border-gray-600"
                  rows={3}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                Mínimo 3 caracteres
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Recuperable */}
        <FormField
          control={form.control}
          name="isRecovered"
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
                <FormLabel>Día Recuperable</FormLabel>
                <FormDescription>
                  Si está marcado, este día será recuperado en otra fecha
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

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
            {mode === 'create' ? 'Crear Día Festivo' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default HolidayForm;
