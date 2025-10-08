// src/components/erica-history/qna-grid/qna-grid-headers.tsx
"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText } from 'lucide-react';

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

interface QnaGridHeadersProps {
  weeksWithTopics: WeekWithTopic[];
  categories: Category[];
}

// ==================== COMPONENTE ====================
export default function QnaGridHeaders({
  weeksWithTopics,
  categories
}: QnaGridHeadersProps) {

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
  const qnaPeriods = React.useMemo(() => {
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

  // ========== RENDER ==========
  return (
    <div className="bg-white dark:bg-gray-900 sticky top-0 z-20">
      
      {/* ========== FILA 1: PERÍODOS TEMPORALES ========== */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {/* Columna fija estudiante */}
        <div className="flex">
          <div className="w-16 p-2 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 font-medium text-xs text-center sticky left-0 z-10">
            #
          </div>
          <div className="w-48 p-2 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 font-medium text-xs text-center sticky left-16 z-10">
            Estudiante
          </div>
        </div>

        {/* Períodos QNA */}
        {qnaPeriods.map((period) => (
          <React.Fragment key={period.qnaNumber}>
            {/* Semanas del período */}
            {period.weeks.map((week) => (
              <div 
                key={week.id}
                className={`
                  min-w-max border-r border-gray-200 dark:border-gray-700 p-2 text-center
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
                {/* 6 columnas por semana: E, R, I, C, A, Total */}
                <div className="flex">
                  {categories.map((category) => (
                    <div key={category.id} className="w-16 h-8"></div>
                  ))}
                  <div className="w-16 h-8"></div> {/* Total */}
                </div>
              </div>
            ))}

            {/* QNA calculado */}
            <div className="min-w-max border-r border-gray-200 dark:border-gray-700 p-2 text-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
              <div className="text-xs font-bold mb-1">
                QNA{period.qnaNumber}
              </div>
              <div className="text-xs opacity-80">
                {formatDateRange(period.startDate, period.endDate)}
              </div>
              {/* 5 columnas QNA: E, R, I, C, A */}
              <div className="flex">
                {categories.map((category) => (
                  <div key={category.id} className="w-16 h-8"></div>
                ))}
              </div>
            </div>
          </React.Fragment>
        ))}

        {/* Promedios mensuales */}
        <div className="min-w-max border-r border-gray-200 dark:border-gray-700 p-2 text-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
          <div className="text-xs font-bold mb-1">Mensual 1</div>
          <div className="text-xs opacity-80">QNA1 + QNA2</div>
          <div className="flex">
            {categories.map((category) => (
              <div key={category.id} className="w-16 h-8"></div>
            ))}
          </div>
        </div>

        <div className="min-w-max border-r border-gray-200 dark:border-gray-700 p-2 text-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
          <div className="text-xs font-bold mb-1">Mensual 2</div>
          <div className="text-xs opacity-80">QNA3 + QNA4</div>
          <div className="flex">
            {categories.map((category) => (
              <div key={category.id} className="w-16 h-8"></div>
            ))}
          </div>
        </div>

        {/* Promedio Final */}
        <div className="min-w-max p-2 text-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          <div className="text-xs font-bold mb-1">Final</div>
          <div className="text-xs opacity-80">Bimestral</div>
          <div className="flex">
            {categories.map((category) => (
              <div key={category.id} className="w-16 h-8"></div>
            ))}
          </div>
        </div>
      </div>

      {/* ========== FILA 2: TEMAS ========== */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-orange-50 dark:bg-orange-950/20">
        {/* Columna fija estudiante */}
        <div className="flex">
          <div className="w-16 p-2 border-r border-gray-200 dark:border-gray-700"></div>
          <div className="w-48 p-2 border-r border-gray-200 dark:border-gray-700"></div>
        </div>

        {/* Temas por período */}
        {qnaPeriods.map((period) => (
          <React.Fragment key={`themes-${period.qnaNumber}`}>
            {/* Temas de las semanas */}
            {period.weeks.map((week) => (
              <div 
                key={`theme-${week.id}`}
                className="min-w-max border-r border-gray-200 dark:border-gray-700 p-2 text-center bg-orange-100 dark:bg-orange-900/30"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <FileText className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-medium text-orange-800 dark:text-orange-200">
                    {week.topic ? 'Tema' : 'Sin tema'}
                  </span>
                </div>
                {week.topic && (
                  <div className="text-xs text-orange-700 dark:text-orange-300 truncate max-w-24" title={week.topic.title}>
                    {week.topic.title}
                  </div>
                )}
                <div className="flex">
                  {categories.map(() => (
                    <div className="w-16 h-6"></div>
                  ))}
                  <div className="w-16 h-6"></div>
                </div>
              </div>
            ))}

            {/* QNA (sin tema específico) */}
            <div className="min-w-max border-r border-gray-200 dark:border-gray-700 p-2"></div>
          </React.Fragment>
        ))}

        {/* Mensuales y final (sin temas) */}
        <div className="min-w-max border-r border-gray-200 dark:border-gray-700 p-2"></div>
        <div className="min-w-max border-r border-gray-200 dark:border-gray-700 p-2"></div>
        <div className="min-w-max p-2"></div>
      </div>

      {/* ========== FILA 3: TIPOS DE CÁLCULO ========== */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {/* Columna fija estudiante */}
        <div className="flex">
          <div className="w-16 p-2 border-r border-gray-200 dark:border-gray-700"></div>
          <div className="w-48 p-2 border-r border-gray-200 dark:border-gray-700"></div>
        </div>

        {/* Tipos por período */}
        {qnaPeriods.map((period) => (
          <React.Fragment key={`types-${period.qnaNumber}`}>
            {/* Semanas individuales */}
            {period.weeks.map((week) => (
              <div 
                key={`type-${week.id}`}
                className="min-w-max border-r border-gray-200 dark:border-gray-700 p-2 text-center"
              >
                <Badge variant="outline" className="text-xs font-bold mb-1">
                  Semana {week.number}
                </Badge>
                <div className="flex">
                  {categories.map(() => (
                    <div className="w-16 h-6"></div>
                  ))}
                  <div className="w-16 h-6"></div>
                </div>
              </div>
            ))}

            {/* QNA */}
            <div className="min-w-max border-r border-gray-200 dark:border-gray-700 p-2 text-center">
              <Badge variant="secondary" className="text-xs font-bold mb-1 bg-yellow-200 dark:bg-yellow-800">
                Suma
              </Badge>
              <div className="flex">
                {categories.map(() => (
                  <div className="w-16 h-6"></div>
                ))}
              </div>
            </div>
          </React.Fragment>
        ))}

        {/* Mensuales */}
        <div className="min-w-max border-r border-gray-200 dark:border-gray-700 p-2 text-center">
          <Badge variant="secondary" className="text-xs font-bold mb-1 bg-indigo-200 dark:bg-indigo-800">
            Promedio
          </Badge>
        </div>

        <div className="min-w-max border-r border-gray-200 dark:border-gray-700 p-2 text-center">
          <Badge variant="secondary" className="text-xs font-bold mb-1 bg-indigo-200 dark:bg-indigo-800">
            Promedio
          </Badge>
        </div>

        {/* Final */}
        <div className="min-w-max p-2 text-center">
          <Badge variant="secondary" className="text-xs font-bold mb-1 bg-gray-300 dark:bg-gray-600">
            Promedio
          </Badge>
        </div>
      </div>

      {/* ========== FILA 4: COMPETENCIAS ERICA ========== */}
      <div className="flex border-b-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
        {/* Columna fija estudiante */}
        <div className="flex">
          <div className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-xs font-bold text-center sticky left-0 z-10 bg-gray-100 dark:bg-gray-700">
            #
          </div>
          <div className="w-48 p-2 border-r border-gray-200 dark:border-gray-700 text-xs font-bold text-center sticky left-16 z-10 bg-gray-100 dark:bg-gray-700">
            Nombre Completo
          </div>
        </div>

        {/* Competencias por período */}
        {qnaPeriods.map((period) => (
          <React.Fragment key={`competencies-${period.qnaNumber}`}>
            {/* Semanas */}
            {period.weeks.map((week) => (
              <div 
                key={`comp-${week.id}`}
                className="min-w-max border-r border-gray-200 dark:border-gray-700 flex"
              >
                {/* Competencias ERICA */}
                {categories.map((category) => (
                  <div 
                    key={`${week.id}-${category.id}`}
                    className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center"
                  >
                    <Badge 
                      variant="outline" 
                      className="text-xs font-bold bg-white dark:bg-gray-800"
                    >
                      {category.code}
                    </Badge>
                  </div>
                ))}
                {/* Total */}
                <div className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center">
                  <Badge 
                    variant="outline" 
                    className="text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30"
                  >
                    T
                  </Badge>
                </div>
              </div>
            ))}

            {/* QNA competencias */}
            <div className="min-w-max border-r border-gray-200 dark:border-gray-700 flex">
              {categories.map((category) => (
                <div 
                  key={`qna-${period.qnaNumber}-${category.id}`}
                  className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center"
                >
                  <Badge 
                    variant="outline" 
                    className="text-xs font-bold bg-yellow-200 dark:bg-yellow-800"
                  >
                    {category.code}
                  </Badge>
                </div>
              ))}
            </div>
          </React.Fragment>
        ))}

        {/* Mensuales competencias */}
        <div className="min-w-max border-r border-gray-200 dark:border-gray-700 flex">
          {categories.map((category) => (
            <div 
              key={`monthly1-${category.id}`}
              className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center"
            >
              <Badge 
                variant="outline" 
                className="text-xs font-bold bg-indigo-200 dark:bg-indigo-800"
              >
                {category.code}
              </Badge>
            </div>
          ))}
        </div>

        <div className="min-w-max border-r border-gray-200 dark:border-gray-700 flex">
          {categories.map((category) => (
            <div 
              key={`monthly2-${category.id}`}
              className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center"
            >
              <Badge 
                variant="outline" 
                className="text-xs font-bold bg-indigo-200 dark:bg-indigo-800"
              >
                {category.code}
              </Badge>
            </div>
          ))}
        </div>

        {/* Final competencias */}
        <div className="min-w-max flex">
          {categories.map((category) => (
            <div 
              key={`final-${category.id}`}
              className="w-16 p-2 border-r border-gray-200 dark:border-gray-700 text-center"
            >
              <Badge 
                variant="outline" 
                className="text-xs font-bold bg-gray-300 dark:bg-gray-600"
              >
                {category.code}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}