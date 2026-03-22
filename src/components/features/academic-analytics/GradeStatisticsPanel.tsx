'use client';

import { AlertCircle, TrendingDown, Activity, Layers } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GradeDistributionStatistics } from '@/types/academic-analytics.types';

interface GradeStatisticsPanelProps {
  data: GradeDistributionStatistics | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Panel que muestra estadísticas de distribución de calificaciones
 * Incluye:
 * - Medidas de tendencia central
 * - Medidas de dispersión
 * - Gráfica de distribución
 * - Estadísticas descriptivas
 */
export function GradeStatisticsPanel({
  data,
  isLoading,
  error,
}: GradeStatisticsPanelProps) {

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No hay estadísticas disponibles</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Estadísticas de Distribución - {data.grade.name}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {data.section && `Sección ${data.section.name}`}
          {data.course && ` • Curso: ${data.course.name}`}
        </p>
      </div>

      {/* Medidas de Tendencia Central */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Medidas de Tendencia Central
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">Valores que representan el centro de los datos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Media</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.statistics.mean.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Promedio aritmético</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Mediana</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.statistics.median.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Valor central</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Moda</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {data.statistics.mode.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Valor más frecuente</p>
          </div>
        </div>
      </div>

      {/* Medidas de Dispersión */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Medidas de Dispersión
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">Variabilidad de los datos alrededor del centro</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-cyan-50 dark:bg-cyan-950 rounded-lg p-4 border border-cyan-200 dark:border-cyan-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Desv. Estándar</p>
            <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
              {data.statistics.standardDeviation.toFixed(3)}
            </p>
          </div>
          <div className="bg-teal-50 dark:bg-teal-950 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Varianza</p>
            <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
              {data.statistics.variance.toFixed(3)}
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Rango</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {data.statistics.range.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {data.statistics.minScore.toFixed(2)} - {data.statistics.maxScore.toFixed(2)}
            </p>
          </div>
          <div className="bg-lime-50 dark:bg-lime-950 rounded-lg p-4 border border-lime-200 dark:border-lime-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">IQR</p>
            <p className="text-xl font-bold text-lime-600 dark:text-lime-400">
              {data.statistics.iqr.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Q1: {data.statistics.q1.toFixed(1)} | Q3: {data.statistics.q3.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Detalle de Categorías */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Desglose por Categorías
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Excelente (≥90)</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {data.distribution.excellent.count}
            </p>
            <Badge className="mt-2 bg-emerald-200 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-100">
              {data.distribution.excellent.percentage.toFixed(1)}%
            </Badge>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Bueno (80-89)</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.distribution.good.count}
            </p>
            <Badge className="mt-2 bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100">
              {data.distribution.good.percentage.toFixed(1)}%
            </Badge>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Satisfactorio (70-79)</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {data.distribution.satisfactory.count}
            </p>
            <Badge className="mt-2 bg-amber-200 text-amber-800 dark:bg-amber-700 dark:text-amber-100">
              {data.distribution.satisfactory.percentage.toFixed(1)}%
            </Badge>
          </div>
          <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Necesita Mejora (&lt;70)</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {data.distribution.needsImprovement.count}
            </p>
            <Badge className="mt-2 bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100">
              {data.distribution.needsImprovement.percentage.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </div>

      {/* Total de Estudiantes */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Total de Estudiantes Analizados</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{data.totalStudents}</p>
      </div>
    </div>
  );
}
