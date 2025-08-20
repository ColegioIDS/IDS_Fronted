'use client';

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCourseForm } from '@/context/CourseContext';
import { Loader2, Save, X, AlertCircle } from 'lucide-react';
import { CourseFormValues, CourseArea } from '@/types/courses';
import { courseSchema, defaultCourseValues } from '@/schemas/courses';
import { toast } from 'react-toastify';

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'create' | 'edit';
}

export function CourseForm({ open, onOpenChange, mode = 'create' }: CourseFormProps) {
  const {
    submitting,
    formMode,
    currentCourse,
    handleSubmit,
    cancelForm
  } = useCourseForm();

  // Form con react-hook-form y zod
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: defaultCourseValues
  });

  // Areas disponibles
  const areas: CourseArea[] = [
    'Científica',
    'Humanística',
    'Sociales',
    'Tecnológica',
    'Artística',
    'Idiomas',
    'Educación Física'
  ];

  // Colores predefinidos
  const colors = [
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Púrpura', value: '#8B5CF6' },
    { name: 'Amarillo', value: '#F59E0B' },
    { name: 'Rojo', value: '#EF4444' },
    { name: 'Cian', value: '#06B6D4' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Naranja', value: '#F97316' },
    { name: 'Índigo', value: '#6366F1' },
    { name: 'Lima', value: '#84CC16' },
    { name: 'Esmeralda', value: '#059669' },
    { name: 'Slate', value: '#64748B' }
  ];

  // Efecto para cargar datos en modo edición
  useEffect(() => {
    if (open && formMode === 'edit' && currentCourse) {
      form.reset({
        code: currentCourse.code,
        name: currentCourse.name,
        area: currentCourse.area || null,
        color: currentCourse.color || null,
        isActive: currentCourse.isActive
      });
    } else if (open && formMode === 'create') {
      form.reset(defaultCourseValues);
    }
  }, [open, formMode, currentCourse, form]);

  // Función para enviar el formulario
  const onSubmit = async (data: CourseFormValues) => {
    try {
      const result = await handleSubmit(data);
      
      if (result?.success) {
        handleClose();
        toast.success(
          formMode === 'edit' 
            ? 'Curso actualizado correctamente' 
            : 'Curso creado correctamente'
        );
      } else {
        // Manejar errores de validación del servidor
        if (result?.details && Array.isArray(result.details)) {
          result.details.forEach((detail: any) => {
            if (detail.field && detail.message) {
              form.setError(detail.field as keyof CourseFormValues, {
                type: 'server',
                message: detail.message
              });
            }
          });
        } else {
          toast.error(result?.message || 'Error al procesar el formulario');
        }
      }
    } catch (error) {
      console.error('Error en el formulario:', error);
      toast.error('Error inesperado al procesar el formulario');
    }
  };

  // Función para cerrar el formulario
  const handleClose = () => {
    form.reset(defaultCourseValues);
    cancelForm();
    onOpenChange(false);
  };

  // Función para manejar cambios en el dialog
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !submitting) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'edit' ? 'Editar Curso' : 'Crear Nuevo Curso'}
            {mode === 'edit' && currentCourse && (
              <span className="text-sm font-normal text-gray-500">
                ({currentCourse.code})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Código del curso */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código del Curso *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ej. MATE-101"
                        disabled={submitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Área */}
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={submitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar área" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[101]">
                        {areas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Nombre del curso */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Curso *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ej. Matemáticas Básicas"
                      disabled={submitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Color */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={submitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar color">
                            {field.value && (
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: field.value }}
                                />
                                {colors.find(c => c.value === field.value)?.name || 'Color personalizado'}
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[101]">
                        {colors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: color.value }}
                              />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado activo */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <FormLabel>Estado</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={submitting}
                        />
                      </FormControl>
                      <Label className="text-sm">
                        {field.value ? 'Activo' : 'Inactivo'}
                      </Label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Preview del color seleccionado */}
            {form.watch('color') && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200"
                  style={{ backgroundColor: form.watch('color') || undefined }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    Vista previa del color
                  </span>
                  <span className="text-xs text-gray-500">
                    {form.watch('color')}
                  </span>
                </div>
              </div>
            )}

            {/* Indicador de errores generales */}
            {form.formState.errors.root && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">
                  {form.formState.errors.root.message}
                </span>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || !form.formState.isValid}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {formMode === 'edit' ? 'Actualizar' : 'Crear'} Curso
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}