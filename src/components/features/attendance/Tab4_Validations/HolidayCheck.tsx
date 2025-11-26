/**
 * Validación de Feriado
 * Verifica que la fecha no sea un feriado
 */

'use client';

import { useEffect, useState } from 'react';
import { validateHolidayByDate } from '@/services/attendance.service';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface HolidayCheckProps {
  bimesterId: number;
  date: string;
  isLoading: boolean;
}

export function HolidayCheck({ bimesterId, date, isLoading }: HolidayCheckProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [holidayInfo, setHolidayInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      setState('loading');
      return;
    }

    const fetchHoliday = async () => {
      try {
        setState('loading');
        const result = await validateHolidayByDate(bimesterId, date);
        if (result && typeof result === 'object' && 'id' in result) {
          // Si existe un objeto, significa que SÍ es feriado
          const holidayName = (result as Record<string, unknown>).name as string || 'Feriado';
          setState('error');
          setError(`Es feriado: ${holidayName}`);
          setHolidayInfo(null);
        } else {
          // Si no hay resultado, NO es feriado (validación exitosa)
          setState('success');
          setError(null);
          setHolidayInfo('No es feriado - Día hábil');
        }
      } catch (err) {
        setState('error');
        setError(err instanceof Error ? err.message : 'Error al validar feriado');
        setHolidayInfo(null);
      }
    };

    fetchHoliday();
  }, [bimesterId, date, isLoading]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3 mb-3">
        {(state === 'loading' || state === 'idle') && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
        {state === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
        {state === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
        <h3 className="font-semibold text-gray-900">Feriado</h3>
      </div>

      {(state === 'loading' || state === 'idle') && (
        <p className="text-sm text-gray-500">Validando feriado...</p>
      )}

      {state === 'success' && (
        <p className="text-sm text-green-600">{holidayInfo || 'No es feriado - Día hábil'}</p>
      )}

      {state === 'error' && (
        <p className="text-sm text-red-600">{error || 'Error al validar'}</p>
      )}
    </div>
  );
}
