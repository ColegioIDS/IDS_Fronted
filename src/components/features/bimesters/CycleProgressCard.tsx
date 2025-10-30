// src/components/features/bimesters/CycleProgressCard.tsx

'use client';

import React, { useMemo } from 'react';
import { Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format, differenceInDays, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CycleProgressCardProps {
  cycle?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  } | null;
}

/**
 * 📊 Card de progreso del ciclo escolar
 * 
 * Muestra:
 * - Mensaje cuando no hay ciclo seleccionado
 * - Progress bar con días completados/restantes
 * - Información detallada del ciclo
 * - Estados: No iniciado, En progreso, Finalizado
 */
export function CycleProgressCard({ cycle }: CycleProgressCardProps) {
  const progressData = useMemo(() => {
    if (!cycle) return null;

    const today = new Date();
    const startDate = new Date(cycle.startDate);
    const endDate = new Date(cycle.endDate);

    // Total de días del ciclo
    const totalDays = differenceInDays(endDate, startDate) + 1;

    // Estado del ciclo
    let status: 'not-started' | 'in-progress' | 'completed';
    let daysCompleted = 0;
    let daysRemaining = 0;
    let progressPercentage = 0;

    if (isBefore(today, startDate)) {
      // No ha iniciado
      status = 'not-started';
      daysRemaining = totalDays;
      daysCompleted = 0;
      progressPercentage = 0;
    } else if (isAfter(today, endDate)) {
      // Ya terminó
      status = 'completed';
      daysCompleted = totalDays;
      daysRemaining = 0;
      progressPercentage = 100;
    } else {
      // En progreso
      status = 'in-progress';
      daysCompleted = differenceInDays(today, startDate) + 1;
      daysRemaining = differenceInDays(endDate, today);
      progressPercentage = (daysCompleted / totalDays) * 100;
    }

    return {
      status,
      totalDays,
      daysCompleted,
      daysRemaining,
      progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
      startDate,
      endDate,
    };
  }, [cycle]);

  // Sin ciclo seleccionado
  if (!cycle) {
    return (
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                Selecciona un Ciclo Escolar
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Para ver los bimestres y el progreso del ciclo, selecciona un ciclo escolar en los filtros de arriba.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progressData) return null;

  const { status, totalDays, daysCompleted, daysRemaining, progressPercentage, startDate, endDate } = progressData;

  // Configuración de colores según el estado
  const statusConfig = {
    'not-started': {
      gradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-900 dark:text-blue-100',
      subtextColor: 'text-blue-700 dark:text-blue-300',
      progressColor: 'bg-blue-500',
      label: 'No iniciado',
      icon: Clock,
    },
    'in-progress': {
      gradient: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
      border: 'border-green-200 dark:border-green-800',
      iconBg: 'bg-green-100 dark:bg-green-900/50',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-900 dark:text-green-100',
      subtextColor: 'text-green-700 dark:text-green-300',
      progressColor: 'bg-green-500',
      label: 'En progreso',
      icon: TrendingUp,
    },
    'completed': {
      gradient: 'from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30',
      border: 'border-gray-200 dark:border-gray-800',
      iconBg: 'bg-gray-100 dark:bg-gray-900/50',
      iconColor: 'text-gray-600 dark:text-gray-400',
      textColor: 'text-gray-900 dark:text-gray-100',
      subtextColor: 'text-gray-700 dark:text-gray-300',
      progressColor: 'bg-gray-500',
      label: 'Finalizado',
      icon: Calendar,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={`bg-gradient-to-r ${config.gradient} ${config.border}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${config.iconColor}`} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-lg font-semibold ${config.textColor} truncate`}>
                    {cycle.name}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs font-medium ${config.iconBg} ${config.iconColor} rounded-full whitespace-nowrap`}>
                    {config.label}
                  </span>
                  {cycle.isActive && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full whitespace-nowrap">
                      Activo
                    </span>
                  )}
                </div>
                <p className={`text-sm ${config.subtextColor}`}>
                  {format(startDate, "d 'de' MMMM 'de' yyyy", { locale: es })} 
                  {' - '}
                  {format(endDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            {/* Progress bar personalizado */}
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/50 dark:bg-gray-800/50">
              <div
                className={cn("h-full transition-all duration-500 ease-in-out", config.progressColor)}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {/* Días completados */}
              <div className="text-center">
                <div className={`text-2xl font-bold ${config.textColor}`}>
                  {daysCompleted}
                </div>
                <div className={`text-xs ${config.subtextColor} mt-1`}>
                  Días completados
                </div>
              </div>

              {/* Porcentaje */}
              <div className="text-center">
                <div className={`text-2xl font-bold ${config.textColor}`}>
                  {progressPercentage.toFixed(1)}%
                </div>
                <div className={`text-xs ${config.subtextColor} mt-1`}>
                  Progreso total
                </div>
              </div>

              {/* Días restantes */}
              <div className="text-center">
                <div className={`text-2xl font-bold ${config.textColor}`}>
                  {daysRemaining}
                </div>
                <div className={`text-xs ${config.subtextColor} mt-1`}>
                  {daysRemaining === 1 ? 'Día restante' : 'Días restantes'}
                </div>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className={`text-xs ${config.subtextColor} pt-2 border-t ${config.border}`}>
            <span className="font-medium">Duración total:</span> {totalDays} días
            {status === 'in-progress' && (
              <span className="ml-4">
                <span className="font-medium">Hoy:</span> {format(new Date(), "d 'de' MMMM", { locale: es })}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CycleProgressCard;
