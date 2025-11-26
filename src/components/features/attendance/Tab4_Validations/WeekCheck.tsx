/**
 * Validación de Semana Académica
 * Verifica que no sea una semana BREAK
 */

'use client';

import { useEffect, useState } from 'react';
import { validateAcademicWeekByDate } from '@/services/attendance.service';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface WeekCheckProps {
  bimesterId: number;
  date: string;
  isLoading: boolean;
}

interface WeekData {
  id: number;
  number: number;
  weekType: string;
  startDate: string;
  endDate: string;
  bimesterId: number;
}

export function WeekCheck({ bimesterId, date, isLoading }: WeekCheckProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [data, setData] = useState<WeekData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      setState('loading');
      return;
    }

    const fetchWeek = async () => {
      try {
        setState('loading');
        const result = await validateAcademicWeekByDate(bimesterId, date);

        // Si result está vacío o no tiene id, no hay semana en esa fecha
        if (!result || Object.keys(result).length === 0 || !('id' in result)) {
          setState('error');
          setError('Fecha fuera de semana académica');
          setData(null);
          return;
        }

        const weekData = result as unknown as WeekData;
        setData(weekData);

        if (weekData.weekType === 'BREAK') {
          setState('error');
          setError('Semana BREAK - No se puede registrar asistencia');
        } else {
          setState('success');
          setError(null);
        }
      } catch (err) {
        setState('error');
        setError(err instanceof Error ? err.message : 'Error al validar semana');
        setData(null);
      }
    };

    fetchWeek();
  }, [bimesterId, date, isLoading]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3 mb-3">
        {(state === 'loading' || state === 'idle') && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
        {state === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
        {state === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
        <h3 className="font-semibold text-gray-900">Semana Académica</h3>
      </div>

      {(state === 'loading' || state === 'idle') && (
        <p className="text-sm text-gray-500">Validando semana académica...</p>
      )}

      {state === 'success' && data && (
        <div className="space-y-1">
          <p className="text-sm text-green-600">
            Semana {data.weekType} #{data.number} ✓
          </p>
          {data.startDate && data.endDate && (
            <p className="text-xs text-gray-600">
              {new Date(data.startDate).toLocaleDateString('es-ES')} - {new Date(data.endDate).toLocaleDateString('es-ES')}
            </p>
          )}
        </div>
      )}

      {state === 'success' && !data && (
        <p className="text-sm text-green-600">Semana académica validada</p>
      )}

      {state === 'error' && (
        <p className="text-sm text-red-600">{error || 'Error al validar'}</p>
      )}
    </div>
  );
}
