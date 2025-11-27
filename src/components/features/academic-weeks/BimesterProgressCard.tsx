// src/components/features/academic-weeks/BimesterProgressCard.tsx

'use client';

import React, { useMemo } from 'react';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getWeekTypeTheme } from '@/config/theme.config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { WeekType, WEEK_TYPE_LABELS } from '@/types/academic-week.types';
import { parseISODateForTimezone, formatISODateWithTimezone } from '@/utils/dateUtils';

interface BimesterInfo {
  id: number;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
}

interface WeekTypeDistribution {
  type: WeekType;
  count: number;
  expected: number;
  percentage: number;
}

interface BimesterProgressCardProps {
  bimesterInfo?: BimesterInfo | null;
  totalWeeks: number;
  weekTypeDistribution: {
    REGULAR: number;
    EVALUATION: number;
    REVIEW: number;
  };
  isLoading?: boolean;
}

/**
 * 📊 Card de progreso del Bimestre para Academic Weeks
 * 
 * Muestra:
 * - Progreso general de creación de semanas
 * - Distribución por tipo de semana
 * - Alertas de validación
 * - Estado del bimestre
 */
export function BimesterProgressCard({
  bimesterInfo,
  totalWeeks,
  weekTypeDistribution,
  isLoading = false,
}: BimesterProgressCardProps) {
  // Calcular estadísticas del bimestre
  const stats = useMemo(() => {
    if (!bimesterInfo) {
      return {
        expectedWeeks: 0,
        createdWeeks: totalWeeks,
        progressPercentage: 0,
        remainingWeeks: 0,
        hasEvaluationWeek: false,
        hasReviewWeek: false,
        distribution: [] as WeekTypeDistribution[],
      };
    }

    // Calcular semanas esperadas (aproximadamente)
    const start = parseISODateForTimezone(bimesterInfo.startDate);
    const end = parseISODateForTimezone(bimesterInfo.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const expectedWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

    const progressPercentage = expectedWeeks > 0
      ? Math.round((totalWeeks / expectedWeeks) * 100)
      : 0;

    const remainingWeeks = Math.max(0, expectedWeeks - totalWeeks);

    // Distribución de tipos
    const distribution: WeekTypeDistribution[] = [
      {
        type: 'REGULAR' as WeekType,
        count: weekTypeDistribution.REGULAR,
        expected: expectedWeeks - 2, // La mayoría son regulares
        percentage: totalWeeks > 0 ? Math.round((weekTypeDistribution.REGULAR / totalWeeks) * 100) : 0,
      },
      {
        type: 'EVALUATION' as WeekType,
        count: weekTypeDistribution.EVALUATION,
        expected: 1, // Una semana de evaluación por bimestre
        percentage: totalWeeks > 0 ? Math.round((weekTypeDistribution.EVALUATION / totalWeeks) * 100) : 0,
      },
      {
        type: 'REVIEW' as WeekType,
        count: weekTypeDistribution.REVIEW,
        expected: 1, // Una semana de revisión por bimestre
        percentage: totalWeeks > 0 ? Math.round((weekTypeDistribution.REVIEW / totalWeeks) * 100) : 0,
      },
    ];

    return {
      expectedWeeks,
      createdWeeks: totalWeeks,
      progressPercentage: Math.min(progressPercentage, 100),
      remainingWeeks,
      hasEvaluationWeek: weekTypeDistribution.EVALUATION > 0,
      hasReviewWeek: weekTypeDistribution.REVIEW > 0,
      distribution,
    };
  }, [bimesterInfo, totalWeeks, weekTypeDistribution]);

  // Determinar alertas
  const alerts = useMemo(() => {
    const alerts: Array<{ type: 'warning' | 'error' | 'info'; message: string }> = [];

    if (!bimesterInfo) {
      return alerts;
    }

    // Alerta si no hay semana de evaluación
    if (!stats.hasEvaluationWeek) {
      alerts.push({
        type: 'error',
        message: 'Falta semana de evaluación',
      });
    }

    // Alerta si no hay semana de revisión
    if (!stats.hasReviewWeek) {
      alerts.push({
        type: 'warning',
        message: 'Falta semana de revisión',
      });
    }

    // Alerta si progreso es bajo
    if (stats.progressPercentage < 50) {
      alerts.push({
        type: 'info',
        message: `Quedan ${stats.remainingWeeks} semanas por crear`,
      });
    }

    return alerts;
  }, [bimesterInfo, stats]);

  // Estado sin bimestre seleccionado
  if (!bimesterInfo) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Progreso del Bimestre
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Selecciona un bimestre para ver su progreso
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determinar estado visual del progreso
  const progressStatus = stats.progressPercentage >= 100
    ? 'complete'
    : stats.progressPercentage >= 75
    ? 'good'
    : stats.progressPercentage >= 50
    ? 'progress'
    : 'warning';

  const statusConfig = {
    complete: {
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
      border: 'border-green-200 dark:border-green-800',
      progressBg: 'bg-green-500',
      icon: CheckCircle2,
      iconClass: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900',
    },
    good: {
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
      border: 'border-blue-200 dark:border-blue-800',
      progressBg: 'bg-blue-500',
      icon: TrendingUp,
      iconClass: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900',
    },
    progress: {
      bg: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20',
      border: 'border-indigo-200 dark:border-indigo-800',
      progressBg: 'bg-indigo-500',
      icon: Clock,
      iconClass: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900',
    },
    warning: {
      bg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20',
      border: 'border-orange-200 dark:border-orange-800',
      progressBg: 'bg-orange-500',
      icon: AlertTriangle,
      iconClass: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900',
    },
  };

  const config = statusConfig[progressStatus];
  const StatusIcon = config.icon;

  return (
    <Card className={`${config.bg} ${config.border}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {bimesterInfo.name}
          </CardTitle>
          <div className={`p-2 rounded-lg ${config.iconBg}`}>
            <StatusIcon className={`h-5 w-5 ${config.iconClass}`} />
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {formatISODateWithTimezone(bimesterInfo.startDate, "d 'de' MMMM")} -{' '}
          {formatISODateWithTimezone(bimesterInfo.endDate, "d 'de' MMMM, yyyy")}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progreso general */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Progreso de creación
            </span>
            <span className="text-gray-900 dark:text-gray-100 font-bold">
              {stats.createdWeeks} / {stats.expectedWeeks} semanas
            </span>
          </div>
          <div className="relative">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${config.progressBg} transition-all duration-300 ease-in-out`}
                style={{ width: `${stats.progressPercentage}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-right">
            {stats.progressPercentage}% completado
          </p>
        </div>

        {/* Distribución por tipo */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Distribución por tipo
          </p>
          <div className="space-y-2">
            {stats.distribution.map((dist) => {
              const theme = getWeekTypeTheme(dist.type);
              return (
                <div key={dist.type} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${theme.icon}`} />
                  <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                    {WEEK_TYPE_LABELS[dist.type]}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {dist.count}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${theme.badge}`}>
                      {dist.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alertas */}
        {alerts.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-2 rounded-lg ${
                  alert.type === 'error'
                    ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                    : alert.type === 'warning'
                    ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400'
                    : 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                }`}
              >
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-medium">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {stats.createdWeeks}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Creadas</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {stats.remainingWeeks}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Restantes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {stats.expectedWeeks}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Esperadas</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BimesterProgressCard;
