// src/components/features/attendance-statuses/AttendanceStatusForm.tsx
'use client';

import { useState } from 'react';
import { AttendanceStatus, CreateAttendanceStatusDto } from '@/types/attendance-status.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

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
    requiresJustification: initialData?.requiresJustification || false,
    isTemporal: initialData?.isTemporal || false,
    isExcused: initialData?.isExcused || false,
    canHaveNotes: initialData?.canHaveNotes ?? true,
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
      toast.success(initialData ? 'Estado actualizado correctamente' : 'Estado creado correctamente');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error al guardar el estado. Intenta de nuevo.');
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
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">
            {initialData ? 'Editar Estado de Asistencia' : 'Crear Nuevo Estado'}
          </CardTitle>
          <CardDescription>
            {initialData
              ? 'Modifica los detalles del estado de asistencia'
              : 'Define un nuevo estado con sus propiedades y configuración'}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sección 1: Información Básica */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
              <h3 className="text-lg font-semibold text-foreground">Información Básica</h3>
            </div>

            <div className="space-y-4 pl-4">
              {/* Código */}
              <div className="space-y-2">
                <Label htmlFor="code" className="font-semibold">
                  Código <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Ej: P, I, R"
                  maxLength={10}
                  disabled={isLoading || !!initialData}
                  className="h-10 w-full"
                />
                {errors.code && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.code}
                  </p>
                )}
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Presente"
                  disabled={isLoading}
                  className="h-10 w-full"
                />
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold">
                  Descripción
                </Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe este estado de asistencia..."
                  rows={3}
                  disabled={isLoading}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sección 2: Presentación Visual */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
              <h3 className="text-lg font-semibold text-foreground">Presentación Visual</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
              {/* Color */}
              <div className="space-y-3">
                <Label htmlFor="color" className="font-semibold">
                  Color del Estado
                </Label>
                <div className="flex gap-3 items-center">
                  <input
                    id="color"
                    type="color"
                    name="colorCode"
                    value={formData.colorCode}
                    onChange={handleChange}
                    className="h-10 w-10 rounded-full border-2 border-input cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                    disabled={isLoading}
                  />
                  <Input
                    type="text"
                    value={formData.colorCode}
                    onChange={handleChange}
                    name="colorCode"
                    placeholder="#22c55e"
                    className="flex-1 font-mono text-xs h-9"
                    disabled={isLoading}
                  />
                  <div
                    className="h-10 w-10 rounded-full border-2 border-input shadow-md"
                    style={{ backgroundColor: formData.colorCode }}
                  />
                </div>
              </div>

              {/* Orden */}
              <div className="space-y-2">
                <Label htmlFor="order" className="font-semibold">
                  Orden de Visualización
                </Label>
                <Input
                  id="order"
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  min="0"
                  max="999"
                  className="h-10"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Propiedades del Estado */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
              <h3 className="text-lg font-semibold text-foreground">Propiedades del Estado</h3>
            </div>

            {/* Grid de checkboxes - mejorado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
              {/* Ausencia */}
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-colors cursor-pointer">
                <Checkbox
                  id="isNegative"
                  name="isNegative"
                  checked={formData.isNegative}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({ ...prev, isNegative: checked as boolean }));
                  }}
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="isNegative" className="text-sm font-semibold cursor-pointer">
                    Es una Ausencia
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Marca negativamente el registro de asistencia
                  </p>
                </div>
              </div>

              {/* Justificación */}
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors cursor-pointer">
                <Checkbox
                  id="requiresJustification"
                  name="requiresJustification"
                  checked={formData.requiresJustification}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({ ...prev, requiresJustification: checked as boolean }));
                  }}
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="requiresJustification" className="text-sm font-semibold cursor-pointer">
                    Requiere Justificación
                  </Label>
                  <p className="text-xs text-muted-foreground">El estudiante debe justificar</p>
                </div>
              </div>

              {/* Temporal */}
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-900/50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-colors cursor-pointer">
                <Checkbox
                  id="isTemporal"
                  name="isTemporal"
                  checked={formData.isTemporal}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({ ...prev, isTemporal: checked as boolean }));
                  }}
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="isTemporal" className="text-sm font-semibold cursor-pointer">
                    Es Temporal
                  </Label>
                  <p className="text-xs text-muted-foreground">Vigencia limitada en el tiempo</p>
                </div>
              </div>

              {/* Notas */}
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/40 transition-colors cursor-pointer">
                <Checkbox
                  id="canHaveNotes"
                  name="canHaveNotes"
                  checked={formData.canHaveNotes}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({ ...prev, canHaveNotes: checked as boolean }));
                  }}
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="canHaveNotes" className="text-sm font-semibold cursor-pointer">
                    Puede Tener Notas
                  </Label>
                  <p className="text-xs text-muted-foreground">Permite agregar anotaciones</p>
                </div>
              </div>

              {/* Excusado */}
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-cyan-200 bg-cyan-50 dark:border-cyan-900/50 dark:bg-cyan-950/20 hover:bg-cyan-100 dark:hover:bg-cyan-950/40 transition-colors cursor-pointer">
                <Checkbox
                  id="isExcused"
                  name="isExcused"
                  checked={formData.isExcused}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({ ...prev, isExcused: checked as boolean }));
                  }}
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="isExcused" className="text-sm font-semibold cursor-pointer">
                    Es Excusado
                  </Label>
                  <p className="text-xs text-muted-foreground">Considera como asistencia válida</p>
                </div>
              </div>

              {/* Activo */}
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/40 transition-colors cursor-pointer">
                <Checkbox
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({ ...prev, isActive: checked as boolean }));
                  }}
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">
                    Está Activo
                  </Label>
                  <p className="text-xs text-muted-foreground">Disponible para usar</p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              variant="outline"
              className="flex-1 h-11"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : initialData ? (
                'Actualizar Estado'
              ) : (
                'Crear Estado'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
