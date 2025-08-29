//src\components\cycles\CycleForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner"; // ✅ IMPORTAR SONNER
import {
  schoolCycleSchema,
  SchoolCycleFormValues,
  defaultValues as defaultCycleValues,
} from "@/schemas/SchoolCycle";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { IoAlertCircleOutline } from "react-icons/io5";
import { FaRegSave } from "react-icons/fa";
import { AiOutlineClear } from "react-icons/ai";

import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from 'date-fns/locale';

// Importamos los hooks del context
import { useSchoolCycleActions, useSchoolCycleValidations } from '@/context/SchoolCycleContext';
import { SchoolCycle } from '@/types/SchoolCycle';

interface CycleFormProps {
  // Para modo edición
  editingCycle?: SchoolCycle | null;
  // Callback opcional para manejar éxito
  onSuccess?: (cycle: SchoolCycle) => void;
  // Callback opcional para manejar errores
  onError?: (error: Error) => void;
  // Para cerrar modal/drawer si es necesario
  onCancel?: () => void;
}

export function CycleForm({
  editingCycle = null,
  onSuccess,
  onError,
  onCancel,
}: CycleFormProps) {
  // Estados locales para manejar errores del servidor
  const [serverError, setServerError] = useState<{
    message: string;
    details: string[];
  } | null>(null);

  // Hooks del context
  const { 
    createCycle, 
    updateCycle, 
    isCreating, 
    isUpdating,
    validateNewCycle,
    refetchAll // ✅ IMPORTANTE: Para recargar datos
  } = useSchoolCycleActions();
  
  const { 
    validateCycleData, 
    canCreateCycle, 
    hasMultipleActive 
  } = useSchoolCycleValidations();

  // Determinamos si estamos en modo edición
  const isEditing = !!editingCycle;
  const isLoading = isCreating || isUpdating;

  // Configuramos los valores por defecto
  const getDefaultValues = (): SchoolCycleFormValues => {
    if (editingCycle) {
      return {
        name: editingCycle.name,
        startDate: new Date(editingCycle.startDate),
        endDate: new Date(editingCycle.endDate),
        isActive: editingCycle.isActive || false,
        isClosed: editingCycle.isClosed || false,
      };
    }
    return defaultCycleValues;
  };

  const form = useForm<SchoolCycleFormValues>({
    resolver: zodResolver(schoolCycleSchema),
    defaultValues: getDefaultValues(),
  });

  const handleSubmit = async (values: SchoolCycleFormValues) => {
    try {
      setServerError(null);
      
      const cycleIdToExclude = editingCycle?.id || null;
      
      const validation = validateCycleData(
        {
          name: values.name,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
          isActive: values.isActive,
          isClosed: values.isClosed,
        },
        cycleIdToExclude 
      );

      if (!validation.isValid) {
        setServerError({
          message: 'Error de validación',
          details: validation.errors,
        });
        
        toast.error("Error de validación", {
          description: validation.errors.join(", "),
          duration: 5000,
        });
        return;
      }

      // Mostramos advertencias si las hay
      if (validation.warnings && validation.warnings.length > 0) {
        console.warn('Advertencias del ciclo:', validation.warnings);
        
        // ✅ SONNER: Toast de advertencia
        validation.warnings.forEach(warning => {
          toast.warning("Advertencia", {
            description: warning,
            duration: 4000,
          });
        });
      }

      let savedCycle: SchoolCycle;

      if (isEditing && editingCycle) {
        console.log('Editando ciclo:', editingCycle);
        // ✅ MODO EDICIÓN
        savedCycle = await updateCycle(editingCycle.id, {
          name: values.name,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
          isActive: values.isActive,
          isClosed: values.isClosed,
        });
        
        // ✅ SONNER: Toast de éxito para actualización
        toast.success("¡Ciclo actualizado!", {
          description: `El ciclo "${savedCycle.name}" ha sido actualizado correctamente.`,
          duration: 4000,
        });
        
      } else {
        // ✅ MODO CREACIÓN
        if (!canCreateCycle && values.isActive) {
          setServerError({
            message: 'No se puede crear el ciclo',
            details: ['Ya existe un ciclo activo. Desactívalo primero o marca este como inactivo.'],
          });
          
          toast.error("No se puede crear el ciclo", {
            description: "Ya existe un ciclo activo. Desactívalo primero.",
            duration: 5000,
          });
          return;
        }

        savedCycle = await createCycle({
          name: values.name,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
          isActive: values.isActive,
          isClosed: values.isClosed,
        });
        
        // ✅ SONNER: Toast de éxito para creación
        toast.success("¡Ciclo creado!", {
          description: `El ciclo "${savedCycle.name}" ha sido creado correctamente.`,
          duration: 4000,
        });
      }

      await refetchAll();
      
      onSuccess?.(savedCycle);
      
      // Reseteamos el formulario solo si estamos creando
      if (!isEditing) {
        form.reset();
      }

    } catch (error) {
      console.error('Error al guardar ciclo:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setServerError({
        message: isEditing ? 'Error al actualizar el ciclo' : 'Error al crear el ciclo',
        details: [errorMessage],
      });

      // ✅ SONNER: Toast de error
      toast.error(isEditing ? "Error al actualizar" : "Error al crear", {
        description: errorMessage,
        duration: 6000,
      });

      // Llamamos al callback de error si existe
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  };

  // Manejador para limpiar formulario
  const handleClear = () => {
    setServerError(null);
    form.reset();
    
    // ✅ SONNER: Toast informativo
    toast.info("Formulario limpiado", {
      description: "Se han restaurado los valores por defecto.",
      duration: 2000,
    });
  };

  // ✅ OPCIONAL: Función para recargar manualmente
  const handleRefresh = async () => {
    try {
      await refetchAll();
      toast.success("Datos actualizados", {
        description: "La información ha sido recargada correctamente.",
        duration: 3000,
      });
    } catch (error) {
      toast.error("Error al recargar", {
        description: "No se pudieron actualizar los datos.",
        duration: 4000,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Advertencia si hay múltiples activos */}
        {hasMultipleActive && (
          <Alert>
            <IoAlertCircleOutline className="h-4 w-4" />
            <AlertTitle>Advertencia</AlertTitle>
            <AlertDescription>
              Actualmente hay múltiples ciclos activos. Se recomienda tener solo uno activo.
            </AlertDescription>
          </Alert>
        )}

        {/* Nombre */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Ciclo *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej: Ciclo Escolar 2025" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha de inicio */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de inicio *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      {field.value
                        ? format(field.value, "PPP", { locale: es })
                        : "Selecciona una fecha"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 z-[90002]"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => field.onChange(date)}
                    initialFocus
                    locale={es}
                    disabled={isLoading}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha de fin */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de fin *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      {field.value
                        ? format(field.value, "PPP", { locale: es })
                        : "Selecciona una fecha"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 z-[90002]"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => field.onChange(date)}
                    initialFocus
                    locale={es}
                    disabled={isLoading}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Activo */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>¿Ciclo activo?</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Si está activo, se utilizará como ciclo escolar principal.
                  {hasMultipleActive && " (Actualmente hay múltiples ciclos activos)"}
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Cerrado */}
        <FormField
          control={form.control}
          name="isClosed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>¿Ciclo cerrado?</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Si se marca como cerrado, no se podrán inscribir más estudiantes.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Errores del servidor */}
        {serverError && (
          <Alert variant="destructive">
            <IoAlertCircleOutline className="h-4 w-4" />
            <AlertTitle>{serverError.message}</AlertTitle>
            <AlertDescription>
              {serverError.details?.length > 0 && (
                <ul className="list-disc list-inside text-sm">
                  {serverError.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={isLoading}
          >
            <AiOutlineClear className="mr-2" /> Limpiar
          </Button>

         

          <Button type="submit" disabled={isLoading}>
            <FaRegSave className="mr-2" />
            {isLoading 
              ? (isEditing ? "Actualizando..." : "Guardando...") 
              : (isEditing ? "Actualizar Ciclo" : "Guardar Ciclo")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}