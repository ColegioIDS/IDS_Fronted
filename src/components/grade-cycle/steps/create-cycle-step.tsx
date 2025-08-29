// ==========================================
// src/components/grade-cycle/steps/create-cycle-step.tsx
// ==========================================

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, CheckCircle, AlertTriangle, Clock, Edit } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSchoolCycleContext, useSchoolCycleActions } from '@/context/SchoolCycleContext';

const cycleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  isActive: z.boolean()
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start < end;
}, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["endDate"]
});

type CycleFormData = z.infer<typeof cycleSchema>;

interface CreateCycleStepProps {
  onComplete: () => void;
  onNext: () => void;
}

export default function CreateCycleStep({ onComplete, onNext }: CreateCycleStepProps) {
  const { activeCycle, cycles, stats, updateCycle } = useSchoolCycleContext();
  const { createCycle, isCreating, isUpdating, validateNewCycle } = useSchoolCycleActions();
  const [selectedAction, setSelectedAction] = useState<'select' | 'create'>('select');
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');

  // Separar ciclos por estado
  const inactiveCycles = cycles.filter(cycle => !cycle.isActive);
  const futureCycles = cycles.filter(cycle => {
    const startDate = new Date(cycle.startDate);
    const now = new Date();
    return startDate > now;
  });
  const pastCycles = cycles.filter(cycle => {
    const endDate = new Date(cycle.endDate);
    const now = new Date();
    return endDate < now && !cycle.isActive;
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue
  } = useForm<CycleFormData>({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      isActive: false
    }
  });

  const watchedData = watch();

  // Activar ciclo existente
  const handleActivateExistingCycle = async () => {
    if (!selectedCycleId) return;
    
    const cycleToActivate = cycles.find(c => c.id.toString() === selectedCycleId);
    if (!cycleToActivate) return;

    try {
      await updateCycle(cycleToActivate.id, {
        ...cycleToActivate,
        isActive: true
      });
      onComplete();
    } catch (error) {
      console.error('Error activating cycle:', error);
    }
  };

  const onSubmit = async (data: CycleFormData) => {
    try {
      const payload = {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive
      };

      await createCycle(payload);
      onComplete();
    } catch (error) {
      console.error('Error creating cycle:', error);
    }
  };

  // Auto-generar nombre basado en fechas
  const generateCycleName = () => {
    if (watchedData.startDate) {
      const startYear = new Date(watchedData.startDate).getFullYear();
      const endYear = startYear + 1;
      setValue('name', `${startYear}-${endYear}`);
    }
  };

  // Si ya hay ciclo activo, mostrar información
  if (activeCycle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ciclo Escolar Configurado</h3>
              <p className="text-sm text-muted-foreground">
                Ya tienes un ciclo activo configurado
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
            Activo
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {activeCycle.name}
            </CardTitle>
            <CardDescription>
              {new Date(activeCycle.startDate).toLocaleDateString()} - {new Date(activeCycle.endDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estado:</span>
              <Badge variant={activeCycle.isActive ? "default" : "secondary"}>
                {activeCycle.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setSelectedAction('create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Nuevo Ciclo
              </Button>
              <Button onClick={onNext}>
                Continuar al Siguiente Paso
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mostrar formulario si se solicitó crear nuevo */}
        {selectedAction === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Ciclo</CardTitle>
              <CardDescription>
                Esto desactivará el ciclo actual si se marca como activo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                      onChange={(e) => {
                        register('startDate').onChange(e);
                        setTimeout(generateCycleName, 100);
                      }}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-red-500">{errors.startDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha de Fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...register('endDate')}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-red-500">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Ciclo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="name"
                      placeholder="ej: 2025-2026"
                      {...register('name')}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateCycleName}
                      disabled={!watchedData.startDate}
                    >
                      Auto
                    </Button>
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <Label htmlFor="isActive">Activar Inmediatamente</Label>
                    <p className="text-sm text-muted-foreground">
                      Desactivará el ciclo actual: {activeCycle.name}
                    </p>
                  </div>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="isActive"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSelectedAction('select')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="min-w-[120px]"
                  >
                    {isCreating ? "Creando..." : "Crear Ciclo"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Si no hay ciclo activo, mostrar opciones
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Configurar Ciclo Escolar</h3>
          <p className="text-sm text-muted-foreground">
            Seleccione un ciclo existente o cree uno nuevo
          </p>
        </div>
      </div>

      {stats.hasMultipleActive && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Advertencia: Hay múltiples ciclos activos. Se recomienda tener solo uno activo.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Opciones de Ciclo Escolar</CardTitle>
          <CardDescription>
            Elija cómo configurar el ciclo académico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedAction} onValueChange={(value) => setSelectedAction(value as 'select' | 'create')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Seleccionar Existente
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear Nuevo
              </TabsTrigger>
            </TabsList>

            {/* Tab: Seleccionar Ciclo Existente */}
            <TabsContent value="select" className="space-y-4 mt-6">
              {inactiveCycles.length === 0 ? (
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    No hay ciclos existentes disponibles. Puede crear un nuevo ciclo.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="existingCycle">Seleccionar Ciclo</Label>
                    <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Elija un ciclo escolar" />
                      </SelectTrigger>
                      <SelectContent>
                        {futureCycles.length > 0 && (
                          <>
                            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                              Ciclos Futuros
                            </div>
                            {futureCycles.map(cycle => (
                              <SelectItem key={cycle.id} value={cycle.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-blue-500" />
                                  <span>{cycle.name}</span>
                                  <Badge variant="outline" className="text-xs">Futuro</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                        
                        {pastCycles.length > 0 && (
                          <>
                            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                              Ciclos Anteriores
                            </div>
                            {pastCycles.map(cycle => (
                              <SelectItem key={cycle.id} value={cycle.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-gray-500" />
                                  <span>{cycle.name}</span>
                                  <Badge variant="secondary" className="text-xs">Pasado</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vista previa del ciclo seleccionado */}
                  {selectedCycleId && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        {(() => {
                          const selectedCycle = cycles.find(c => c.id.toString() === selectedCycleId);
                          if (!selectedCycle) return null;

                          const isSelected = selectedCycle.id.toString() === selectedCycleId;
                          const isFuture = futureCycles.some(c => c.id === selectedCycle.id);
                          const isPast = pastCycles.some(c => c.id === selectedCycle.id);

                          return (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{selectedCycle.name}</h4>
                                <div className="flex gap-1">
                                  {isFuture && <Badge variant="outline">Futuro</Badge>}
                                  {isPast && <Badge variant="secondary">Pasado</Badge>}
                                  <Badge variant={selectedCycle.isActive ? "default" : "outline"}>
                                    {selectedCycle.isActive ? "Activo" : "Inactivo"}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Inicio:</p>
                                  <p className="font-medium">
                                    {new Date(selectedCycle.startDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Fin:</p>
                                  <p className="font-medium">
                                    {new Date(selectedCycle.endDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              {isPast && (
                                <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                                    Este es un ciclo pasado. Activarlo permitirá trabajar con datos históricos.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleActivateExistingCycle}
                      disabled={!selectedCycleId || isUpdating}
                      className="min-w-[120px]"
                    >
                      {isUpdating ? "Activando..." : "Activar Ciclo Seleccionado"}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab: Crear Nuevo Ciclo */}
            <TabsContent value="create" className="space-y-4 mt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                      onChange={(e) => {
                        register('startDate').onChange(e);
                        setTimeout(generateCycleName, 100);
                      }}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-red-500">{errors.startDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha de Fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...register('endDate')}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-red-500">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Ciclo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="name"
                      placeholder="ej: 2025-2026"
                      {...register('name')}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateCycleName}
                      disabled={!watchedData.startDate}
                    >
                      Auto
                    </Button>
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <Label htmlFor="isActive">Activar Inmediatamente</Label>
                    <p className="text-sm text-muted-foreground">
                      El ciclo estará activo al crearse
                    </p>
                  </div>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="isActive"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="min-w-[120px]"
                  >
                    {isCreating ? "Creando..." : "Crear Ciclo"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}