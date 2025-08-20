// components/academic-weeks/week-stats.tsx
"use client";

import React, { useMemo } from 'react';
import {
  Calendar,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Activity,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAcademicWeekContext } from '@/context/AcademicWeeksContext';
import { useBimesterContext } from '@/context/newBimesterContext';
import { 
  parseUTCAsLocal, 
  calculateWeekProgress, 
  calculateDaysRemaining 
} from '@/utils/date-helpers';

interface WeekStatsProps {
  isLoading?: boolean;
}

export function WeekStats({ isLoading = false }: WeekStatsProps) {
  const { weeks, currentWeek } = useAcademicWeekContext();
  const { bimesters } = useBimesterContext();

  // Calcular todas las estadísticas usando los contextos
  const stats = useMemo(() => {
    const now = new Date();

    // Clasificar semanas por estado usando las funciones utilitarias
    const classifiedWeeks = weeks.map(week => {
      const startDate = parseUTCAsLocal(week.startDate);
      const endDate = parseUTCAsLocal(week.endDate);
      const isActive = startDate <= now && now <= endDate;

      return {
        ...week,
        parsedStartDate: startDate,
        parsedEndDate: endDate,
        isActive,
        isCompleted: endDate < now,
        isUpcoming: startDate > now
      };
    });

    const completedWeeks = classifiedWeeks.filter(w => w.isCompleted);
    const upcomingWeeks = classifiedWeeks.filter(w => w.isUpcoming);
    const activeWeek = classifiedWeeks.find(w => w.isActive);

    // Calcular progreso de semana actual usando funciones utilitarias
    let currentWeekProgress = 0;
    let daysRemainingInCurrentWeek = 0;

    if (activeWeek || currentWeek) {
      const week = activeWeek || currentWeek;
      if (week) {
        const startDate = parseUTCAsLocal(week.startDate || '');
        const endDate = parseUTCAsLocal(week.endDate || '');

        if (startDate <= now && now <= endDate) {
          currentWeekProgress = calculateWeekProgress(startDate, endDate);
          daysRemainingInCurrentWeek = calculateDaysRemaining(endDate);
        }
      }
    }

    // Encontrar bimestre activo
    const activeBimester = bimesters.find(b => b.isActive);
    let weeksThisBimester = 0;
    let completedThisBimester = 0;
    let weeksRemainingInBimester = 0;

    if (activeBimester) {
      const bimesterWeeks = classifiedWeeks.filter(w => w.bimesterId === activeBimester.id);
      weeksThisBimester = bimesterWeeks.length;
      completedThisBimester = bimesterWeeks.filter(w => w.isCompleted).length;
      weeksRemainingInBimester = bimesterWeeks.filter(w => w.isUpcoming).length;
    }

    // Calcular métricas de objetivos
    const weeksWithObjectives = weeks.filter(w =>
      w.objectives && w.objectives.trim().length > 0
    ).length;

    const objectivesPercentage = weeks.length > 0 ?
      Math.round((weeksWithObjectives / weeks.length) * 100) : 0;

    // Calcular eficiencia del bimestre
    const bimesterCompletionRate = weeksThisBimester > 0 ?
      Math.round((completedThisBimester / weeksThisBimester) * 100) : 0;

    return {
      totalWeeks: weeks.length,
      completedWeeks: completedWeeks.length,
      upcomingWeeks: upcomingWeeks.length,
      hasActiveWeek: !!(activeWeek || currentWeek),
      currentWeekProgress,
      daysRemainingInCurrentWeek,
      weeksThisBimester,
      completedThisBimester,
      weeksRemainingInBimester,
      activeBimesterName: activeBimester?.name,
      objectivesPercentage,
      weeksWithObjectives,
      bimesterCompletionRate,
      activeBimesters: bimesters.filter(b => b.isActive).length,
      currentWeekNumber: (activeWeek || currentWeek)?.number
    };
  }, [weeks, currentWeek, bimesters]);

  const statCards = [
    // Card principal - Semana actual
    {
      title: stats.hasActiveWeek ? 'Semana en Curso' : 'Sin Semana Activa',
      subtitle: stats.hasActiveWeek ? `Semana ${stats.currentWeekNumber || ''} - Progreso actual` : 'No hay semana en progreso',
      value: stats.hasActiveWeek ? `${stats.currentWeekProgress}%` : '0',
      description: stats.hasActiveWeek ?
        `${stats.daysRemainingInCurrentWeek} días restantes` : 'semanas disponibles',
      icon: stats.hasActiveWeek ? Activity : Clock,
      color: stats.hasActiveWeek ? 'emerald' : 'slate',
      showProgress: stats.hasActiveWeek,
      progressValue: stats.currentWeekProgress,
      trend: stats.hasActiveWeek && stats.currentWeekProgress > 50 ? 'En progreso' :
        stats.hasActiveWeek ? 'Iniciando' : null,
      isMain: true
    },
    // Progreso del bimestre actual
    {
      title: 'Bimestre Actual',
      subtitle: stats.activeBimesterName || 'Sin bimestre activo',
      value: `${stats.completedThisBimester}/${stats.weeksThisBimester}`,
      description: 'semanas completadas',
      icon: BookOpen,
      color: 'blue',
      showProgress: stats.weeksThisBimester > 0,
      progressValue: stats.weeksThisBimester > 0 ?
        Math.round((stats.completedThisBimester / stats.weeksThisBimester) * 100) : 0,
      trend: stats.weeksRemainingInBimester > 0 ?
        `${stats.weeksRemainingInBimester} pendientes` :
        stats.weeksThisBimester > 0 ? 'Completado' : null
    },
    // Semanas completadas totales
    {
      title: 'Completadas',
      subtitle: 'Total del ciclo académico',
      value: stats.completedWeeks,
      description: 'semanas finalizadas',
      icon: CheckCircle,
      color: 'green',
      showProgress: false,
      progressValue: 0,
      trend: stats.totalWeeks > 0 ?
        `${Math.round((stats.completedWeeks / stats.totalWeeks) * 100)}% del total` : null
    },
    // Objetivos definidos
    {
      title: 'Con Objetivos',
      subtitle: 'Semanas con metas definidas',
      value: `${stats.weeksWithObjectives}/${stats.totalWeeks}`,
      description: `${stats.objectivesPercentage}% del total`,
      icon: Target,
      color: 'purple',
      showProgress: true,
      progressValue: stats.objectivesPercentage,
      trend: stats.objectivesPercentage >= 80 ? 'Excelente' :
        stats.objectivesPercentage >= 60 ? 'Bueno' :
          stats.objectivesPercentage >= 40 ? 'Regular' : 'Mejorar'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      emerald: {
        icon: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        text: 'text-emerald-700 dark:text-emerald-300',
        value: 'text-emerald-900 dark:text-emerald-100',
        gradient: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-950/5'
      },
      blue: {
        icon: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-300',
        value: 'text-blue-900 dark:text-blue-100',
        gradient: 'from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-950/5'
      },
      green: {
        icon: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-950/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-700 dark:text-green-300',
        value: 'text-green-900 dark:text-green-100',
        gradient: 'from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-950/5'
      },
      purple: {
        icon: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-700 dark:text-purple-300',
        value: 'text-purple-900 dark:text-purple-100',
        gradient: 'from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-950/5'
      },
      slate: {
        icon: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-950/20',
        border: 'border-slate-200 dark:border-slate-800',
        text: 'text-slate-700 dark:text-slate-300',
        value: 'text-slate-900 dark:text-slate-100',
        gradient: 'from-slate-50 to-slate-100/50 dark:from-slate-950/20 dark:to-slate-950/5'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTrendBadgeColor = (trend: string | null) => {
    if (!trend) return '';

    if (trend.includes('%') || trend.includes('progreso') || trend === 'Excelente' || trend === 'Completado') {
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
    }

    switch (trend) {
      case 'Bueno':
      case 'Normal':
      case 'Iniciando':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
      case 'Regular':
      case 'Alta carga':
      case 'pendientes':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
      case 'Mejorar':
      case 'Inicial':
      case 'Sin programar':
        return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400';
      case 'Pocas':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse border-0 shadow-md">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                  <div className="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const colors = getColorClasses(stat.color);

        return (
          <Card
            key={index}
            className={cn(
              "group hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 transition-all duration-300 hover:-translate-y-1 border-0 shadow-md overflow-hidden",
              `bg-gradient-to-br ${colors.gradient}`,
              stat.isMain && "sm:col-span-2 lg:col-span-1"
            )}
          >
            <CardContent className="p-6 relative">
              {/* Elemento decorativo de fondo */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/20 dark:bg-white/5 -translate-y-8 translate-x-8" />

              <div className="space-y-4 relative">
                {/* Header con ícono y badge */}
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl shadow-sm border border-white/50 dark:border-border/50",
                    colors.bg
                  )}>
                    <stat.icon className={cn("h-6 w-6", colors.icon)} />
                  </div>

                  {stat.trend && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs font-medium px-2 py-1 border-0",
                        getTrendBadgeColor(stat.trend)
                      )}
                    >
                      {stat.trend}
                    </Badge>
                  )}
                </div>

                {/* Contenido principal */}
                <div className="space-y-2">
                  <div>
                    <h3 className={cn("text-sm font-semibold", colors.text)}>
                      {stat.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {stat.subtitle}
                    </p>
                  </div>

                  <div>
                    <p className={cn("text-3xl font-bold tracking-tight", colors.value)}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {stat.description}
                    </p>
                  </div>
                </div>

                {/* Barra de progreso */}
                {stat.showProgress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={cn("font-medium", colors.text)}>Progreso</span>
                      <span className={cn("font-semibold", colors.value)}>
                        {stat.progressValue}%
                      </span>
                    </div>
                    <Progress
                      value={stat.progressValue}
                      className="h-2 bg-white/40 dark:bg-background/40"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}