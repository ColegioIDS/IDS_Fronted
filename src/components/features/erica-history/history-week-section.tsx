// src/components/features/erica-history/history-week-section.tsx

'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EricaHistoryWeekData } from '@/types/erica-history';
import { formatDate } from '@/lib/date-utils';

interface HistoryWeekSectionProps {
  weekData: EricaHistoryWeekData;
}

const DIMENSION_COLORS: Record<string, string> = {
  EJECUTA: '#ef4444',
  RETIENE: '#3b82f6',
  INTERPRETA: '#a855f7',
  CONOCE: '#22c55e',
  AMPLIA: '#eab308',
};

const STATE_LABELS: Record<string, string> = {
  E: 'Excelente',
  B: 'Bueno',
  P: 'Por mejorar',
  C: 'En construcción',
  N: 'No evaluado',
};

export const HistoryWeekSection: React.FC<HistoryWeekSectionProps> = ({ weekData }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatStudentName = (givenNames: string, lastNames: string) => {
    return `${lastNames}, ${givenNames}`;
  };

  const getInitials = (givenNames: string, lastNames: string) => {
    return `${givenNames.charAt(0)}${lastNames.charAt(0)}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-base sm:text-lg">
                Semana {weekData.academicWeek.number}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {weekData.evaluations.length} evaluaciones
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium">{weekData.topic.title}</p>
              <span className="hidden sm:inline">•</span>
              <p>
                {formatDate(new Date(weekData.academicWeek.startDate))} -{' '}
                {formatDate(new Date(weekData.academicWeek.endDate))}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="overflow-x-auto -mx-1 px-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm min-w-[150px] sm:min-w-[200px]">
                    Estudiante
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[100px] text-center">
                    Dimensión
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[100px] text-center">
                    Estado
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[80px] text-center">
                    Puntos
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[150px] sm:min-w-[200px]">
                    Evaluado por
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[100px] text-center">
                    Fecha
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weekData.evaluations.map((evaluation, idx) => (
                  <TableRow key={evaluation.id} className={idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}>
                    <TableCell className="text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                            {getInitials(evaluation.student.givenNames, evaluation.student.lastNames)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {formatStudentName(evaluation.student.givenNames, evaluation.student.lastNames)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {evaluation.section.grade?.name} {evaluation.section.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        style={{
                          backgroundColor: DIMENSION_COLORS[evaluation.dimension],
                          color: 'white',
                          borderColor: DIMENSION_COLORS[evaluation.dimension],
                        }}
                        className="text-xs"
                      >
                        {evaluation.dimension.substring(0, 1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {STATE_LABELS[evaluation.state]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold text-xs sm:text-sm">
                      {evaluation.points.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <p className="truncate">
                        {evaluation.evaluatedBy.givenNames} {evaluation.evaluatedBy.lastNames}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs text-center text-gray-500">
                      {formatDate(new Date(evaluation.evaluatedAt))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Notas si existen */}
          {weekData.evaluations.some((e) => e.notes) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Notas:</p>
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                {weekData.evaluations
                  .filter((e) => e.notes)
                  .map((evaluation, idx) => (
                    <li key={idx} className="list-disc list-inside">
                      <strong>
                        {formatStudentName(evaluation.student.givenNames, evaluation.student.lastNames)}
                      </strong>
                      : {evaluation.notes}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
