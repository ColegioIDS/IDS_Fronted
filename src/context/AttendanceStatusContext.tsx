// src/context/AttendanceStatusContext.tsx
/**
 * Context para compartir estados de asistencia en toda la aplicación
 * Carga los estados una sola vez del backend y los distribuye a todos los componentes
 * Evita hacer múltiples peticiones al mismo endpoint
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AttendanceStatus } from '@/types/attendance-status.types';
import { api } from '@/config/api';

interface AttendanceStatusContextType {
  statuses: AttendanceStatus[];
  loading: boolean;
  error: string | null;
  getStatusByCode: (code: string) => AttendanceStatus | undefined;
  getStatusesByFilter: (filter: Partial<AttendanceStatus>) => AttendanceStatus[];
  refreshStatuses: () => Promise<void>;
}

const AttendanceStatusContext = createContext<AttendanceStatusContextType | undefined>(undefined);

/**
 * Provider que carga y distribuye los estados de asistencia
 */
export function AttendanceStatusProvider({ children }: { children: React.ReactNode }) {
  const [statuses, setStatuses] = useState<AttendanceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar estados del backend
   */
  const loadStatuses = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[AttendanceStatusContext] 🔄 Cargando estados de asistencia...');

      // Get user role from localStorage or use default
      const userRole = localStorage.getItem('userRole') || '1';

      // Use the role-based endpoint that returns ONLY the statuses allowed for this role
      const response = await api.get<{
        success: boolean;
        data: AttendanceStatus[];
        message?: string;
      }>(`/api/attendance/status/allowed/role/${userRole}`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al cargar estados de asistencia');
      }

      const loadedStatuses = response.data.data || [];
      console.log('[AttendanceStatusContext] ✅ Estados cargados:', loadedStatuses.length, loadedStatuses.map(s => ({ id: s.id, code: s.code, name: s.name })));

      setStatuses(loadedStatuses);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[AttendanceStatusContext] ❌ Error:', errorMessage);
      setError(errorMessage);

      // If that fails, provide helpful error message
      setError('No se pudieron cargar los estados de asistencia. Verifique que el backend esté configurado correctamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar al montar el componente
   */
  useEffect(() => {
    loadStatuses();
  }, []);

  /**
   * Obtener un estado por código
   */
  const getStatusByCode = (code: string): AttendanceStatus | undefined => {
    return statuses.find(status => status.code === code);
  };

  /**
   * Filtrar estados por propiedades
   */
  const getStatusesByFilter = (filter: Partial<AttendanceStatus>): AttendanceStatus[] => {
    return statuses.filter(status => {
      return Object.entries(filter).every(([key, value]) => {
        return (status as any)[key] === value;
      });
    });
  };

  const value: AttendanceStatusContextType = {
    statuses,
    loading,
    error,
    getStatusByCode,
    getStatusesByFilter,
    refreshStatuses: loadStatuses,
  };

  return (
    <AttendanceStatusContext.Provider value={value}>
      {children}
    </AttendanceStatusContext.Provider>
  );
}

/**
 * Hook para usar el context
 */
export function useAttendanceStatuses() {
  const context = useContext(AttendanceStatusContext);

  if (!context) {
    throw new Error('useAttendanceStatuses debe ser usado dentro de AttendanceStatusProvider');
  }

  return context;
}

export default AttendanceStatusContext;
