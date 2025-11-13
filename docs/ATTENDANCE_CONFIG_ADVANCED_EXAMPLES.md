# 🚀 Ejemplos Avanzados - Attendance Config

Ejemplos de uso más avanzado del módulo de Configuración de Asistencia.

---

## 1. Uso con React Query (Caché)

```tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceConfigService } from '@/services/attendance-config.service';
import { UpdateAttendanceConfigDto } from '@/types/attendance-config.types';

export function ConfigWithReactQuery() {
  const queryClient = useQueryClient();

  // Query para obtener
  const { data: config, isLoading, error } = useQuery({
    queryKey: ['attendance-config'],
    queryFn: () => attendanceConfigService.getCurrent(),
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  // Mutation para actualizar
  const updateMutation = useMutation({
    mutationFn: (data: UpdateAttendanceConfigDto) =>
      attendanceConfigService.update(config!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-config'] });
    },
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Umbral: {config?.riskThresholdPercentage}%</h1>
      <button
        onClick={() => updateMutation.mutate({ riskThresholdPercentage: 85 })}
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? 'Guardando...' : 'Actualizar a 85%'}
      </button>
    </div>
  );
}
```

---

## 2. Contexto Global

```tsx
'use client';

import { createContext, useContext } from 'react';
import { useActiveAttendanceConfig } from '@/hooks/useAttendanceConfig';
import { AttendanceConfig } from '@/types/attendance-config.types';

interface ConfigContextType {
  config: AttendanceConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export function AttendanceConfigProvider({ children }: { children: React.ReactNode }) {
  const { config, loading, error, refetch } = useActiveAttendanceConfig();

  return (
    <ConfigContext.Provider value={{ config, loading, error, refetch }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useAttendanceConfigContext() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error(
      'useAttendanceConfigContext debe usarse dentro de AttendanceConfigProvider'
    );
  }
  return context;
}

// Uso en componentes
function StudentRiskAlert({ studentAttendance }: { studentAttendance: number }) {
  const { config } = useAttendanceConfigContext();

  if (!config) return null;

  const isAtRisk = studentAttendance < config.riskThresholdPercentage;

  return isAtRisk ? (
    <div className="bg-red-100 p-4 rounded">
      Estudiante en riesgo: {studentAttendance}% {'<'}{' '}
      {config.riskThresholdPercentage}%
    </div>
  ) : null;
}
```

---

## 3. Hook Personalizado Avanzado

```tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { attendanceConfigService } from '@/services/attendance-config.service';
import { AttendanceConfig, UpdateAttendanceConfigDto } from '@/types/attendance-config.types';

interface UseAdvancedConfigOptions {
  autoLoad?: boolean;
  cacheTime?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAdvancedConfig(options: UseAdvancedConfigOptions = {}) {
  const {
    autoLoad = true,
    cacheTime = 5 * 60 * 1000,
    onSuccess,
    onError,
  } = options;

  const [config, setConfig] = useState<AttendanceConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<{ data: AttendanceConfig; timestamp: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const load = useCallback(async (force = false) => {
    // Usar cache si está disponible
    if (
      !force &&
      cacheRef.current &&
      Date.now() - cacheRef.current.timestamp < cacheTime
    ) {
      setConfig(cacheRef.current.data);
      return;
    }

    setLoading(true);
    setError(null);

    // Cancelar requests previos
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const data = await attendanceConfigService.getCurrent();
      cacheRef.current = { data, timestamp: Date.now() };
      setConfig(data);
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [cacheTime, onSuccess, onError]);

  const update = useCallback(
    async (data: UpdateAttendanceConfigDto) => {
      if (!config) throw new Error('No hay configuración cargada');

      setLoading(true);
      setError(null);

      try {
        const updated = await attendanceConfigService.update(config.id, data);
        cacheRef.current = { data: updated, timestamp: Date.now() };
        setConfig(updated);
        onSuccess?.();
        return updated;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Error desconocido');
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [config, onSuccess, onError]
  );

  const clearCache = useCallback(() => {
    cacheRef.current = null;
  }, []);

  useEffect(() => {
    if (autoLoad) {
      load();
    }

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [autoLoad, load]);

  return {
    config,
    loading,
    error,
    load,
    update,
    clearCache,
    isCached: cacheRef.current !== null,
  };
}
```

---

## 4. Componente con Historial

```tsx
'use client';

import { useState } from 'react';
import { AttendanceConfig, UpdateAttendanceConfigDto } from '@/types/attendance-config.types';
import { useActiveAttendanceConfig } from '@/hooks/useAttendanceConfig';

interface HistoryEntry {
  timestamp: Date;
  change: string;
  oldValue: any;
  newValue: any;
}

export function ConfigWithHistory() {
  const { config } = useActiveAttendanceConfig();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const handleUpdate = async (data: UpdateAttendanceConfigDto) => {
    if (!config) return;

    // Registrar cambios
    Object.entries(data).forEach(([key, newValue]) => {
      const oldValue = config[key as keyof AttendanceConfig];
      if (oldValue !== newValue) {
        setHistory((prev) => [
          {
            timestamp: new Date(),
            change: `${key}: ${oldValue} → ${newValue}`,
            oldValue,
            newValue,
          },
          ...prev,
        ]);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        {/* Tu formulario aquí */}
      </div>

      <div className="space-y-2">
        <h3 className="font-bold">Historial de Cambios</h3>
        {history.map((entry, i) => (
          <div key={i} className="text-sm p-2 bg-gray-100 rounded">
            <div className="font-semibold">
              {entry.timestamp.toLocaleTimeString()}
            </div>
            <div>{entry.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 5. Formulario Avanzado con Prevista

```tsx
'use client';

import { useState } from 'react';
import { AttendanceConfig, UpdateAttendanceConfigDto } from '@/types/attendance-config.types';

interface ConfigPreviewProps {
  config: AttendanceConfig;
  formData: UpdateAttendanceConfigDto;
}

export function ConfigPreview({ config, formData }: ConfigPreviewProps) {
  const [showImpact, setShowImpact] = useState(false);

  // Simular impacto de cambios
  const predictImpact = () => {
    const changes = Object.entries(formData).filter(
      ([key, value]) => config[key as keyof AttendanceConfig] !== value
    );

    return {
      riskThresholdChanged: 'riskThresholdPercentage' in formData,
      tardySettingsChanged:
        'lateThresholdTime' in formData ||
        'markAsTardyAfterMinutes' in formData,
      justificationChanged:
        'justificationRequiredAfter' in formData ||
        'maxJustificationDays' in formData,
      affectedRecords: 0, // Simulado
    };
  };

  const impact = predictImpact();

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowImpact(!showImpact)}
        className="text-blue-600 underline"
      >
        {showImpact ? 'Ocultar' : 'Ver'} impacto de cambios
      </button>

      {showImpact && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-bold mb-2">Impacto Estimado</h4>
          <ul className="space-y-1 text-sm">
            {impact.riskThresholdChanged && (
              <li>
                ⚠️ Cambio en umbral de riesgo afectará alertas futuras
              </li>
            )}
            {impact.tardySettingsChanged && (
              <li>⏰ Cambio en tardanza afectará nuevos registros</li>
            )}
            {impact.justificationChanged && (
              <li>📝 Cambio en justificaciones afectará pendientes</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## 6. Validaciones Personalizadas

```tsx
'use client';

import { AttendanceConfig, UpdateAttendanceConfigDto } from '@/types/attendance-config.types';

export class ConfigValidator {
  // Validar porcentaje
  static isValidPercentage(value: number): boolean {
    return value >= 0 && value <= 100;
  }

  // Validar tiempo HH:MM
  static isValidTime(time: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  // Validar minutos
  static isValidMinutes(minutes: number): boolean {
    return minutes >= 1 && minutes <= 120;
  }

  // Validar lógica completa
  static validate(data: UpdateAttendanceConfigDto): Record<string, string> {
    const errors: Record<string, string> = {};

    if (data.riskThresholdPercentage !== undefined) {
      if (!this.isValidPercentage(data.riskThresholdPercentage)) {
        errors.riskThresholdPercentage = 'Debe estar entre 0 y 100';
      }
    }

    if (data.lateThresholdTime !== undefined) {
      if (!this.isValidTime(data.lateThresholdTime)) {
        errors.lateThresholdTime = 'Formato debe ser HH:MM (ej: 08:30)';
      }
    }

    if (data.markAsTardyAfterMinutes !== undefined) {
      if (!this.isValidMinutes(data.markAsTardyAfterMinutes)) {
        errors.markAsTardyAfterMinutes = 'Debe estar entre 1 y 120';
      }
    }

    // Validación lógica
    if (
      data.autoApproveJustification === true &&
      (!data.autoApprovalAfterDays || data.autoApprovalAfterDays < 1)
    ) {
      errors.autoApprovalAfterDays =
        'Debe especificar días para aprobación automática';
    }

    return errors;
  }
}

// Uso
const errors = ConfigValidator.validate({
  riskThresholdPercentage: 150, // Inválido
});

console.log(errors); // { riskThresholdPercentage: "Debe estar entre 0 y 100" }
```

---

## 7. Integración con Formulario (React Hook Form)

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { attendanceConfigService } from '@/services/attendance-config.service';
import { AttendanceConfig } from '@/types/attendance-config.types';

// Esquema Zod
const configSchema = z.object({
  riskThresholdPercentage: z.number().min(0).max(100),
  consecutiveAbsenceAlert: z.number().min(1),
  lateThresholdTime: z.string().regex(/^\d{2}:\d{2}$/),
  markAsTardyAfterMinutes: z.number().min(1).max(120),
  justificationRequiredAfter: z.number().min(0),
  maxJustificationDays: z.number().min(1),
  autoApproveJustification: z.boolean(),
  autoApprovalAfterDays: z.number().min(1).optional(),
  isActive: z.boolean(),
});

type ConfigFormData = z.infer<typeof configSchema>;

export function ConfigFormWithReactHookForm({ config }: { config: AttendanceConfig }) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: config,
  });

  const autoApprove = watch('autoApproveJustification');

  const onSubmit = async (data: ConfigFormData) => {
    try {
      await attendanceConfigService.update(config.id, data);
      alert('Guardado exitosamente');
    } catch (error) {
      alert('Error al guardar');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Umbral de Riesgo (%)</label>
        <input
          type="number"
          {...register('riskThresholdPercentage', { valueAsNumber: true })}
          min="0"
          max="100"
        />
        {errors.riskThresholdPercentage && (
          <span className="text-red-500">{errors.riskThresholdPercentage.message}</span>
        )}
      </div>

      <div>
        <label>Hora Límite</label>
        <input type="time" {...register('lateThresholdTime')} />
        {errors.lateThresholdTime && (
          <span className="text-red-500">{errors.lateThresholdTime.message}</span>
        )}
      </div>

      {/* Mostrar campo solo si autoApprove es true */}
      {autoApprove && (
        <div>
          <label>Días para Aprobación Automática</label>
          <input
            type="number"
            {...register('autoApprovalAfterDays', { valueAsNumber: true })}
            min="1"
          />
        </div>
      )}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Guardar
      </button>
    </form>
  );
}
```

---

## 8. Testing

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { AttendanceConfigPage } from '@/components/features/attendance-config';

// Mock del servicio
jest.mock('@/services/attendance-config.service', () => ({
  attendanceConfigService: {
    getCurrent: jest.fn().mockResolvedValue({
      id: 1,
      riskThresholdPercentage: 80,
      consecutiveAbsenceAlert: 3,
      lateThresholdTime: '08:30',
      markAsTardyAfterMinutes: 15,
      justificationRequiredAfter: 3,
      maxJustificationDays: 365,
      autoApproveJustification: false,
      autoApprovalAfterDays: 7,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    }),
    update: jest.fn().mockResolvedValue({}),
  },
}));

describe('AttendanceConfigPage', () => {
  test('carga y muestra configuración', async () => {
    render(<AttendanceConfigPage />);

    await waitFor(() => {
      expect(screen.getByText(/80%/)).toBeInTheDocument();
    });
  });

  test('permite editar configuración', async () => {
    render(<AttendanceConfigPage />);

    const editButton = await screen.findByText(/Editar/);
    editButton.click();

    const input = screen.getByDisplayValue('80');
    expect(input).toBeInTheDocument();
  });
});
```

---

## 9. Monitoreo y Analytics

```tsx
'use client';

import { useCallback } from 'react';
import { attendanceConfigService } from '@/services/attendance-config.service';
import { UpdateAttendanceConfigDto } from '@/types/attendance-config.types';

class ConfigAnalytics {
  static trackChange(key: string, oldValue: any, newValue: any) {
    // Enviar a tu servicio de analytics (Mixpanel, Amplitude, etc)
    console.log('Analytics:', {
      event: 'config_changed',
      property: key,
      oldValue,
      newValue,
      timestamp: new Date(),
    });
  }

  static trackAccess() {
    console.log('Analytics: config_accessed');
  }
}

export function ConfigWithAnalytics() {
  const handleUpdate = useCallback(async (data: UpdateAttendanceConfigDto) => {
    // Rastrear cambios
    Object.entries(data).forEach(([key, newValue]) => {
      ConfigAnalytics.trackChange(key, null, newValue);
    });

    await attendanceConfigService.update(1, data);
  }, []);

  return (
    <div>
      {/* Tu componente */}
    </div>
  );
}
```

---

## 10. Sincronización en Tiempo Real

```tsx
'use client';

import { useEffect, useState } from 'react';
import { attendanceConfigService } from '@/services/attendance-config.service';
import { AttendanceConfig } from '@/types/attendance-config.types';

export function ConfigWithRealtimeSync() {
  const [config, setConfig] = useState<AttendanceConfig | null>(null);

  useEffect(() => {
    // Polling cada 30 segundos
    const interval = setInterval(async () => {
      try {
        const latest = await attendanceConfigService.getCurrent();
        setConfig(latest);
      } catch (error) {
        console.error('Error sincronizando:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {config && (
        <div className="text-sm text-gray-500">
          Última actualización: {new Date(config.updatedAt).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
```

---

**¡Estos ejemplos te muestran formas avanzadas de usar el módulo!**

Para más información, revisa la documentación completa en `/docs/`.
