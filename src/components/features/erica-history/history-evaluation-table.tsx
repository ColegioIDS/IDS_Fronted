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
import { useEricaColors } from '@/hooks/useEricaColors';
import { getPerformanceLevelColor, getPerformanceLevelLabel } from '@/constants/performance-levels';

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
      APLICA?: EricaHistoryEvaluation;
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
    APLICA: 'A',
  };
  return codes[dimension] || '?';
};

const getDimensionColor = (dimension: string): string => {
  const colors: Record<string, string> = {
    EJECUTA: 'bg-blue-100',
    RETIENE: 'bg-purple-100',
    INTERPRETA: 'bg-green-100',
    CONOCE: 'bg-orange-100',
    APLICA: 'bg-pink-100',
  };
  return colors[dimension] || 'bg-gray-100';
};

export function HistoryEvaluationTable({ weeks, isLoading }: HistoryEvaluationTableProps) {
  const { getStateColor: getStateHexColor, getDimensionColor: getDimensionHexColor, getState, colors, loading: colorsLoading } = useEricaColors();

  // Función para obtener estilos dinámicos de estado usando hexColor
  const getStateStyles = (state?: string): React.CSSProperties => {
    if (!state) return { backgroundColor: 'rgba(243, 244, 246, 0.2)' };
    const stateInfo = getState(state as any);
    if (stateInfo?.hexColor) {
      // Convertir hex a RGB con opacidad del 20% (0.2)
      const hex = stateInfo.hexColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
      };
    }
    return { backgroundColor: 'rgba(243, 244, 246, 0.2)' };
  };

  // Función para obtener color de dimensión en hex
  const getDimensionHexColorValue = (dimension: string): string => {
    const dimensionCode = dimension.slice(0, 1).toUpperCase();
    return getDimensionHexColor(dimensionCode as any);
  };

  // Agrupar evaluaciones por estudiante y semana
  const groupedData = useMemo(() => {
    const grouped: Record<number, StudentEvaluationRow> = {};

    // Procesar cada semana
    weeks.forEach((week) => {
      week.evaluations.forEach((evaluation) => {
        const studentId = evaluation.studentId;
        
        if (!grouped[studentId]) {
          // Dividir el nombre para obtener givenNames y lastNames
          const nameParts = evaluation.studentName.split(',').map(part => part.trim());
          const lastNames = nameParts[0] || '';
          const givenNames = nameParts[1] || '';
          
          grouped[studentId] = {
            studentId: studentId,
            studentName: evaluation.studentName,
            givenNames: givenNames,
            lastNames: lastNames,
            sectionName: undefined,
            gradeName: undefined,
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

  // Agrupar semanas en grupos de 4 para PROMEDIO MES
  const monthGroups = useMemo(() => {
    const groups = [];
    for (let i = 0; i < weeks.length; i += 4) {
      const groupWeeks = [weeks[i], weeks[i + 1], weeks[i + 2], weeks[i + 3]].filter(Boolean);
      if (groupWeeks.length > 0) {
        groups.push({
          weeks: groupWeeks,
          monthIndex: Math.floor(i / 4),
        });
      }
    }
    return groups;
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
            <TableHeader className="border-b-4 border-gray-400">
              {/* Fila 1: Nombre estudiante y encabezados de semanas + PROMEDIO QNA cada 2 + PROMEDIO MENSUAL junto a QNA2 */}
              <TableRow className="bg-gray-100">
                <TableHead rowSpan={2} className="sticky left-0 z-20 font-semibold text-gray-800 min-w-[250px] py-2 text-center align-middle bg-gray-100 border-r-2 border-gray-400">
                  Nombre del estudiante
                </TableHead>
                
                {/* Encabezados por grupos de 4 semanas (mes) */}
                {monthGroups.map((group, groupIdx) => (
                  <React.Fragment key={`month-group-header-${group.monthIndex}`}>
                    {/* Pares de semanas dentro del mes y sus QNA */}
                    {group.weeks.length >= 2 && (
                      <>
                        {/* Par 1: Semanas 1-2 y QNA 1 */}
                        {group.weeks.slice(0, 2).map((week) => (
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
                        
                        <TableHead 
                          colSpan={5}
                          className="text-center font-bold text-blue-700 bg-blue-50 py-2 border-r-2 border-gray-400"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm">PROMEDIO QNA {group.monthIndex * 2 + 1}</span>
                            {group.weeks[0].academicWeek.startDate && group.weeks[1].academicWeek.endDate && (
                              <span className="text-xs text-blue-600">
                                {new Date(group.weeks[0].academicWeek.startDate || '').toLocaleDateString()} - {new Date(group.weeks[1].academicWeek.endDate || '').toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </TableHead>
                      </>
                    )}
                    
                    {/* Par 2: Semanas 3-4 y QNA 2 + PROMEDIO MENSUAL */}
                    {group.weeks.length >= 4 && (
                      <>
                        {group.weeks.slice(2, 4).map((week) => (
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
                        
                        <TableHead 
                          colSpan={5}
                          className="text-center font-bold text-blue-700 bg-blue-50 py-2 border-r-2 border-gray-400"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm">PROMEDIO QNA {group.monthIndex * 2 + 2}</span>
                            {group.weeks[2].academicWeek.startDate && group.weeks[3].academicWeek.endDate && (
                              <span className="text-xs text-blue-600">
                                {new Date(group.weeks[2].academicWeek.startDate || '').toLocaleDateString()} - {new Date(group.weeks[3].academicWeek.endDate || '').toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </TableHead>
                      </>
                    )}
                  </React.Fragment>
                ))}
                
                {/* Semanas restantes que no encajan en grupos de 4 (solo si hay más de 4 semanas) */}
                {weeks.length > 4 && weeks.length % 4 !== 0 && (() => {
                  const remainingStartIndex = Math.floor(weeks.length / 4) * 4;
                  const remainingWeeks = weeks.slice(remainingStartIndex);
                  return remainingWeeks.map((week) => (
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
                  ));
                })()}
                
                {/* Header vacío para TOTAL en fila 1 */}
                <TableHead 
                  rowSpan={2}
                  className="text-center font-bold text-green-700 bg-green-50 py-2 px-4 border-l-2 border-r-2 border-gray-400 min-w-[80px]"
                >
                  <span className="text-sm">TOTAL</span>
                </TableHead>
              </TableRow>

              {/* Fila 2: Encabezados de dimensiones */}
              <TableRow className="bg-gray-50">
                {monthGroups.map((group) => (
                  <React.Fragment key={`dims-month-group-${group.monthIndex}`}>
                    {/* Dimensiones para semanas 1-2 y QNA 1 */}
                    {group.weeks.length >= 2 && (
                      <>
                        {group.weeks.slice(0, 2).map((week) => (
                          <React.Fragment key={`dimensions-${week.academicWeek.id}`}>
                            {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).map((dimension) => (
                              <TableHead 
                                key={`${week.academicWeek.id}-${dimension}`}
                                className="font-semibold text-center min-w-[60px] py-2 text-white"
                                style={{
                                  backgroundColor: getDimensionHexColorValue(dimension),
                                  color: '#ffffff',
                                }}
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
                        
                        {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).map((dimension, dimIdx) => (
                          <TableHead 
                            key={`qna1-${group.monthIndex}-${dimension}`}
                            className={`font-semibold text-blue-700 text-center min-w-[60px] py-2 bg-blue-50 ${dimIdx === 4 ? 'border-r-2 border-gray-400' : ''}`}
                          >
                            <span className="text-xs font-bold">{getDimensionShortCode(dimension)}</span>
                          </TableHead>
                        ))}
                      </>
                    )}
                    
                    {/* Dimensiones para semanas 3-4, QNA 2 y PROMEDIO MENSUAL */}
                    {group.weeks.length >= 4 && (
                      <>
                        {group.weeks.slice(2, 4).map((week) => (
                          <React.Fragment key={`dimensions-${week.academicWeek.id}`}>
                            {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).map((dimension) => (
                              <TableHead 
                                key={`${week.academicWeek.id}-${dimension}`}
                                className="font-semibold text-center min-w-[60px] py-2 text-white"
                                style={{
                                  backgroundColor: getDimensionHexColorValue(dimension),
                                  color: '#ffffff',
                                }}
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
                        
                        {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).map((dimension, dimIdx) => (
                          <TableHead 
                            key={`qna2-${group.monthIndex}-${dimension}`}
                            className={`font-semibold text-blue-700 text-center min-w-[60px] py-2 bg-blue-50 ${dimIdx === 4 ? 'border-r-2 border-gray-400' : ''}`}
                          >
                            <span className="text-xs font-bold">{getDimensionShortCode(dimension)}</span>
                          </TableHead>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))}
                
                {/* Dimensiones para semanas restantes (solo si hay más de 4 semanas) */}
                {weeks.length > 4 && weeks.length % 4 !== 0 && (() => {
                  const remainingStartIndex = Math.floor(weeks.length / 4) * 4;
                  const remainingWeeks = weeks.slice(remainingStartIndex);
                  return remainingWeeks.map((week) => (
                    <React.Fragment key={`dimensions-${week.academicWeek.id}`}>
                      {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).map((dimension) => (
                        <TableHead 
                          key={`${week.academicWeek.id}-${dimension}`}
                          className="font-semibold text-center min-w-[60px] py-2 text-white"
                          style={{
                            backgroundColor: getDimensionHexColorValue(dimension),
                            color: '#ffffff',
                          }}
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
                  ));
                })()}
                
                {/* Header vacío para TOTAL en fila 2 */}
                <TableHead className="bg-green-50 border-l-2 border-r-2 border-gray-400"></TableHead>
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

                  {/* Datos organizados por grupos de 4 semanas (mes) */}
                  {monthGroups.map((group) => (
                    <React.Fragment key={`month-group-row-${group.monthIndex}-${row.studentId}`}>
                      {/* Par 1: Semanas 1-2 + QNA 1 */}
                      {group.weeks.length >= 2 && (() => {
                        const pair1Weeks = group.weeks.slice(0, 2);
                        const qna1Totals: Record<string, number> = {};
                        const qna1Counts: Record<string, number> = {};
                        
                        (['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).forEach((dimension) => {
                          let total = 0;
                          let count = 0;
                          pair1Weeks.forEach((week) => {
                            const weekEvals = row.weekEvaluations[week.academicWeek.id] || {};
                            const eval_ = weekEvals[dimension];
                            if (eval_) {
                              total += eval_.score;
                              count++;
                            }
                          });
                          qna1Totals[dimension] = count > 0 ? total / count : 0;
                          qna1Counts[dimension] = count;
                        });
                        
                        return (
                          <React.Fragment key={`qna1-row-${group.monthIndex}-${row.studentId}`}>
                            {/* Datos de las semanas 1-2 */}
                            {pair1Weeks.map((week) => {
                              const weekEvals = row.weekEvaluations[week.academicWeek.id] || {};
                              return (
                                <React.Fragment key={`row-week-${week.academicWeek.id}-${row.studentId}`}>
                                  {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).map((dimension) => {
                                    const evaluation = weekEvals[dimension];
                                    return (
                                      <TableCell 
                                        key={`${week.academicWeek.id}-${dimension}-${row.studentId}`} 
                                        className="text-center text-xs p-1"
                                        style={evaluation ? getStateStyles(evaluation.state) : {}}
                                      >
                                        {evaluation ? (
                                          <div>
                                            <Badge
                                              style={{
                                                backgroundColor: getState(evaluation.state as any)?.hexColor || '#CCCCCC',
                                                color: '#ffffff',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                padding: '0.25rem 0.5rem',
                                              }}
                                            >
                                              {evaluation.state}
                                            </Badge>
                                            <div className="text-xs text-gray-700 mt-0.5 font-semibold">
                                              {evaluation.score.toFixed(2)}
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
                                      const total = (['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).reduce((sum, dimension) => {
                                        const dimEval = weekEvals[dimension];
                                        return sum + (dimEval?.score || 0);
                                      }, 0);
                                      return total > 0 ? `${total.toFixed(2)}` : '—';
                                    })()}
                                  </TableCell>
                                </React.Fragment>
                              );
                            })}

                            {/* Columnas PROMEDIO QNA 1 */}
                            {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).map((dimension, dimIdx) => {
                              const average = qna1Totals[dimension] || 0;
                              const performanceColor = getPerformanceLevelColor(average);
                              const performanceLabel = getPerformanceLevelLabel(average);
                              
                              return (
                                <TableCell 
                                  key={`qna1-${group.monthIndex}-${dimension}-${row.studentId}`}
                                  className={`text-center text-xs p-1 font-semibold ${dimIdx === 4 ? 'border-r-2 border-gray-400' : ''}`}
                                  style={{
                                    backgroundColor: `rgba(${parseInt(performanceColor.slice(1, 3), 16)}, ${parseInt(performanceColor.slice(3, 5), 16)}, ${parseInt(performanceColor.slice(5, 7), 16)}, 0.2)`,
                                    color: performanceColor,
                                  }}
                                  title={performanceLabel}
                                >
                                  {qna1Counts[dimension] > 0 ? `${qna1Totals[dimension].toFixed(2)}` : '—'}
                                </TableCell>
                              );
                            })}
                          </React.Fragment>
                        );
                      })()}

                      {/* Par 2: Semanas 3-4 + QNA 2 */}
                      {group.weeks.length >= 4 && (() => {
                        const pair1Weeks = group.weeks.slice(0, 2);
                        const pair2Weeks = group.weeks.slice(2, 4);
                        const qna1Totals: Record<string, number> = {};
                        const qna1Counts: Record<string, number> = {};
                        const qna2Totals: Record<string, number> = {};
                        const qna2Counts: Record<string, number> = {};
                        
                        (['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).forEach((dimension) => {
                          let total1 = 0, count1 = 0;
                          let total2 = 0, count2 = 0;
                          
                          pair1Weeks.forEach((week) => {
                            const weekEvals = row.weekEvaluations[week.academicWeek.id] || {};
                            const eval_ = weekEvals[dimension];
                            if (eval_) {
                              total1 += eval_.score;
                              count1++;
                            }
                          });
                          
                          pair2Weeks.forEach((week) => {
                            const weekEvals = row.weekEvaluations[week.academicWeek.id] || {};
                            const eval_ = weekEvals[dimension];
                            if (eval_) {
                              total2 += eval_.score;
                              count2++;
                            }
                          });
                          
                          qna1Totals[dimension] = count1 > 0 ? total1 / count1 : 0;
                          qna1Counts[dimension] = count1;
                          qna2Totals[dimension] = count2 > 0 ? total2 / count2 : 0;
                          qna2Counts[dimension] = count2;
                        });
                        
                        return (
                          <React.Fragment key={`qna2-mes-row-${group.monthIndex}-${row.studentId}`}>
                            {/* Datos de las semanas 3-4 */}
                            {pair2Weeks.map((week) => {
                              const weekEvals = row.weekEvaluations[week.academicWeek.id] || {};
                              return (
                                <React.Fragment key={`row-week-${week.academicWeek.id}-${row.studentId}`}>
                                  {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).map((dimension) => {
                                    const evaluation = weekEvals[dimension];
                                    return (
                                      <TableCell 
                                        key={`${week.academicWeek.id}-${dimension}-${row.studentId}`} 
                                        className="text-center text-xs p-1"
                                        style={evaluation ? getStateStyles(evaluation.state) : {}}
                                      >
                                        {evaluation ? (
                                          <div>
                                            <Badge
                                              style={{
                                                backgroundColor: getState(evaluation.state as any)?.hexColor || '#CCCCCC',
                                                color: '#ffffff',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                padding: '0.25rem 0.5rem',
                                              }}
                                            >
                                              {evaluation.state}
                                            </Badge>
                                            <div className="text-xs text-gray-700 mt-0.5 font-semibold">
                                              {evaluation.score.toFixed(2)}
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
                                      const total = (['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).reduce((sum, dimension) => {
                                        const dimEval = weekEvals[dimension];
                                        return sum + (dimEval?.score || 0);
                                      }, 0);
                                      return total > 0 ? `${total.toFixed(2)}` : '—';
                                    })()}
                                  </TableCell>
                                </React.Fragment>
                              );
                            })}

                            {/* Columnas PROMEDIO QNA 2 */}
                            {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).map((dimension, dimIdx) => {
                              const average = qna2Totals[dimension] || 0;
                              const performanceColor = getPerformanceLevelColor(average);
                              const performanceLabel = getPerformanceLevelLabel(average);
                              
                              return (
                                <TableCell 
                                  key={`qna2-${group.monthIndex}-${dimension}-${row.studentId}`}
                                  className={`text-center text-xs p-1 font-semibold ${dimIdx === 4 ? 'border-r-2 border-gray-400' : ''}`}
                                  style={{
                                    backgroundColor: `rgba(${parseInt(performanceColor.slice(1, 3), 16)}, ${parseInt(performanceColor.slice(3, 5), 16)}, ${parseInt(performanceColor.slice(5, 7), 16)}, 0.2)`,
                                    color: performanceColor,
                                  }}
                                  title={performanceLabel}
                                >
                                  {qna2Counts[dimension] > 0 ? `${qna2Totals[dimension].toFixed(2)}` : '—'}
                                </TableCell>
                              );
                            })}
                          </React.Fragment>
                        );
                      })()}
                    </React.Fragment>
                  ))}
                  
                  {/* Semanas restantes (solo si hay más de 4 semanas) */}
                  {weeks.length > 4 && weeks.length % 4 !== 0 && (() => {
                    const remainingStartIndex = Math.floor(weeks.length / 4) * 4;
                    const remainingWeeks = weeks.slice(remainingStartIndex);
                    return remainingWeeks.map((week) => {
                      const weekEvals = row.weekEvaluations[week.academicWeek.id] || {};
                      return (
                        <React.Fragment key={`row-week-${week.academicWeek.id}-${row.studentId}`}>
                          {(['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).map((dimension) => {
                            const evaluation = weekEvals[dimension];
                            return (
                              <TableCell 
                                key={`${week.academicWeek.id}-${dimension}-${row.studentId}`} 
                                className="text-center text-xs p-1"
                                style={evaluation ? getStateStyles(evaluation.state) : {}}
                              >
                                {evaluation ? (
                                  <div>
                                    <Badge
                                      style={{
                                        backgroundColor: getState(evaluation.state as any)?.hexColor || '#CCCCCC',
                                        color: '#ffffff',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        padding: '0.25rem 0.5rem',
                                      }}
                                    >
                                      {evaluation.state}
                                    </Badge>
                                    <div className="text-xs text-gray-700 mt-0.5 font-semibold">
                                      {evaluation.score.toFixed(2)}
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
                              const total = (['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).reduce((sum, dimension) => {
                                const dimEval = weekEvals[dimension];
                                return sum + (dimEval?.score || 0);
                              }, 0);
                              return total > 0 ? `${total.toFixed(2)}` : '—';
                            })()}
                          </TableCell>
                        </React.Fragment>
                      );
                    });
                  })()}
                  
                  {/* TOTAL (suma de todos los puntos) */}
                  <TableCell className="text-center font-bold text-xs bg-green-50 border-l-2 border-r-2 border-gray-400 py-2">
                    {(() => {
                      let totalSum = 0;
                      weeks.forEach((week) => {
                        (['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'] as const).forEach((dimension) => {
                          const weekEvals = row.weekEvaluations[week.academicWeek.id] || {};
                          const eval_ = weekEvals[dimension];
                          if (eval_) {
                            totalSum += eval_.score;
                          }
                        });
                      });
                      return totalSum > 0 ? `${totalSum.toFixed(2)}` : '—';
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
