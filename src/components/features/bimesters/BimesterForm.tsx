// src/components/features/bimesters/BimesterForm.tsx

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { format, parse } from 'date-fns';
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
import DatePicker from '@/components/form/date-picker';
import { CycleSelector } from '@/components/shared/selectors/CycleSelector';
import { CycleInfo } from '@/components/shared/info/CycleInfo';
import { bimesterService } from '@/services/bimester.service';
import { handleApiError, handleApiSuccess } from '@/utils/handleApiError';
import { Bimester } from '@/types/bimester.types';

// ============================================
// SCHEMA ZOD
// ============================================

const bimesterFormSchema = z.object({
  cycleId: z.number().min(1, 'Debe seleccionar un ciclo escolar'),
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
    editingBimester?.schoolCycleId || null
  );
  const [startDate, setStartDate] = useState<string>(
    editingBimester?.startDate ? format(new Date(editingBimester.startDate), 'dd/MM/yyyy') : ''
  );
  const [endDate, setEndDate] = useState<string>(
    editingBimester?.endDate ? format(new Date(editingBimester.endDate), 'dd/MM/yyyy') : ''
  );

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
      cycleId: editingBimester?.schoolCycleId || 0,
      number: editingBimester?.number || 1,
      name: editingBimester?.name || '',
      startDate: editingBimester?.startDate?.split('T')[0] || '',
      endDate: editingBimester?.endDate?.split('T')[0] || '',
      isActive: editingBimester?.isActive ?? false,
      weeksCount: editingBimester?.weeksCount || 8,
    },
  });

  const isActive = watch('isActive');

  // Sincronizar cycleId con el selector
  React.useEffect(() => {
    if (selectedCycleId) {
      setValue('cycleId', selectedCycleId);
    }
  }, [selectedCycleId, setValue]);

  // Submit handler
  const onSubmit = async (data: BimesterFormData) => {
    try {
      setIsLoading(true);

      // Convertir fechas de dd/MM/yyyy a ISO
      let startDateISO: string;
      let endDateISO: string;

      try {
        // Si las fechas vienen en formato dd/MM/yyyy, parsear
        if (startDate.includes('/')) {
          const parsedStart = parse(startDate, 'dd/MM/yyyy', new Date());
          startDateISO = parsedStart.toISOString();
        } else {
          startDateISO = new Date(data.startDate).toISOString();
        }

        if (endDate.includes('/')) {
          const parsedEnd = parse(endDate, 'dd/MM/yyyy', new Date());
          endDateISO = parsedEnd.toISOString();
        } else {
          endDateISO = new Date(data.endDate).toISOString();
        }
      } catch (dateError) {
        toast.error('Error al procesar las fechas. Usa el formato dd/mm/aaaa');
        return;
      }

      const payload = {
        number: data.number,
        name: data.name,
        startDate: startDateISO,
        endDate: endDateISO,
        isActive: data.isActive,
        weeksCount: data.weeksCount,
      };

      if (isEditing && editingBimester) {
        // Actualizar
        await bimesterService.update(editingBimester.id, payload);
        handleApiSuccess('Bimestre actualizado correctamente');
      } else {
        // Crear
        await bimesterService.create(data.cycleId, payload);
        handleApiSuccess('Bimestre creado correctamente');
      }

      reset();
      setStartDate('');
      setEndDate('');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      handleApiError(err, isEditing ? 'Error al actualizar bimestre' : 'Error al crear bimestre');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
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
              {errors.cycleId && (
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
                <div className="space-y-2">
                  <DatePicker
                    id="startDate"
                    label="Fecha Inicio"
                    required
                    defaultDate={editingBimester?.startDate ? new Date(editingBimester.startDate) : undefined}
                    placeholder="dd/mm/aaaa"
                    onChange={(selectedDates) => {
                      if (selectedDates && selectedDates.length > 0) {
                        const date = selectedDates[0];
                        const formatted = format(date, 'dd/MM/yyyy');
                        setStartDate(formatted);
                        setValue('startDate', date.toISOString());
                      }
                    }}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.startDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <DatePicker
                    id="endDate"
                    label="Fecha Fin"
                    required
                    defaultDate={editingBimester?.endDate ? new Date(editingBimester.endDate) : undefined}
                    placeholder="dd/mm/aaaa"
                    onChange={(selectedDates) => {
                      if (selectedDates && selectedDates.length > 0) {
                        const date = selectedDates[0];
                        const formatted = format(date, 'dd/MM/yyyy');
                        setEndDate(formatted);
                        setValue('endDate', date.toISOString());
                      }
                    }}
                  />
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
              disabled={isLoading || !selectedCycleId}
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
