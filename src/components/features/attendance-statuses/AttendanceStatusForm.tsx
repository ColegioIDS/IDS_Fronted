// src/components/features/attendance-statuses/AttendanceStatusForm.tsx
'use client';

import { useState } from 'react';
import { AttendanceStatus, CreateAttendanceStatusDto } from '@/types/attendance-status.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader, Save, X, AlertTriangle, ShieldCheck, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AttendanceStatusFormProps {
  initialData?: AttendanceStatus;
  onSubmit: (data: CreateAttendanceStatusDto | any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AttendanceStatusForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: AttendanceStatusFormProps) => {
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    colorCode: initialData?.colorCode || '#22c55e',
    isNegative: initialData?.isNegative || false,
    isTemporal: initialData?.isTemporal || false,
    isExcused: initialData?.isExcused || false,
    order: initialData?.order || 0,
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    } else if (formData.code.length > 10) {
      newErrors.code = 'El código no puede exceder 10 caracteres';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 3 || formData.name.length > 100) {
      newErrors.name = 'El nombre debe tener entre 3 y 100 caracteres';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, completa los campos requeridos correctamente');
      return;
    }

    try {
      await onSubmit(formData);
      // El éxito se maneja en el componente padre (AttendanceStatusesPageContent)
    } catch (error: any) {
      console.error('Error en handleSubmit:', error);
      // Extraer mensaje de error de diferentes formatos
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'Error al guardar el estado. Intenta de nuevo.';
      console.log('Mostrando toast con mensaje:', errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseInt(value) || 0
            : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <Card className="shadow-lg border-t-4 border-t-primary">
      <CardHeader className="border-b bg-muted/10 pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {initialData ? 'Editar Estado' : 'Nuevo Estado'}
            </CardTitle>
            <CardDescription>
              {initialData
                ? 'Modifica los detalles del estado de asistencia seleccionado'
                : 'Configura un nuevo estado de asistencia para el sistema'}
            </CardDescription>
          </div>
          <div 
            className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm border-2 border-white dark:border-slate-800"
            style={{ backgroundColor: formData.colorCode }}
          >
            <span className="font-bold text-white text-lg drop-shadow-sm">
              {formData.code || '?'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sección 1: Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-6 w-1 bg-primary rounded-full" />
                <h3 className="font-semibold text-lg">Información Básica</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Código */}
                  <div className="space-y-2">
                    <Label htmlFor="code" className="font-medium">
                      Código <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Ej: P"
                      maxLength={10}
                      disabled={isLoading}
                      className={cn(errors.code && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.code && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.code}
                      </p>
                    )}
                  </div>

                  {/* Orden */}
                  <div className="space-y-2">
                    <Label htmlFor="order" className="font-medium">
                      Orden
                    </Label>
                    <Input
                      id="order"
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleChange}
                      min="0"
                      max="999"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-medium">
                    Nombre del Estado <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: Presente"
                    disabled={isLoading}
                    className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="font-medium">
                    Descripción
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Breve descripción del estado..."
                    rows={3}
                    disabled={isLoading}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-6 w-1 bg-primary rounded-full" />
                <h3 className="font-semibold text-lg">Configuración y Propiedades</h3>
              </div>

              <div className="space-y-6">
                {/* Color */}
                <div className="space-y-3">
                  <Label htmlFor="color" className="font-medium">
                    Color Identificativo
                  </Label>
                  <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/20">
                    <input
                      id="color"
                      type="color"
                      name="colorCode"
                      value={formData.colorCode}
                      onChange={handleChange}
                      className="h-12 w-12 rounded cursor-pointer border-0 p-0 bg-transparent"
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Selecciona un color</p>
                      <p className="text-xs text-muted-foreground">Este color se usará en reportes y tablas</p>
                    </div>
                    <div className="text-xs font-mono bg-muted px-2 py-1 rounded border">
                      {formData.colorCode}
                    </div>
                  </div>
                </div>

                {/* Propiedades Checkboxes */}
                <div className="grid grid-cols-1 gap-3">
                  <div className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
                    formData.isNegative ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50" : "hover:bg-muted/50"
                  )}>
                    <Checkbox
                      id="isNegative"
                      checked={formData.isNegative}
                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                        setFormData((prev) => ({ ...prev, isNegative: checked === true }));
                      }}
                      className="mt-1 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="isNegative" className="font-medium cursor-pointer flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Es una Ausencia
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Marca negativamente el registro de asistencia del estudiante.
                      </p>
                    </div>
                  </div>

                  <div className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
                    formData.isExcused ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50" : "hover:bg-muted/50"
                  )}>
                    <Checkbox
                      id="isExcused"
                      checked={formData.isExcused}
                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                        setFormData((prev) => ({ ...prev, isExcused: checked === true }));
                      }}
                      className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="isExcused" className="font-medium cursor-pointer flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                        Es Justificable / Excusado
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        No afecta negativamente el porcentaje de asistencia.
                      </p>
                    </div>
                  </div>

                  <div className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
                    formData.isTemporal ? "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900/50" : "hover:bg-muted/50"
                  )}>
                    <Checkbox
                      id="isTemporal"
                      checked={formData.isTemporal}
                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                        setFormData((prev) => ({ ...prev, isTemporal: checked === true }));
                      }}
                      className="mt-1 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="isTemporal" className="font-medium cursor-pointer flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        Es Temporal
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Estado transitorio (ej. retardo) que puede cambiar.
                      </p>
                    </div>
                  </div>

                  <div className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
                    formData.isActive ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50" : "bg-muted/30"
                  )}>
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                        setFormData((prev) => ({ ...prev, isActive: checked === true }));
                      }}
                      className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="isActive" className="font-medium cursor-pointer flex items-center gap-2">
                        <Eye className="w-4 h-4 text-green-600" />
                        Estado Activo
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Disponible para ser seleccionado en los registros.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-4 pt-6 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="min-w-[120px]"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[140px] shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {initialData ? 'Guardar Cambios' : 'Crear Estado'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
