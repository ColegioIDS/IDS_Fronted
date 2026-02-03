'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EricaHistoryWeekData, DimensionType, QnaData, MonthData, BimesterData } from '@/types/erica-history';
import { getDimensionColors, getStateColors } from '@/services/erica-history.service';

interface EvaluationTableProps {
  weeks: EricaHistoryWeekData[];
  qnas?: QnaData[];
  months?: MonthData[];
  bimester?: BimesterData;
  isLoading?: boolean;
}

// Mapeo de nombres completos a abreviaturas
const dimensionMap: Record<DimensionType, string> = {
  EJECUTA: 'E',
  RETIENE: 'R',
  INTERPRETA: 'I',
  CONOCE: 'C',
  APLICA: 'A',
};

const dimensionOrder: DimensionType[] = ['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'];

// Función para crear un color con opacidad
const hexToRgba = (hex: string, opacity: number = 0.15): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Función para determinar el color de fondo según el score
const getScoreBackgroundColor = (score: number): string => {
  if (score > 0.89 && score <= 1) {
    return '#92D050'; // Verde
  } else if (score >= 0.5 && score <= 0.89) {
    return '#FFFF00'; // Amarillo
  } else if (score >= 0 && score < 0.5) {
    return '#FF3300'; // Rojo
  }
  return '#f3f4f6'; // Gris por defecto
};

// Mapeo de estados a colores
const stateColorMap: Record<string, { bg: string; text: string }> = {
  E: { bg: 'bg-green-100', text: 'text-green-800' },
  B: { bg: 'bg-blue-100', text: 'text-blue-800' },
  P: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  C: { bg: 'bg-orange-100', text: 'text-orange-800' },
  N: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

const stateLabels: Record<string, string> = {
  E: 'Excelente',
  B: 'Bien',
  P: 'Poco',
  C: 'Casi Nada',
  N: 'Nada',
};

type ColumnType = 'week' | 'qna' | 'month' | 'bimester';

interface Column {
  type: ColumnType;
  id: string;
  label: string;
  data: any;
}

export function EvaluationTable({ weeks, qnas = [], months = [], bimester, isLoading = false }: EvaluationTableProps) {
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc' | null>(null);
  
  // Colores por defecto
  const defaultDimensionColors: Record<string, string> = {
    E: '#FF6B6B',  // Rojo
    R: '#4ECDC4',  // Turquesa
    I: '#45B7D1',  // Azul
    C: '#FFA07A',  // Naranja claro
    A: '#98D8C8',  // Verde menta
  };

  const defaultStateColors: Record<string, string> = {
    E: '#4CAF50',  // Verde (Excelente)
    B: '#2196F3',  // Azul (Bien)
    P: '#FFC107',  // Amarillo (Poco)
    C: '#FF9800',  // Naranja (Casi Nada)
    N: '#9E9E9E',  // Gris (Nada)
  };

  const [dimensionColors, setDimensionColors] = useState<Record<string, string>>(defaultDimensionColors);
  const [stateColors, setStateColors] = useState<Record<string, string>>(defaultStateColors);

  // Cargar colores del servidor
  useEffect(() => {
    console.log('Iniciando carga de colores...');
    const loadColors = async () => {
      try {
        console.log('Llamando a getDimensionColors y getStateColors...');
        const [dimColors, stColors] = await Promise.all([
          getDimensionColors(),
          getStateColors(),
        ]);

        console.log('✅ Dimension colors loaded:', dimColors);
        console.log('✅ State colors loaded:', stColors);

        // Crear mapas de colores por clave
        const dimColorMap: Record<string, string> = { ...defaultDimensionColors };
        dimColors.forEach((item) => {
          console.log(`Agregando dimension color: ${item.dimension} = ${item.hexColor}`);
          dimColorMap[item.dimension] = item.hexColor;
        });

        const stColorMap: Record<string, string> = { ...defaultStateColors };
        stColors.forEach((item) => {
          console.log(`Agregando state color: ${item.state} = ${item.hexColor}`);
          stColorMap[item.state] = item.hexColor;
        });

        console.log('📊 Final dimension colors map:', dimColorMap);
        console.log('📊 Final state colors map:', stColorMap);

        setDimensionColors(dimColorMap);
        setStateColors(stColorMap);
      } catch (error) {
        console.error('❌ Error loading colors, usando colores por defecto:', error);
        // Los colores por defecto ya están establecidos
      }
    };

    loadColors();
  }, []);

  // Obtener todos los estudiantes únicos
  const allStudents = useMemo(() => {
    const studentsMap = new Map<number, { name: string; givenNames: string; lastNames: string }>();
    weeks.forEach((week) => {
      week.students?.forEach((student: any) => {
        if (!studentsMap.has(student.studentId)) {
          studentsMap.set(student.studentId, {
            name: `${student.lastNames || ''}, ${student.givenNames || student.studentName || ''}`.trim(),
            givenNames: student.givenNames || '',
            lastNames: student.lastNames || '',
          });
        }
      });
    });

    let students = Array.from(studentsMap.entries()).map(([id, data]) => ({ id, ...data }));

    // Aplicar ordenamiento si está establecido
    if (sortOrder === 'asc') {
      students.sort((a, b) => a.name.localeCompare(b.name, 'es-ES'));
    } else if (sortOrder === 'desc') {
      students.sort((a, b) => b.name.localeCompare(a.name, 'es-ES'));
    }

    return students;
  }, [weeks, sortOrder]);

  // Construir lista de columnas intercalando semanas y QNAs
  const columns: Column[] = useMemo(() => {
    const cols: Column[] = [];

    console.log('DEBUG: weeks=', weeks);
    console.log('DEBUG: qnas=', qnas);
    console.log('DEBUG: months=', months);
    console.log('DEBUG: bimester=', bimester);

    // Crear un mapa de QNA por última semana incluida (usando weekNumber, NO weekId)
    const qnaByLastWeek = new Map<number, typeof qnas[0]>();
    qnas.forEach((qna) => {
      const lastWeekNumber = Math.max(...qna.weeks);
      qnaByLastWeek.set(lastWeekNumber, qna);
    });

    // Crear un mapa de meses por la última semana que cubre (cada mes cubre ~4 semanas / 2 QNAs)
    // Para simplificar: MES1 aparece después de la semana 4, MES2 después de la semana 8, etc.
    const monthByLastWeek = new Map<number, typeof months[0]>();
    months.forEach((month, index) => {
      const lastWeekForMonth = (index + 1) * 4; // MES1 → week 4, MES2 → week 8, etc.
      monthByLastWeek.set(lastWeekForMonth, month);
    });

    // Agregar semanas intercaladas con QNAs y meses
    weeks.forEach((week) => {
      const startDate = new Date(week.startDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      const endDate = new Date(week.endDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      const weekLabel = `SEMANA ${week.weekNumber}\n${startDate} - ${endDate}\n${(week as any).weekTitle || week.weekTheme || ''}`;
      
      cols.push({
        type: 'week',
        id: `week-${week.weekId}`,
        label: weekLabel,
        data: week,
      });

      // Si hay un QNA que termina en esta semana, agregarlo (comparar con weekNumber)
      const qnaForThisWeek = qnaByLastWeek.get(week.weekNumber);
      if (qnaForThisWeek) {
        // Calcular fechas del QNA basado en las semanas que contiene
        const qnaWeeks = weeks.filter((w) => qnaForThisWeek.weeks.includes(w.weekNumber));
        const qnaStartDate = qnaWeeks.length > 0 ? new Date(qnaWeeks[0].startDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : '';
        const qnaEndDate = qnaWeeks.length > 0 ? new Date(qnaWeeks[qnaWeeks.length - 1].endDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : '';
        const qnaLabel = `QNA${qnaForThisWeek.qnaNumber}\n${qnaStartDate} - ${qnaEndDate}`;
        
        cols.push({
          type: 'qna',
          id: `qna-${qnaForThisWeek.qnaId}`,
          label: qnaLabel,
          data: qnaForThisWeek,
        });
      }

      // Si hay un mes que termina en esta semana, agregarlo
      const monthForThisWeek = monthByLastWeek.get(week.weekNumber);
      if (monthForThisWeek) {
        // Calcular fechas del mes (4 semanas antes de la semana actual)
        const monthStartWeekNumber = week.weekNumber - 3;
        const monthWeeks = weeks.filter((w) => w.weekNumber >= monthStartWeekNumber && w.weekNumber <= week.weekNumber);
        const monthStartDate = monthWeeks.length > 0 ? new Date(monthWeeks[0].startDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : '';
        const monthEndDate = monthWeeks.length > 0 ? new Date(monthWeeks[monthWeeks.length - 1].endDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : '';
        const monthLabel = `MES${monthForThisWeek.monthNumber}\n${monthStartDate} - ${monthEndDate}`;
        
        cols.push({
          type: 'month',
          id: `month-${monthForThisWeek.monthId}`,
          label: monthLabel,
          data: monthForThisWeek,
        });
      }
    });

    // Agregar bimestre al final
    if (bimester) {
      cols.push({
        type: 'bimester',
        id: 'bimester',
        label: 'BIMESTRE',
        data: bimester,
      });
    }

    return cols;
  }, [weeks, qnas, months, bimester]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">Cargando evaluaciones...</div>
        </CardContent>
      </Card>
    );
  }

  if (!weeks || weeks.length === 0 || allStudents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">No hay evaluaciones disponibles</div>
        </CardContent>
      </Card>
    );
  }

  const tableScrollRef = React.useRef<HTMLDivElement>(null);
  const topScrollRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, source: 'top' | 'bottom') => {
    const target = e.currentTarget;
    const otherRef = source === 'top' ? tableScrollRef : topScrollRef;
    if (otherRef.current) {
      otherRef.current.scrollLeft = target.scrollLeft;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base dark:text-white">Evaluaciones por Período</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Scroll superior */}
        <div
          ref={topScrollRef}
          className="overflow-x-auto mb-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800"
          onScroll={(e) => handleScroll(e, 'top')}
        >
          <div style={{ width: '100%', height: '12px' }} />
        </div>

        {/* Tabla principal */}
        <div
          ref={tableScrollRef}
          className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded"
          onScroll={(e) => handleScroll(e, 'bottom')}
        >
          <Table className="relative">
            <TableHeader className="border-b-4 border-gray-400 dark:border-gray-600">
              {/* Fila 1: Períodos */}
              <TableRow className="bg-gray-100 dark:bg-gray-900">
                <TableHead rowSpan={2} className="sticky left-0 z-20 font-semibold text-gray-800 dark:text-gray-100 min-w-[50px] py-2 text-center align-middle bg-gray-100 dark:bg-gray-900 border-r-2 border-gray-400 dark:border-gray-600">
                  <span>Clave</span>
                </TableHead>
                <TableHead rowSpan={2} className="sticky left-[50px] z-20 font-semibold text-gray-800 dark:text-gray-100 min-w-[200px] py-2 text-center align-middle bg-gray-100 dark:bg-gray-900 border-r-2 border-gray-400 dark:border-gray-600">
                  <div className="flex items-center justify-between gap-2">
                    <span>Nombre del Estudiante</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? null : 'asc')}
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          sortOrder === 'asc' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        title="Ordenar A-Z"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => setSortOrder(sortOrder === 'desc' ? null : 'desc')}
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          sortOrder === 'desc' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        title="Ordenar Z-A"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                </TableHead>
                {columns.map((col) => (
                  <TableHead
                    key={col.id}
                    colSpan={col.type === 'week' ? 6 : col.type === 'qna' || col.type === 'month' ? 5 : col.type === 'bimester' ? 1 : 1}
                    className={`text-center font-semibold text-gray-800 dark:text-gray-100 py-2 whitespace-pre-line text-xs ${
                      col.type === 'week' ? 'border-r-2 border-gray-400 dark:border-gray-600' : 'border-r border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>

              {/* Fila 2: Dimensiones */}
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                {columns.map((col) => {
                  if (col.type === 'week') {
                    return (
                      <React.Fragment key={`dims-${col.id}`}>
                        {dimensionOrder.map((dimension) => {
                          const dimKey = dimensionMap[dimension];
                          const bgColor = dimensionColors[dimKey];
                          console.log(`Dimension ${dimKey}: color=${bgColor}`);
                          return (
                            <TableHead
                              key={`dim-${col.id}-${dimension}`}
                              className="text-center font-bold text-xs py-2 border-r border-gray-300"
                            >
                              <Badge 
                                className="border-0 text-xs text-white"
                                style={{ backgroundColor: bgColor }}
                              >
                                {dimKey}
                              </Badge>
                            </TableHead>
                          );
                        })}
                        <TableHead
                          key={`tot-${col.id}`}
                          className="text-center font-bold text-xs py-2 border-r-2 border-gray-400 dark:border-gray-600"
                        >
                          <Badge className="border-0 text-xs bg-amber-200 text-amber-800">Tot</Badge>
                        </TableHead>
                      </React.Fragment>
                    );
                  } else if (col.type === 'qna') {
                    return (
                      <React.Fragment key={`dims-${col.id}`}>
                        {dimensionOrder.map((dimension) => {
                          const dimKey = dimensionMap[dimension];
                          const bgColor = dimensionColors[dimKey] || '#999999';
                          return (
                            <TableHead
                              key={`dim-${col.id}-${dimension}`}
                              className="text-center font-bold text-xs py-2 border-r border-gray-300"
                            >
                              <Badge 
                                className="border-0 text-xs text-white"
                                style={{ backgroundColor: bgColor }}
                              >
                                {dimKey}
                              </Badge>
                            </TableHead>
                          );
                        })}
                      </React.Fragment>
                    );
                  } else if (col.type === 'month') {
                    return (
                      <React.Fragment key={`dims-${col.id}`}>
                        {dimensionOrder.map((dimension) => {
                          const dimKey = dimensionMap[dimension];
                          const bgColor = dimensionColors[dimKey] || '#999999';
                          return (
                            <TableHead
                              key={`dim-${col.id}-${dimension}`}
                              className="text-center font-bold text-xs py-2 border-r border-gray-300"
                            >
                              <Badge 
                                className="border-0 text-xs text-white"
                                style={{ backgroundColor: bgColor }}
                              >
                                {dimKey}
                              </Badge>
                            </TableHead>
                          );
                        })}
                      </React.Fragment>
                    );
                  } else if (col.type === 'bimester') {
                    return (
                      <TableHead
                        key={`header-${col.id}`}
                        className="text-center font-bold text-xs py-2 border-r border-gray-300"
                      >
                        <Badge className="border-0 text-xs bg-green-200 text-green-800">Puntos</Badge>
                      </TableHead>
                    );
                  } else {
                    return (
                      <TableHead
                        key={`header-${col.id}`}
                        className="text-center font-bold text-xs py-2 border-r border-gray-300"
                      >
                        <Badge className="border-0 text-xs bg-green-200 text-green-800">Prom</Badge>
                      </TableHead>
                    );
                  }
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {allStudents.map((student, index) => (
                <TableRow key={`student-${student.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="sticky left-0 z-10 font-semibold text-gray-900 dark:text-gray-50 bg-gray-50 dark:bg-gray-800 border-r-2 border-gray-400 dark:border-gray-600 text-xs py-2 text-center min-w-[50px]">
                    {index + 1}
                  </TableCell>
                  <TableCell className="sticky left-[50px] z-10 font-semibold text-gray-900 dark:text-gray-50 bg-gray-50 dark:bg-gray-800 border-r-2 border-gray-400 dark:border-gray-600 text-xs py-2">
                    {student.name}
                  </TableCell>

                  {columns.map((col) => {
                    if (col.type === 'week') {
                      const studentData = col.data.students?.find((s: any) => s.studentId === student.id);
                      return (
                        <React.Fragment key={`row-${student.id}-${col.id}`}>
                          {dimensionOrder.map((dimension) => {
                            const evaluation = studentData?.evaluations.find((e: any) => e.dimension === dimension);
                            const solidColor = evaluation ? stateColors[evaluation.state] : '#9ca3af';
                            const lightColor = evaluation ? hexToRgba(stateColors[evaluation.state], 0.12) : '#f3f4f6';

                            return (
                              <TableCell
                                key={`cell-${student.id}-${col.id}-${dimension}`}
                                className="text-center text-xs py-2 border-r border-gray-300 dark:border-gray-700"
                                style={{ 
                                  backgroundColor: lightColor
                                }}
                              >
                                {evaluation ? (
                                  <div className="flex flex-col gap-0.5 items-center">
                                    <Badge
                                      variant="outline"
                                      className="border-0 bg-white text-xs font-semibold"
                                      style={{ color: solidColor, borderColor: solidColor }}
                                    >
                                      {evaluation.state}
                                    </Badge>
                                    <span className="text-xs font-bold" style={{ color: solidColor }}>
                                      {evaluation.score.toFixed(2)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">-</span>
                                )}
                              </TableCell>
                            );
                          })}
                          {/* Total semana */}
                          <TableCell
                            key={`total-${student.id}-${col.id}`}
                            className="text-center text-xs py-2 bg-amber-50 dark:bg-amber-950 border-r-3 border-gray-600 dark:border-gray-500 font-semibold"
                          >
                            {studentData?.totalScore ? (
                              <span className="text-xs text-amber-900 dark:text-amber-100">{studentData.totalScore.toFixed(2)}</span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </TableCell>
                        </React.Fragment>
                      );
                    } else if (col.type === 'qna') {
                      const studentData = col.data.students?.find((s: any) => s.studentId === student.id);
                      const dimensionKeys = ['ejecuta', 'retiene', 'interpreta', 'conoce', 'aplica'] as const;
                      
                      return (
                        <React.Fragment key={`row-${student.id}-${col.id}`}>
                          {dimensionKeys.map((dimKey, idx) => {
                            const score = studentData?.[dimKey] ?? 0;
                            const roundedScore = score > 0 ? Math.round(score * 10) / 10 : null;
                            const isLastDimension = idx === dimensionKeys.length - 1;
                            const bgColor = roundedScore ? getScoreBackgroundColor(roundedScore) : '#f3f4f6';

                            return (
                              <TableCell
                                key={`cell-${student.id}-${col.id}-${dimKey}`}
                                className={`text-center text-xs py-2 ${
                                  isLastDimension ? 'border-r-3 border-gray-600 dark:border-gray-500' : 'border-r border-gray-300 dark:border-gray-700'
                                }`}
                                style={{ backgroundColor: bgColor }}
                              >
                                {roundedScore ? (
                                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{roundedScore.toFixed(1)}</span>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-600 text-xs">-</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </React.Fragment>
                      );
                    } else if (col.type === 'month') {
                      // Mes con 5 dimensiones
                      const studentData = col.data.students?.find((s: any) => s.studentId === student.id);
                      const dimensionKeys = ['ejecuta', 'retiene', 'interpreta', 'conoce', 'aplica'] as const;
                      
                      return (
                        <React.Fragment key={`row-${student.id}-${col.id}`}>
                          {dimensionKeys.map((dimKey, idx) => {
                            const score = studentData?.[dimKey] ?? 0;
                            const roundedScore = score > 0 ? Math.round(score * 10) / 10 : null;
                            const isLastDimension = idx === dimensionKeys.length - 1;
                            const bgColor = roundedScore ? getScoreBackgroundColor(roundedScore) : '#f3f4f6';

                            return (
                              <TableCell
                                key={`cell-${student.id}-${col.id}-${dimKey}`}
                                className={`text-center text-xs py-2 ${
                                  isLastDimension ? 'border-r-3 border-gray-600 dark:border-gray-500' : 'border-r border-gray-300 dark:border-gray-700'
                                }`}
                                style={{ backgroundColor: bgColor }}
                              >
                                {roundedScore ? (
                                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{roundedScore.toFixed(1)}</span>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-600 text-xs">-</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </React.Fragment>
                      );
                    } else if (col.type === 'bimester') {
                      // Bimestre solo con totalPoints
                      const studentData = col.data.students?.find((s: any) => s.studentId === student.id);
                      const totalPoints = studentData?.totalPoints ?? 0;

                      return (
                        <TableCell
                          key={`row-${student.id}-${col.id}`}
                          className="text-center text-xs py-2 bg-green-50 dark:bg-green-950 border-r-3 border-gray-600 dark:border-gray-500 font-semibold"
                        >
                          {totalPoints > 0 ? (
                            <span className="text-xs text-green-900 dark:text-green-100">{totalPoints.toFixed(2)}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600 text-xs">-</span>
                          )}
                        </TableCell>
                      );
                    } else {
                      return (
                        <TableCell
                          key={`row-${student.id}-${col.id}`}
                          className="text-center text-xs py-2 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 font-semibold"
                        >
                          <span className="text-gray-400 dark:text-gray-600 text-xs">-</span>
                        </TableCell>
                      );
                    }
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
