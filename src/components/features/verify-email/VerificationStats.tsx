// src/components/features/verify-email/VerificationStats.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VerificationStats as VerificationStatsType } from '@/types/verify-email.types';
import { CheckCircle2, AlertCircle, Users, TrendingUp } from 'lucide-react';

interface VerificationStatsProps {
  stats: VerificationStatsType | null;
  isLoading: boolean;
}

/**
 * Componente para mostrar estadísticas de verificación
 */
export function VerificationStatsComponent({
  stats,
  isLoading,
}: VerificationStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: Users,
      label: 'Total de Usuarios',
      value: stats.total,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      icon: CheckCircle2,
      label: 'Verificados',
      value: stats.verified,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      icon: AlertCircle,
      label: 'Pendientes',
      value: stats.pending,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      icon: TrendingUp,
      label: 'Tasa de Verificación',
      value: `${stats.verificationRate.toFixed(1)}%`,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {item.label}
                    </p>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </div>
                  <div className={`${item.bgColor} p-3 rounded-lg`}>
                    <IconComponent className={`h-6 w-6 ${item.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Promedio de días */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Promedio de Verificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.averageDaysToVerify.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">días promedio</p>
            </div>
            <div className="text-right text-sm text-gray-600 dark:text-gray-400">
              Tiempo promedio que tardan los usuarios en verificar su email
              después de la creación de la cuenta.
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
