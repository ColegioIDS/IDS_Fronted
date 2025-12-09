// src/components/erica-evaluations/evaluation-grid/grid-stats.tsx
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  TrendingUp,
  Award
} from 'lucide-react';

// Types
interface Stats {
  totalStudents: number;
  studentsWithEvaluations: number;
  fullyEvaluatedStudents: number;
  averagePoints: number;
  completionRate: number;
  evaluationRate: number;
}

interface Category {
  id: number;
  code: string;
  name: string;
  order: number;
}

interface GridStatsProps {
  stats: Stats;
  categories: Category[];
  totalStudents: number;
}

// ==================== COMPONENTE ====================
export default function GridStats({
  stats,
  categories,
  totalStudents
}: GridStatsProps) {

  // ========== COMPUTED VALUES ==========
  
  const completionPercentage = useMemo(() => {
    return Math.round(stats.completionRate);
  }, [stats.completionRate]);

  const evaluationPercentage = useMemo(() => {
    return Math.round(stats.evaluationRate);
  }, [stats.evaluationRate]);

  const averagePointsPercentage = useMemo(() => {
    // Asumiendo que el máximo de puntos es 1.0 por categoría
    return Math.round((stats.averagePoints / categories.length) * 100);
  }, [stats.averagePoints, categories.length]);

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // ========== RENDER ==========
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Estadísticas del Grid
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* ========== ESTUDIANTES TOTALES ========== */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Total Estudiantes
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalStudents}
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Con evaluaciones</span>
                  <span>{stats.studentsWithEvaluations}</span>
                </div>
                <Progress 
                  value={evaluationPercentage} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {evaluationPercentage}% han sido evaluados
                </div>
              </div>
            </div>
          </div>

          {/* ========== COMPLETITUD ========== */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Completitud
              </span>
            </div>
            
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${getPerformanceColor(completionPercentage)}`}>
                {completionPercentage}%
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Completos</span>
                  <span>{stats.fullyEvaluatedStudents}</span>
                </div>
                <Progress 
                  value={completionPercentage} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {stats.fullyEvaluatedStudents} de {stats.totalStudents} estudiantes
                </div>
              </div>
            </div>
          </div>

          {/* ========== PROMEDIO DE PUNTOS ========== */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Promedio
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.averagePoints.toFixed(2)}
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>De {categories.length}.00</span>
                  <span>{averagePointsPercentage}%</span>
                </div>
                <Progress 
                  value={averagePointsPercentage} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Rendimiento promedio
                </div>
              </div>
            </div>
          </div>

          {/* ========== ESTADO GENERAL ========== */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Estado
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {completionPercentage >= 80 ? (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Excelente
                  </Badge>
                ) : completionPercentage >= 60 ? (
                  <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                    Bueno
                  </Badge>
                ) : completionPercentage >= 40 ? (
                  <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                    Regular
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Necesita Atención
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Faltan por evaluar:
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {stats.totalStudents - stats.fullyEvaluatedStudents} estudiantes
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(((stats.totalStudents - stats.fullyEvaluatedStudents) * categories.length))} evaluaciones pendientes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== BARRA DE PROGRESO GENERAL ========== */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Progreso General del Grid
              </h4>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {completionPercentage}% completado
              </span>
            </div>
            
            <Progress 
              value={completionPercentage} 
              className="h-3"
            />
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-green-600 dark:text-green-400">
                  {stats.fullyEvaluatedStudents}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Completos</div>
              </div>
              
              <div className="text-center">
                <div className="font-medium text-yellow-600 dark:text-yellow-400">
                  {stats.studentsWithEvaluations - stats.fullyEvaluatedStudents}
                </div>
                <div className="text-gray-500 dark:text-gray-400">En progreso</div>
              </div>
              
              <div className="text-center">
                <div className="font-medium text-gray-600 dark:text-gray-400">
                  {stats.totalStudents - stats.studentsWithEvaluations}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Sin evaluar</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}