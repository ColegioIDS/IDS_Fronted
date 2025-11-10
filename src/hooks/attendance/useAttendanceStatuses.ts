// src/hooks/attendance/useAttendanceStatuses.ts
/**
 * Hook para acceder a los estados de asistencia desde el Context
 * Provee helper methods para trabajar con los estados
 */

import { useMemo } from 'react';
import { useAttendanceStatuses as useAttendanceStatusesContext } from '@/context/AttendanceStatusContext';
import { AttendanceStatus, AttendanceStatusCode } from '@/types/attendance.types';

export interface AttendanceStatusConfig {
  code: AttendanceStatusCode;
  label: string;
  colorClass: string;
  bgColorClass: string;
  borderColorClass: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  icon?: string;
  requiresJustification: boolean;
}

export interface UseAttendanceStatusesReturn {
  statuses: AttendanceStatus[];
  loading: boolean;
  error: string | null;
  getStatusConfig: (code: string) => AttendanceStatusConfig | undefined;
  getStatusLabel: (code: string) => string;
  getStatusColor: (code: string) => string;
  getStatusByCode: (code: string) => AttendanceStatus | undefined;
  getExcusedStatuses: () => AttendanceStatus[];
  getNegativeStatuses: () => AttendanceStatus[];
  refresh: () => Promise<void>;
}

/**
 * Hook principal para trabajar con estados de asistencia
 */
export function useAttendanceStatuses(): UseAttendanceStatusesReturn {
  const { statuses, loading, error, getStatusByCode, getStatusesByFilter, refreshStatuses } =
    useAttendanceStatusesContext();

  /**
   * Configuración de colores y estilos por estado
   * Se construye dinámicamente a partir de los datos del backend
   */
  const statusConfigs = useMemo<Map<string, AttendanceStatusConfig>>(() => {
    const configs = new Map<string, AttendanceStatusConfig>();

    statuses.forEach(status => {
      const colorMap: Record<string, { bgColor: string; borderColor: string; textColor: string; badgeVariant: any }> = {
        '#22c55e': { bgColor: 'bg-green-100', borderColor: 'border-green-300', textColor: 'text-green-700', badgeVariant: 'success' },
        '#ef4444': { bgColor: 'bg-red-100', borderColor: 'border-red-300', textColor: 'text-red-700', badgeVariant: 'destructive' },
        '#eab308': { bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300', textColor: 'text-yellow-700', badgeVariant: 'secondary' },
        '#06b6d4': { bgColor: 'bg-cyan-100', borderColor: 'border-cyan-300', textColor: 'text-cyan-700', badgeVariant: 'default' },
        '#8b5cf6': { bgColor: 'bg-purple-100', borderColor: 'border-purple-300', textColor: 'text-purple-700', badgeVariant: 'default' },
        '#f97316': { bgColor: 'bg-orange-100', borderColor: 'border-orange-300', textColor: 'text-orange-700', badgeVariant: 'secondary' },
      };

      const colorCode = status.colorCode || '#6b7280';
      const colorConfig = colorMap[colorCode] || {
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        textColor: 'text-gray-700',
        badgeVariant: 'outline' as any,
      };

      configs.set(status.code, {
        code: status.code as AttendanceStatusCode,
        label: status.name,
        colorClass: colorConfig.textColor,
        bgColorClass: colorConfig.bgColor,
        borderColorClass: colorConfig.borderColor,
        badgeVariant: colorConfig.badgeVariant,
        requiresJustification: status.requiresJustification,
      });
    });

    return configs;
  }, [statuses]);

  /**
   * Obtener configuración completa de un estado
   */
  const getStatusConfig = (code: string): AttendanceStatusConfig | undefined => {
    return statusConfigs.get(code);
  };

  /**
   * Obtener etiqueta de un estado
   */
  const getStatusLabel = (code: string): string => {
    const config = statusConfigs.get(code);
    return config?.label || code;
  };

  /**
   * Obtener color de un estado
   */
  const getStatusColor = (code: string): string => {
    const status = getStatusByCode(code);
    return status?.colorCode || '#6b7280';
  };

  /**
   * Obtener estados excusados
   */
  const getExcusedStatuses = (): AttendanceStatus[] => {
    return getStatusesByFilter({ isExcused: true });
  };

  /**
   * Obtener estados negativos
   */
  const getNegativeStatuses = (): AttendanceStatus[] => {
    return getStatusesByFilter({ isNegative: true });
  };

  return {
    statuses,
    loading,
    error,
    getStatusConfig,
    getStatusLabel,
    getStatusColor,
    getStatusByCode,
    getExcusedStatuses,
    getNegativeStatuses,
    refresh: refreshStatuses,
  };
}

export default useAttendanceStatuses;
