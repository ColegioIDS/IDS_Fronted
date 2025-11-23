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
  Users,
  Shield,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Validar que summary tenga la estructura esperada
  if (!summary.summary) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No hay datos disponibles para mostrar. Por favor, intenta más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  const configPercentage = parseFloat(summary.summary.configurationPercentage);
  const isFullyConfigured = configPercentage === 100;
  const hasGaps = summary.gaps?.rolesWithoutPermissions?.count > 0 ||
    summary.gaps?.statusesWithoutPermissions?.count > 0;

  // Define stat cards
  const stats = [
    {
      title: 'Total de Roles',
      value: summary.summary.totalRoles,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      description: 'Roles del sistema',
    },
    {
      title: 'Total de Estados',
      value: summary.summary.totalStatuses,
      icon: Shield,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      description: 'Estados de asistencia',
    },
    {
      title: 'Permisos Configurados',
      value: summary.summary.totalPermissions,
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      description: 'Permisos totales',
    },
    {
      title: 'Configuración',
      value: `${configPercentage.toFixed(1)}%`,
      icon: TrendingUp,
      color: isFullyConfigured ? 'from-green-500 to-green-600' : 'from-amber-500 to-amber-600',
      bgColor: isFullyConfigured ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
      textColor: isFullyConfigured ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400',
      description: 'del sistema configurado',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={stat.bgColor}>
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.textColor}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration Alert */}
      {isFullyConfigured ? (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-300 ml-3">
            ✨ Excelente! Todos los permisos están completamente configurados.
          </AlertDescription>
        </Alert>
      ) : hasGaps ? (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-300 ml-3">
            ⚠️ Hay brechas en la configuración. Se encontraron{' '}
            {(summary.gaps?.rolesWithoutPermissions?.count || 0) > 0 &&
              `${summary.gaps?.rolesWithoutPermissions?.count} role(s) sin permisos`}
            {(summary.gaps?.rolesWithoutPermissions?.count || 0) > 0 &&
              (summary.gaps?.statusesWithoutPermissions?.count || 0) > 0 &&
              ' y '}
            {(summary.gaps?.statusesWithoutPermissions?.count || 0) > 0 &&
              `${summary.gaps?.statusesWithoutPermissions?.count} estado(s) sin permisos`}
            .
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Breakdown */}
      <Card className="border-l-4 border-blue-400 dark:border-blue-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Desglose por Rol
          </CardTitle>
          <CardDescription>
            Promedio de {summary.breakdown?.averagePermissionsPerRole || '0'} permisos por rol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(summary.breakdown?.roles || []).map((role) => (
              <div key={role.roleId} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Rol ID: {role.roleId}
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {role.permissionCount} permisos
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (role.permissionCount /
                          (parseInt(summary.breakdown?.averagePermissionsPerRole || '1') * 2)) *
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
        {(summary.gaps?.rolesWithoutPermissions?.count || 0) > 0 && (
          <Card className="border-l-4 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                Roles Sin Permisos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-bold text-red-600 dark:text-red-400">
                {summary.gaps?.rolesWithoutPermissions?.count || 0} rol(es) sin configuración
              </p>
              {(summary.gaps?.rolesWithoutPermissions?.count || 0) > 0 && (
                <ul className="space-y-1 text-red-700 dark:text-red-300">
                  {(summary.gaps?.rolesWithoutPermissions?.data || []).slice(0, 3).map((role: any) => (
                    <li key={role.id} className="text-xs flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full" />
                      {role.name}
                    </li>
                  ))}
                  {(summary.gaps?.rolesWithoutPermissions?.count || 0) > 3 && (
                    <li className="text-xs text-red-600 dark:text-red-400 font-medium">
                      + {(summary.gaps?.rolesWithoutPermissions?.count || 0) - 3} más
                    </li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {(summary.gaps?.statusesWithoutPermissions?.count || 0) > 0 && (
          <Card className="border-l-4 border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <AlertCircle className="h-4 w-4" />
                Estados Sin Permisos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-bold text-orange-600 dark:text-orange-400">
                {summary.gaps?.statusesWithoutPermissions?.count || 0} estado(s) sin configuración
              </p>
              {(summary.gaps?.statusesWithoutPermissions?.count || 0) > 0 && (
                <ul className="space-y-1 text-orange-700 dark:text-orange-300">
                  {(summary.gaps?.statusesWithoutPermissions?.data || []).slice(0, 3).map((status: any) => (
                    <li key={status.id} className="text-xs flex items-center gap-1">
                      <span className="w-1 h-1 bg-orange-600 rounded-full" />
                      {status.name} ({status.code})
                    </li>
                  ))}
                  {(summary.gaps?.statusesWithoutPermissions?.count || 0) > 3 && (
                    <li className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      + {(summary.gaps?.statusesWithoutPermissions?.count || 0) - 3} más
                    </li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
