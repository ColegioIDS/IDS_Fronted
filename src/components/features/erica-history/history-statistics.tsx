// src/components/features/erica-history/history-statistics.tsx

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, BookOpen, TrendingUp } from 'lucide-react';
import { EricaHistoryStats } from '@/types/erica-history';

interface HistoryStatisticsProps {
  stats: EricaHistoryStats;
}

const DIMENSION_COLORS: Record<string, { bg: string; text: string }> = {
  EJECUTA: { bg: 'bg-red-100', text: 'text-red-700' },
  RETIENE: { bg: 'bg-blue-100', text: 'text-blue-700' },
  INTERPRETA: { bg: 'bg-purple-100', text: 'text-purple-700' },
  CONOCE: { bg: 'bg-green-100', text: 'text-green-700' },
  APLICA: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
};

const STATE_LABELS: Record<string, string> = {
  E: 'Excelente',
  B: 'Bueno',
  P: 'Por mejorar',
  C: 'En construcción',
  N: 'No evaluado',
};

export const HistoryStatistics: React.FC<HistoryStatisticsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Evaluaciones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            Total Evaluaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalEvaluations}
          </div>
        </CardContent>
      </Card>

      {/* Total Estudiantes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            Total Estudiantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalStudents}
          </div>
        </CardContent>
      </Card>

      {/* Total Semanas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-600" />
            Total Semanas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalWeeks}
          </div>
        </CardContent>
      </Card>

      {/* Promedio Puntos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            Promedio Puntos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.averagePoints.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      {/* Distribución por Dimensión */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Por Dimensión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.byDimension).map(([dimension, count]) => (
              <div key={dimension} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{dimension}</span>
                <Badge className={`${DIMENSION_COLORS[dimension].bg} ${DIMENSION_COLORS[dimension].text}`}>
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribución por Estado */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.byState).map(([state, count]) => (
              <div key={state} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {STATE_LABELS[state]}
                </span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
