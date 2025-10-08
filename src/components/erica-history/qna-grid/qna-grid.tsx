import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText } from 'lucide-react';

// Types
interface AcademicWeek {
  id: number;
  number: number;
  startDate: string | Date;
  endDate: string | Date;
  objectives?: string;
}

interface EricaTopic {
  id: number;
  title: string;
  description?: string;
}

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

interface QnaUnifiedGridProps {
  weeksWithTopics: WeekWithTopic[];
  categories: Category[];
  scales: Scale[];
  students: Student[];
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function QnaUnifiedGrid({
  weeksWithTopics,
  categories,
  scales,
  students
}: QnaUnifiedGridProps) {

  // ========== FUNCIONES AUXILIARES ==========
  
  const formatDateRange = (startDate: string | Date, endDate: string | Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', { 
        month: 'short',
        day: '2-digit'
      });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // Agrupar semanas en períodos QNA (cada 2 semanas)
  const qnaPeriods = useMemo(() => {
    const periods = [];
    for (let i = 0; i < weeksWithTopics.length; i += 2) {
      const week1 = weeksWithTopics[i];
      const week2 = weeksWithTopics[i + 1];
      
      periods.push({
        qnaNumber: Math.floor(i / 2) + 1,
        weeks: week2 ? [week1, week2] : [week1],
        startDate: week1.startDate,
        endDate: week2 ? week2.endDate : week1.endDate
      });
    }
    return periods;
  }, [weeksWithTopics]);

  // Colores para diferentes períodos
  const getPeriodColors = (qnaNumber: number) => {
    const colors = [
      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600',
      'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-600',
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600',
      'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600'
    ];
    return colors[(qnaNumber - 1) % colors.length];
  };

  // ========== FUNCIONES DE DATOS DE ESTUDIANTES ==========
  
  const getStudentFullName = (student: Student) => {
    return `${student.enrollment.student.lastNames}, ${student.enrollment.student.givenNames}`;
  };

  const getWeekCategoryEvaluation = (student: Student, weekNumber: number, categoryCode: string) => {
    return student.weeklyEvaluations[weekNumber]?.[categoryCode] || null;
  };

  const getWeekTotal = (student: Student, weekNumber: number) => {
    let total = 0;
    categories.forEach(category => {
      const evaluation = getWeekCategoryEvaluation(student, weekNumber, category.code);
      if (evaluation) {
        total += evaluation.points;
      }
    });
    return total;
  };

  const getCalculatedResult = (student: Student, calculationType: string, competency: string) => {
    const result = student.calculatedResults[calculationType];
    if (!result) return null;
    
    return {
      value: result[`result${competency}` as keyof typeof result] as number,
      color: result[`color${competency}` as keyof typeof result] as string
    };
  };

  // Colores para celdas
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

  const getCalculatedCellColor = (color?: string) => {
    switch (color) {
      case 'green': return 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 font-bold';
      case 'yellow': return 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 font-bold';
      case 'red': return 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 font-bold';
      default: return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold';
    }
  };

  // ========== RENDER ==========
  return (
    <div className="w-full overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
      <table className="w-full border-collapse">
        
        {/* ========== HEADERS ========== */}
        <thead className="bg-white dark:bg-gray-900 sticky top-0 z-20">
          
          {/* FILA 1: PERÍODOS TEMPORALES */}
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {/* Columnas fijas */}
            <th className="w-16 p-2 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 font-medium text-xs text-center sticky left-0 z-30">
              #
            </th>
            
            <th className="w-48 p-2 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 font-medium text-xs text-center sticky left-0 z-30">
              Estudiante
            </th>

            {/* Períodos QNA */}
            {qnaPeriods.map((period) => (
              <React.Fragment key={`period-${period.qnaNumber}`}>
                {/* Semanas del período */}
                {period.weeks.map((week) => (
                  <th 
                    key={`week-header-${week.id}`}
                    colSpan={categories.length + 1} // +1 para el total
                    className={`
                      p-2 text-center border-r border-gray-200 dark:border-gray-700
                      ${getPeriodColors(period.qnaNumber)}
                    `}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs font-medium mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDateRange(week.startDate, week.endDate)}</span>
                    </div>
                    <div className="text-xs opacity-80">
                      Semana {week.number}
                    </div>
                  </th>
                ))}

                {/* QNA calculado */}
                <th 
                  colSpan={categories.length}
                  className="p-2 text-center border-r border-gray-200 dark:border-gray-700 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                >
                  <div className="text-xs font-bold mb-1">
                    QNA{period.qnaNumber}
                  </div>
                  <div className="text-xs opacity-80">
                    {formatDateRange(period.startDate, period.endDate)}
                  </div>
                </th>
              </React.Fragment>
            ))}

            {/* Promedios mensuales */}
            <th 
              colSpan={categories.length}
              className="p-2 text-center border-r border-gray-200 dark:border-gray-700 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200"
            >
              <div className="text-xs font-bold mb-1">Mensual 1</div>
              <div className="text-xs opacity-80">QNA1 + QNA2</div>
            </th>

            <th 
              colSpan={categories.length}
              className="p-2 text-center border-r border-gray-200 dark:border-gray-700 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200"
            >
              <div className="text-xs font-bold mb-1">Mensual 2</div>
              <div className="text-xs opacity-80">QNA3 + QNA4</div>
            </th>

            {/* Promedio Final */}
            <th 
              colSpan={categories.length}
              className="p-2 text-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <div className="text-xs font-bold mb-1">Final</div>
              <div className="text-xs opacity-80">Bimestral</div>
            </th>
          </tr>

          {/* FILA 2: TEMAS */}
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-orange-50 dark:bg-orange-950/20">
            {/* Columnas fijas */}
            <th className="p-2 border-r border-gray-200 dark:border-gray-700"></th>
            <th className="p-2 border-r border-gray-200 dark:border-gray-700"></th>

            {/* Temas por período */}
            {qnaPeriods.map((period) => (
              <React.Fragment key={`themes-${period.qnaNumber}`}>
                {/* Temas de las semanas */}
                {period.weeks.map((week) => (
                  <th 
                    key={`theme-${week.id}`}
                    colSpan={categories.length + 1}
                    className="p-2 text-center border-r border-gray-200 dark:border-gray-700 bg-orange-100 dark:bg-orange-900/30"
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FileText className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                      <span className="text-xs font-medium text-orange-800 dark:text-orange-200">
                        {week.topic ? 'Tema' : 'Sin tema'}
                      </span>
                    </div>
                    {week.topic && (
                      <div className="text-xs text-orange-700 dark:text-orange-300 truncate max-w-32" title={week.topic.title}>
                        {week.topic.title}
                      </div>
                    )}
                  </th>
                ))}

                {/* QNA (sin tema específico) */}
                <th colSpan={categories.length} className="p-2 border-r border-gray-200 dark:border-gray-700"></th>
              </React.Fragment>
            ))}

            {/* Mensuales y final (sin temas) */}
            <th colSpan={categories.length} className="p-2 border-r border-gray-200 dark:border-gray-700"></th>
            <th colSpan={categories.length} className="p-2 border-r border-gray-200 dark:border-gray-700"></th>
            <th colSpan={categories.length} className="p-2"></th>
          </tr>

          {/* FILA 3: TIPOS DE CÁLCULO */}
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {/* Columnas fijas */}
            <th className="p-2 border-r border-gray-200 dark:border-gray-700"></th>
            <th className="p-2 border-r border-gray-200 dark:border-gray-700"></th>

            {/* Tipos por período */}
            {qnaPeriods.map((period) => (
              <React.Fragment key={`types-${period.qnaNumber}`}>
                {/* Semanas individuales */}
                {period.weeks.map((week) => (
                  <th 
                    key={`type-${week.id}`}
                    colSpan={categories.length + 1}
                    className="p-2 text-center border-r border-gray-200 dark:border-gray-700"
                  >
                    <Badge variant="outline" className="text-xs font-bold mb-1">
                      Semana {week.number}
                    </Badge>
                  </th>
                ))}

                {/* QNA */}
                <th 
                  colSpan={categories.length}
                  className="p-2 text-center border-r border-gray-200 dark:border-gray-700"
                >
                  <Badge variant="secondary" className="text-xs font-bold mb-1 bg-yellow-200 dark:bg-yellow-800">
                    Suma
                  </Badge>
                </th>
              </React.Fragment>
            ))}

            {/* Mensuales */}
            <th 
              colSpan={categories.length}
              className="p-2 text-center border-r border-gray-200 dark:border-gray-700"
            >
              <Badge variant="secondary" className="text-xs font-bold mb-1 bg-indigo-200 dark:bg-indigo-800">
                Promedio
              </Badge>
            </th>

            <th 
              colSpan={categories.length}
              className="p-2 text-center border-r border-gray-200 dark:border-gray-700"
            >
              <Badge variant="secondary" className="text-xs font-bold mb-1 bg-indigo-200 dark:bg-indigo-800">
                Promedio
              </Badge>
            </th>

            {/* Final */}
            <th 
              colSpan={categories.length}
              className="p-2 text-center"
            >
              <Badge variant="secondary" className="text-xs font-bold mb-1 bg-gray-300 dark:bg-gray-600">
                Promedio
              </Badge>
            </th>
          </tr>

          {/* FILA 4: COMPETENCIAS ERICA */}
          <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
            {/* Columnas fijas */}
            <th className="p-2 border-r border-gray-200 dark:border-gray-700 text-xs font-bold text-center sticky left-0 z-30 bg-gray-100 dark:bg-gray-700">
              #
            </th>
            <th className="p-2 border-r border-gray-200 dark:border-gray-700 text-xs font-bold text-center sticky left-0 z-30 bg-gray-100 dark:bg-gray-700">
              Nombre Completo
            </th>

            {/* Competencias por período */}
            {qnaPeriods.map((period) => (
              <React.Fragment key={`competencies-${period.qnaNumber}`}>
                {/* Semanas */}
                {period.weeks.map((week) => (
                  <React.Fragment key={`comp-${week.id}`}>
                    {/* Competencias ERICA */}
                    {categories.map((category) => (
                      <th 
                        key={`${week.id}-${category.id}`}
                        className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center"
                      >
                        <Badge 
                          variant="outline" 
                          className="text-xs font-bold bg-white dark:bg-gray-800"
                        >
                          {category.code}
                        </Badge>
                      </th>
                    ))}
                    {/* Total */}
                    <th className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center">
                      <Badge 
                        variant="outline" 
                        className="text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30"
                      >
                        T
                      </Badge>
                    </th>
                  </React.Fragment>
                ))}

                {/* QNA competencias */}
                {categories.map((category) => (
                  <th 
                    key={`qna-${period.qnaNumber}-${category.id}`}
                    className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center"
                  >
                    <Badge 
                      variant="outline" 
                      className="text-xs font-bold bg-yellow-200 dark:bg-yellow-800"
                    >
                      {category.code}
                    </Badge>
                  </th>
                ))}
              </React.Fragment>
            ))}

            {/* Mensuales competencias */}
            {categories.map((category) => (
              <th 
                key={`monthly1-${category.id}`}
                className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center"
              >
                <Badge 
                  variant="outline" 
                  className="text-xs font-bold bg-indigo-200 dark:bg-indigo-800"
                >
                  {category.code}
                </Badge>
              </th>
            ))}

            {categories.map((category) => (
              <th 
                key={`monthly2-${category.id}`}
                className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center"
              >
                <Badge 
                  variant="outline" 
                  className="text-xs font-bold bg-indigo-200 dark:bg-indigo-800"
                >
                  {category.code}
                </Badge>
              </th>
            ))}

            {/* Final competencias */}
            {categories.map((category) => (
              <th 
                key={`final-${category.id}`}
                className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center"
              >
                <Badge 
                  variant="outline" 
                  className="text-xs font-bold bg-gray-300 dark:bg-gray-600"
                >
                  {category.code}
                </Badge>
              </th>
            ))}
          </tr>
        </thead>

        {/* ========== BODY - ESTUDIANTES ========== */}
       <tbody>
  {students.map((student, index) => (
    <tr 
      key={student.enrollment.id}
      className={`
        border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50
        ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/30 dark:bg-gray-800/30'}
      `}
    >
      
      {/* Columna ID - Estudiante */}
      <td className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center font-medium text-sm sticky left-0 z-30 bg-inherit">
        {student.enrollment.student.id}
      </td>
      
      {/* Columna Nombre - Ajustamos el z-index para que sea menor que la primera columna pero mayor que el contenido */}
      <td className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-sm font-medium truncate sticky left-0 z-20 bg-inherit" title={getStudentFullName(student)}>
        {getStudentFullName(student)}
      </td>

      {/* Resto del contenido de la tabla... */}
      {/* Datos por período QNA */}
      {qnaPeriods.map((period) => (
        <React.Fragment key={`student-${student.enrollment.id}-period-${period.qnaNumber}`}>
          
          {/* Semanas individuales del período */}
          {period.weeks.map((week) => (
            <React.Fragment key={`student-${student.enrollment.id}-week-${week.id}`}>
              
              {/* Evaluaciones por competencia */}
              {categories.map((category) => {
                const evaluation = getWeekCategoryEvaluation(student, week.number, category.code);
                
                return (
                  <td 
                    key={`${student.enrollment.id}-${week.id}-${category.id}`}
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
                  </td>
                );
              })}

              {/* Total de la semana */}
              <td className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs bg-yellow-100 dark:bg-yellow-900/30">
                <div className="font-bold text-yellow-800 dark:text-yellow-200">
                  {getWeekTotal(student, week.number).toFixed(2)}
                </div>
              </td>
            </React.Fragment>
          ))}

          {/* QNA Calculado */}
          {categories.map((category) => {
            const qnaResult = getCalculatedResult(student, `QNA${period.qnaNumber}`, category.code);
            
            return (
              <td 
                key={`qna-${student.enrollment.id}-${period.qnaNumber}-${category.id}`}
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
              </td>
            );
          })}
        </React.Fragment>
      ))}

      {/* Promedios Mensuales */}
      
      {/* Mensual 1 */}
      {categories.map((category) => {
        const mensual1Result = getCalculatedResult(student, 'MONTHLY1', category.code);
        
        return (
          <td 
            key={`monthly1-${student.enrollment.id}-${category.id}`}
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
          </td>
        );
      })}

      {/* Mensual 2 */}
      {categories.map((category) => {
        const mensual2Result = getCalculatedResult(student, 'MONTHLY2', category.code);
        
        return (
          <td 
            key={`monthly2-${student.enrollment.id}-${category.id}`}
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
          </td>
        );
      })}

      {/* Promedio Final Bimestral */}
      {categories.map((category) => {
        const finalResult = getCalculatedResult(student, 'BIMESTRAL', category.code);
        
        return (
          <td 
            key={`final-${student.enrollment.id}-${category.id}`}
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
          </td>
        );
      })}
    </tr>
  ))}
</tbody>
      </table>

      {/* Mensaje si no hay estudiantes */}
      {students.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No hay estudiantes para mostrar en el grid QNA
        </div>
      )}
    </div>
  );
}