// src/components/features/verify-email/admin/VerifyEmailPageContent.tsx
'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useVerifyEmail } from '@/hooks/data/useVerifyEmail';
import { verifyEmailService } from '@/services/verify-email.service';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { VerifyEmailStatus } from './VerifyEmailStatus';
import { VerificationStats } from './VerificationStats';
import { UnverifiedUsersTable } from './UnverifiedUsersTable';
import { VerifiedUsersTable } from './VerifiedUsersTable';
import { VerifyEmailFilters } from './VerifyEmailFilters';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Mail, BarChart3, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { PaginatedUnverifiedUsers } from '@/types/verify-email.types';

type TabType = 'status' | 'users' | 'verified' | 'stats';

/**
 * Página principal de gestión de verificación de emails
 * Combina:
 * - Estado del usuario autenticado
 * - Gestión de usuarios sin verificar (Admin)
 * - Gestión de usuarios verificados (Admin)
 * - Estadísticas de verificación (Admin)
 */
export function VerifyEmailPageContent() {
  const { user } = useAuth();
  const {
    userStatus,
    userStatusLoading,
    userStatusError,
    requestVerification,
    resendVerification,
    unverifiedUsers,
    usersLoading,
    usersError,
    query,
    updateQuery,
    refreshUsers,
    stats,
    statsLoading,
    statsError,
    refreshStats,
    refreshAll,
  } = useVerifyEmail({
    page: 1,
    limit: 10,
    isVerified: false,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Estado para usuarios verificados
  const [verifiedUsersData, setVerifiedUsersData] = useState<PaginatedUnverifiedUsers | null>(null);
  const [verifiedUsersLoading, setVerifiedUsersLoading] = useState(false);
  const [verifiedUsersPage, setVerifiedUsersPage] = useState(1);

  // 🔄 Cargar usuarios verificados
  const loadVerifiedUsers = useCallback(async (page: number = 1) => {
    try {
      setVerifiedUsersLoading(true);
      const result = await verifyEmailService.getUnverifiedUsers({
        page,
        limit: 10,
        isVerified: true,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setVerifiedUsersData(result);
      setVerifiedUsersPage(page);
    } catch (err: any) {
      toast.error('Error al cargar usuarios verificados');
    } finally {
      setVerifiedUsersLoading(false);
    }
  }, []);

  // Cargar usuarios verificados al montar
  useEffect(() => {
    loadVerifiedUsers(1);
  }, [loadVerifiedUsers]);

  const [activeTab, setActiveTab] = useState<TabType>('status');
  const [requestLoading, setRequestLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // 📧 Solicitar verificación
  const handleRequestVerification = useCallback(async () => {
    try {
      setRequestLoading(true);
      const success = await requestVerification();
      if (success) {
        toast.success('Se ha enviado un email de verificación a tu correo');
      }
    } finally {
      setRequestLoading(false);
    }
  }, [requestVerification]);

  // 📧 Reenviar verificación
  const handleResendVerification = useCallback(async () => {
    try {
      setResendLoading(true);
      const success = await resendVerification();
      if (success) {
        toast.success('Se ha reenviado el email de verificación');
      }
    } finally {
      setResendLoading(false);
    }
  }, [resendVerification]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Verificación de Emails
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona y monitorea la verificación de emails de los usuarios
          </p>
        </div>
        <Button
          onClick={() => {
            refreshAll();
            loadVerifiedUsers(verifiedUsersPage);
          }}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Mi Email
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Pendientes
          </TabsTrigger>
          <TabsTrigger value="verified" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Verificados
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Estado del Usuario Autenticado */}
        <TabsContent value="status" className="space-y-4">
          <VerifyEmailStatus
            status={userStatus}
            isLoading={userStatusLoading}
            error={userStatusError}
            onRequestVerification={handleRequestVerification}
            onResendVerification={handleResendVerification}
            requestLoading={requestLoading}
            resendLoading={resendLoading}
          />
        </TabsContent>

        {/* Tab 2: Gestión de Usuarios Pendientes (Admin) */}
        <TabsContent value="users" className="space-y-4">
          <ProtectedPage module="verify-email" action="read">
            <UnverifiedUsersTable
              users={unverifiedUsers?.data || []}
              isLoading={usersLoading}
              currentPage={unverifiedUsers?.meta.page || 1}
              totalPages={unverifiedUsers?.meta.totalPages || 1}
              onPageChange={(page) => updateQuery({ page })}
            />
          </ProtectedPage>
        </TabsContent>

        {/* Tab 3: Gestión de Usuarios Verificados (Admin) */}
        <TabsContent value="verified" className="space-y-4">
          <ProtectedPage module="verify-email" action="read">
            <VerifiedUsersTable
              users={verifiedUsersData?.data || []}
              isLoading={verifiedUsersLoading}
              currentPage={verifiedUsersData?.meta.page || 1}
              totalPages={verifiedUsersData?.meta.totalPages || 1}
              onPageChange={(page) => loadVerifiedUsers(page)}
            />
          </ProtectedPage>
        </TabsContent>

        {/* Tab 4: Estadísticas (Admin) */}
        <TabsContent value="stats" className="space-y-4">
          <ProtectedPage module="verify-email" action="read">
            <VerificationStats
              stats={stats}
              isLoading={statsLoading}
            />
          </ProtectedPage>
        </TabsContent>
      </Tabs>
    </div>
  );
}
