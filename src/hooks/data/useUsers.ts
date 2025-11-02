// src/hooks/data/useUsers.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usersService } from '@/services/users.service';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { PaginatedUsers, UsersQuery, User, UserStats } from '@/types/users.types';
import { toast } from 'sonner';

interface UseUsersState {
  data: PaginatedUsers | null;
  stats: UserStats | null;
  isLoading: boolean;
  error: Error | null;
  query: UsersQuery;
  permissionError: string | null;
}

export function useUsers(initialQuery: UsersQuery = {}) {
  const { hasPermission } = useAuth();
  
  const [state, setState] = useState<UseUsersState>({
    data: null,
    stats: null,
    isLoading: true,
    error: null,
    permissionError: null,
    query: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...initialQuery,
    },
  });

  // ✅ Verificar si tiene permiso para leer estadísticas
  const canReadStats = hasPermission('user', 'read-stats');

  // Fetch users
  const fetchUsers = useCallback(async (query: UsersQuery) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await usersService.getUsers(query);
      setState((prev) => ({
        ...prev,
        data: result,
        isLoading: false,
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      setState((prev) => ({
        ...prev,
        error: err,
        isLoading: false,
      }));
      toast.error(err.message);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    // ✅ Solo intentar cargar si tiene permiso
    if (!canReadStats) {
      setState((prev) => ({
        ...prev,
        permissionError: 'No tienes permiso para ver las estadísticas',
        stats: null,
      }));
      return;
    }

    try {
      const stats = await usersService.getUserStats();
      setState((prev) => ({
        ...prev,
        stats,
        permissionError: null,
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error al obtener estadísticas');
      
      // ✅ Si el error es de permisos, establecer permissionError
      if (err.message.includes('Permisos insuficientes') || err.message.includes('read-stats')) {
        setState((prev) => ({
          ...prev,
          permissionError: 'No tienes permiso para ver las estadísticas',
          stats: null,
        }));
      } else {
        toast.error(err.message);
      }
    }
  }, [canReadStats]);

  // Initial load
  useEffect(() => {
    fetchUsers(state.query);
    fetchStats();
  }, [canReadStats]);

  // Update query
  const updateQuery = useCallback(
    (newQuery: Partial<UsersQuery>) => {
      const updatedQuery = { ...state.query, ...newQuery };
      setState((prev) => ({ ...prev, query: updatedQuery }));
      fetchUsers(updatedQuery);
    },
    [state.query, fetchUsers]
  );

  // Refresh
  const refresh = useCallback(() => {
    fetchUsers(state.query);
    fetchStats();
  }, [state.query, fetchUsers, fetchStats]);

  // Create user
  const createUser = useCallback(
    async (data: any) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        await usersService.createUser(data);
        toast.success('Usuario creado exitosamente');
        await refresh();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Error al crear usuario');
        toast.error(err.message);
        throw err;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [refresh]
  );

  // Update user
  const updateUser = useCallback(
    async (id: number, data: any) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        await usersService.updateUser(id, data);
        toast.success('Usuario actualizado exitosamente');
        await refresh();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Error al actualizar usuario');
        toast.error(err.message);
        throw err;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [refresh]
  );

  // Delete user
  const deleteUser = useCallback(
    async (id: number) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        await usersService.deleteUser(id);
        toast.success('Usuario eliminado exitosamente');
        await refresh();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Error al eliminar usuario');
        toast.error(err.message);
        throw err;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [refresh]
  );

  // Get user by ID
  const getUserById = useCallback(async (id: number) => {
    try {
      const user = await usersService.getUserById(id);
      return user;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error al obtener usuario');
      toast.error(err.message);
      throw err;
    }
  }, []);

  // Grant access
  const grantAccess = useCallback(
    async (id: number) => {
      try {
        await usersService.grantAccess(id);
        toast.success('Acceso otorgado exitosamente');
        await refresh();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Error al otorgar acceso');
        toast.error(err.message);
        throw err;
      }
    },
    [refresh]
  );

  // Revoke access
  const revokeAccess = useCallback(
    async (id: number) => {
      try {
        await usersService.revokeAccess(id);
        toast.success('Acceso revocado exitosamente');
        await refresh();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Error al revocar acceso');
        toast.error(err.message);
        throw err;
      }
    },
    [refresh]
  );

  // Verify email
  const verifyEmail = useCallback(
    async (id: number) => {
      try {
        await usersService.verifyEmail(id);
        toast.success('Email verificado exitosamente');
        await refresh();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Error al verificar email');
        toast.error(err.message);
        throw err;
      }
    },
    [refresh]
  );

  // Change password
  const changePassword = useCallback(
    async (id: number, data: any) => {
      try {
        await usersService.changePassword(id, data);
        toast.success('Contraseña cambiada exitosamente');
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Error al cambiar contraseña');
        toast.error(err.message);
        throw err;
      }
    },
    []
  );

  // Upload picture
  const uploadPicture = useCallback(
    async (userId: number, file: File, kind: string, description?: string) => {
      try {
        // 1️⃣ Subir a Cloudinary
        toast.loading('Subiendo imagen a Cloudinary...');
        const { url, publicId } = await uploadImageToCloudinary(file);
        
        // 2️⃣ Registrar en backend
        const result = await usersService.uploadPicture(userId, url, publicId, kind, description);
        toast.success('Foto subida exitosamente');
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Error al subir foto');
        toast.error(err.message);
        throw err;
      }
    },
    []
  );

  // Remove picture
  const removePicture = useCallback(
    async (userId: number, pictureId: number) => {
      try {
        await usersService.removePicture(userId, pictureId);
        toast.success('Foto eliminada exitosamente');
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Error al eliminar foto');
        toast.error(err.message);
        throw err;
      }
    },
    []
  );

  return {
    // State
    data: state.data,
    stats: state.stats,
    isLoading: state.isLoading,
    error: state.error,
    permissionError: state.permissionError,
    query: state.query,
    // Actions
    updateQuery,
    refresh,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    grantAccess,
    revokeAccess,
    verifyEmail,
    changePassword,
    uploadPicture,
    removePicture,
  };
}
