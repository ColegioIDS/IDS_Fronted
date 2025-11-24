'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface StatusDistributionChartProps {
  excellent: number;
  good: number;
  risk: number;
  height?: number;
}

/**
 * Gráfico de Distribución de Estados de Asistencia
 * Muestra un gráfico de pastel con la distribución de estudiantes
 */
export function StatusDistributionChart({
  excellent = 2,
  good = 5,
  risk = 2,
  height = 300,
}: StatusDistributionChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Inicializar gráfico
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const total = excellent + good + risk;

    const option = {
      responsive: true,
      maintainAspectRatio: true,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff',
        },
        formatter: (params: any) => {
          const percentage = ((params.value / total) * 100).toFixed(1);
          return `<div style="padding: 8px;">
            <div style="font-weight: bold;">${params.name}</div>
            <div>${params.value} estudiantes (${percentage}%)</div>
          </div>`;
        },
      },
      legend: {
        orient: 'horizontal',
        bottom: '5%',
        textStyle: {
          color: '#6b7280',
        },
      },
      series: [
        {
          name: 'Estudiantes',
          type: 'pie',
          radius: ['30%', '70%'],
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          data: [
            {
              value: excellent,
              name: 'Excelente',
              itemStyle: {
                color: '#10b981',
              },
            },
            {
              value: good,
              name: 'Buena',
              itemStyle: {
                color: '#3b82f6',
              },
            },
            {
              value: risk,
              name: 'En Riesgo',
              itemStyle: {
                color: '#ef4444',
              },
            },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            color: '#6b7280',
            formatter: '{b}: {c}',
          },
        },
      ],
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
  }, [excellent, good, risk]);

  // Manejar dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    if (chartInstance.current) {
      chartInstance.current.setOption({
        legend: {
          textStyle: {
            color: isDark ? '#9ca3af' : '#6b7280',
          },
        },
        label: {
          color: isDark ? '#9ca3af' : '#6b7280',
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
