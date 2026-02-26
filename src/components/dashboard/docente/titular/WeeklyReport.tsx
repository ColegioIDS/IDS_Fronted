'use client';

import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Card } from '@/components/ui/card';
import type { AttendanceReportResponse } from '@/types/dashboard.types';

interface WeeklyReportProps {
  data: AttendanceReportResponse;
}

interface AttendanceStatus {
  id: number;
  code: string;
  name: string;
  colorCode: string;
}

export default function WeeklyReport({ data }: WeeklyReportProps) {
  const weeklyData = data as any;

  const { dayPattern, studentWeeklyData, statusColorMap, summary } = useMemo(() => {
    // Build status color map from availableStatuses
    const colorMap: { [key: string]: { name: string; code: string; color: string } } = {};
    
    if (weeklyData.availableStatuses) {
      weeklyData.availableStatuses.forEach((status: AttendanceStatus) => {
        const trimmedName = status.name.trim().toLowerCase();
        colorMap[trimmedName] = {
          name: status.name.trim(),
          code: status.code,
          color: status.colorCode,
        };
      });
    }

    // Process byDayOfWeek data for day pattern chart
    const dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const dayData: { [key: string]: { present: number; unjustified: number; justified: number } } = {};
    
    dayOrder.forEach(day => {
      dayData[day] = { present: 0, unjustified: 0, justified: 0 };
    });

    weeklyData.byDayOfWeek.forEach((day: any) => {
      if (dayData[day.dayOfWeek]) {
        dayData[day.dayOfWeek] = {
          present: Math.round(day.presentPercentage),
          unjustified: Math.round(day.unjustifiedAbsencePercentage),
          justified: Math.round(day.justifiedAbsencePercentage),
        };
      }
    });

    // Process byStudent data for summary table (sorted by name)
    const students = (weeklyData.byStudent || [])
      .map((student: any) => ({
        ...student,
        displayName: student.studentName.trim(),
      }))
      .sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));

    // Calculate summary
    const totalStudents = students.length;
    const avgAttendance = weeklyData.summary?.averageAttendancePercentage || 0;

    return {
      dayPattern: dayData,
      studentWeeklyData: students,
      statusColorMap: colorMap,
      summary: {
        totalStudents,
        avgAttendance,
        studentsWithAttendance: weeklyData.summary?.studentsWithAttendance || 0,
        totalWeeks: weeklyData.summary?.totalWeeks || 0,
      },
    };
  }, [weeklyData]);

  if (!dayPattern || !studentWeeklyData) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-500">
        No hay datos de asistencia disponibles
      </div>
    );
  }

  const hexToRgba = (hex: string, opacity: number) => {
    const trimmedHex = hex.replace('#', '');
    const r = parseInt(trimmedHex.substring(0, 2), 16);
    const g = parseInt(trimmedHex.substring(2, 4), 16);
    const b = parseInt(trimmedHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Day pattern chart
  const dayCategories = Object.keys(dayPattern).filter(day => dayPattern[day].present > 0 || dayPattern[day].unjustified > 0 || dayPattern[day].justified > 0);
  
  const dayChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      background: 'transparent',
      stacked: true,
    },
    colors: [
      hexToRgba('#21c442', 0.8), // Present - green
      hexToRgba('#e22400', 0.8), // Unjustified - red
      hexToRgba('#f5ec00', 0.8), // Justified - yellow
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: dayCategories,
      axisBorder: {
        show: true,
        color: '#e2e8f0',
      },
      axisTicks: {
        show: true,
        color: '#e2e8f0',
      },
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Porcentaje (%)',
        style: {
          color: '#64748b',
          fontSize: '12px',
        },
      },
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
      max: 100,
    },
    grid: {
      borderColor: '#e2e8f0',
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) => `${val}%`,
      },
    },
    legend: {
      position: 'bottom',
      labels: {
        colors: '#64748b',
      },
    },
  };

  const dayChartSeries = [
    {
      name: 'Asistencia',
      data: dayCategories.map(day => dayPattern[day]?.present || 0),
    },
    {
      name: 'Inasistencia',
      data: dayCategories.map(day => dayPattern[day]?.unjustified || 0),
    },
    {
      name: 'Justificada',
      data: dayCategories.map(day => dayPattern[day]?.justified || 0),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Asistencia Promedio</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {summary.avgAttendance.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {summary.studentsWithAttendance} estudiantes
          </p>
        </Card>

        <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total de Estudiantes</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {summary.totalStudents}
          </p>
          <p className="text-xs text-slate-500 mt-1">Con registros</p>
        </Card>

        <Card className="p-4 bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-900/30">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Semanas Reportadas</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {summary.totalWeeks}
          </p>
          <p className="text-xs text-slate-500 mt-1">Período actual</p>
        </Card>
      </div>

      {/* Day of Week Pattern Chart */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Patrón de Asistencia por Día
        </h3>
        <div className="w-full h-80">
          <Chart
            options={dayChartOptions}
            series={dayChartSeries}
            type="bar"
            height="100%"
          />
        </div>
      </Card>

      {/* Students Weekly Summary */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Resumen de Asistencia Semanal por Estudiante
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-center py-3 px-2 font-semibold text-slate-600 dark:text-slate-400 w-10">
                  #
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
                  Estudiante
                </th>
                <th className="text-center py-3 px-4 font-semibold text-green-600 dark:text-green-400">
                  Presente
                </th>
                <th className="text-center py-3 px-4 font-semibold text-red-600 dark:text-red-400">
                  Ausente
                </th>
                <th className="text-center py-3 px-4 font-semibold text-amber-600 dark:text-amber-400">
                  Justificado
                </th>
                <th className="text-center py-3 px-4 font-semibold text-blue-600 dark:text-blue-400">
                  Total Asistencia
                </th>
                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
                  Asistencia %
                </th>
              </tr>
            </thead>
            <tbody>
              {studentWeeklyData.map((student: any, idx: number) => {
                // Get the first week's data (or aggregate if multiple weeks)
                const weekData = student.weeklyData?.[0] || {};
                const attendancePercentage = student.totalWeeklyAttendancePercentage || 0;
                
                return (
                  <tr
                    key={`${student.enrollmentId}-${idx}`}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="text-center py-3 px-2 text-slate-500 dark:text-slate-500 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                      {student.displayName}
                    </td>
                    <td className="text-center py-3 px-4 text-green-600 dark:text-green-400 font-semibold">
                      {weekData.presentDays || 0}
                    </td>
                    <td className="text-center py-3 px-4 text-red-600 dark:text-red-400 font-semibold">
                      {weekData.unjustifiedAbsentDays || 0}
                    </td>
                    <td className="text-center py-3 px-4 text-amber-600 dark:text-amber-400 font-semibold">
                      {weekData.justifiedAbsentDays || 0}
                    </td>
                    <td className="text-center py-3 px-4 text-blue-600 dark:text-blue-400 font-semibold">
                      {weekData.presentDays || 0}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span 
                        className={`font-semibold ${
                          attendancePercentage >= 90 
                            ? 'text-green-600 dark:text-green-400' 
                            : attendancePercentage >= 70
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {attendancePercentage.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
