// src/components/erica-history/shared/academic-context-info.tsx
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookOpen } from 'lucide-react';

// Types
import { SchoolCycle } from '@/types/SchoolCycle';
import { Bimester } from '@/types/SchoolBimesters';
import { AcademicWeek } from '@/types/academic-week.types';

// ==================== INTERFACES ====================
interface AcademicContextInfoProps {
  cycle: SchoolCycle | null;
  bimester: Bimester | null;
  academicWeeks: AcademicWeek[];
}

// ==================== COMPONENTE ====================
export default function AcademicContextInfo({
  cycle,
  bimester,
  academicWeeks
}: AcademicContextInfoProps) {

  // ========== FUNCIONES AUXILIARES ==========
  
  const formatDateRange = (startDate: string | Date, endDate: string | Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric' 
      });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getBimesterProgress = () => {
    if (!bimester) return null;

    const now = new Date();
    const startDate = new Date(bimester.startDate);
    const endDate = new Date(bimester.endDate);
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    if (elapsed <= 0) return { percentage: 0, status: 'No iniciado' };
    if (elapsed >= totalDuration) return { percentage: 100, status: 'Completado' };
    
    const percentage = Math.round((elapsed / totalDuration) * 100);
    return { percentage, status: 'En progreso' };
  };

  const getWeeksSummary = () => {
    if (!academicWeeks || academicWeeks.length === 0) return null;
    
    const totalWeeks = academicWeeks.length;
    const now = new Date();
    
    const completedWeeks = academicWeeks.filter(week => {
      const endDate = new Date(week.endDate);
      return endDate < now;
    }).length;
    
    const currentWeek = academicWeeks.find(week => {
      const startDate = new Date(week.startDate);
      const endDate = new Date(week.endDate);
      return startDate <= now && now <= endDate;
    });

    return {
      total: totalWeeks,
      completed: completedWeeks,
      current: currentWeek,
      remaining: totalWeeks - completedWeeks
    };
  };

  const progress = getBimesterProgress();
  const weeksSummary = getWeeksSummary();

  // ========== RENDER ==========
  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 border-indigo-200 dark:border-indigo-800">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Información principal */}
          <div className="flex items-center space-x-8">
            
            {/* Ciclo Escolar */}
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <div className="text-sm text-gray-500 dark:text-gray-400">Ciclo Escolar</div>
              </div>
              <div className="font-semibold text-indigo-900 dark:text-indigo-100">
                {cycle?.name || 'No seleccionado'}
              </div>
              {cycle && (
                <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                  {formatDateRange(cycle.startDate, cycle.endDate)}
                </div>
              )}
            </div>

            {/* Separador */}
            {cycle && <div className="w-px h-16 bg-indigo-300 dark:bg-indigo-600"></div>}
            
            {/* Bimestre */}
            {bimester && (
              <>
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">Bimestre</div>
                  </div>
                  <div className="font-semibold text-indigo-900 dark:text-indigo-100">
                    {bimester.name}
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                    {formatDateRange(bimester.startDate, bimester.endDate)}
                  </div>
                  {progress && (
                    <Badge 
                      variant="outline" 
                      className="mt-2 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-600"
                    >
                      {progress.status} ({progress.percentage}%)
                    </Badge>
                  )}
                </div>

                <div className="w-px h-16 bg-indigo-300 dark:bg-indigo-600"></div>
              </>
            )}
            
            {/* Semanas Académicas */}
            {weeksSummary && (
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <div className="text-sm text-gray-500 dark:text-gray-400">Semanas Académicas</div>
                </div>
                <div className="font-semibold text-indigo-900 dark:text-indigo-100">
                  {weeksSummary.total} semanas
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600"
                  >
                    {weeksSummary.completed} completadas
                  </Badge>
                  {weeksSummary.remaining > 0 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600"
                    >
                      {weeksSummary.remaining} restantes
                    </Badge>
                  )}
                </div>
                {weeksSummary.current && (
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                    Actual: Semana {weeksSummary.current.number}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Emoji decorativo */}
          <div className="text-4xl">
            📊
          </div>
        </div>

        {/* Barra de progreso del bimestre */}
        {progress && bimester && (
          <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-700">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                Progreso del Bimestre
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {progress.percentage}%
              </span>
            </div>
            <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2">
              <div 
                className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Información de semanas detallada */}
        {academicWeeks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-700">
            <div className="text-sm text-indigo-700 dark:text-indigo-300 font-medium mb-2">
              Desglose de Semanas:
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {academicWeeks.map((week) => {
                const now = new Date();
                const startDate = new Date(week.startDate);
                const endDate = new Date(week.endDate);
                
                let status = 'future';
                if (endDate < now) status = 'completed';
                else if (startDate <= now && now <= endDate) status = 'current';
                
                const statusClasses = {
                  completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600',
                  current: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600',
                  future: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                };
                
                return (
                  <div
                    key={week.id}
                    className={`
                      text-center text-xs px-2 py-1 rounded border
                      ${statusClasses[status as keyof typeof statusClasses]}
                    `}
                    title={`Semana ${week.number}: ${formatDateRange(week.startDate, week.endDate)}`}
                  >
                    S{week.number}
                    {status === 'current' && (
                      <div className="w-1 h-1 bg-blue-500 rounded-full mx-auto mt-1 animate-pulse"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}