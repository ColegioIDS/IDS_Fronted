// src/components/features/academic-weeks/AcademicWeekForm.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Loader2, AlertCircle, Info, CheckCircle2, BookOpen, Hash } from 'lucide-react';
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
import { academicWeekService } from '@/services/academic-week.service';
import { parseISODateForTimezone, formatISODateWithTimezone, formatDateWithTimezone } from '@/utils/dateUtils';

// Esquema de validación
const academicWeekFormSchema = z.object({
  cycleId: z.number({ required_error: 'El ciclo escolar es requerido' }),
  bimesterId: z.number({ required_error: 'El bimestre es requerido' }),
  number: z.number({ required_error: 'El número de semana es requerido' }).min(1).max(52),
  weekType: z.nativeEnum(WeekType, { required_error: 'El tipo de semana es requerido' }),
  startDate: z.date({ required_error: 'La fecha de inicio es requerida' }),
  endDate: z.date({ required_error: 'La fecha de fin es requerida' }),
  isActive: z.boolean(),
  year: z.number().optional(),
  month: z.nativeEnum(AcademicMonth).optional(),
  objectives: z.string().max(500, 'Los objetivos no pueden exceder 500 caracteres').optional(),
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
  // Estado para bimesters dinámicos
  const [dynamicBimesters, setDynamicBimesters] = useState<Array<{ id: number; name: string; number: number }>>(availableBimesters);
  const [isLoadingBimesters, setIsLoadingBimesters] = useState(false);
  const [dynamicBimesterDateRange, setDynamicBimesterDateRange] = useState<{ startDate: string; endDate: string } | null>(bimesterDateRange || null);
  const [isLoadingDateRange, setIsLoadingDateRange] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const form = useForm<AcademicWeekFormValues>({
    resolver: zodResolver(academicWeekFormSchema),
    defaultValues: {
      cycleId: initialData?.cycleId,
      bimesterId: initialData?.bimesterId,
      number: initialData?.number || 1,
      weekType: initialData?.weekType || WeekType.REGULAR,
      startDate: initialData?.startDate,
      endDate: initialData?.endDate,
      year: initialData?.year,
      month: initialData?.month,
      objectives: initialData?.objectives || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const selectedCycleId = form.watch('cycleId');
  const selectedBimesterId = form.watch('bimesterId');
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');

  // Resetear isInitialized cuando cambia initialData (nuevo registro a editar o crear)
  useEffect(() => {
    setIsInitialized(false);
    setDynamicBimesters([]);
    setDynamicBimesterDateRange(null);
    console.log('🔄 Initializing form with new initialData:', initialData);
  }, [(initialData as any)?.id]); // Solo cambiar cuando cambia el ID (es decir, se selecciona otra semana)

  // Reset form cuando cambia initialData (especialmente importante para modo edición)
  useEffect(() => {
    const initializeForm = async () => {
      if (initialData && initialData.cycleId) {
        // PASO 1: Cargar los bimesters del ciclo PRIMERO
        setIsLoadingBimesters(true);
        try {
          const response = await academicWeekService.getAvailableBimesters({
            cycleId: initialData.cycleId,
          });
          const bimestersData = response.data.map((b: any) => ({
            id: b.id,
            name: b.name,
            number: b.number,
          }));
          setDynamicBimesters(bimestersData);
          
          console.log('✅ Bimesters loaded:', bimestersData);
        } catch (error) {
          console.error('❌ Error al cargar bimesters:', error);
          setDynamicBimesters([]);
        } finally {
          setIsLoadingBimesters(false);
        }

        // PASO 2: Cargar date range si tenemos bimesterId
        if (initialData.bimesterId) {
          setIsLoadingDateRange(true);
          try {
            const range = await academicWeekService.getBimesterDateRange(initialData.bimesterId);
            setDynamicBimesterDateRange(range);
            console.log('✅ Date range loaded:', range);
          } catch (error) {
            console.error('❌ Error al cargar rango de fechas:', error);
            setDynamicBimesterDateRange(null);
          } finally {
            setIsLoadingDateRange(false);
          }
        }

        // PASO 3: Ahora SÍ resetear el formulario con TODOS los datos
        // Usar un pequeño delay más robusto para asegurar que el estado se actualizó
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('🔄 Resetting form with initialData:', initialData);
        
        form.reset({
          cycleId: initialData.cycleId,
          bimesterId: initialData.bimesterId,
          number: initialData.number || 1,
          weekType: initialData.weekType || WeekType.REGULAR,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          year: initialData.year,
          month: initialData.month,
          objectives: initialData.objectives || '',
          isActive: initialData.isActive ?? true,
        });

        setIsInitialized(true);
      } else if (initialData) {
        // Si no hay cycleId pero hay initialData (modo crear con valores pre-cargados)
        // Cargar bimesters si hay cycleId pre-seleccionado
        if (initialData.cycleId) {
          setIsLoadingBimesters(true);
          try {
            const response = await academicWeekService.getAvailableBimesters({
              cycleId: initialData.cycleId,
            });
            setDynamicBimesters(response.data.map((b: any) => ({
              id: b.id,
              name: b.name,
              number: b.number,
            })));
          } catch (error) {
            console.error('Error al cargar bimesters:', error);
          } finally {
            setIsLoadingBimesters(false);
          }
        }
        
        form.reset({
          cycleId: initialData.cycleId,
          bimesterId: initialData.bimesterId,
          number: initialData.number || 1,
          weekType: initialData.weekType || WeekType.REGULAR,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          year: initialData.year,
          month: initialData.month,
          objectives: initialData.objectives || '',
          isActive: initialData.isActive ?? true,
        });
        setIsInitialized(true);
      } else {
        // Modo crear sin valores iniciales
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeForm();
    }
  }, [initialData, isInitialized]);

  // Cargar bimesters dinámicamente cuando cambia el ciclo seleccionado (solo en modo interactivo)
  useEffect(() => {
    const loadBimesters = async () => {
      // No cargar si no hay cycleId
      if (!selectedCycleId) {
        setDynamicBimesters([]);
        return;
      }

      // No cargar si aún no está inicializado (ya se carga en la inicialización)
      if (!isInitialized) {
        return;
      }

      // Si ya tenemos bimesters y el bimester seleccionado está en la lista, no recargar
      const currentBimesterId = form.getValues('bimesterId');
      if (dynamicBimesters.length > 0 && currentBimesterId) {
        const bimesterExists = dynamicBimesters.some(b => b.id === currentBimesterId);
        if (bimesterExists) {
          return; // No recargar si el bimester actual ya está en la lista
        }
      }

      setIsLoadingBimesters(true);
      try {
        const response = await academicWeekService.getAvailableBimesters({
          cycleId: selectedCycleId,
        });
        setDynamicBimesters(response.data.map((b: any) => ({
          id: b.id,
          name: b.name,
          number: b.number,
        })));
      } catch (error) {
        console.error('Error al cargar bimesters:', error);
        setDynamicBimesters([]);
      } finally {
        setIsLoadingBimesters(false);
      }
    };

    loadBimesters();
  }, [selectedCycleId, isInitialized]);

  // Cargar rango de fechas cuando cambia el bimestre seleccionado (solo en modo interactivo)
  useEffect(() => {
    const loadDateRange = async () => {
      if (!selectedBimesterId) {
        setDynamicBimesterDateRange(null);
        return;
      }

      // No cargar si aún no está inicializado (ya se carga en la inicialización)
      if (!isInitialized) {
        return;
      }

      setIsLoadingDateRange(true);
      try {
        const range = await academicWeekService.getBimesterDateRange(selectedBimesterId);
        setDynamicBimesterDateRange(range);
      } catch (error) {
        console.error('Error al cargar rango de fechas:', error);
        setDynamicBimesterDateRange(null);
      } finally {
        setIsLoadingDateRange(false);
      }
    };

    loadDateRange();
  }, [selectedBimesterId, isInitialized]);

  // Actualizar bimesters cuando cambia availableBimesters (para mantener sincronización)
  // Solo si no estamos en proceso de inicialización y no tenemos bimesters dinámicos ya cargados
  useEffect(() => {
    if (isInitialized && availableBimesters.length > 0 && dynamicBimesters.length === 0) {
      setDynamicBimesters(availableBimesters);
    }
  }, [availableBimesters, isInitialized, dynamicBimesters.length]);

  // Actualizar date range cuando cambia bimesterDateRange (para mantener sincronización)
  useEffect(() => {
    if (isInitialized && bimesterDateRange && !dynamicBimesterDateRange) {
      setDynamicBimesterDateRange(bimesterDateRange);
    }
  }, [bimesterDateRange, isInitialized, dynamicBimesterDateRange]);

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
    if (!date || !dynamicBimesterDateRange) return true;

    // Extraer solo la fecha YYYY-MM-DD (ignorar la hora y timezone)
    const checkDateStr = date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
    
    const startDateStr = dynamicBimesterDateRange.startDate.split('T')[0];
    const endDateStr = dynamicBimesterDateRange.endDate.split('T')[0];

    // Comparar solo las fechas como strings (YYYY-MM-DD)
    return checkDateStr >= startDateStr && checkDateStr <= endDateStr;
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
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Ciclo Escolar *
              </FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => {
                  field.onChange(parseInt(value));
                  form.setValue('bimesterId', undefined as any); // Reset bimestre
                }}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400">
                    <SelectValue placeholder="Seleccionar ciclo escolar" />
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
              <FormLabel className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Bimestre *
              </FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
                disabled={isSubmitting || !selectedCycleId || isLoadingBimesters}
              >
                <FormControl>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400">
                    <SelectValue placeholder="Seleccionar bimestre" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dynamicBimesters.map((bimester) => (
                    <SelectItem key={bimester.id} value={bimester.id.toString()}>
                      Bimestre {bimester.number} - {bimester.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedCycleId && (
                <FormDescription className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <Info className="h-3.5 w-3.5" />
                  Primero selecciona un ciclo escolar
                </FormDescription>
              )}
              {isLoadingBimesters && (
                <FormDescription className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Cargando bimestres...
                </FormDescription>
              )}
              {dynamicBimesterDateRange && (
                <FormDescription className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Rango: {formatISODateWithTimezone(dynamicBimesterDateRange.startDate, 'dd MMM')} -{' '}
                  {formatISODateWithTimezone(dynamicBimesterDateRange.endDate, 'dd MMM yyyy')}
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
                <FormLabel className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Número de Semana *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={52}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    disabled={isSubmitting}
                    className="border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400"
                  />
                </FormControl>
                <FormDescription className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <Info className="h-3.5 w-3.5" />
                  Entre 1 y 52
                </FormDescription>
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
                <FormLabel className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Tipo de Semana *
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400">
                      <SelectValue placeholder="Seleccionar tipo" />
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

        {/* Grid: Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha Inicio */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Fecha de Inicio *
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
                          formatDateWithTimezone(field.value, "d 'de' MMMM, yyyy")
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
                {field.value && !isDateInBimesterRange(field.value) && (
                  <div className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Fecha fuera del rango del bimestre</span>
                  </div>
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
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  Fecha de Fin *
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
                          formatDateWithTimezone(field.value, "d 'de' MMMM, yyyy")
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
                {field.value && !isDateInBimesterRange(field.value) && (
                  <div className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Fecha fuera del rango del bimestre</span>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Objetivos */}
        <FormField
          control={form.control}
          name="objectives"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Objetivos de Aprendizaje
                <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe los objetivos de aprendizaje para esta semana académica..."
                  className="resize-none border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400"
                  rows={3}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <Info className="h-3.5 w-3.5" />
                Máximo 500 caracteres
              </FormDescription>
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
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  className="h-4 w-4 mt-1 text-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-400 border-gray-300 dark:border-gray-600 rounded"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Semana activa
                </FormLabel>
                <FormDescription>
                  Si está activa, esta semana será visible para estudiantes y maestros
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
            className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Crear Semana' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default AcademicWeekForm;
