// src/components/features/verify-email/admin/VerifyEmailPageContent.tsx
'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useVerifyEmail } from '@/hooks/data/verify-email';
import { verifyEmailService } from '@/services/verify-email.service';
import { useAuth } from '@/hooks/useAuth';
import { VERIFY_EMAIL_PERMISSIONS } from '@/constants/modules-permissions/verify-email/verify-email.permissions';
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
  const { hasPermission, isLoading: authLoading } = useAuth();
  const canAccessAdmin = hasPermission(
    VERIFY_EMAIL_PERMISSIONS.READ.module,
    VERIFY_EMAIL_PERMISSIONS.READ.action
  );

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
  } = useVerifyEmail(
    {
      page: 1,
      limit: 10,
      isVerified: false,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    { skipAdmin: !canAccessAdmin }
  );

  // Estado para usuarios verificados (solo se carga si tiene permiso)
  const [verifiedUsersData, setVerifiedUsersData] = useState<PaginatedUnverifiedUsers | null>(null);
  const [verifiedUsersLoading, setVerifiedUsersLoading] = useState(false);
  const [verifiedUsersPage, setVerifiedUsersPage] = useState(1);

  // 🔄 Cargar usuarios verificados (solo si tiene permiso admin)
  const loadVerifiedUsers = useCallback(
    async (page: number = 1) => {
      if (!canAccessAdmin) return;
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
    },
    [canAccessAdmin]
  );

  // Cargar usuarios verificados al montar solo si tiene permiso
  useEffect(() => {
    if (canAccessAdmin) loadVerifiedUsers(1);
  }, [canAccessAdmin, loadVerifiedUsers]);

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
    <div className="space-y-6">
      {/* Barra: descripción breve + actualizar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Gestiona tu correo y, si tienes permiso, la verificación de otros usuarios.
        </p>
        <Button
          onClick={() => {
            refreshAll();
            if (canAccessAdmin) loadVerifiedUsers(verifiedUsersPage);
          }}
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Contenedor principal con pestañas */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
          <div className="border-b px-4 pt-4 sm:px-6">
            <TabsList
              className={
                canAccessAdmin
                  ? 'grid w-full grid-cols-4 h-11 bg-muted/50 p-1'
                  : 'grid w-full grid-cols-1 h-11 bg-muted/50 p-1 max-w-xs'
              }
            >
              <TabsTrigger value="status" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Mail className="h-4 w-4 shrink-0" />
                Mi Email
              </TabsTrigger>
              {canAccessAdmin && (
                <>
                  <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <Mail className="h-4 w-4 shrink-0" />
                    Pendientes
                  </TabsTrigger>
                  <TabsTrigger value="verified" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Verificados
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <BarChart3 className="h-4 w-4 shrink-0" />
                    Estadísticas
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          {/* Contenido de cada pestaña */}
          <div className="p-4 sm:p-6">
            <TabsContent value="status" className="mt-0 space-y-4">
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

            {/* Tabs de admin: solo se renderizan si tiene permiso verify-email:read */}
            {canAccessAdmin && (
              <>
                <TabsContent value="users" className="mt-0 space-y-4">
                  <UnverifiedUsersTable
                    users={unverifiedUsers?.data || []}
                    isLoading={usersLoading}
                    currentPage={unverifiedUsers?.meta.page || 1}
                    totalPages={unverifiedUsers?.meta.totalPages || 1}
                    onPageChange={(page) => updateQuery({ page })}
                  />
                </TabsContent>
                <TabsContent value="verified" className="mt-0 space-y-4">
                  <VerifiedUsersTable
                    users={verifiedUsersData?.data || []}
                    isLoading={verifiedUsersLoading}
                    currentPage={verifiedUsersData?.meta.page || 1}
                    totalPages={verifiedUsersData?.meta.totalPages || 1}
                    onPageChange={(page) => loadVerifiedUsers(page)}
                  />
                </TabsContent>
                <TabsContent value="stats" className="mt-0 space-y-4">
                  <VerificationStats
                    stats={stats}
                    isLoading={statsLoading}
                  />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
