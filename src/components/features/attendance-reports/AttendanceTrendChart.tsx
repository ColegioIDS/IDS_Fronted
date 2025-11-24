'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export interface WeeklyTrendData {
  week: number;
  weekStart: string;
  weekEnd: string;
  averageAttendance: number;
  totalRecords: number;
}

interface AttendanceTrendChartProps {
  height?: number;
  data?: WeeklyTrendData[] | null;
  loading?: boolean;
}

/**
 * Gráfico de Tendencia de Asistencia
 * Muestra la evolución semanal de la asistencia promedio
 */
export function AttendanceTrendChart({ height = 300, data = null, loading = false }: AttendanceTrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Inicializar gráfico
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // Preparar datos: usar datos reales si están disponibles, si no usar ejemplo
    let xAxisData: string[] = [];
    let seriesData: number[] = [];
    let minValue = 0;
    let maxValue = 100;

    if (data && data.length > 0) {
      console.log('📈 [TrendChart] Rendering with REAL data:', data);
      xAxisData = data.map((item) => `S${item.week}`);
      seriesData = data.map((item) => item.averageAttendance);
      minValue = Math.max(0, Math.min(...seriesData) - 10);
      maxValue = Math.min(100, Math.max(...seriesData) + 10);
    } else {
      console.log('📈 [TrendChart] Rendering with EXAMPLE data - API data not available yet');
      xAxisData = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'];
      seriesData = [85, 88, 90, 87, 92, 89];
      minValue = 70;
      maxValue = 100;
    }

    const option = {
      responsive: true,
      maintainAspectRatio: true,
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        axisLabel: {
          color: '#6b7280',
        },
      },
      yAxis: {
        type: 'value',
        min: minValue,
        max: maxValue,
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        axisLabel: {
          color: '#6b7280',
          formatter: '{value}%',
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
          },
        },
      },
      series: [
        {
          name: 'Asistencia',
          data: seriesData,
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#3b82f6',
          },
          lineStyle: {
            color: '#3b82f6',
            width: 3,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(59, 130, 246, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(59, 130, 246, 0)',
              },
            ]),
          },
          emphasis: {
            itemStyle: {
              color: '#1e40af',
              borderColor: '#fff',
              borderWidth: 2,
            },
          },
          tooltip: {
            valueFormatter: (value: any) => `${value}%`,
          },
        },
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff',
        },
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';
          const data = params[0];
          return `<div style="padding: 8px;">
            <div style="font-weight: bold;">${data.axisValue}</div>
            <div style="color: #3b82f6;">Asistencia: ${data.value}%</div>
          </div>`;
        },
      },
    };

    chartInstance.current.setOption(option);

    // Manejar redimensionamiento
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  // Manejar dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    if (chartInstance.current) {
      chartInstance.current.setOption({
        xAxis: {
          axisLine: {
            lineStyle: {
              color: isDark ? '#374151' : '#e5e7eb',
            },
          },
          axisLabel: {
            color: isDark ? '#9ca3af' : '#6b7280',
          },
        },
        yAxis: {
          axisLine: {
            lineStyle: {
              color: isDark ? '#374151' : '#e5e7eb',
            },
          },
          axisLabel: {
            color: isDark ? '#9ca3af' : '#6b7280',
          },
          splitLine: {
            lineStyle: {
              color: isDark ? '#1f2937' : '#f3f4f6',
            },
          },
        },
      });
    }
  }, []);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: `${height}px`,
      }}
      className="rounded-lg"
    />
  );
}
