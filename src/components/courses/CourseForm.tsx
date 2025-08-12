'use client';

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCourseContext } from '@/context/CourseContext';
import { Loader2, Save, X } from 'lucide-react';

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode?: boolean;
  courseId?: number;
}

export function CourseForm({ open, onOpenChange, isEditMode = false, courseId }: CourseFormProps) {
  const {
    form,
    isSubmitting,
    createCourse,
    updateCourse,
    currentCourse,
    resetForm
  } = useCourseContext();

  // Areas disponibles
  const areas = [
    'Científica',
    'Humanística',
    'Artística',
    'Deportiva',
    'Tecnológica'
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
  ];

  const onSubmit = async (data: any) => {
    let result;

    if (isEditMode && courseId) {
      result = await updateCourse(courseId, data);
    } else {
      result = await createCourse(data);
    }

    if (result?.success) {
      onOpenChange(false);
      resetForm();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] z-[100]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Curso' : 'Crear Nuevo Curso'}
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
                        {...field}
                        value={field.value || ''}
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
                      value={field.value || undefined}
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
                      {...field}
                      value={field.value || ''}
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
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar color" />
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
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: form.watch('color') ?? undefined }}
                />
                <span className="text-sm text-gray-600">
                  Vista previa del color seleccionado
                </span>
              </div>
            )}


            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditMode ? 'Actualizar' : 'Crear'} Curso
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}