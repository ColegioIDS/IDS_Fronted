// src/components/features/attendance-config/components/ConfigEditView.tsx
'use client';

import React, { useState } from 'react';
import { AttendanceConfig, UpdateAttendanceConfigDto, CreateAttendanceConfigDto } from '@/types/attendance-config.types';
import { ConfigCard } from './ConfigCard';
import { ConfigField } from './ConfigField';
import { AlertCircle, Clock, AlertTriangle, CheckCircle2, Save, X } from 'lucide-react';

interface ConfigEditViewProps {
  config: AttendanceConfig;
  onSave: (data: UpdateAttendanceConfigDto | CreateAttendanceConfigDto | Partial<AttendanceConfig>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData extends UpdateAttendanceConfigDto {
  showAutoApprovalDays: boolean;
}

export const ConfigEditView: React.FC<ConfigEditViewProps> = ({
  config,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: config.name || '',
    description: config.description || '',
    riskThresholdPercentage: config.riskThresholdPercentage,
    consecutiveAbsenceAlert: config.consecutiveAbsenceAlert,
    defaultNotesPlaceholder: config.defaultNotesPlaceholder,
    lateThresholdTime: config.lateThresholdTime,
    markAsTardyAfterMinutes: config.markAsTardyAfterMinutes,
    justificationRequiredAfter: config.justificationRequiredAfter,
    maxJustificationDays: config.maxJustificationDays,
    autoApproveJustification: config.autoApproveJustification,
    autoApprovalAfterDays: config.autoApprovalAfterDays,
    isActive: config.isActive,
    showAutoApprovalDays: config.autoApproveJustification,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 3 || formData.name.length > 255) {
      newErrors.name = 'El nombre debe tener entre 3 y 255 caracteres';
    }

    if (
      typeof formData.riskThresholdPercentage === 'number' &&
      (formData.riskThresholdPercentage < 0 || formData.riskThresholdPercentage > 100)
    ) {
      newErrors.riskThresholdPercentage = 'Debe estar entre 0 y 100';
    }

    if (
      formData.consecutiveAbsenceAlert &&
      formData.consecutiveAbsenceAlert < 1
    ) {
      newErrors.consecutiveAbsenceAlert = 'Debe ser al menos 1';
    }

    if (
      formData.markAsTardyAfterMinutes &&
      (formData.markAsTardyAfterMinutes < 1 ||
        formData.markAsTardyAfterMinutes > 120)
    ) {
      newErrors.markAsTardyAfterMinutes = 'Debe estar entre 1 y 120';
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (
      formData.lateThresholdTime &&
      !timeRegex.test(formData.lateThresholdTime as string)
    ) {
      newErrors.lateThresholdTime = 'Formato debe ser HH:MM';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const { showAutoApprovalDays, ...dataToSave } = formData;
      await onSave(dataToSave);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (key: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'autoApproveJustification' && {
        showAutoApprovalDays: value,
      }),
    }));
    // Limpiar error del campo
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-8">
      {/* Información Básica */}
      <ConfigCard
        title="Información Básica"
        description="Nombre y descripción de la configuración"
        type="threshold"
        icon={AlertCircle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <ConfigField
              label="Nombre"
              value={config.name || ''}
              editValue={formData.name}
              isEditing={true}
              onChange={(value) => handleFieldChange('name', value)}
              type="text"
              error={errors.name}
            />
          </div>
          <div className="md:col-span-2">
            <ConfigField
              label="Descripción"
              value={config.description || ''}
              editValue={formData.description}
              isEditing={true}
              onChange={(value) => handleFieldChange('description', value)}
              type="textarea"
            />
          </div>
        </div>
      </ConfigCard>

      {/* Umbral de Riesgo y Alertas */}
      <ConfigCard
        title="Umbral de Riesgo y Alertas"
        description="Configuración de límites de asistencia para alertas"
        type="threshold"
        icon={AlertCircle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigField
            label="Porcentaje Mínimo de Asistencia (%)"
            value={config.riskThresholdPercentage}
            editValue={formData.riskThresholdPercentage}
            isEditing={true}
            onChange={(value) =>
              handleFieldChange('riskThresholdPercentage', value)
            }
            type="number"
            min={0}
            max={100}
            helperText="Rango: 0-100%"
            error={errors.riskThresholdPercentage}
          />
          <ConfigField
            label="Alertas Consecutivas"
            value={config.consecutiveAbsenceAlert}
            editValue={formData.consecutiveAbsenceAlert}
            isEditing={true}
            onChange={(value) =>
              handleFieldChange('consecutiveAbsenceAlert', value)
            }
            type="number"
            min={1}
            helperText="Número de ausencias antes de alertar"
            error={errors.consecutiveAbsenceAlert}
          />
        </div>
      </ConfigCard>

      {/* Tardanza */}
      <ConfigCard
        title="Configuración de Tardanza"
        description="Parámetros para marcar asistencia como tardía"
        type="timing"
        icon={Clock}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigField
            label="Hora Límite de Llegada (HH:MM)"
            value={config.lateThresholdTime}
            editValue={formData.lateThresholdTime}
            isEditing={true}
            onChange={(value) =>
              handleFieldChange('lateThresholdTime', value)
            }
            type="time"
            helperText="Ej: 08:30"
            error={errors.lateThresholdTime}
          />
          <ConfigField
            label="Minutos para Marcar Tardío"
            value={config.markAsTardyAfterMinutes}
            editValue={formData.markAsTardyAfterMinutes}
            isEditing={true}
            onChange={(value) =>
              handleFieldChange('markAsTardyAfterMinutes', value)
            }
            type="number"
            min={1}
            max={120}
            helperText="Rango: 1-120 minutos"
            error={errors.markAsTardyAfterMinutes}
          />
        </div>
      </ConfigCard>

      {/* Justificaciones */}
      <ConfigCard
        title="Justificación de Ausencias"
        description="Reglas para justificar inasistencias"
        type="justification"
        icon={AlertTriangle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigField
            label="Requiere Justificación Después de"
            value={config.justificationRequiredAfter}
            editValue={formData.justificationRequiredAfter}
            isEditing={true}
            onChange={(value) =>
              handleFieldChange('justificationRequiredAfter', value)
            }
            type="number"
            min={1}
            helperText="Número de ausencias"
            error={errors.justificationRequiredAfter}
          />
          <ConfigField
            label="Días Máximos para Justificar"
            value={config.maxJustificationDays}
            editValue={formData.maxJustificationDays}
            isEditing={true}
            onChange={(value) =>
              handleFieldChange('maxJustificationDays', value)
            }
            type="number"
            min={1}
            helperText="Máximo de días hábiles"
            error={errors.maxJustificationDays}
          />
        </div>
      </ConfigCard>

      {/* Aprobación Automática */}
      <ConfigCard
        title="Aprobación Automática"
        description="Configuración de auto-aprobación de justificaciones"
        type="approval"
        icon={CheckCircle2}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigField
            label="Auto-aprobar Justificaciones"
            value={config.autoApproveJustification}
            editValue={formData.autoApproveJustification}
            isEditing={true}
            onChange={(value) =>
              handleFieldChange('autoApproveJustification', value)
            }
            type="checkbox"
            helperText="Aprobar automáticamente después de X días"
          />
          {formData.showAutoApprovalDays && (
            <ConfigField
              label="Días para Auto-aprobación"
              value={config.autoApprovalAfterDays}
              editValue={formData.autoApprovalAfterDays}
              isEditing={true}
              onChange={(value) =>
                handleFieldChange('autoApprovalAfterDays', value)
              }
              type="number"
              min={1}
              helperText="Días antes de auto-aprobar"
            />
          )}
        </div>
      </ConfigCard>

      {/* Botones de Acción */}
      <div className="flex gap-3 pt-8 border-t-2 border-slate-200 dark:border-slate-700">
        <button
          type="submit"
          disabled={isSaving || loading}
          className="flex-1 px-5 py-3.5 text-sm inline-flex items-center justify-center font-medium gap-2 rounded-lg transition bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving || loading}
          className="flex-1 px-5 py-3.5 text-sm inline-flex items-center justify-center font-medium gap-2 rounded-lg transition bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </button>
      </div>
    </form>
  );
};
