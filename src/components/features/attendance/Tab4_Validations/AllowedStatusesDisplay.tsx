/**
 * Mostrador de Estados Permitidos
 * Muestra los estados de asistencia que el rol puede usar
 */

'use client';

import { useEffect, useState } from 'react';
import { getAllowedAttendanceStatusesByRole } from '@/services/attendance.service';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface AllowedStatusesDisplayProps {
  roleId: number;
  isLoading: boolean;
}

interface StatusData {
  code: string;
  name: string;
  colorCode?: string;
  isNegative?: boolean;
}

export function AllowedStatusesDisplay({
  roleId,
  isLoading,
}: AllowedStatusesDisplayProps) {
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [statuses, setStatuses] = useState<StatusData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      setState('loading');
      return;
    }

    const fetchStatuses = async () => {
      try {
        setState('loading');
        const result = await getAllowedAttendanceStatusesByRole(roleId);
        if (result && Array.isArray(result) && result.length > 0) {
          setStatuses(result as unknown as StatusData[]);
          setState('success');
          setError(null);
        } else {
          setState('error');
          setError('No hay estados permitidos para este rol');
        }
      } catch (err) {
        setState('error');
        setError(err instanceof Error ? err.message : 'Error al cargar estados');
      }
    };

    fetchStatuses();
  }, [roleId, isLoading]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3 mb-3">
        {state === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
        {state === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
        {state === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
        <h3 className="font-semibold text-gray-900">Estados Permitidos</h3>
      </div>

      {state === 'loading' && (
        <p className="text-sm text-gray-500">Cargando estados...</p>
      )}

      {state === 'success' && statuses.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {statuses.slice(0, 4).map(status => (
              <div
                key={status.code}
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1"
              >
                {status.colorCode && (
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: status.colorCode }}
                  />
                )}
                <span className="text-xs font-medium text-gray-900">{status.name}</span>
              </div>
            ))}
          </div>
          {statuses.length > 4 && (
            <p className="text-xs text-gray-500">... y {statuses.length - 4} más</p>
          )}
          <p className="text-xs text-green-600 mt-2">Total: {statuses.length} estados</p>
        </div>
      )}

      {state === 'error' && (
        <p className="text-sm text-red-600">{error || 'Error al cargar'}</p>
      )}
    </div>
  );
}
