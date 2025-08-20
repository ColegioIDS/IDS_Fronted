// components/academic-weeks/create-week-dialog.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Plus, Loader2, AlertCircle, RefreshCw, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAcademicWeekActions, useAcademicWeekContext } from '@/context/AcademicWeeksContext';
import { useBimesterContext } from '@/context/newBimesterContext';
import { academicWeekSchema, defaultValues } from '@/schemas/academic-week.schemas';
import { AcademicWeekFormValues } from '@/types/academic-week.types';

interface CreateWeekDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWeekDialog({ open, onOpenChange }: CreateWeekDialogProps) {
  const { createWeek, isCreating } = useAcademicWeekActions();
  const { weeks } = useAcademicWeekContext();
  const { 
    bimesters, 
    isLoading: isLoadingBimesters, 
    isError: isBimestersError,
    refetchAll: refetchBimesters 
  } = useBimesterContext();
  
  const [serverError, setServerError] = useState<string>('');
  const [selectedBimester, setSelectedBimester] = useState<any>(null);

  const form = useForm<AcademicWeekFormValues>({
    resolver: zodResolver(academicWeekSchema),
    defaultValues,
  });

  const handleSubmit = async (data: AcademicWeekFormValues) => {
    try {
      setServerError(''); // Limpiar error anterior
      await createWeek(data);
      form.reset();
      setSelectedBimester(null);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating week:', error);
      // Capturar el mensaje de error del servidor
      const errorMessage = error?.message || 'Ha ocurrido un error inesperado';
      setServerError(errorMessage);
    }
  };

  // Limpiar error y datos cuando se abre/cierra el modal
  useEffect(() => {
    if (!open) {
      setServerError('');
      setSelectedBimester(null);
      form.reset();
    }
  }, [open, form]);

  // Actualizar el bimestre seleccionado cuando cambie el valor
  useEffect(() => {
    const bimesterId = form.watch('bimesterId');
    if (bimesterId) {
      const bimester = bimesters.find(b => b.id === bimesterId);
      setSelectedBimester(bimester || null);
      // Limpiar las fechas cuando cambie el bimestre
      form.setValue('startDate', '');
      form.setValue('endDate', '');
    }
  }, [form.watch('bimesterId'), bimesters, form]);

  // Función para verificar si una fecha está dentro del rango del bimestre
  const isDateInRange = (date: Date) => {
    if (!selectedBimester) return false;
    const startDate = new Date(selectedBimester.startDate);
    const endDate = new Date(selectedBimester.endDate);
    return date >= startDate && date <= endDate;
  };

  // Función para verificar si una fecha está ocupada por otra semana académica
  const isDateOccupied = (date: Date) => {
    if (!selectedBimester) return false;
    
    // Obtener todas las semanas del bimestre seleccionado
    const bimesterWeeks = weeks.filter(week => week.bimesterId === selectedBimester.id);
    
    // Debug: Log para verificar
    console.log('Checking date:', format(date, 'yyyy-MM-dd'));
    console.log('Bimester weeks:', bimesterWeeks);
    
    // Verificar si la fecha está en el rango de alguna semana existente
    const isOccupied = bimesterWeeks.some(week => {
      const weekStart = new Date(week.startDate.split('T')[0] + 'T00:00:00');
      const weekEnd = new Date(week.endDate.split('T')[0] + 'T00:00:00');
      
      console.log('Week range:', format(weekStart, 'yyyy-MM-dd'), 'to', format(weekEnd, 'yyyy-MM-dd'));
      console.log('Date in range?', date >= weekStart && date <= weekEnd);
      
      return date >= weekStart && date <= weekEnd;
    });
    
    console.log('Date occupied?', isOccupied);
    return isOccupied;
  };

  // Función para determinar si una fecha debe estar deshabilitada
  const isDateDisabled = (date: Date) => {
    return !isDateInRange(date) || isDateOccupied(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] bg-background border border-border flex flex-col">
        <DialogHeader className="space-y-3 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Crear Nueva Semana Académica
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Agrega una nueva semana al calendario académico. Asegúrate de que las fechas estén dentro del rango del bimestre seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div 
          className="flex-1 overflow-y-auto scrollbar-custom pr-4" 
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
          }}
        >
          <Form {...form}>
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Bimestre */}
                <FormField
                  control={form.control}
                  name="bimesterId"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Bimestre *
                      </FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        disabled={isLoadingBimesters || isBimestersError}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 bg-background border-input hover:border-ring focus:border-ring transition-colors">
                            <SelectValue 
                              placeholder={
                                isLoadingBimesters 
                                  ? "Cargando bimestres..." 
                                  : isBimestersError
                                  ? "Error al cargar bimestres"
                                  : "Seleccionar bimestre"
                              } 
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-background border-border">
                          {bimesters.length === 0 && !isLoadingBimesters && (
                            <SelectItem value="no-data" disabled className="text-muted-foreground">
                              No hay bimestres disponibles
                            </SelectItem>
                          )}
                          {bimesters.map((bimester) => (
                            <SelectItem 
                              key={bimester.id} 
                              value={bimester.id?.toString() || ''}
                              className="hover:bg-accent focus:bg-accent cursor-pointer"
                            >
                              <div className="flex flex-col py-1">
                                <span className="font-medium text-foreground">
                                  {bimester.name}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>
                                    {format(new Date(bimester.startDate), 'dd MMM', { locale: es })} - {format(new Date(bimester.endDate), 'dd MMM yyyy', { locale: es })}
                                  </span>
                                  {bimester.isActive && (
                                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                                      Activo
                                    </span>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-destructive" />
                      
                      {/* Mostrar error de bimestres */}
                      {isBimestersError && (
                        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <span className="text-sm text-destructive">Error al cargar bimestres</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={refetchBimesters}
                            className="h-6 w-6 p-0 hover:bg-destructive/20"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                {/* Número de semana */}
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Número de Semana *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="20"
                          className="h-11 bg-background border-input hover:border-ring focus:border-ring transition-colors"
                          placeholder="Ej: 1, 2, 3..."
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Información del bimestre seleccionado */}
              {selectedBimester && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Rango permitido para las fechas
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Desde <strong>{format(new Date(selectedBimester.startDate), 'dd MMMM yyyy', { locale: es })}</strong> hasta <strong>{format(new Date(selectedBimester.endDate), 'dd MMMM yyyy', { locale: es })}</strong>
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {(() => {
                            const startDate = new Date(selectedBimester.startDate);
                            const endDate = new Date(selectedBimester.endDate);
                            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            const availableWeeks = Math.floor(diffDays / 7);
                            return `${diffDays} días (≈ ${availableWeeks} ${availableWeeks === 1 ? 'semana' : 'semanas'})`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Leyenda de colores */}
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">
                      Leyenda del calendario:
                    </h5>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div>
                        <span className="text-gray-600 dark:text-gray-400">Disponible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
                        <span className="text-gray-600 dark:text-gray-400">Ocupado por otra semana</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <span className="text-gray-600 dark:text-gray-400">Fuera del bimestre</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Fecha de inicio */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Fecha de Inicio *
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              disabled={!selectedBimester}
                              className={cn(
                                "h-11 w-full justify-start text-left font-normal bg-background border-input hover:border-ring focus:border-ring transition-colors",
                                !field.value && "text-muted-foreground",
                                !selectedBimester && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(new Date(field.value + 'T00:00:00'), "dd MMMM yyyy", { locale: es })
                              ) : (
                                <span>Seleccionar fecha de inicio</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, 'yyyy-MM-dd'));
                              }
                            }}
                            disabled={(date) => isDateDisabled(date)}
                            modifiers={{
                              occupied: (date) => isDateOccupied(date) && isDateInRange(date)
                            }}
                            modifiersClassNames={{
                              occupied: 'date-occupied'
                            }}
                            initialFocus
                            locale={es}
                            className="rounded-md border-0"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs text-destructive" />
                      {!selectedBimester && (
                        <p className="text-xs text-muted-foreground">
                          Selecciona un bimestre primero
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                {/* Fecha de fin */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Fecha de Fin *
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              disabled={!selectedBimester}
                              className={cn(
                                "h-11 w-full justify-start text-left font-normal bg-background border-input hover:border-ring focus:border-ring transition-colors",
                                !field.value && "text-muted-foreground",
                                !selectedBimester && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(new Date(field.value + 'T00:00:00'), "dd MMMM yyyy", { locale: es })
                              ) : (
                                <span>Seleccionar fecha de fin</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, 'yyyy-MM-dd'));
                              }
                            }}
                            disabled={(date) => isDateDisabled(date)}
                            modifiers={{
                              occupied: (date) => isDateOccupied(date) && isDateInRange(date)
                            }}
                            modifiersClassNames={{
                              occupied: 'date-occupied'
                            }}
                            initialFocus
                            locale={es}
                            className="rounded-md border-0"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs text-destructive" />
                      {!selectedBimester && (
                        <p className="text-xs text-muted-foreground">
                          Selecciona un bimestre primero
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              {/* Objetivos */}
              <FormField
                control={form.control}
                name="objectives"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-foreground">
                      Objetivos (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe los objetivos y metas para esta semana académica..."
                        className="min-h-[120px] resize-none bg-background border-input hover:border-ring focus:border-ring transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                    <p className="text-xs text-muted-foreground">
                      Puedes agregar objetivos específicos, metas de aprendizaje o actividades destacadas para esta semana.
                    </p>
                  </FormItem>
                )}
              />

              {/* Mostrar error del servidor */}
              {serverError && (
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-destructive">
                    {serverError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </Form>
        </div>

        <DialogFooter className="gap-3 pt-4 flex-shrink-0 border-t border-border/50 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
            className="h-11 px-6 border-input hover:bg-accent"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isCreating || isBimestersError || bimesters.length === 0}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Crear Semana
              </>
            )}
          </Button>
        </DialogFooter>

        <style jsx global>{`
          .scrollbar-custom {
            scrollbar-width: thin;
            scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
          }
          .scrollbar-custom::-webkit-scrollbar {
            width: 6px;
          }
          .scrollbar-custom::-webkit-scrollbar-track {
            background: transparent;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.5);
            border-radius: 3px;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.8);
          }
          /* Dark mode scrollbar */
          .dark .scrollbar-custom {
            scrollbar-color: rgba(71, 85, 105, 0.8) transparent;
          }
          .dark .scrollbar-custom::-webkit-scrollbar-thumb {
            background: rgba(71, 85, 105, 0.8);
          }
          .dark .scrollbar-custom::-webkit-scrollbar-thumb:hover {
            background: rgba(71, 85, 105, 1);
          }
          
          /* Estilos para fechas ocupadas - Usando las clases correctas de shadcn/ui */
          .date-occupied {
            background-color: rgba(239, 68, 68, 0.15) !important;
            color: rgb(185, 28, 28) !important;
            border-radius: 0.375rem !important;
            position: relative;
          }
          
          .date-occupied::before {
            content: '';
            position: absolute;
            top: 2px;
            right: 2px;
            width: 6px;
            height: 6px;
            background-color: rgb(239, 68, 68);
            border-radius: 50%;
          }
          
          .date-occupied:hover {
            background-color: rgba(239, 68, 68, 0.25) !important;
          }
          
          /* Dark mode para fechas ocupadas */
          .dark .date-occupied {
            background-color: rgba(239, 68, 68, 0.2) !important;
            color: rgb(248, 113, 113) !important;
          }
          
          .dark .date-occupied:hover {
            background-color: rgba(239, 68, 68, 0.3) !important;
          }
          
          /* Estilos adicionales para el calendario */
          [role="gridcell"] button[disabled] {
            opacity: 0.4;
          }
          
          [role="gridcell"] button[disabled].date-occupied {
            opacity: 0.8 !important;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}