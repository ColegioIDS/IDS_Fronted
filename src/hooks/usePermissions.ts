// src/hooks/usePermissions.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Permission } from '@/types/permission';
import { getPermissions } from '@/services/usePermission';

interface PermissionsState {
  permissions: Permission[];
  isLoading: boolean;
  error: Error | null;
}

export const usePermissions = () => {
  const [state, setState] = useState<PermissionsState>({
    permissions: [],
    isLoading: true,
    error: null,
  });

  const { permissions, isLoading, error } = state;

  const fetchPermissions = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await getPermissions();
      setState({ permissions: data, isLoading: false, error: null });
    } catch (err) {
      setState({ permissions: [], isLoading: false, error: err as Error });
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return useMemo(() => ({
    permissions,
    isLoading,
    error,
    refetch: fetchPermissions,
  }), [permissions, isLoading, error, fetchPermissions]);
};
