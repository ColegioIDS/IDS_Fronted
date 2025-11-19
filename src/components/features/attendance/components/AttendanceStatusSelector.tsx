// src/components/features/attendance/components/AttendanceStatusSelector.tsx
/**
 * Componente mejorado para seleccionar estado de asistencia
 * Diseño limpio con iconos, sin emojis
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AttendanceStatusInfo } from '@/types/attendance.types';
import { AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AttendanceStatusSelectorProps {
  statuses: AttendanceStatusInfo[];
  selectedStatusId: number | null;
  onStatusChange: (statusId: number) => void;
  isLoading?: boolean;
}

/**
 * Obtener icono basado en el código de estado
 */
function getStatusIcon(code: string) {
  switch (code) {
    case 'P': // Present
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'I': // Absent
    case 'A': // Absence
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'T': // Tardy
    case 'TJ': // Tardy Justified
      return <Clock className="h-5 w-5 text-amber-600" />;
    case 'IJ': // Absent Justified
    case 'E': // Excused
    case 'M': // Medical
      return <AlertCircle className="h-5 w-5 text-blue-600" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
  }
}

/**
 * Obtener color de fondo basado en el código
 */
function getStatusBgColor(code: string): string {
  switch (code) {
    case 'P':
      return 'bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950/20 dark:border-green-800 dark:hover:bg-green-950/40';
    case 'I':
    case 'A':
      return 'bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-800 dark:hover:bg-red-950/40';
    case 'T':
    case 'TJ':
      return 'bg-amber-50 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/20 dark:border-amber-800 dark:hover:bg-amber-950/40';
    case 'IJ':
    case 'E':
    case 'M':
      return 'bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/20 dark:border-blue-800 dark:hover:bg-blue-950/40';
    default:
      return 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-950/20 dark:border-gray-800 dark:hover:bg-gray-950/40';
  }
}

/**
 * Obtener color del texto del label
 */
function getStatusTextColor(code: string): string {
  switch (code) {
    case 'P':
      return 'text-green-900 dark:text-green-100';
    case 'I':
    case 'A':
      return 'text-red-900 dark:text-red-100';
    case 'T':
    case 'TJ':
      return 'text-amber-900 dark:text-amber-100';
    case 'IJ':
    case 'E':
    case 'M':
      return 'text-blue-900 dark:text-blue-100';
    default:
      return 'text-gray-900 dark:text-gray-100';
  }
}

export function AttendanceStatusSelector({
  statuses,
  selectedStatusId,
  onStatusChange,
  isLoading = false,
}: AttendanceStatusSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estado de Asistencia</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Selecciona el estado que se aplicará a todos los estudiantes
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {statuses.map((status) => (
          <button
            key={status.id}
            onClick={() => !isLoading && onStatusChange(status.id)}
            disabled={isLoading}
            className={`relative flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${getStatusBgColor(status.code)} ${
              selectedStatusId === status.id ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-950' : ''
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
          >
            {/* Checkmark indicator */}
            {selectedStatusId === status.id && (
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            )}

            <div className="flex flex-1 items-start justify-between">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.code)}
                  <span className={`font-semibold ${getStatusTextColor(status.code)}`}>{status.name}</span>
                </div>
                {status.description && (
                  <p className={`mt-1 text-xs ${getStatusTextColor(status.code)}`}>{status.description}</p>
                )}
              </div>

              {/* Badge de código */}
              <span className={`rounded px-2 py-1 text-xs font-mono font-semibold ${getStatusTextColor(status.code)}`}>
                {status.code}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedStatusId && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/30">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Estado seleccionado: <span className="font-semibold">{statuses.find((s) => s.id === selectedStatusId)?.name}</span>
          </p>
        </div>
      )}
    </div>
  );
}
