// src/components/features/erica-history/bimestre-complete-view.tsx

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BimesterCompleteResponse, BimesterWeek } from '@/types/erica-history';
import { Calendar, BookOpen } from 'lucide-react';
import { STATE_POINTS } from '@/types/erica-evaluations';

interface BimesterCompleteViewProps {
  data: BimesterCompleteResponse;
  isLoading?: boolean;
}

const getStateColor = (state?: string): string => {
  if (!state) return 'bg-gray-100 text-gray-600';
  const colors: Record<string, string> = {
    E: 'bg-green-100 text-green-800',
    B: 'bg-blue-100 text-blue-800',
    P: 'bg-yellow-100 text-yellow-800',
    C: 'bg-orange-100 text-orange-800',
    N: 'bg-red-100 text-red-800',
  };
  return colors[state] || 'bg-gray-100 text-gray-600';
};

const getStateBgColor = (state?: string): string => {
  if (!state) return 'bg-gray-50';
  const colors: Record<string, string> = {
    E: 'bg-green-50',
    B: 'bg-blue-50',
    P: 'bg-yellow-50',
    C: 'bg-orange-50',
    N: 'bg-red-50',
  };
  return colors[state] || 'bg-gray-50';
};

export function BimesterCompleteView({ data, isLoading }: BimesterCompleteViewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            Cargando bimestre...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            No hay datos disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-600 mb-1">Total Semanas</p>
            <p className="text-2xl font-bold text-blue-900">{data.summary.totalWeeks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-600 mb-1">Con Tema</p>
            <p className="text-2xl font-bold text-green-900">{data.summary.weeksWithTopic}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-600 mb-1">Sin Tema</p>
            <p className="text-2xl font-bold text-orange-900">{data.summary.weeksWithoutTopic}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-600 mb-1">Total Evaluaciones</p>
            <p className="text-2xl font-bold text-purple-900">{data.summary.totalEvaluations}</p>
          </CardContent>
        </Card>
      </div>

      {/* Semanas */}
      <Tabs defaultValue={`week-1`} className="w-full">
        <TabsList className="w-full overflow-x-auto grid grid-cols-auto gap-1">
          {data.weeks.map((week) => (
            <TabsTrigger key={`week-${week.weekNumber}`} value={`week-${week.weekNumber}`} className="text-xs">
              Semana {week.weekNumber}
            </TabsTrigger>
          ))}
        </TabsList>

        {data.weeks.map((week) => (
          <TabsContent key={`week-${week.weekNumber}`} value={`week-${week.weekNumber}`} className="space-y-4">
            <WeekCard week={week} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function WeekCard({ week }: { week: BimesterWeek }) {
  const hasEvaluations = Object.values(week.evaluations).some(arr => arr.length > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Semana {week.weekNumber}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(week.startDate).toLocaleDateString('es-ES')} - {new Date(week.endDate).toLocaleDateString('es-ES')}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {week.weekType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tema */}
        {week.topic ? (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {week.topic.weekTheme}
                </h4>
                {week.topic.course && (
                  <p className="text-sm text-blue-800 mt-2">
                    <span className="font-medium">{week.topic.course.name}</span>
                    {week.topic.course.code && ` (${week.topic.course.code})`}
                  </p>
                )}
                {week.topic.teacher && (
                  <p className="text-sm text-blue-700 mt-1">
                    Docente: {week.topic.teacher.givenNames} {week.topic.teacher.lastNames}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-600 text-sm">Sin tema asignado</p>
          </div>
        )}

        {/* Evaluaciones por dimensión */}
        {hasEvaluations ? (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Evaluaciones por Dimensión</h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'AMPLIA'] as const).map((dimension) => {
                const evaluations = week.evaluations[dimension] || [];
                return (
                  <Card key={dimension}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{dimension}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {evaluations.length > 0 ? (
                        evaluations.map((evaluation) => (
                          <div
                            key={evaluation.id}
                            className={`p-2 rounded text-xs ${getStateBgColor(evaluation.state)}`}
                          >
                            <p className="font-medium">{evaluation.studentName}</p>
                            <Badge className={`text-xs font-bold mt-1 ${getStateColor(evaluation.state)}`}>
                              {evaluation.state}
                            </Badge>
                            <p className="text-xs text-gray-600 mt-1">
                              {(STATE_POINTS[evaluation.state as keyof typeof STATE_POINTS] ?? 0).toFixed(2)} pts
                            </p>
                            {evaluation.notes && (
                              <p className="text-xs italic text-gray-600 mt-1">{evaluation.notes}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-xs text-center py-4">—</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-600 text-sm">Sin evaluaciones registradas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
