// src/components/erica-history/qna-grid/qna-grid-stats.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Target
} from 'lucide-react';

// ==================== INTERFACES ====================
interface QnaStats {
  totalStudents: number;
  weeksCount: number;
  categoriesCount: number;
  totalPossibleEvaluations: number;
  completedEvaluations: number;
  completionPercentage: number;
  averageStudentCompletion: number;
}

interface GridStats {
  totalStudents: number;
  studentsWithEvaluations: number;
  evaluationRate: number;
}

interface QnaGridStatsProps {
  stats: QnaStats;
  gridStats: GridStats;
  totalWeeks: number;
}

// ==================== COMPONENTE ====================
export default function QnaGridStats({
  stats,
  gridStats,
  totalWeeks
}: QnaGridStatsProps) {

  // ========== COMPUTED VALUES ==========
  
  const completionStatus = React.useMemo(() => {
    if (stats.completionPercentage >= 80) {
      return {
        status: 'excellent',
        text: 'Excelente',
        color: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        icon: CheckCircle
      };
    } else if (stats.completionPercentage >= 60) {
      return {
        status: 'good',
        text: 'Bueno',
        color: 'text-blue-700 dark:text-blue-300',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        icon: TrendingUp
      };
    } else if (stats.completionPercentage >= 30) {
      return {
        status: 'fair',
        text: 'Regular',
        color: 'text-yellow-700 dark:text-yellow-300',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        icon: Target
      };
    } else {
      return {
        status: 'poor',
        text: 'Necesita Atención',
        color: 'text-red-700 dark:text-red-300',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        icon: AlertTriangle
      };
    }
  }, [stats.completionPercentage]);

  const expectedQnaCalculations = totalWeeks / 2; // 4 QNAs para 8 semanas
  const expectedMonthlyCalculations = expectedQnaCalculations / 2; // 2 Mensuales

  // ========== RENDER ==========
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* ========== ESTADÍSTICA GENERAL ========== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalStudents}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {gridStats.studentsWithEvaluations} evaluados
            </Badge>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Tasa de evaluación: {gridStats.evaluationRate.toFixed(1)}%
          </div>
        </CardContent>
      </Card>

      {/* ========== EVALUACIONES COMPLETADAS ========== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Evaluaciones</CardTitle>
          <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.completedEvaluations}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            de {stats.totalPossibleEvaluations} posibles
          </div>
          <Progress 
            value={stats.completionPercentage} 
            className="mt-2 h-2"
          />
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {stats.completionPercentage.toFixed(1)}% completado
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ========== ESTADO DE FINALIZACIÓN ========== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estado General</CardTitle>
          <completionStatus.icon className={`h-4 w-4 ${completionStatus.color}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${completionStatus.color}`}>
            {completionStatus.text}
          </div>
          <div className={`text-sm p-2 rounded-lg mt-2 ${completionStatus.bgColor}`}>
            <div className={`font-medium ${completionStatus.color}`}>
              Promedio por estudiante: {stats.averageStudentCompletion.toFixed(1)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========== ESTRUCTURA ACADÉMICA ========== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estructura</CardTitle>
          <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Semanas:</span>
              <Badge variant="outline" className="text-xs">
                {stats.weeksCount}/8
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Competencias:</span>
              <Badge variant="outline" className="text-xs">
                {stats.categoriesCount}/5
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">QNAs:</span>
              <Badge variant="secondary" className="text-xs">
                {expectedQnaCalculations}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Mensuales:</span>
              <Badge variant="secondary" className="text-xs">
                {expectedMonthlyCalculations}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========== DETALLES ADICIONALES (Span completo) ========== */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Resumen Detallado del Sistema QNA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cálculos QNA */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Cálculos QNA</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <span className="text-gray-700 dark:text-gray-300">QNA1 (Sem 1-2):</span>
                  <Badge variant="outline" className="text-yellow-700 dark:text-yellow-300">
                    Suma
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <span className="text-gray-700 dark:text-gray-300">QNA2 (Sem 3-4):</span>
                  <Badge variant="outline" className="text-yellow-700 dark:text-yellow-300">
                    Suma
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <span className="text-gray-700 dark:text-gray-300">QNA3 (Sem 5-6):</span>
                  <Badge variant="outline" className="text-yellow-700 dark:text-yellow-300">
                    Suma
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <span className="text-gray-700 dark:text-gray-300">QNA4 (Sem 7-8):</span>
                  <Badge variant="outline" className="text-yellow-700 dark:text-yellow-300">
                    Suma
                  </Badge>
                </div>
              </div>
            </div>

            {/* Promedios Mensuales */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Promedios Mensuales</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                  <span className="text-gray-700 dark:text-gray-300">Mensual 1:</span>
                  <div className="text-right">
                    <Badge variant="outline" className="text-indigo-700 dark:text-indigo-300">
                      (QNA1 + QNA2) ÷ 2
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                  <span className="text-gray-700 dark:text-gray-300">Mensual 2:</span>
                  <div className="text-right">
                    <Badge variant="outline" className="text-indigo-700 dark:text-indigo-300">
                      (QNA3 + QNA4) ÷ 2
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-gray-700 dark:text-gray-300">Final:</span>
                  <div className="text-right">
                    <Badge variant="outline" className="text-gray-700 dark:text-gray-300">
                      (M1 + M2) ÷ 2
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Interpretación de Colores */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Interpretación de Resultados</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 dark:bg-green-800 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Verde: Excelente (≥3.25)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-800 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Amarillo: Bueno (≥2.0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 dark:bg-red-800 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Rojo: Necesita mejora (&lt;2.0)</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <strong>Nota:</strong> Los colores se calculan automáticamente según los rangos configurados en el sistema QNA.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}