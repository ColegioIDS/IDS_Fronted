// src/hooks/data/useAttendanceStatusPermissions.ts
'use client';

import { useAuth } from '@/context/AuthContext';

/**
 * Hook para validar permisos en Estados de Asistencia
 */
export const useAttendanceStatusPermissions = () => {
  const { user } = useAuth();

  const canReadStatuses = () => {
    return user?.role?.permissions?.some(
      (p) => p?.permission?.module === 'attendance-status' && p?.permission?.action === 'read'
    );
  };

  const canReadOneStatus = () => {
    return user?.role?.permissions?.some(
      (p) => p?.permission?.module === 'attendance-status' && p?.permission?.action === 'read-one'
    );
  };

  const canCreateStatus = () => {
    return user?.role?.permissions?.some(
      (p) => p?.permission?.module === 'attendance-status' && p?.permission?.action === 'create'
    );
  };

  const canUpdateStatus = () => {
    return user?.role?.permissions?.some(
      (p) => p?.permission?.module === 'attendance-status' && p?.permission?.action === 'update'
    );
  };

  const canDeleteStatus = () => {
    return user?.role?.permissions?.some(
      (p) => p?.permission?.module === 'attendance-status' && p?.permission?.action === 'delete'
    );
  };

  return {
    canReadStatuses: canReadStatuses(),
    canReadOneStatus: canReadOneStatus(),
    canCreateStatus: canCreateStatus(),
    canUpdateStatus: canUpdateStatus(),
    canDeleteStatus: canDeleteStatus(),
    user,
  };
};
