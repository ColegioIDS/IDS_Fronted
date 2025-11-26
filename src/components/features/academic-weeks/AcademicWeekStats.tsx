// src/components/features/academic-weeks/AcademicWeekStats.tsx

'use client';

import React from 'react';
import { Calendar, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AcademicWeek, WeekType } from '@/types/academic-week.types';
import { getWeekTypeTheme } from '@/config/theme.config';

interface AcademicWeekStatsProps {
  data: AcademicWeek[];
  isLoading: boolean;
}

/**
 * 📊 Componente de estadísticas para Academic Weeks
 * 
 * Muestra:
 * - Total de semanas
 * - Semanas por tipo (REGULAR, EVALUATION, REVIEW)
 * - Semanas activas
 */
export function AcademicWeekStats({ data, isLoading }: AcademicWeekStatsProps) {
  // Calcular estadísticas
  const stats = React.useMemo(() => {
    const total = data.length;
    const active = data.filter((w) => w.isActive).length;
    const regular = data.filter((w) => w.weekType === WeekType.REGULAR).length;
    const evaluation = data.filter((w) => w.weekType === WeekType.EVALUATION).length;
    const review = data.filter((w) => w.weekType === WeekType.REVIEW).length;

    return { total, active, regular, evaluation, review };
  }, [data]);

  const regularTheme = getWeekTypeTheme('REGULAR');
  const evaluationTheme = getWeekTypeTheme('EVALUATION');
  const reviewTheme = getWeekTypeTheme('REVIEW');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      label: 'Total de Semanas',
      value: stats.total,
      subtext: 'Semanas registradas',
      icon: Calendar,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
    },
    {
      label: 'Semanas Regulares',
      value: stats.regular,
      subtext: 'Clases normales',
      icon: BookOpen,
      iconColor: regularTheme.icon.replace('text-', ''),
      iconBg: regularTheme.bg,
      borderColor: regularTheme.border,
    },
    {
      label: 'Evaluaciones',
      value: stats.evaluation,
      subtext: 'Semanas de exámenes',
      icon: AlertCircle,
      iconColor: evaluationTheme.icon.replace('text-', ''),
      iconBg: evaluationTheme.bg,
      borderColor: evaluationTheme.border,
    },
    {
      label: 'Repaso',
      value: stats.review,
      subtext: 'Semanas de refuerzo',
      icon: CheckCircle,
      iconColor: reviewTheme.icon.replace('text-', ''),
      iconBg: reviewTheme.bg,
      borderColor: reviewTheme.border,
    },
    {
      label: 'Semanas Activas',
      value: stats.active,
      subtext: `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% del total`,
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/50',
      borderColor: 'border-green-200 dark:border-green-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card
            key={index}
            className={`border ${stat.borderColor} hover:shadow-lg transition-shadow duration-200`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-full ${stat.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {stat.subtext}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default AcademicWeekStats;
