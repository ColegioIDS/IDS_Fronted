// src/components/features/school-cycles/SchoolCycleForm.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorAlert } from '@/components/shared/feedback/ErrorAlert';
import { schoolCycleService } from '@/services/school-cycle.service';
import { SchoolCycle, CreateSchoolCycleDto, UpdateSchoolCycleDto } from '@/types/school-cycle.types';
import { createSchoolCycleSchema, updateSchoolCycleSchema } from '@/schemas/school-cycle.schema';
import { handleApiError } from '@/utils/handleApiError';
import { Calendar, CheckCircle } from 'lucide-react';
import { getModuleTheme } from '@/config/theme.config';

interface SchoolCycleFormProps {
  cycle?: SchoolCycle;
  onSuccess?: (cycle: SchoolCycle) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function SchoolCycleForm({
  cycle,
  onSuccess,
  onCancel,
  isLoading: externalLoading = false,
}: SchoolCycleFormProps) {
  const theme = getModuleTheme('school-cycle');
  const [formData, setFormData] = useState({
    name: cycle?.name || '',
    description: cycle?.description || '',
    academicYear: cycle?.academicYear?.toString() || new Date().getFullYear().toString(),
    startDate: cycle?.startDate ? new Date(cycle.startDate).toISOString().split('T')[0] : '',
    endDate: cycle?.endDate ? new Date(cycle.endDate).toISOString().split('T')[0] : '',
    isActive: cycle?.isActive || false,
    canEnroll: cycle?.canEnroll ?? true, // ← NUEVO
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(externalLoading);
  const [apiError, setApiError] = useState<{ message: string; details?: string[] } | null>(null);

  const validateForm = () => {
    try {
      const schema = cycle ? updateSchoolCycleSchema : createSchoolCycleSchema;
      const dataToValidate = {
        ...formData,
        academicYear: formData.academicYear ? parseInt(formData.academicYear) : undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      schema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (err: any) {
      const formErrors: Record<string, string> = {};
      if (err.errors) {
        err.errors.forEach((e: any) => {
          const path = e.path?.[0] || 'general';
          formErrors[path] = e.message;
        });
      }
      setErrors(formErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setApiError(null);

      const startDate = new Date(formData.startDate).toISOString();
      const endDate = new Date(formData.endDate).toISOString();

      let result: SchoolCycle;

      if (cycle) {
        const updateData: UpdateSchoolCycleDto = {};
        if (formData.name !== cycle.name) updateData.name = formData.name;
        if (formData.description !== (cycle.description || '')) updateData.description = formData.description;
        if (formData.academicYear !== (cycle.academicYear?.toString() || '')) {
          updateData.academicYear = parseInt(formData.academicYear);
        }
        if (startDate !== cycle.startDate) updateData.startDate = startDate;
        if (endDate !== cycle.endDate) updateData.endDate = endDate;
        if (formData.isActive !== cycle.isActive) updateData.isActive = formData.isActive;
        if (formData.canEnroll !== cycle.canEnroll) updateData.canEnroll = formData.canEnroll; // ← NUEVO

        result = await schoolCycleService.update(cycle.id, updateData);
      } else {
        const createData: CreateSchoolCycleDto = {
          name: formData.name,
          description: formData.description,
          academicYear: parseInt(formData.academicYear),
          startDate,
          endDate,
          isActive: formData.isActive,
          canEnroll: formData.canEnroll, // ← NUEVO
        };

        result = await schoolCycleService.create(createData);
      }

      onSuccess?.(result);
    } catch (err: any) {
      const handled = handleApiError(err, `Error al ${cycle ? 'actualizar' : 'crear'} ciclo escolar`);
      setApiError({
        message: handled.message,
        details: handled.details,
      });
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const isSubmitDisabled =
    isLoading ||
    !formData.name.trim() ||
    !formData.startDate ||
    !formData.endDate ||
    cycle?.isArchived ||
    externalLoading;

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
      <CardHeader className={`${theme.bg} border-b border-gray-200 dark:border-gray-800`}>
        <CardTitle className={`flex items-center gap-2 ${theme.text}`}>
          <Calendar className="w-5 h-5" strokeWidth={2.5} />
          {cycle ? 'Editar Ciclo Escolar' : 'Crear Nuevo Ciclo Escolar'}
        </CardTitle>
        <CardDescription>
          {cycle?.isArchived && (
            <span className="text-amber-600 dark:text-amber-400">
              ⚠️ Este ciclo está cerrado y no puede ser modificado
            </span>
          )}
          {!cycle?.isArchived && (
            <span>Completa los datos para {cycle ? 'actualizar' : 'crear'} un ciclo escolar</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {apiError && (
          <ErrorAlert 
            message={apiError.message} 
            title="Error al guardar" 
            details={apiError.details}
          />
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="font-medium text-gray-700 dark:text-gray-300">
            Nombre del Ciclo *
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Ciclo Escolar 2025"
            disabled={isLoading || cycle?.isArchived}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="font-medium text-gray-700 dark:text-gray-300">
            Descripción
          </Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descripción del ciclo escolar (opcional)"
            disabled={isLoading || cycle?.isArchived}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="academicYear" className="font-medium text-gray-700 dark:text-gray-300">
            Año Académico
          </Label>
          <Input
            id="academicYear"
            name="academicYear"
            type="number"
            min={2000}
            max={2099}
            value={formData.academicYear}
            onChange={handleChange}
            placeholder="2025"
            disabled={isLoading || cycle?.isArchived}
          />
          {errors.academicYear && <p className="text-sm text-red-600 dark:text-red-400">{errors.academicYear}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="font-medium text-gray-700 dark:text-gray-300">
              Fecha de Inicio *
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              disabled={isLoading || cycle?.isArchived}
              className={errors.startDate ? 'border-red-500' : ''}
            />
            {errors.startDate && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="font-medium text-gray-700 dark:text-gray-300">
              Fecha de Fin *
            </Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              disabled={isLoading || cycle?.isArchived}
              className={errors.endDate ? 'border-red-500' : ''}
            />
            {errors.endDate && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={isLoading || cycle?.isArchived}
              className="w-4 h-4 rounded border-gray-300 cursor-pointer"
            />
            <label htmlFor="isActive" className="flex items-center gap-2 cursor-pointer flex-1">
              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Activar este ciclo</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Solo puede haber un ciclo activo a la vez
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <input
              id="canEnroll"
              name="canEnroll"
              type="checkbox"
              checked={formData.canEnroll}
              onChange={handleChange}
              disabled={isLoading || cycle?.isArchived}
              className="w-4 h-4 rounded border-gray-300 cursor-pointer"
            />
            <label htmlFor="canEnroll" className="flex items-center gap-2 cursor-pointer flex-1">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" strokeWidth={2.5} />
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Permitir matrículas</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Permitir que se realicen nuevas matrículas en este ciclo
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`flex-1 ${theme.gradient} text-white hover:shadow-lg transition-all duration-300`}
          >
            {isLoading ? 'Guardando...' : cycle ? 'Actualizar Ciclo' : 'Crear Ciclo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}