// src/components/features/verify-email/VerifyEmailPageContent.tsx
'use client';

import React, { useCallback, useState } from 'react';
import { useVerifyEmail } from '@/hooks/data/verify-email';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { VerifyEmailStatus } from './VerifyEmailStatus';
import { VerificationStatsComponent } from './VerificationStats';
import { UnverifiedUsersTable } from './UnverifiedUsersTable';
import { VerifyEmailFilters } from './VerifyEmailFilters';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Mail, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

type TabType = 'status' | 'users' | 'stats';

/**
 * Página principal de gestión de verificación de emails
 * Combina:
 * - Estado del usuario autenticado
 * - Gestión de usuarios sin verificar (Admin)
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

  // 🔄 Limpiar filtros
  const handleClearFilters = useCallback(() => {
    updateQuery({
      search: undefined,
      isVerified: false,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
    });
  }, [updateQuery]);

  // ✅ Verificar si hay filtros activos
  const hasActiveFilters = !!(query.search || query.isVerified !== false);

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
          onClick={refreshAll}
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Mi Email
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Usuarios
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

        {/* Tab 2: Gestión de Usuarios (Admin) */}
        <TabsContent value="users" className="space-y-4">
          <ProtectedPage module="verify-email" action="read">
            <VerifyEmailFilters
              query={query}
              onQueryChange={updateQuery}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />

            <UnverifiedUsersTable
              users={unverifiedUsers?.data || []}
              isLoading={usersLoading}
              currentPage={unverifiedUsers?.meta.page || 1}
              totalPages={unverifiedUsers?.meta.totalPages || 1}
              onPageChange={(page) => updateQuery({ page })}
            />
          </ProtectedPage>
        </TabsContent>

        {/* Tab 3: Estadísticas (Admin) */}
        <TabsContent value="stats" className="space-y-4">
          <ProtectedPage module="verify-email" action="read">
            <VerificationStatsComponent
              stats={stats}
              isLoading={statsLoading}
            />
          </ProtectedPage>
        </TabsContent>
      </Tabs>
    </div>
  );
}
