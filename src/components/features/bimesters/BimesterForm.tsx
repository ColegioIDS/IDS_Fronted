// src/components/features/bimesters/BimesterForm.tsx

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CycleSelector } from '@/components/shared/selectors/CycleSelector';
import { CycleInfo } from '@/components/shared/info/CycleInfo';
import { bimesterService } from '@/services/bimester.service';
import { handleApiError, handleApiSuccess } from '@/utils/handleApiError';
import { Bimester } from '@/types/bimester.types';

// ============================================
// SCHEMA ZOD
// ============================================

const bimesterFormSchema = z.object({
  cycleId: z.number(),
  number: z.number().min(1, 'El número debe ser al menos 1').max(4, 'El número máximo es 4'),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  isActive: z.boolean(),
  weeksCount: z.number().min(1, 'Debe tener al menos 1 semana').max(12, 'Máximo 12 semanas'),
});

type BimesterFormData = z.infer<typeof bimesterFormSchema>;

// ============================================
// PROPS
// ============================================

interface BimesterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBimester?: Bimester | null;
  onSuccess?: () => void;
}

/**
 * 🎯 Formulario Completo de Bimestre
 * 
 * Formulario de bimestre que usa:
 * 1. CycleSelector - Para seleccionar el ciclo (GET /api/bimesters/cycles/available)
 * 2. CycleInfo - Para mostrar info del ciclo (GET /api/bimesters/cycles/:id)
 * 3. bimesterService.create - Para crear el bimestre (POST /api/school-cycles/:id/bimesters)
 * 
 * FLUJO COMPLETO para Usuario con permisos de bimester:
 * 1. Selector carga ciclos disponibles (NO archivados)
 * 2. Usuario selecciona ciclo (o se auto-selecciona el activo)
 * 3. Se muestra info del ciclo con validación de fechas
 * 4. Usuario llena formulario
 * 5. Se crea el bimestre en ese ciclo
 */
export function BimesterForm({
  open,
  onOpenChange,
  editingBimester = null,
  onSuccess,
}: BimesterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(
    editingBimester?.schoolCycleId || (editingBimester as any)?.cycleId || null
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    editingBimester?.startDate ? new Date(editingBimester.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    editingBimester?.endDate ? new Date(editingBimester.endDate) : undefined
  );
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [cycleDateRange, setCycleDateRange] = useState<{ from: Date; to: Date } | null>(null);

  const isEditing = !!editingBimester;

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BimesterFormData>({
    resolver: zodResolver(bimesterFormSchema),
    defaultValues: {
      cycleId: editingBimester?.schoolCycleId || (editingBimester as any)?.cycleId || 0,
      number: editingBimester?.number || 1,
      name: editingBimester?.name || '',
      startDate: editingBimester?.startDate?.split('T')[0] || '',
      endDate: editingBimester?.endDate?.split('T')[0] || '',
      isActive: editingBimester?.isActive ?? false,
      weeksCount: editingBimester?.weeksCount || 8,
    },
  });

  const isActive = watch('isActive');

  // Reiniciar formulario cuando cambie el bimestre en edición o se abra el diálogo
  React.useEffect(() => {
    if (open) {
      if (editingBimester) {
        // Modo edición: cargar datos del bimestre
        const cycleId = editingBimester.schoolCycleId || (editingBimester as any).cycleId;
        
        console.log('🔧 Modo edición - Cargando bimestre:', editingBimester);
        console.log('📍 School Cycle ID:', cycleId);
        
        setSelectedCycleId(cycleId);
        setStartDate(editingBimester.startDate ? new Date(editingBimester.startDate) : undefined);
        setEndDate(editingBimester.endDate ? new Date(editingBimester.endDate) : undefined);
        
        // Reiniciar formulario con valores
        reset({
          cycleId: cycleId,
          number: editingBimester.number,
          name: editingBimester.name,
          startDate: editingBimester.startDate,
          endDate: editingBimester.endDate,
          isActive: editingBimester.isActive,
          weeksCount: editingBimester.weeksCount,
        });
        
        console.log('✅ Estados actualizados - selectedCycleId:', cycleId);
      } else {
        // Modo creación: resetear todo
        console.log('➕ Modo creación - Reseteando formulario');
        setSelectedCycleId(null);
        setStartDate(undefined);
        setEndDate(undefined);
        reset({
          cycleId: 0,
          number: 1,
          name: '',
          startDate: '',
          endDate: '',
          isActive: false,
          weeksCount: 8,
        });
      }
    }
  }, [open, editingBimester, reset]);

  // Sincronizar cycleId con el selector
  React.useEffect(() => {
    if (selectedCycleId) {
      setValue('cycleId', selectedCycleId);
    }
  }, [selectedCycleId, setValue]);

  // Sincronizar startDate con react-hook-form
  React.useEffect(() => {
    if (startDate) {
      setValue('startDate', startDate.toISOString(), { shouldValidate: true });
    }
  }, [startDate, setValue]);

  // Sincronizar endDate con react-hook-form
  React.useEffect(() => {
    if (endDate) {
      setValue('endDate', endDate.toISOString(), { shouldValidate: true });
    }
  }, [endDate, setValue]);

  // Obtener fechas del ciclo seleccionado usando SOLO bimesterService
  // Esto asegura que use los permisos de bimester:read en lugar de school-cycle:read
  React.useEffect(() => {
    const fetchCycleDates = async () => {
      if (selectedCycleId) {
        try {
          const cycle = await bimesterService.getCycleById(selectedCycleId);
          if (cycle.startDate && cycle.endDate) {
            const dateRange = {
              from: new Date(cycle.startDate),
              to: new Date(cycle.endDate),
            };
            console.log('🗓️ Rango de fechas del ciclo:', dateRange);
            setCycleDateRange(dateRange);
          }
        } catch (error) {
          console.error('Error al obtener fechas del ciclo:', error);
          setCycleDateRange(null);
        }
      } else {
        setCycleDateRange(null);
      }
    };

    fetchCycleDates();
  }, [selectedCycleId]);

  // Submit handler
  const onSubmit = async (data: BimesterFormData) => {
    try {
      setIsLoading(true);

      console.log('📤 Enviando formulario:', {
        isEditing,
        data,
        startDate,
        endDate,
        selectedCycleId,
      });

      // Validar que el ciclo esté seleccionado (solo en modo creación)
      if (!isEditing && (!data.cycleId || data.cycleId === 0)) {
        toast.error('Debe seleccionar un ciclo escolar');
        return;
      }

      // Validar que las fechas estén seleccionadas
      if (!startDate || !endDate) {
        toast.error('Debes seleccionar las fechas de inicio y fin');
        return;
      }

      const payload = {
        number: data.number,
        name: data.name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: data.isActive,
        weeksCount: data.weeksCount,
      };

      console.log('📦 Payload a enviar:', payload);

      if (isEditing && editingBimester) {
        // Actualizar
        console.log('🔄 Actualizando bimestre ID:', editingBimester.id);
        await bimesterService.update(editingBimester.id, payload);
        handleApiSuccess('Bimestre actualizado correctamente');
      } else {
        // Crear
        console.log('➕ Creando bimestre en ciclo:', data.cycleId);
        await bimesterService.create(data.cycleId, payload);
        handleApiSuccess('Bimestre creado correctamente');
      }

      reset();
      setStartDate(undefined);
      setEndDate(undefined);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ Error en submit:', err);
      handleApiError(err, isEditing ? 'Error al actualizar bimestre' : 'Error al crear bimestre');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-fit lg:max-w-fit overflow-y-auto  bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isEditing ? 'Editar Bimestre' : 'Crear Nuevo Bimestre'}
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            {isEditing
              ? 'Modifica la información del bimestre'
              : 'Completa los datos para crear un nuevo bimestre'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda: Formulario */}
            <div className="space-y-4">
              {/* Selector de Ciclo */}
              <CycleSelector
                value={selectedCycleId}
                onValueChange={setSelectedCycleId}
                label="Ciclo Escolar"
                required
                disabled={isLoading || isEditing}
                showDateRange
              />
              {!isEditing && errors.cycleId && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.cycleId.message}</p>
              )}

              {/* Número */}
              <div className="space-y-2">
                <Label htmlFor="number">
                  Número del Bimestre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="number"
                  type="number"
                  min={1}
                  max={4}
                  {...register('number', { valueAsNumber: true })}
                  disabled={isLoading}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                />
                {errors.number && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.number.message}</p>
                )}
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  {...register('name')}
                  disabled={isLoading}
                  placeholder="Ej: Primer Bimestre"
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                />
                {errors.name && React.createElement('p', { className: 'text-sm text-red-600 dark:text-red-400' }, errors.name.message)}
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                {/* Fecha Inicio */}
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="px-1">
                    Fecha Inicio <span className="text-red-500">*</span>
                  </Label>
                  <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="startDate"
                        className="w-full justify-between font-normal bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      >
                        {startDate ? format(startDate, 'dd/MM/yyyy') : 'dd/mm/aaaa'}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0 calendar-date-in-range" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        captionLayout="dropdown"
                        fromYear={2020}
                        toYear={2035}
                        fromDate={cycleDateRange?.from}
                        toDate={cycleDateRange?.to}
                        disabled={(date) => {
                          if (!cycleDateRange) return false;
                          return date < cycleDateRange.from || date > cycleDateRange.to;
                        }}
                        onSelect={(date) => {
                          setStartDate(date);
                          setOpenStartDate(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.startDate.message}</p>
                  )}
                </div>

                {/* Fecha Fin */}
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="px-1">
                    Fecha Fin <span className="text-red-500">*</span>
                  </Label>
                  <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="endDate"
                        className="w-full justify-between font-normal bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      >
                        {endDate ? format(endDate, 'dd/MM/yyyy') : 'dd/mm/aaaa'}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0 calendar-date-in-range" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        captionLayout="dropdown"
                        fromYear={2020}
                        toYear={2035}
                        fromDate={cycleDateRange?.from}
                        toDate={cycleDateRange?.to}
                        disabled={(date) => {
                          if (!cycleDateRange) return false;
                          return date < cycleDateRange.from || date > cycleDateRange.to;
                        }}
                        onSelect={(date) => {
                          setEndDate(date);
                          setOpenEndDate(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              {/* Semanas */}
              <div className="space-y-2">
                <Label htmlFor="weeksCount">
                  Cantidad de Semanas <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="weeksCount"
                  type="number"
                  min={1}
                  max={12}
                  {...register('weeksCount', { valueAsNumber: true })}
                  disabled={isLoading}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                />
                {errors.weeksCount && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.weeksCount.message}</p>
                )}
              </div>

              {/* Estado Activo */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('isActive', checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Marcar como activo
                </Label>
              </div>
            </div>

            {/* Columna Derecha: Info del Ciclo */}
            {selectedCycleId && (
              <div>
                <CycleInfo cycleId={selectedCycleId} showBimesters showStats />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-gray-300 dark:border-gray-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (!isEditing && !selectedCycleId)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Actualizar' : 'Crear'} Bimestre
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BimesterForm;
