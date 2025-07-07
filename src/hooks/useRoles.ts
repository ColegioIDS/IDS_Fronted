import { useState, useEffect, useCallback, useMemo } from 'react';
import { getRoles, createRole as createRoleService, deleteRole as deleteRoleService, updateRole as updateRoleService } from '@/services/useRole';
import { Role, RoleTableRow, RoleFormValues } from '@/types/role';

const formatDate = (date: string | Date): string =>
  new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

interface RoleState {
  roles: RoleTableRow[];
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
}

const initialFormData: RoleFormValues = {
  name: '',
  description: '',
  isActive: true,
};

export const useRoles = () => {
  const [roleState, setRoleState] = useState<RoleState>({
    roles: [],
    isLoading: true,
    isSaving: false,
    error: null,
  });

  const [formData, setFormData] = useState<RoleFormValues>(initialFormData);

  const { roles, isLoading, isSaving, error } = roleState;

  const fetchRoles = useCallback(async () => {
    try {
      setRoleState(prev => ({ ...prev, isLoading: true, error: null }));

      const roleData = await getRoles();

      const tableRows: RoleTableRow[] = roleData.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description || '',
        isActive: role.isActive,
        createdAt: formatDate(role.createdAt),
        updatedAt: formatDate(role.updatedAt),
        createdBy: role.createdBy?.fullName || '',
        userCount: role.userCount,
        permissionCount: role.permissions.length,
        permissions: role.permissions
      }));
      console.log('Roles obtenidos:', tableRows);

      setRoleState({
        roles: tableRows,
        isLoading: false,
        isSaving: false,
        error: null,
      });
    } catch (err) {
      setRoleState(prev => ({
        ...prev,
        roles: [],
        isLoading: false,
        error: err instanceof Error ? err : new Error('Error al obtener los roles'),
      }));
    }
  }, []);

  const updateFormData = useCallback((updates: Partial<RoleFormValues>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const createRole = useCallback(async (data?: RoleFormValues) => {
    try {
      setRoleState(prev => ({ ...prev, isSaving: true, error: null }));

      const roleToCreate = data || formData;
      const createdRole = await createRoleService(roleToCreate as Role);

      await fetchRoles(); // Refresca la lista después de crear
      setFormData(initialFormData); // Limpia formulario

      return createdRole;
    } catch (err) {

      const error = err instanceof Error ? err : new Error('Error al crear el rol');
      setRoleState(prev => ({ ...prev, isSaving: false }));
      throw error;
    }
  }, [formData, fetchRoles]);



  const deleteRole = useCallback(async (roleId: string) => {
  try {
    setRoleState(prev => ({ ...prev, isSaving: true, error: null }));

    await deleteRoleService(roleId);
    await fetchRoles(); // Refresca la lista después de eliminar
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Error al eliminar el rol');
    setRoleState(prev => ({ ...prev, isSaving: false, error }));
    throw error;
  }
}, [fetchRoles]);

const updateRole = useCallback(
  async (roleId: string, updates: Partial<RoleFormValues>) => {
    try {
      setRoleState(prev => ({ ...prev, isSaving: true, error: null }));

      // Llama al servicio
      const updated = await updateRoleService(roleId, updates);

      // Vuelve a obtener la lista para mantener sincronizado
      await fetchRoles();

      return updated;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al actualizar el rol');
      setRoleState(prev => ({ ...prev, isSaving: false, error }));
      throw error;
    }
  },
  [fetchRoles]
);















  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return useMemo(() => ({
    roles,
    isLoading,
    isSaving,
    error,
    formData,
    updateFormData,
    createRole,
    refetch: fetchRoles,
    deleteRole,
    updateRole
  }), [
    roles,
    isLoading,
    isSaving,
    error,
    formData,
    updateFormData,
    createRole,
    fetchRoles,
    deleteRole,
    updateRole
  ]);
};
