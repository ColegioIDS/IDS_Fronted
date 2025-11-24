'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface SectionComparisonChartProps {
  sections?: Array<{
    name: string;
    avgAttendance: number;
  }>;
  height?: number;
}

/**
 * Gráfico de Comparación de Secciones
 * Muestra un gráfico de barras comparando asistencia por sección
 */
export function SectionComparisonChart({
  sections = [
    { name: '6to A', avgAttendance: 89.5 },
    { name: '6to B', avgAttendance: 91.2 },
    { name: '6to C', avgAttendance: 86.7 },
    { name: '6to D', avgAttendance: 93.1 },
  ],
  height = 300,
}: SectionComparisonChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Inicializar gráfico
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
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
        data: sections.map((s) => s.name),
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
        min: 70,
        max: 100,
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
          name: 'Asistencia Promedio',
          data: sections.map((s) => s.avgAttendance),
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: '#3b82f6',
              },
              {
                offset: 1,
                color: '#1e40af',
              },
            ]),
            borderRadius: [8, 8, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#60a5fa',
                },
                {
                  offset: 1,
                  color: '#3b82f6',
                },
              ]),
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
        axisPointer: {
          type: 'shadow',
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
  }, [sections]);

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
