/**
 * Mostrador de Configuración
 * Muestra la configuración activa de asistencia
 */

'use client';

import { useEffect, useState } from 'react';
import { getActiveAttendanceConfig } from '@/services/attendance.service';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ConfigDisplayProps {
  isLoading: boolean;
}

export function ConfigDisplay({ isLoading }: ConfigDisplayProps) {
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      setState('loading');
      return;
    }

    const fetchConfig = async () => {
      try {
        setState('loading');
        const result = await getActiveAttendanceConfig();
        if (result && typeof result === 'object') {
          setConfig(result);
          setState('success');
          setError(null);
        } else {
          setState('error');
          setError('Configuración no encontrada');
        }
      } catch (err) {
        setState('error');
        setError(err instanceof Error ? err.message : 'Error al cargar configuración');
      }
    };

    fetchConfig();
  }, [isLoading]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3 mb-3">
        {state === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
        {state === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
        {state === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
        <h3 className="font-semibold text-gray-900">Configuración</h3>
      </div>

      {state === 'loading' && (
        <p className="text-sm text-gray-500">Cargando configuración...</p>
      )}

      {state === 'success' && config && (
        <div className="space-y-2">
          {Object.entries(config).slice(0, 3).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-gray-600">{key}:</span>
              <span className="font-medium text-gray-900">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
          {Object.keys(config).length > 3 && (
            <p className="text-xs text-gray-500">... y más</p>
          )}
        </div>
      )}

      {state === 'error' && (
        <p className="text-sm text-red-600">{error || 'Error al cargar'}</p>
      )}
    </div>
  );
}
