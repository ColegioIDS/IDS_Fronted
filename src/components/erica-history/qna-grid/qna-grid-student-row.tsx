// src/components/erica-history/qna-grid/qna-grid-student-row.tsx
"use client";

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

// Types
import { AcademicWeek } from '@/types/academic-week.types';
import { EricaTopic } from '@/types/erica-topics';

// ==================== INTERFACES ====================
interface WeekWithTopic extends AcademicWeek {
  topic: EricaTopic | null;
}

interface Category {
  id: number;
  code: string;
  name: string;
  order: number;
}

interface Scale {
  id: number;
  code: string;
  name: string;
  numericValue: number;
  order: number;
}

// Estructura de estudiante del QNA Grid
interface Student {
  enrollment: {
    id: number;
    student: {
      id: number;
      givenNames: string;
      lastNames: string;
    };
  };
  weeklyEvaluations: {
    [weekNumber: number]: {
      [categoryCode: string]: {
        id: number;
        scaleCode: string;
        scaleName: string;
        points: number;
        notes?: string;
        evaluatedAt: Date;
      } | null;
    };
  };
  calculatedResults: {
    [calculationType: string]: {
      resultE: number;
      resultR: number;
      resultI: number;
      resultC: number;
      resultA: number;
      colorE?: string;
      colorR?: string;
      colorI?: string;
      colorC?: string;
      colorA?: string;
    };
  };
  summary: {
    totalEvaluations: number;
    maxPossibleEvaluations: number;
    completionPercentage: number;
    totalPoints: number;
    averagePoints: number;
    calculatedResultsCount: number;
  };
}

interface QnaGridStudentRowProps {
  student: Student;
  weeksWithTopics: WeekWithTopic[];
  categories: Category[];
  scales: Scale[];
  isEvenRow: boolean;
}

// ==================== COMPONENTE ====================
export default function QnaGridStudentRow({
  student,
  weeksWithTopics,
  categories,
  scales,
  isEvenRow
}: QnaGridStudentRowProps) {

  // ========== FUNCIONES AUXILIARES ==========
  
  const getStudentNumber = () => {
    return student.enrollment.student.id;
  };

  const getStudentFullName = () => {
    return `${student.enrollment.student.lastNames}, ${student.enrollment.student.givenNames}`;
  };

  // Obtener evaluación de una semana y categoría específica
  const getWeekCategoryEvaluation = (weekNumber: number, categoryCode: string) => {
    return student.weeklyEvaluations[weekNumber]?.[categoryCode] || null;
  };

  // Calcular total de una semana
  const getWeekTotal = (weekNumber: number) => {
    let total = 0;
    categories.forEach(category => {
      const evaluation = getWeekCategoryEvaluation(weekNumber, category.code);
      if (evaluation) {
        total += evaluation.points;
      }
    });
    return total;
  };

  // Obtener resultado calculado (QNA, Mensual, etc.)
  const getCalculatedResult = (calculationType: string, competency: string) => {
    const result = student.calculatedResults[calculationType];
    if (!result) return null;
    
    return {
      value: result[`result${competency}` as keyof typeof result] as number,
      color: result[`color${competency}` as keyof typeof result] as string
    };
  };

  // Colores para celdas de evaluación
  const getEvaluationCellColor = (scaleCode?: string) => {
    switch (scaleCode) {
      case 'E': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'B': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'P': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'C': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
      case 'N': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  // Colores para resultados calculados
  const getCalculatedCellColor = (color?: string) => {
    switch (color) {
      case 'green': return 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 font-bold';
      case 'yellow': return 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 font-bold';
      case 'red': return 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 font-bold';
      default: return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold';
    }
  };

  // Agrupar semanas en períodos QNA
  const qnaPeriods = useMemo(() => {
    const periods = [];
    for (let i = 0; i < weeksWithTopics.length; i += 2) {
      const week1 = weeksWithTopics[i];
      const week2 = weeksWithTopics[i + 1];
      
      periods.push({
        qnaNumber: Math.floor(i / 2) + 1,
        weeks: week2 ? [week1, week2] : [week1]
      });
    }
    return periods;
  }, [weeksWithTopics]);

  // ========== RENDER ==========
  return (
    <div className={`
      flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50
      ${isEvenRow ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/30 dark:bg-gray-800/30'}
    `}>
      
      {/* ========== COLUMNAS FIJAS - ESTUDIANTE ========== */}
      <div className="flex">
        {/* Número */}
        <div className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center font-medium text-sm sticky left-0 z-10 bg-inherit">
          {getStudentNumber()}
        </div>
        
        {/* Nombre completo */}
        <div className="w-48 p-2 border-r border-gray-200 dark:border-gray-700 text-sm font-medium truncate sticky left-16 z-10 bg-inherit" title={getStudentFullName()}>
          {getStudentFullName()}
        </div>
      </div>

      {/* ========== DATOS POR PERÍODO QNA ========== */}
      {qnaPeriods.map((period) => (
        <React.Fragment key={period.qnaNumber}>
          
          {/* Semanas individuales del período */}
          {period.weeks.map((week) => (
            <div key={week.id} className="min-w-max border-r border-gray-200 dark:border-gray-700 flex">
              
              {/* Evaluaciones por competencia */}
              {categories.map((category) => {
                const evaluation = getWeekCategoryEvaluation(week.number, category.code);
                
                return (
                  <div 
                    key={`${week.id}-${category.id}`}
                    className={`
                      w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs
                      ${getEvaluationCellColor(evaluation?.scaleCode)}
                    `}
                  >
                    {evaluation ? (
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs font-bold">
                          {evaluation.scaleCode}
                        </Badge>
                        <div className="text-xs">
                          {evaluation.points.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-600">
                        -
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Total de la semana */}
              <div className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs bg-yellow-100 dark:bg-yellow-900/30">
                <div className="font-bold text-yellow-800 dark:text-yellow-200">
                  {getWeekTotal(week.number).toFixed(2)}
                </div>
              </div>
            </div>
          ))}

          {/* QNA Calculado */}
          <div className="min-w-max border-r border-gray-200 dark:border-gray-700 flex">
            {categories.map((category) => {
              const qnaResult = getCalculatedResult(`QNA${period.qnaNumber}`, category.code);
              
              return (
                <div 
                  key={`qna-${period.qnaNumber}-${category.id}`}
                  className={`
                    w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs
                    ${getCalculatedCellColor(qnaResult?.color)}
                  `}
                >
                  {qnaResult ? (
                    <div className="space-y-1">
                      <div className="font-bold">
                        {qnaResult.value.toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 dark:text-gray-600">
                      -
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </React.Fragment>
      ))}

      {/* ========== PROMEDIOS MENSUALES ========== */}
      
      {/* Mensual 1 */}
      <div className="min-w-max border-r border-gray-200 dark:border-gray-700 flex">
        {categories.map((category) => {
          const mensual1Result = getCalculatedResult('MONTHLY1', category.code);
          
          return (
            <div 
              key={`monthly1-${category.id}`}
              className={`
                w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs
                ${getCalculatedCellColor(mensual1Result?.color)}
              `}
            >
              {mensual1Result ? (
                <div className="space-y-1">
                  <div className="font-bold">
                    {mensual1Result.value.toFixed(2)}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 dark:text-gray-600">
                  -
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mensual 2 */}
      <div className="min-w-max border-r border-gray-200 dark:border-gray-700 flex">
        {categories.map((category) => {
          const mensual2Result = getCalculatedResult('MONTHLY2', category.code);
          
          return (
            <div 
              key={`monthly2-${category.id}`}
              className={`
                w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs
                ${getCalculatedCellColor(mensual2Result?.color)}
              `}
            >
              {mensual2Result ? (
                <div className="space-y-1">
                  <div className="font-bold">
                    {mensual2Result.value.toFixed(2)}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 dark:text-gray-600">
                  -
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========== PROMEDIO FINAL BIMESTRAL ========== */}
      <div className="min-w-max flex">
        {categories.map((category) => {
          const finalResult = getCalculatedResult('BIMESTRAL', category.code);
          
          return (
            <div 
              key={`final-${category.id}`}
              className={`
                w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs
                ${getCalculatedCellColor(finalResult?.color)}
              `}
            >
              {finalResult ? (
                <div className="space-y-1">
                  <div className="font-bold">
                    {finalResult.value.toFixed(2)}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 dark:text-gray-600">
                  -
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}