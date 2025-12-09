// src/components/features/erica-evaluations/evaluation-grid/grid-stats-v2.tsx
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Target,
} from 'lucide-react';

interface GridStatsV2Props {
  totalStudents: number;
  fullyEvaluated: number;
  studentsWithAnyEvaluation: number;
  completionRate: number;
  averagePoints: number;
  headerAction?: React.ReactNode; // Toggle o acción adicional para el header
}

export default function GridStatsV2({
  totalStudents,
  fullyEvaluated,
  studentsWithAnyEvaluation,
  completionRate,
  averagePoints,
  headerAction,
}: GridStatsV2Props) {
  
  const pendingStudents = totalStudents - studentsWithAnyEvaluation;
  const inProgressStudents = studentsWithAnyEvaluation - fullyEvaluated;
  
  // Determinar color del progreso basado en porcentaje
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Determinar color del promedio basado en puntos
  const getAverageColor = (avg: number) => {
    if (avg >= 0.8) return 'text-green-600';
    if (avg >= 0.6) return 'text-blue-600';
    if (avg >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const stats = [
    {
      label: 'Total Estudiantes',
      value: totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Completados',
      value: fullyEvaluated,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      subtext: `${Math.round((fullyEvaluated / totalStudents) * 100)}%`,
    },
    {
      label: 'En Progreso',
      value: inProgressStudents,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'Pendientes',
      value: pendingStudents,
      icon: Target,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {/* Stats individuales */}
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                  {stat.subtext && (
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      ({stat.subtext})
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Promedio general */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${getAverageColor(averagePoints)}`}>
                {averagePoints.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">Promedio General</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barra de progreso general (ocupa todo el ancho) */}
      <Card className="col-span-2 md:col-span-5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progreso de Evaluación
            </span>
            <div className="flex items-center gap-4">
              {headerAction && (
                <div>
                  {headerAction}
                </div>
              )}
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {Math.round(completionRate)}%
              </span>
            </div>
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`absolute left-0 top-0 h-full ${getProgressColor(completionRate)} transition-all duration-500`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{fullyEvaluated} de {totalStudents} estudiantes completados</span>
            <span>{5 - Math.floor(completionRate / 20)} dimensiones pendientes en promedio</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
