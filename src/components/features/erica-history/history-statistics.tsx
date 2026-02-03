// src/components/features/erica-history/history-statistics.tsx

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, BookOpen } from 'lucide-react';
import { EricaHistorySummary } from '@/types/erica-history';

interface HistoryStatisticsProps {
  stats: EricaHistorySummary;
}

export const HistoryStatistics: React.FC<HistoryStatisticsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </div>
  );
};
