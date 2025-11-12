// src/components/features/attendance-permissions/AttendancePermissionDashboard.tsx
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { PermissionsDashboardSummary } from '@/types/attendance-permissions.types';

interface AttendancePermissionDashboardProps {
  summary: PermissionsDashboardSummary | null;
  loading?: boolean;
}

export const AttendancePermissionDashboard: React.FC<
  AttendancePermissionDashboardProps
> = ({ summary, loading = false }) => {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const configPercentage = parseFloat(summary.summary.configurationPercentage);
  const isFullyConfigured = configPercentage === 100;
  const hasGaps = summary.gaps.rolesWithoutPermissions.count > 0 ||
    summary.gaps.statusesWithoutPermissions.count > 0;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {summary.summary.totalRoles}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              roles del sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {summary.summary.totalStatuses}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              estados de asistencia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Permisos Configurados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {summary.summary.totalPermissions}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              permisos totales
            </p>
          </CardContent>
        </Card>

        <Card className={isFullyConfigured ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${isFullyConfigured ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {configPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              del sistema configurado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Alert */}
      {isFullyConfigured ? (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            Excelente! Todos los permisos están completamente configurados.
          </AlertDescription>
        </Alert>
      ) : hasGaps ? (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Hay brechas en la configuración. Se encontraron{' '}
            {summary.gaps.rolesWithoutPermissions.count > 0 &&
              `${summary.gaps.rolesWithoutPermissions.count} role(s) sin permisos`}
            {summary.gaps.rolesWithoutPermissions.count > 0 &&
              summary.gaps.statusesWithoutPermissions.count > 0 &&
              ' y '}
            {summary.gaps.statusesWithoutPermissions.count > 0 &&
              `${summary.gaps.statusesWithoutPermissions.count} estado(s) sin permisos`}
            .
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Desglose por Rol
          </CardTitle>
          <CardDescription>
            Promedio de {summary.breakdown.averagePermissionsPerRole} permisos por rol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary.breakdown.roles.map((role) => (
              <div key={role.roleId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Rol {role.roleId}
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {role.permissionCount} permisos
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (role.permissionCount /
                          parseInt(summary.breakdown.averagePermissionsPerRole || '1')) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gaps Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summary.gaps.rolesWithoutPermissions.count > 0 && (
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                Roles Sin Permisos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-bold text-red-600 dark:text-red-400">
                {summary.gaps.rolesWithoutPermissions.count} rol(es)
              </p>
              <ul className="mt-2 space-y-1 text-red-700 dark:text-red-300">
                {summary.gaps.rolesWithoutPermissions.data.map((role: any) => (
                  <li key={role.id} className="text-xs">
                    • {role.name}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {summary.gaps.statusesWithoutPermissions.count > 0 && (
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                Estados Sin Permisos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-bold text-red-600 dark:text-red-400">
                {summary.gaps.statusesWithoutPermissions.count} estado(s)
              </p>
              <ul className="mt-2 space-y-1 text-red-700 dark:text-red-300">
                {summary.gaps.statusesWithoutPermissions.data.map((status: any) => (
                  <li key={status.id} className="text-xs">
                    • {status.name} ({status.code})
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
