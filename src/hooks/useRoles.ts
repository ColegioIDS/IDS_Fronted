// src/hooks/useRoles.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { RoleTableRow } from '@/types/role';

interface ApiResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdById: number | null;
    modifiedById: number | null;
    userCount: number;
    permissions: Array<{
      id: number;
      module: string;
      action: string;
      description: string | null;
      isActive: boolean;
      isSystem: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    createdBy: {
      id: number;
      fullName: string;
    } | null;
    modifiedBy: {
      id: number;
      fullName: string;
    } | null;
  }>;
}

export const useRoles = () => {
  const [state, setState] = useState<{
    roles: RoleTableRow[];
    isLoading: boolean;
    error: Error | null;
  }>({
    roles: [],
    isLoading: true,
    error: null,
  });

  const { roles, isLoading, error } = state;

  const fetchRoles = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('http://localhost:5000/api/roles');
      const result: ApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch roles');
      }

      // Transformación directa a RoleTableRow
      const tableRows: RoleTableRow[] = result.data.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description || '',
        isActive: role.isActive,
        createdAt: formatDate(role.createdAt),
        updatedAt: formatDate(role.updatedAt),
        createdBy: role.createdBy?.fullName || '',
        userCount: role.userCount,
        permissionCount: role.permissions.length,
        permissions:role.permissions
      }));

      console.log('Roles transformados:', tableRows);

      setState({ 
        roles: tableRows, 
        isLoading: false, 
        error: null 
      });
    } catch (err) {
      setState({ 
        roles: [], 
        isLoading: false, 
        error: err instanceof Error ? err : new Error('Error fetching roles') 
      });
    }
  }, []);

  // Helper para formatear fechas
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return useMemo(() => ({
    roles,
    isLoading,
    error,
    refetch: fetchRoles
  }), [roles, isLoading, error, fetchRoles]);
};