// src/components/attendance-config/AttendanceConfigDialogs.tsx

'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Check, X, Clock } from 'lucide-react';
import {
  AttendanceConfig,
  UpdateAttendanceConfigDto,
  CreateAttendanceConfigDto,
} from '@/types/attendanceConfig';
import { combineTheme, getThemeClass } from '@/theme/attendanceConfigTheme';

interface EditConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: AttendanceConfig | null;
  onSave: (updates: UpdateAttendanceConfigDto) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Diálogo para editar configuración de asistencia
 */
export const EditAttendanceConfigDialog: React.FC<EditConfigDialogProps> = ({
  open,
  onOpenChange,
  config,
  onSave,
  isLoading = false,
  error = null,
}) => {
  const [formData, setFormData] = React.useState<UpdateAttendanceConfigDto>({});
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  // Inicializar formulario con datos de config
  useEffect(() => {
    if (config) {
      setFormData({
        riskThresholdPercentage: config.riskThresholdPercentage,
        lateThresholdTime: config.lateThresholdTime,
        markAsTardyAfterMinutes: config.markAsTardyAfterMinutes,
        consecutiveAbsenceAlert: config.consecutiveAbsenceAlert,
        justificationRequiredAfter: config.justificationRequiredAfter,
        maxJustificationDays: config.maxJustificationDays,
        autoApproveJustification: config.autoApproveJustification,
        autoApprovalAfterDays: config.autoApprovalAfterDays,
        negativeStatusCodes: config.negativeStatusCodes,
        notesRequiredForStates: config.notesRequiredForStates,
      });
      setValidationErrors({});
    }
  }, [config, open]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.riskThresholdPercentage !== undefined) {
      const pct = formData.riskThresholdPercentage;
      if (pct < 0 || pct > 100) {
        errors.riskThresholdPercentage = 'Debe estar entre 0 y 100';
      }
    }

    if (formData.lateThresholdTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.lateThresholdTime)) {
        errors.lateThresholdTime = 'Formato inválido. Use HH:MM';
      }
    }

    if (formData.markAsTardyAfterMinutes !== undefined) {
      const mins = formData.markAsTardyAfterMinutes;
      if (mins < 1 || mins > 120) {
        errors.markAsTardyAfterMinutes = 'Debe estar entre 1 y 120';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            Editar Configuración de Asistencia
          </DialogTitle>
          <DialogDescription>
            Actualiza los parámetros del sistema de asistencia
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          <form onSubmit={handleSubmit} className="space-y-6 pr-4">
            {error && (
              <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Sección 1: Horarios y Tardanzas */}
            <div className={combineTheme(
              'bg-blue-50 rounded-lg p-4',
              'dark:bg-blue-900/20'
            )}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horarios y Tardanzas
              </h3>

              <div className="space-y-4">
                {/* Hora Límite */}
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">
                    Hora Límite para Asistencia (HH:MM)
                  </Label>
                  <Input
                    type="time"
                    value={formData.lateThresholdTime || ''}
                    onChange={e => handleChange('lateThresholdTime', e.target.value)}
                    className={combineTheme(
                      'bg-white border-gray-300 text-gray-900',
                      'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100'
                    )}
                  />
                  {validationErrors.lateThresholdTime && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {validationErrors.lateThresholdTime}
                    </p>
                  )}
                </div>

                {/* Marcar como Tardío */}
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">
                    Marcar como Tardío (minutos)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.markAsTardyAfterMinutes || ''}
                    onChange={e =>
                      handleChange('markAsTardyAfterMinutes', parseInt(e.target.value))
                    }
                    className={combineTheme(
                      'bg-white border-gray-300 text-gray-900',
                      'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100'
                    )}
                  />
                  {validationErrors.markAsTardyAfterMinutes && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {validationErrors.markAsTardyAfterMinutes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            {/* Sección 2: Umbrales y Alertas */}
            <div className={combineTheme(
              'bg-amber-50 rounded-lg p-4',
              'dark:bg-amber-900/20'
            )}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Umbrales y Alertas
              </h3>

              <div className="space-y-4">
                {/* Umbral de Riesgo */}
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">
                    Umbral de Riesgo (%)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.riskThresholdPercentage || ''}
                    onChange={e =>
                      handleChange('riskThresholdPercentage', parseFloat(e.target.value))
                    }
                    className={combineTheme(
                      'bg-white border-gray-300 text-gray-900',
                      'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100'
                    )}
                  />
                  {validationErrors.riskThresholdPercentage && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {validationErrors.riskThresholdPercentage}
                    </p>
                  )}
                </div>

                {/* Alertas Consecutivas */}
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">
                    Ausencias Consecutivas para Alerta
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.consecutiveAbsenceAlert || ''}
                    onChange={e =>
                      handleChange('consecutiveAbsenceAlert', parseInt(e.target.value))
                    }
                    className={combineTheme(
                      'bg-white border-gray-300 text-gray-900',
                      'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100'
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            {/* Sección 3: Justificaciones */}
            <div className={combineTheme(
              'bg-green-50 rounded-lg p-4',
              'dark:bg-green-900/20'
            )}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Justificaciones
              </h3>

              <div className="space-y-4">
                {/* Justificación Requerida */}
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">
                    Ausencias Antes de Requerir Justificación
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.justificationRequiredAfter || ''}
                    onChange={e =>
                      handleChange('justificationRequiredAfter', parseInt(e.target.value))
                    }
                    className={combineTheme(
                      'bg-white border-gray-300 text-gray-900',
                      'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100'
                    )}
                  />
                </div>

                {/* Plazo Máximo */}
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">
                    Plazo Máximo para Justificar (días)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.maxJustificationDays || ''}
                    onChange={e =>
                      handleChange('maxJustificationDays', parseInt(e.target.value))
                    }
                    className={combineTheme(
                      'bg-white border-gray-300 text-gray-900',
                      'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100'
                    )}
                  />
                </div>

                {/* Auto-aprobar */}
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <Label className="text-gray-700 dark:text-gray-300">
                    Auto-aprobar Justificaciones
                  </Label>
                  <Switch
                    checked={formData.autoApproveJustification || false}
                    onCheckedChange={value =>
                      handleChange('autoApproveJustification', value)
                    }
                  />
                </div>

                {/* Días para Auto-aprobar */}
                {formData.autoApproveJustification && (
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">
                      Días para Auto-aprobar
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.autoApprovalAfterDays || ''}
                      onChange={e =>
                        handleChange('autoApprovalAfterDays', parseInt(e.target.value))
                      }
                      className={combineTheme(
                        'bg-white border-gray-300 text-gray-900',
                        'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100'
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving || isLoading}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CreateConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults: any | null;
  onCreate: (data: CreateAttendanceConfigDto) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Diálogo para crear nueva configuración
 */
export const CreateAttendanceConfigDialog: React.FC<CreateConfigDialogProps> = ({
  open,
  onOpenChange,
  defaults,
  onCreate,
  isLoading = false,
  error = null,
}) => {
  const [formData, setFormData] = React.useState<CreateAttendanceConfigDto>({});
  const [isCreating, setIsCreating] = React.useState(false);

  useEffect(() => {
    if (defaults) {
      setFormData(defaults);
    }
  }, [defaults, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await onCreate(formData);
      setFormData({});
      onOpenChange(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            Crear Nueva Configuración
          </DialogTitle>
          <DialogDescription>
            Define los parámetros para una nueva configuración de asistencia
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          <form onSubmit={handleSubmit} className="space-y-6 pr-4">
            {error && (
              <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Información */}
            <div className={combineTheme(
              'bg-cyan-50 rounded-lg p-4 border border-cyan-200',
              'dark:bg-cyan-900/20 dark:border-cyan-800'
            )}>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Se crearán copias de los valores predeterminados del sistema. Puedes editar después.
              </p>
            </div>

            {/* Datos de configuración */}
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Umbral de Riesgo (%)
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  defaultValue={defaults?.riskThresholdPercentage || 80}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      riskThresholdPercentage: parseFloat(e.target.value),
                    }))
                  }
                  className={combineTheme(
                    'bg-white border-gray-300 text-gray-900',
                    'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100'
                  )}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                <Label className="text-gray-700 dark:text-gray-300">
                  Activar esta configuración
                </Label>
                <Switch
                  defaultChecked={true}
                  onCheckedChange={value => setFormData(prev => ({ ...prev, isActive: value }))}
                />
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreating || isLoading}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          >
            {isCreating ? 'Creando...' : 'Crear Configuración'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default { EditAttendanceConfigDialog, CreateAttendanceConfigDialog };