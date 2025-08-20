// src/components/grades/GradeForm.tsx
'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGradeForm } from '@/context/GradeContext';
import { gradeSchema, defaultValues } from '@/schemas/grade';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  Save, 
  X, 
  Baby, 
  GraduationCap,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

type GradeFormData = z.infer<typeof gradeSchema>;

interface GradeFormProps {
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSuccess: () => void;
}

export default function GradeForm({ mode, onCancel, onSuccess }: GradeFormProps) {
  const {
    submitting,
    currentGrade,
    handleSubmit: submitGrade
  } = useGradeForm();

  const form = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues,
  });

  // Cargar datos del grado actual si estamos editando
  useEffect(() => {
    if (mode === 'edit' && currentGrade) {
      form.reset({
        name: currentGrade.name,
        level: currentGrade.level,
        order: currentGrade.order,
        isActive: currentGrade.isActive,
      });
    } else if (mode === 'create') {
      form.reset(defaultValues);
    }
  }, [mode, currentGrade, form]);

  const onSubmit = async (data: GradeFormData) => {
    try {
      const result = await submitGrade(data);
      
      if (result.success) {
        onSuccess();
      } else {
        // Mostrar error general
        toast.error(result.message || 'Error al guardar el grado');
      }
    } catch (error: any) {
      console.error('Error en el formulario:', error);
      
      // Si el error tiene detalles de validación, procesarlos
      if (error.response?.data?.details) {
        error.response.data.details.forEach((detail: any) => {
          if (detail.field && detail.field in data) {
            form.setError(detail.field as keyof GradeFormData, {
              type: 'server',
              message: detail.message
            });
          }
        });
      } else {
        // Error general
        toast.error(error.message || 'Error inesperado al guardar el grado');
      }
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Kinder':
        return <Baby className="h-4 w-4 text-pink-500" />;
      case 'Primaria':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'Secundaria':
        return <GraduationCap className="h-4 w-4 text-purple-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  const hasFormErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <div className={`p-2 rounded-lg ${
              mode === 'create' ? 'bg-blue-100' : 'bg-purple-100'
            }`}>
              <BookOpen className={`h-5 w-5 ${
                mode === 'create' ? 'text-blue-600' : 'text-purple-600'
              }`} />
            </div>
            <span>
              {mode === 'create' ? 'Crear Nuevo Grado' : 'Editar Grado'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre del grado */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Nombre del Grado *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Primer Grado, Quinto de Primaria..."
                      {...field}
                      disabled={submitting}
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Ingresa un nombre descriptivo para el grado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nivel educativo */}
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Nivel Educativo *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={submitting}
                  >
                    <FormControl>
                      <SelectTrigger className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Selecciona un nivel educativo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Kinder">
                        <div className="flex items-center space-x-2">
                          <Baby className="h-4 w-4 text-pink-500" />
                          <span>Kinder</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Primaria">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span>Primaria</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Secundaria">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 text-purple-500" />
                          <span>Secundaria</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-gray-500">
                    Define a qué nivel educativo pertenece este grado
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
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Orden de Visualización *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1"
                      min="1"
                      max="20"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      disabled={submitting}
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Número que determina el orden de aparición (1 = primero)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado activo */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 space-y-0 bg-gray-50">
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Estado del Grado
                    </FormLabel>
                    <FormDescription className="text-xs text-gray-500 max-w-xs">
                      {field.value 
                        ? 'El grado estará disponible para inscripciones y será visible en el sistema'
                        : 'El grado estará oculto y no permitirá nuevas inscripciones'
                      }
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        field.value ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {field.value ? 'Activo' : 'Inactivo'}
                      </span>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={submitting}
                        className="data-[state=checked]:bg-green-600"
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Alerta de errores */}
            {hasFormErrors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Por favor, corrige los errores en el formulario antes de continuar.
                </AlertDescription>
              </Alert>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </Button>
              
              <Button
                type="submit"
                disabled={submitting || hasFormErrors}
                className={`flex items-center space-x-2 ${
                  mode === 'create' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>
                      {mode === 'create' ? 'Crear Grado' : 'Actualizar Grado'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}