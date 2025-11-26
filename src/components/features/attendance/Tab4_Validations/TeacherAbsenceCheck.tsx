/**
 * Validación de Ausencia del Maestro
 * Verifica que el maestro no esté en ausencia
 */

'use client';

import { useEffect, useState } from 'react';
import { validateTeacherAbsenceByDate } from '@/services/attendance.service';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface TeacherAbsenceCheckProps {
  teacherId: number;
  date: string;
  isLoading: boolean;
}

export function TeacherAbsenceCheck({
  teacherId,
  date,
  isLoading,
}: TeacherAbsenceCheckProps) {
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      setState('loading');
      return;
    }

    const fetchAbsence = async () => {
      try {
        setState('loading');
        const result = await validateTeacherAbsenceByDate(teacherId, date);
        if (result && typeof result === 'object' && 'id' in result) {
          // Si existe un objeto, el maestro SÍ está en ausencia
          setState('error');
          setError(
            `Maestro en ausencia: ${(result as Record<string, unknown>).reason || 'Desconocida'}`
          );
        } else {
          // Si no hay resultado, el maestro está presente
          setState('success');
          setError(null);
        }
      } catch (err) {
        setState('error');
        setError(err instanceof Error ? err.message : 'Error al validar ausencia');
      }
    };

    fetchAbsence();
  }, [teacherId, date, isLoading]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3 mb-3">
        {state === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
        {state === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
        {state === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
        <h3 className="font-semibold text-gray-900">Ausencia del Maestro</h3>
      </div>

      {state === 'loading' && (
        <p className="text-sm text-gray-500">Validando ausencia...</p>
      )}

      {state === 'success' && (
        <p className="text-sm text-green-600">Maestro presente</p>
      )}

      {state === 'error' && (
        <p className="text-sm text-red-600">{error || 'Error al validar'}</p>
      )}
    </div>
  );
}
