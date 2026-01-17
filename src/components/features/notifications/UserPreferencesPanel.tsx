// src/components/features/notifications/UserPreferencesPanel.tsx
'use client';

import { useNotificationPreferences } from '@/hooks/data/notifications';
import { UpdatePreferenceDto } from '@/types/notifications.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { handleApiError } from '@/utils/handleApiError';

export function UserPreferencesPanel() {
  const { preferences, isLoading, error, isUpdating, updatePreferences } = useNotificationPreferences();
  const [localPrefs, setLocalPrefs] = useState<UpdatePreferenceDto | null>(null);

  const handleChange = (key: keyof UpdatePreferenceDto, value: any) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!localPrefs) return;

    try {
      await updatePreferences(localPrefs);
      setLocalPrefs(null);
      toast.success('Preferencias actualizadas correctamente');
    } catch (error) {
      const handled = handleApiError(error);
      // toast.error already called by handleApiError
      throw new Error(handled.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !preferences) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          {error || 'Error al cargar preferencias'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Por Tipo de Notificación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tipos de Notificaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'enableAlerts' as const, label: 'Alertas' },
            { key: 'enableReminders' as const, label: 'Recordatorios' },
            { key: 'enableGrades' as const, label: 'Calificaciones' },
            { key: 'enableAssignment' as const, label: 'Tareas' },
            { key: 'enableAttendance' as const, label: 'Asistencia' },
            { key: 'enableInfo' as const, label: 'Información' },
            { key: 'enableCustom' as const, label: 'Personalizadas' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="font-normal cursor-pointer">{label}</Label>
              <Switch
                checked={(localPrefs?.[key] ?? preferences?.[key] ?? true) as boolean}
                onCheckedChange={(checked) =>
                  handleChange(key as keyof UpdatePreferenceDto, checked)
                }
                disabled={isUpdating}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Por Canal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Canales de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* IN_APP - Siempre activo */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <Label className="font-normal cursor-pointer font-semibold">En la Aplicación (IN_APP)</Label>
              <p className="text-xs text-green-600 mt-1">Siempre habilitado</p>
            </div>
            <Switch checked={true} disabled={true} />
          </div>

          {[
            { key: 'emailEnabled' as const, label: 'Correo Electrónico', disabled: true },
            { key: 'pushEnabled' as const, label: 'Notificaciones Push', disabled: true },
            { key: 'smsEnabled' as const, label: 'SMS', disabled: true },
            { key: 'whatsappEnabled' as const, label: 'WhatsApp', disabled: true },
          ].map(({ key, label, disabled }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="font-normal cursor-pointer">{label}</Label>
                {disabled && <p className="text-xs text-gray-500 mt-1">Próximamente</p>}
              </div>
              <Switch
                checked={(localPrefs?.[key] ?? preferences?.[key] ?? false) as boolean}
                onCheckedChange={(checked) =>
                  handleChange(key as keyof UpdatePreferenceDto, checked)
                }
                disabled={isUpdating || disabled}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Horas de Silencio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-normal">Habilitar horas de silencio</Label>
            <Switch
              checked={localPrefs?.quietHoursEnabled ?? preferences?.quietHoursEnabled ?? false}
              onCheckedChange={(checked) =>
                handleChange('quietHoursEnabled', checked)
              }
              disabled={isUpdating}
            />
          </div>

          {(localPrefs?.quietHoursEnabled ?? preferences?.quietHoursEnabled) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start" className="text-sm">
                  Desde
                </Label>
                <Input
                  id="start"
                  type="time"
                  value={localPrefs?.quietHoursStart ?? preferences?.quietHoursStart ?? ''}
                  onChange={(e) => handleChange('quietHoursStart', e.target.value)}
                  disabled={isUpdating}
                />
              </div>
              <div>
                <Label htmlFor="end" className="text-sm">
                  Hasta
                </Label>
                <Input
                  id="end"
                  type="time"
                  value={localPrefs?.quietHoursEnd ?? preferences?.quietHoursEnd ?? ''}
                  onChange={(e) => handleChange('quietHoursEnd', e.target.value)}
                  disabled={isUpdating}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Frecuencia de Resumen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Frecuencia de Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={localPrefs?.digestFrequency ?? preferences?.digestFrequency ?? 'IMMEDIATE'}
            onValueChange={(value) =>
              handleChange('digestFrequency', value as any)
            }
            disabled={isUpdating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IMMEDIATE">Inmediato</SelectItem>
              <SelectItem value="DAILY">Diario</SelectItem>
              <SelectItem value="WEEKLY">Semanal</SelectItem>
              <SelectItem value="NEVER">Nunca</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      {localPrefs && Object.keys(localPrefs).length > 0 && (
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isUpdating}
            className="flex-1"
          >
            {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar Cambios
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocalPrefs(null)}
            disabled={isUpdating}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}
