// src/hooks/data/verify-email/useVerifyEmail.ts
import { useState, useEffect, useCallback } from 'react';
import { verifyEmailService } from '@/services/verify-email.service';
import {
  EmailVerificationStatus,
  PaginatedUnverifiedUsers,
  VerificationStats,
  VerifyEmailQuery,
} from '@/types/verify-email.types';

export type UseVerifyEmailOptions = {
  /** Si true, no se llaman las APIs de admin (usuarios pendientes, stats). Evita 403 cuando el usuario no tiene verify-email:read. */
  skipAdmin?: boolean;
};

/**
 * Hook para gestionar la verificación de emails
 * Combina estado del usuario autenticado + datos administrativos
 */
export function useVerifyEmail(
  initialQuery: VerifyEmailQuery = {},
  options: UseVerifyEmailOptions = {}
) {
  const { skipAdmin = false } = options;
  // 👤 Estado del usuario autenticado
  const [userStatus, setUserStatus] = useState<EmailVerificationStatus | null>(null);
  const [userStatusLoading, setUserStatusLoading] = useState(false);
  const [userStatusError, setUserStatusError] = useState<string | null>(null);

  // 📋 Datos administrativos (usuarios sin verificar)
  const [unverifiedUsers, setUnverifiedUsers] = useState<PaginatedUnverifiedUsers | null>(
    null
  );
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [query, setQuery] = useState<VerifyEmailQuery>(initialQuery);

  // 📊 Estadísticas
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // 🔄 Obtener estado del usuario autenticado
  const loadUserStatus = useCallback(async () => {
    try {
      setUserStatusLoading(true);
      setUserStatusError(null);
      const status = await verifyEmailService.getVerificationStatus();
      setUserStatus(status);
    } catch (err: any) {
      setUserStatusError(err.message || 'Error al obtener estado');
    } finally {
      setUserStatusLoading(false);
    }
  }, []);

  // 🔄 Obtener usuarios sin verificar (Admin)
  const loadUnverifiedUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const result = await verifyEmailService.getUnverifiedUsers(query);
      setUnverifiedUsers(result);
    } catch (err: any) {
      setUsersError(err.message || 'Error al obtener usuarios');
    } finally {
      setUsersLoading(false);
    }
  }, [query]);

  // 🔄 Obtener estadísticas (Admin)
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const statsData = await verifyEmailService.getVerificationStats();
      setStats(statsData);
    } catch (err: any) {
      setStatsError(err.message || 'Error al obtener estadísticas');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // 📧 Solicitar verificación
  const requestVerification = useCallback(async () => {
    try {
      setUserStatusError(null);
      await verifyEmailService.requestVerification();
      // Recargar estado después de solicitar
      await loadUserStatus();
      return true;
    } catch (err: any) {
      setUserStatusError(err.message);
      return false;
    }
  }, [loadUserStatus]);

  // 📧 Reenviar verificación
  const resendVerification = useCallback(async () => {
    try {
      setUserStatusError(null);
      await verifyEmailService.resendVerification();
      return true;
    } catch (err: any) {
      setUserStatusError(err.message);
      return false;
    }
  }, []);

  // 📧 Verificar con token
  const verifyWithToken = useCallback(async (token: string) => {
    try {
      setUserStatusError(null);
      const result = await verifyEmailService.verifyEmailWithToken(token);
      // Recargar estado después de verificar
      await loadUserStatus();
      return result;
    } catch (err: any) {
      setUserStatusError(err.message);
      throw err;
    }
  }, [loadUserStatus]);

  // 🔧 Utilidades
  const updateQuery = useCallback((newQuery: Partial<VerifyEmailQuery>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  }, []);

  const refreshUsers = useCallback(() => {
    loadUnverifiedUsers();
  }, [loadUnverifiedUsers]);

  const refreshStats = useCallback(() => {
    loadStats();
  }, [loadStats]);

  const refreshAll = useCallback(() => {
    loadUserStatus();
    if (!skipAdmin) {
      loadUnverifiedUsers();
      loadStats();
    }
  }, [skipAdmin, loadUserStatus, loadUnverifiedUsers, loadStats]);

  // ⏳ Cargas iniciales: estado del usuario siempre; admin solo si no skipAdmin
  useEffect(() => {
    loadUserStatus();
  }, [loadUserStatus]);

  useEffect(() => {
    if (!skipAdmin) loadUnverifiedUsers();
  }, [skipAdmin, loadUnverifiedUsers]);

  useEffect(() => {
    if (!skipAdmin) loadStats();
  }, [skipAdmin, loadStats]);

  return {
    // 👤 Usuario autenticado
    userStatus,
    userStatusLoading,
    userStatusError,
    requestVerification,
    resendVerification,
    verifyWithToken,

    // 📋 Datos administrativos
    unverifiedUsers,
    usersLoading,
    usersError,
    query,
    updateQuery,
    refreshUsers,

    // 📊 Estadísticas
    stats,
    statsLoading,
    statsError,
    refreshStats,

    // 🔄 Utilidades
    refreshAll,
  };
}
