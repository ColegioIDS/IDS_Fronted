// src/components/features/erica-history/history-evaluation-table.tsx

'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EricaHistoryEvaluation } from '@/types/erica-history';
import {
  DIMENSION_LABELS,
  STATE_LABELS,
  STATE_POINTS,
} from '@/types/erica-evaluations';

interface Week {
  academicWeek: {
    id: number;
    number: number;
    startDate?: string;
    endDate?: string;
  };
  topic?: {
    id: number;
    title: string;
  } | null;
  evaluations: EricaHistoryEvaluation[];
}

interface HistoryEvaluationTableProps {
  weeks: Week[];
  isLoading?: boolean;
}

interface StudentEvaluationRow {
  studentId: number;
  studentName: string;
  givenNames: string;
  lastNames: string;
  sectionName?: string;
  gradeName?: string;
  // Por cada semana, guardamos los evaluaciones agrupadas por dimensión
  weekEvaluations: {
    [weekId: number]: {
      EJECUTA?: EricaHistoryEvaluation;
      RETIENE?: EricaHistoryEvaluation;
      INTERPRETA?: EricaHistoryEvaluation;
      CONOCE?: EricaHistoryEvaluation;
      AMPLIA?: EricaHistoryEvaluation;
    };
  };
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

const getStudentInitials = (givenNames: string, lastNames: string): string => {
  return `${givenNames?.charAt(0) || ''}${lastNames?.charAt(0) || ''}`.toUpperCase();
};

const getDimensionShortCode = (dimension: string): string => {
  const codes: Record<string, string> = {
    EJECUTA: 'E',
    RETIENE: 'R',
    INTERPRETA: 'I',
    CONOCE: 'C',
    AMPLIA: 'A',
  };
  return codes[dimension] || '?';
};

const getDimensionColor = (dimension: string): string => {
  const colors: Record<string, string> = {
    EJECUTA: 'bg-blue-100',
    RETIENE: 'bg-purple-100',
    INTERPRETA: 'bg-green-100',
    CONOCE: 'bg-orange-100',
    AMPLIA: 'bg-pink-100',
  };
  return colors[dimension] || 'bg-gray-100';
};

export function HistoryEvaluationTable({ weeks, isLoading }: HistoryEvaluationTableProps) {
  // Agrupar evaluaciones por estudiante y semana
  const groupedData = useMemo(() => {
    const grouped: Record<number, StudentEvaluationRow> = {};

    // Procesar cada semana
    weeks.forEach((week) => {
      week.evaluations.forEach((evaluation) => {
        const studentId = evaluation.student.id;
        
        if (!grouped[studentId]) {
          grouped[studentId] = {
            studentId: studentId,
            studentName: `${evaluation.student.lastNames}, ${evaluation.student.givenNames}`,
            givenNames: evaluation.student.givenNames,
            lastNames: evaluation.student.lastNames,
            sectionName: evaluation.section?.name,
            gradeName: evaluation.section?.grade?.name,
            weekEvaluations: {},
          };
        }

        // Inicializar weekEvaluations para esta semana si no existe
        if (!grouped[studentId].weekEvaluations[week.academicWeek.id]) {
          grouped[studentId].weekEvaluations[week.academicWeek.id] = {};
        }

        // Agregar evaluación por dimensión
        grouped[studentId].weekEvaluations[week.academicWeek.id][
          evaluation.dimension as keyof StudentEvaluationRow['weekEvaluations'][number]
        ] = evaluation;
      });
    });

    return Object.values(grouped);
  }, [weeks]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            Cargando evaluaciones...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weeks || weeks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            No hay semanas disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular total de evaluaciones
  const totalEvaluations = weeks.reduce((sum, w) => sum + w.evaluations.length, 0);

  // Agrupar semanas en pares para agregar columnas ERICA cada 2
  const weekPairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < weeks.length; i += 2) {
      pairs.push({
        weeks: [weeks[i], weeks[i + 1]].filter(Boolean),
        pairIndex: Math.floor(i / 2),
      });
    }
    return pairs;
  }, [weeks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Evaluaciones por Estudiante ({totalEvaluations} registros)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="relative">
            <TableHeader>
              {/* Fila 1: Nombre estudiante y encabezados de semanas + PROMEDIO QNA cada 2 */}
              <TableRow className="bg-gray-100">
                <TableHead rowSpan={2} className="sticky left-0 z-20 font-semibold text-gray-800 min-w-[250px] py-2 text-center align-middle bg-gray-100 border-r-2 border-gray-400">
                  Nombre del estudiante
                </TableHead>
                
                {/* Encabezados de semanas y PROMEDIO QNA cada 2 semanas */}
                {weekPairs.map((pair, pairIndex) => (
                  <React.Fragment key={`pair-${pair.pairIndex}`}>
                    {/* Semanas del par */}
                    {pair.weeks.map((week, weekIndex) => (
                      <TableHead 
                        key={`week-header-${week.academicWeek.id}`}
                        colSpan={6} 
                        className={`text-center font-semibold text-gray-800 py-2 border-r-2 border-gray-400`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm">
                            Semana {week.academicWeek.number} - {week.topic?.title || 'Sin tema'}
                          </span>
                          {week.academicWeek.startDate && week.academicWeek.endDate && (
                            <span className="text-xs text-gray-600">
                              {new Date(week.academicWeek.startDate).toLocaleDateString()} - {new Date(week.academicWeek.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    {/* PROMEDIO QNA después del par (Bloque) */}
                    <TableHead 
                      colSpan={5}
                      className="text-center font-bold text-blue-700 bg-blue-50 py-2 border-r-2 border-gray-400"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm">PROMEDIO QNA {pair.pairIndex + 1}</span>
                        {pair.weeks.length > 0 && pair.weeks[0].academicWeek.startDate && pair.weeks[pair.weeks.length - 1].academicWeek.endDate && (
                          <span className="text-xs text-blue-600">
                            {new Date(pair.weeks[0].academicWeek.startDate || '').toLocaleDateString()} - {new Date(pair.weeks[pair.weeks.length - 1].academicWeek.endDate || '').toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  </React.Fragment>
                ))}
              </TableRow>

              {/* Fila 2: Solo encabezados de dimensiones */}
              <TableRow className="bg-gray-50">
                {weekPairs.map((pair, pairIndex) => (
                  <React.Fragment key={`dims-pair-${pair.pairIndex}`}>
                    {/* Dimensiones para cada semana del par */}
                    {pair.weeks.map((week, weekIndex) => (
                      <React.Fragment key={`dimensions-${week.academicWeek.id}`}>
                        {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'AMPLIA'] as const).map((dimension) => (
                          <TableHead 
                            key={`${week.academicWeek.id}-${dimension}`}
                            className="font-semibold text-gray-700 text-center min-w-[60px] py-2"
                          >
                            <span className="text-xs font-bold">{getDimensionShortCode(dimension)}</span>
                          </TableHead>
                        ))}
                        <TableHead 
                          key={`${week.academicWeek.id}-total`}
                          className={`font-semibold text-gray-700 text-center min-w-[60px] py-2 border-r-2 border-gray-400`}
                        >
                          <span className="text-xs font-semibold">Tot</span>
                        </TableHead>
                      </React.Fragment>
                    ))}
                    {/* Dimensiones ERICA */}
                    {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'AMPLIA'] as const).map((dimension) => (
                      <TableHead 
                        key={`erica-${pair.pairIndex}-${dimension}`}
                        className="font-semibold text-blue-700 text-center min-w-[60px] py-2 bg-blue-50"
                      >
                        <span className="text-xs font-bold">{getDimensionShortCode(dimension)}</span>
                      </TableHead>
                    ))}
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {groupedData.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-gray-50">
                  {/* Estudiante */}
                  <TableCell className="sticky left-0 z-10 font-medium bg-white border-r-2 border-gray-400">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                          {getStudentInitials(row.givenNames, row.lastNames)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">
                          {row.studentName}
                        </span>
                        {(row.sectionName || row.gradeName) && (
                          <span className="text-xs text-gray-500">
                            {row.sectionName && `Sección ${row.sectionName}`}
                            {row.sectionName && row.gradeName && ' - '}
                            {row.gradeName}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Dimensiones por par de semanas + PROMEDIO QNA */}
                  {weekPairs.map((pair) => {
                    // Calcular totales PROMEDIO QNA (promedio de las 2 semanas del par)
                    const promedioQnaTotals: Record<string, number> = {};
                    const dimensionCounts: Record<string, number> = {};
                    (['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'AMPLIA'] as const).forEach((dimension) => {
                      let total = 0;
                      let count = 0;
                      pair.weeks.forEach((week) => {
                        const weekEvals = row.weekEvaluations[week.academicWeek.id] || {};
                        const eval_ = weekEvals[dimension];
                        if (eval_) {
                          total += eval_.points;
                          count++;
                        }
                      });
                      promedioQnaTotals[dimension] = count > 0 ? total / count : 0;
                      dimensionCounts[dimension] = count;
                    });

                    return (
                      <React.Fragment key={`pair-row-${pair.pairIndex}-${row.studentId}`}>
                        {/* Datos de las semanas del par */}
                        {pair.weeks.map((week, weekIndex) => {
                          const weekEvals = row.weekEvaluations[week.academicWeek.id] || {};
                          return (
                            <React.Fragment key={`row-week-${week.academicWeek.id}-${row.studentId}`}>
                              {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'AMPLIA'] as const).map((dimension) => {
                                const evaluation = weekEvals[dimension];
                                return (
                                  <TableCell key={`${week.academicWeek.id}-${dimension}-${row.studentId}`} className="text-center text-xs p-1">
                                    {evaluation ? (
                                      <div className={`p-1 rounded ${getStateBgColor(evaluation.state)}`}>
                                        <Badge className={`text-xs font-bold ${getStateColor(evaluation.state)}`}>
                                          {evaluation.state}
                                        </Badge>
                                        <div className="text-xs text-gray-600 mt-0.5">
                                          {evaluation.points.toFixed(2)}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-gray-400 text-sm">—</div>
                                    )}
                                  </TableCell>
                                );
                              })}
                              
                              {/* Total para esta semana */}
                              <TableCell key={`${week.academicWeek.id}-total-${row.studentId}`} className={`text-center font-semibold text-xs p-1 border-r-2 border-gray-400`}>
                                {(() => {
                                  const total = (['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'AMPLIA'] as const).reduce((sum, dimension) => {
                                    const dimEval = weekEvals[dimension];
                                    return sum + (dimEval?.points || 0);
                                  }, 0);
                                  return total > 0 ? `${total.toFixed(2)}` : '—';
                                })()}
                              </TableCell>
                            </React.Fragment>
                          );
                        })}

                        {/* Columnas PROMEDIO QNA (promedio del par) */}
                        {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'AMPLIA'] as const).map((dimension) => (
                          <TableCell 
                            key={`promedioqna-${pair.pairIndex}-${dimension}-${row.studentId}`}
                            className="text-center text-xs p-1 bg-blue-50 font-semibold"
                          >
                            {dimensionCounts[dimension] > 0 ? `${promedioQnaTotals[dimension].toFixed(2)}` : '—'}
                          </TableCell>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
