// src/hooks/usePermissions.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Role } from '@/types/role';
import { getRoles } from '@/services/useRole';
import { RoleState } from '@/types/role';


export const userole = () => {
  const [state, setState] = useState<RoleState>({
    role: [],
    isLoading: true,
    error: null,
  });

  const { role, isLoading, error } = state;

  const fetchRole = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await getRoles();
      setState({ role: data, isLoading: false, error: null });
    } catch (err) {
      setState({ role: [], isLoading: false, error: err as Error });
    }
  }, []);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return useMemo(() => ({
    role,
    isLoading,
    error,
    refetch: fetchRole,
  }), [role, isLoading, error, fetchRole]);
};
