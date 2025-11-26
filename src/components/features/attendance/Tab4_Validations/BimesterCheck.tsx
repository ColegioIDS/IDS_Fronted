/**
 * Validación de Bimestre
 * Verifica que existe un bimestre activo para la fecha
 */

'use client';

import { useEffect, useState } from 'react';
import { validateBimesterByDate } from '@/services/attendance.service';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface BimesterCheckProps {
  cycleId: number;
  date: string;
  isLoading: boolean;
}

interface BimesterData {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

export function BimesterCheck({ cycleId, date, isLoading }: BimesterCheckProps) {
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [data, setData] = useState<BimesterData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      setState('loading');
      return;
    }

    const fetchBimester = async () => {
      try {
        setState('loading');
        const result = await validateBimesterByDate(cycleId, date);
        if (result && typeof result === 'object') {
          setData(result as unknown as BimesterData);
          setState('success');
          setError(null);
        } else {
          setState('error');
          setError('No hay bimestre para esta fecha');
        }
      } catch (err) {
        setState('error');
        setError(err instanceof Error ? err.message : 'Error al validar bimestre');
      }
    };

    fetchBimester();
  }, [cycleId, date, isLoading]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3 mb-3">
        {state === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
        {state === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
        {state === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
        <h3 className="font-semibold text-gray-900">Bimestre</h3>
      </div>

      {state === 'loading' && (
        <p className="text-sm text-gray-500">Validando bimestre...</p>
      )}

      {state === 'success' && data && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
          <p className="text-xs text-gray-600">
            {data.startDate} a {data.endDate}
          </p>
        </div>
      )}

      {state === 'error' && (
        <p className="text-sm text-red-600">{error || 'Error al validar'}</p>
      )}
    </div>
  );
}
