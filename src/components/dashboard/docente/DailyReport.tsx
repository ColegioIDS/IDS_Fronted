'use client';

import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import type { AttendanceReportResponse, DailyReportResponse } from '@/types/dashboard.types';

interface DailyReportProps {
  data: AttendanceReportResponse;
}

interface AttendanceStatus {
  id: number;
  code: string;
  name: string;
  colorCode: string;
}

export default function DailyReport({ data }: DailyReportProps) {
  const dailyData = data as any; // Using any temporarily to access availableStatuses

  const { statusDistribution, studentTimeline, statusColorMap, summary, studentsWithoutAttendance } = useMemo(() => {
    // Build status color map from availableStatuses
    const colorMap: { [key: string]: { name: string; code: string; color: string } } = {};
    
    if (dailyData.availableStatuses) {
      dailyData.availableStatuses.forEach((status: AttendanceStatus) => {
        const normalizedName = status.name.trim().toLowerCase();
        colorMap[normalizedName] = {
          name: status.name.trim(),
          code: status.code,
          color: status.colorCode,
        };
      });
    }

    // Use byStatus directly from API - maintains order and tracks colors
    const statusData: Array<{ name: string; count: number; color: string }> = [];
    const statusMap: { [key: string]: number } = {};
    
    dailyData.byStatus.forEach((status: any) => {
      const statusNameTrimmed = status.status.trim();
      const statusNameLower = statusNameTrimmed.toLowerCase();
      
      if (!statusMap[statusNameLower]) {
        // Search for the matching status in availableStatuses for color
        const matchedStatus = dailyData.availableStatuses?.find((s: AttendanceStatus) => 
          s.name.trim().toLowerCase() === statusNameLower
        );
        
        const color = matchedStatus?.colorCode || '#6B7280';
        statusData.push({
          name: statusNameTrimmed,
          count: status.count,
          color: color,
        });
        statusMap[statusNameLower] = status.count;
      } else {
        statusMap[statusNameLower] += status.count;
      }
    });

    // Build categories and values for chart with embedded colors
    const categories = statusData.map(s => s.name);
    const values = statusData.map(s => s.count);
    const chartColors = statusData.map(s => s.color);

    // Build timeline from byDay, preserving all records (multiple dates per student)
    const records: { student: string; date: string; status: string; justification?: string }[] = [];
    
    dailyData.byDay.forEach((day: any) => {
      day.byStudent.forEach((student: any) => {
        records.push({
          student: student.studentName,
          date: day.date,  // YYYY-MM-DD format
          status: student.status.trim(),
          justification: student.notes || undefined,
        });
      });
    });

    // Sort by student name, then by date
    records.sort((a, b) => {
      const nameCompare = a.student.localeCompare(b.student);
      if (nameCompare !== 0) return nameCompare;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Get students without attendance
    const noAttendanceStudents = (dailyData.byStudent || [])
      .filter((s: any) => !s.hasAttendance)
      .map((s: any) => s.studentName)
      .sort((a: string, b: string) => a.localeCompare(b));

    return {
      statusDistribution: {
        categories,
        values,
        chartColors,
      },
      studentTimeline: records,
      statusColorMap: colorMap,
      summary: {
        present: statusMap['asistencia'] || 0,
        absent: statusMap['inasistencia'] || 0,
        justified: statusMap['justificada'] || 0,
        total: Object.values(statusMap).reduce((a, b) => a + (b as number), 0),
      },
      studentsWithoutAttendance: noAttendanceStudents,
    };
  }, [dailyData]);

  const hexToRgba = (hex: string, opacity: number) => {
    const trimmedHex = hex.replace('#', '');
    const r = parseInt(trimmedHex.substring(0, 2), 16);
    const g = parseInt(trimmedHex.substring(2, 4), 16);
    const b = parseInt(trimmedHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const formatDateFromString = (dateStr: string) => {
    // Parse YYYY-MM-DD string without timezone conversion
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-ES');
  };

  if (!statusDistribution || !studentTimeline) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-500">
        No hay datos de asistencia disponibles
      </div>
    );
  }

  const chartOptions: ApexCharts.ApexOptions = {
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
    },
    colors: statusDistribution.chartColors.map(colorHex => 
      hexToRgba(colorHex, 0.8) // 20% transparency, 80% opacity
    ),
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
        distributed: true,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      formatter: (val) => String(val),
      style: {
        fontSize: '12px',
        fontWeight: 600,
      },
    },
    xaxis: {
      categories: statusDistribution.categories,
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
        text: 'Cantidad',
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
    },
    grid: {
      borderColor: '#e2e8f0',
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) => `${val} estudiantes`,
      },
    },
  };

  const chartSeries = [
    {
      name: 'Registros de Asistencia',
      data: statusDistribution.values,
    },
  ];

  const getStatusColor = (status: string) => {
    const trimmed = status.trim().toLowerCase();
    const statusInfo = statusColorMap[trimmed];
    
    if (statusInfo) {
      // Convert hex to rgba for light background
      const hex = statusInfo.color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      return {
        bg: `rgba(${r}, ${g}, ${b}, 0.15)`,
        text: statusInfo.color,
        border: statusInfo.color,
      };
    }
    
    return {
      bg: '#f3f4f6',
      text: '#6b7280',
      border: '#d1d5db',
    };
  };

  const getStatusLabel = (status: string) => {
    const trimmed = status.trim().toLowerCase();
    const statusInfo = statusColorMap[trimmed];
    return statusInfo ? statusInfo.name : status.trim();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Asistencias</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {summary.present}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {summary.total > 0 ? ((summary.present / summary.total) * 100).toFixed(1) : 0}%
          </p>
        </Card>

        <Card className="p-4 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Inasistencias</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {summary.absent}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {summary.total > 0 ? ((summary.absent / summary.total) * 100).toFixed(1) : 0}%
          </p>
        </Card>

        <Card className="p-4 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Justificadas</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {summary.justified}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {summary.total > 0 ? ((summary.justified / summary.total) * 100).toFixed(1) : 0}%
          </p>
        </Card>

        <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {summary.total}
          </p>
          <p className="text-xs text-slate-500 mt-1">Registros</p>
        </Card>
      </div>

      {/* Status Distribution Chart */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Distribución de Asistencia
        </h3>
        <div className="w-full h-80">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="bar"
            height="100%"
          />
        </div>
      </Card>

      {/* Student Timeline */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Registro por Estudiante
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
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
                  Fecha
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
                  Estado
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
                  Nota
                </th>
              </tr>
            </thead>
            <tbody>
              {studentTimeline.map((record, idx) => {
                const colorInfo = getStatusColor(record.status);
                return (
                  <tr
                    key={`${record.student}-${idx}`}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="text-center py-3 px-2 text-slate-500 dark:text-slate-500 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                      {record.student}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {formatDateFromString(record.date)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        style={{
                          backgroundColor: colorInfo.bg,
                          color: colorInfo.text,
                          borderColor: colorInfo.border,
                        }}
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium border"
                      >
                        {getStatusLabel(record.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {record.justification ? (
                        <span className="text-slate-600 dark:text-slate-400 text-xs">
                          {record.justification}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Students Without Attendance */}
      {studentsWithoutAttendance.length > 0 && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Estudiantes sin Registro de Asistencia
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                Los siguientes {studentsWithoutAttendance.length} estudiante(s) no tienen registro de asistencia:
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentsWithoutAttendance.map((student: string, idx: number) => (
              <div
                key={`no-att-${idx}`}
                className="p-3 bg-white dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-800/50 flex items-center gap-2"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-200 dark:bg-yellow-900/50 flex items-center justify-center text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                  {idx + 1}
                </span>
                <span className="text-sm text-yellow-900 dark:text-yellow-100">{student}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
