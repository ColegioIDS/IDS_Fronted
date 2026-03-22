'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, BarChart3, TrendingUp, TrendingDown, Users, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ComparativeAnalytics } from '@/types/academic-analytics.types';
import * as echarts from 'echarts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ComparativeAnalyticsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  comparative: ComparativeAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Modal que muestra análisis comparativo de una sección
 * Incluye:
 * - Estadísticas de la clase
 * - Distribución de calificaciones (gráfica)
 * - Top 5 y Bottom 5 estudiantes
 * - Posición del estudiante actual (si aplica)
 */
export function ComparativeAnalyticsModal({
  isOpen,
  onOpenChange,
  comparative,
  isLoading,
  error,
}: ComparativeAnalyticsModalProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Gráfica de distribución
  useEffect(() => {
    if (!comparative || !chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      responsive: true,
      color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#444',
        textStyle: { color: '#fff' },
        formatter: (params: any) => {
          if (Array.isArray(params) && params[0]) {
            const value = params[0].value;
            const percentage = ((value / comparative.studentCount) * 100).toFixed(1);
            return `${params[0].name}<br/>${value} estudiantes (${percentage}%)`;
          }
          return '';
        },
      },
      grid: { left: '3%', right: '3%', bottom: '20%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Excelente\n(≥90)', 'Bueno\n(80-89)', 'Satisfactorio\n(70-79)', 'Necesita Mejora\n(<70)'],
        axisLabel: { color: '#666' },
        axisLine: { lineStyle: { color: '#ddd' } },
      },
      yAxis: {
        type: 'value',
        name: 'Estudiantes',
        axisLabel: { color: '#666' },
        axisLine: { lineStyle: { color: '#ddd' } },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      series: [
        {
          name: 'Cantidad',
          data: [
            comparative.distribution.excellent,
            comparative.distribution.onTrack,
            comparative.distribution.atRisk,
          ],
          type: 'bar',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [comparative]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[40vw] !max-w-[40vw] !max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Análisis Comparativo de Sección</DialogTitle>
          <DialogDescription>
            {comparative?.section.name} - {comparative?.grade.name}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {comparative && !isLoading && (
          <div className="space-y-6">
            {/* Estadísticas de la Clase */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Total Estudiantes</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {comparative.studentCount}
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Promedio Clase</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {comparative.classAverage.toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Mediana</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {comparative.classMedian.toFixed(2)}
                </p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Desv. Est.</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {comparative.standardDeviation.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Gráfica de Distribución */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Distribución de Calificaciones
              </h3>
              <div
                ref={chartRef}
                className="w-full h-64 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
              />
            </div>

            {/* Top 5 Estudiantes */}
            {comparative.topStudents.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Top 5 Mejores Estudiantes
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50 dark:bg-emerald-950">
                        <TableHead className="text-emerald-900 dark:text-emerald-300">#</TableHead>
                        <TableHead className="text-emerald-900 dark:text-emerald-300">Estudiante</TableHead>
                        <TableHead className="text-emerald-900 dark:text-emerald-300">Promedio</TableHead>
                        <TableHead className="text-emerald-900 dark:text-emerald-300">Percentil</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparative.topStudents.map((student, idx) => (
                        <TableRow key={student.student.id} className="border-b border-gray-200 dark:border-slate-700">
                          <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {student.student.lastNames}, {student.student.givenNames}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{student.promedio.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                              {student.percentile.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* At-Risk Estudiantes */}
            {comparative.atRiskStudents.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  Estudiantes en Riesgo
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-red-50 dark:bg-red-950">
                        <TableHead className="text-red-900 dark:text-red-300">#</TableHead>
                        <TableHead className="text-red-900 dark:text-red-300">Estudiante</TableHead>
                        <TableHead className="text-red-900 dark:text-red-300">Promedio</TableHead>
                        <TableHead className="text-red-900 dark:text-red-300">Desviación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparative.atRiskStudents.map((student, idx) => (
                        <TableRow key={student.student.id} className="border-b border-gray-200 dark:border-slate-700">
                          <TableCell className="font-semibold text-red-600 dark:text-red-400">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {student.student.lastNames}, {student.student.givenNames}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{student.promedio.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              {student.deviation > 0 ? '+' : ''}{student.deviation.toFixed(2)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
