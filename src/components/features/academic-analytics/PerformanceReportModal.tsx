'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, BarChart3, TrendingUp, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PerformanceReport } from '@/types/academic-analytics.types';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

interface PerformanceReportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  report: PerformanceReport | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Modal que muestra el reporte detallado de desempeño de un estudiante
 * Incluye:
 * - Información del estudiante
 * - Gráfica de componentes por bimestre
 * - Trend académico
 * - Predicción de nota final
 * - Recomendaciones
 */
export function PerformanceReportModal({
  isOpen,
  onOpenChange,
  report,
  isLoading,
  error,
}: PerformanceReportModalProps) {
  const chartsRef = {
    components: useRef<HTMLDivElement>(null),
    trend: useRef<HTMLDivElement>(null),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'ON_TRACK':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'AT_RISK':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'FAILING':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Gráfica de componentes por bimestre
  useEffect(() => {
    if (!report || !chartsRef.components.current) return;

    const chart = echarts.init(chartsRef.components.current);

    const categories = report.bimesterDetails.map((b) => b.bimesterName);
    const erica = report.bimesterDetails.map((b) => b.components.ericaScore);
    const tasks = report.bimesterDetails.map((b) => b.components.tasksScore);
    const actitudinal = report.bimesterDetails.map((b) => b.components.actitudinalScore);
    const declarativo = report.bimesterDetails.map((b) => b.components.declarativoScore);

    const option: echarts.EChartsOption = {
      responsive: true,
      color: ['#ef4444', '#f97316', '#eab308', '#3b82f6'],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#444',
        textStyle: { color: '#fff' },
      },
      legend: {
        data: ['ERICA (0-40)', 'Tareas (0-20)', 'Actitudinal (0-10)', 'Declarativo (0-30)'],
        bottom: 10,
        textStyle: { color: '#666' },
      },
      grid: { left: '3%', right: '3%', bottom: '15%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: '#666' },
        axisLine: { lineStyle: { color: '#ddd' } },
      },
      yAxis: {
        type: 'value',
        name: 'Puntos',
        axisLabel: { color: '#666' },
        axisLine: { lineStyle: { color: '#ddd' } },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      series: [
        {
          name: 'ERICA (0-40)',
          data: erica,
          type: 'bar',
        },
        {
          name: 'Tareas (0-20)',
          data: tasks,
          type: 'bar',
        },
        {
          name: 'Actitudinal (0-10)',
          data: actitudinal,
          type: 'bar',
        },
        {
          name: 'Declarativo (0-30)',
          data: declarativo,
          type: 'bar',
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
  }, [report]);

  // Gráfica de trend
  useEffect(() => {
    if (!report || !chartsRef.trend.current) return;

    const chart = echarts.init(chartsRef.trend.current);

    const categories = report.bimesterDetails.map((b) => b.bimesterName);
    const averages = report.bimesterDetails.map((b) => b.average);

    const option: echarts.EChartsOption = {
      responsive: true,
      color: ['#3b82f6'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#444',
        textStyle: { color: '#fff' },
        formatter: (params: any) => {
          if (Array.isArray(params) && params[0]) {
            return `${params[0].name}<br/>${params[0].seriesName}: ${params[0].value.toFixed(2)}`;
          }
          return '';
        },
      },
      grid: { left: '3%', right: '3%', bottom: '10%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: '#666' },
        axisLine: { lineStyle: { color: '#ddd' } },
      },
      yAxis: {
        type: 'value',
        name: 'Promedio',
        min: 0,
        max: 100,
        axisLabel: { color: '#666' },
        axisLine: { lineStyle: { color: '#ddd' } },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      series: [
        {
          name: 'Promedio Bimestral',
          data: averages,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0)' },
            ]),
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
  }, [report]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[50vw] !max-w-[50vw] !max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reporte de Desempeño Académico</DialogTitle>
          <DialogDescription>
            Análisis detallado del desempeño del estudiante
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {report && !isLoading && (
          <div className="space-y-6">
            {/* Información del Estudiante */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Estudiante</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {report.student.lastNames}, {report.student.givenNames}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Ciclo</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{report.cycle.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Estado</p>
                  <Badge className={getStatusColor(report.academicStatus)}>
                    {report.academicStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Promedio General</p>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">
                    {report.cumulativeAverages.promedio?.toFixed(2) || '--'}
                  </p>
                </div>
              </div>
            </div>

            {/* Gráfica de Componentes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Desglose por Componentes
              </h3>
              <div
                ref={chartsRef.components}
                className="w-full h-64 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
              />
            </div>

            {/* Gráfica de Trend */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trend Académico
              </h3>
              <div
                ref={chartsRef.trend}
                className="w-full h-64 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
              />
            </div>

            {/* Predicción de Nota Final */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Predicción de Nota Final</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {report.predictedFinalGrade.toFixed(2)}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>

            {/* Recomendaciones */}
            {report.performanceRecommendations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  📋 Recomendaciones
                </h3>
                <ul className="space-y-2">
                  {report.performanceRecommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded"
                    >
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">•</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
