'use client';

import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { AttendanceReportResponse } from '@/types/dashboard.types';

interface BimestralReportProps {
  data: AttendanceReportResponse;
}

interface AttendanceStatus {
  id: number;
  code: string;
  name: string;
  colorCode: string;
}

export default function BimestralReport({ data }: BimestralReportProps) {
  const bimestralData = data as any;

  const { trendChartData, statusChartData, studentSummary, statusColorMap, summary } = useMemo(() => {
    // Build status color map from availableStatuses
    const colorMap: { [key: string]: { name: string; code: string; color: string } } = {};
    
    if (bimestralData.availableStatuses) {
      bimestralData.availableStatuses.forEach((status: AttendanceStatus) => {
        const trimmedName = status.name.trim().toLowerCase();
        colorMap[trimmedName] = {
          name: status.name.trim(),
          code: status.code,
          color: status.colorCode,
        };
      });
    }

    // Process attendanceTrend for trend chart
    const trendWeeks = bimestralData.attendanceTrend.map((t: any) => `Sem ${t.week}`);
    const trendPercentages = bimestralData.attendanceTrend.map((t: any) => parseFloat(t.percentage.toFixed(1)));

    // Process statusDistribution for status chart
    const statusLabels = bimestralData.statusDistribution.map((s: any) => s.status.trim());
    const statusValues = bimestralData.statusDistribution.map((s: any) => s.count);
    const statusPercentages = bimestralData.statusDistribution.map((s: any) => parseFloat(s.percentage.toFixed(1)));

    // Process byStudent for student table
    const students = (bimestralData.byStudent || [])
      .map((student: any) => ({
        ...student,
        displayName: student.studentName.trim(),
      }))
      .sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));

    // Count students by risk level
    const riskLevels = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    students.forEach((student: any) => {
      if (student.riskLevel) {
        riskLevels[student.riskLevel as keyof typeof riskLevels]++;
      }
    });

    // Get at-risk students
    const atRiskStudents = students.filter((s: any) => s.isAtRisk).slice(0, 5);

    return {
      trendChartData: {
        weeks: trendWeeks,
        percentages: trendPercentages,
      },
      statusChartData: {
        labels: statusLabels,
        values: statusValues,
        percentages: statusPercentages,
      },
      studentSummary: students,
      statusColorMap: colorMap,
      summary: {
        totalStudents: bimestralData.summary?.totalStudents || 0,
        avgAttendance: bimestralData.summary?.averageAttendancePercentage || 0,
        totalRecords: bimestralData.summary?.totalRecords || 0,
        riskLevels,
        atRiskCount: bimestralData.summary?.atRiskStudentCount || 0,
        atRiskStudents,
      },
    };
  }, [bimestralData]);

  if (!trendChartData || !statusChartData) {
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

  // Trend Chart
  const trendOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
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
    colors: ['#10B981'],
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    markers: {
      size: 5,
      colors: ['#10B981'],
      strokeColors: '#fff',
      strokeWidth: 2,
    },
    xaxis: {
      categories: trendChartData.weeks,
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
        text: 'Asistencia (%)',
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
      min: 50,
    },
    grid: {
      borderColor: '#e2e8f0',
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) => `${val.toFixed(1)}%`,
      },
    },
  };

  const trendSeries = [
    {
      name: 'Asistencia Bimestral',
      data: trendChartData.percentages,
    },
  ];

  // Status Distribution Chart
  const statusColors = statusChartData.labels.map((label: string) => {
    const key = label.trim().toLowerCase();
    return statusColorMap[key]?.color || '#6B7280';
  });

  const statusOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'donut',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: true,
        },
      },
      background: 'transparent',
    },
    colors: statusColors.map((color: string) => hexToRgba(color, 0.8)),
    labels: statusChartData.labels,
    legend: {
      position: 'bottom',
      labels: {
        colors: '#64748b',
      },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) => `${val} registros`,
      },
    },
  };

  const statusSeries = statusChartData.values;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return { badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: '✓', color: 'text-green-600' };
      case 'MEDIUM':
        return { badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '!', color: 'text-yellow-600' };
      case 'HIGH':
        return { badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: '!', color: 'text-orange-600' };
      case 'CRITICAL':
        return { badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '!', color: 'text-red-600' };
      default:
        return { badge: 'bg-slate-100 text-slate-700', icon: '-', color: 'text-slate-600' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Asistencia Promedio</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {summary.avgAttendance.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">{summary.totalRecords} registros</p>
        </Card>

        <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total de Estudiantes</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {summary.totalStudents}
          </p>
          <p className="text-xs text-slate-500 mt-1">Con asistencia</p>
        </Card>

        <Card className="p-4 bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-900/30">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Riesgo Bajo</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {summary.riskLevels.LOW}
          </p>
          <p className="text-xs text-slate-500 mt-1">Estudiantes</p>
        </Card>

        <Card className="p-4 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">En Riesgo</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {summary.riskLevels.HIGH + summary.riskLevels.CRITICAL}
          </p>
          <p className="text-xs text-slate-500 mt-1">Requieren atención</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Tendencia de Asistencia Bimestral
          </h3>
          <div className="w-full h-80">
            <Chart
              options={trendOptions}
              series={trendSeries}
              type="line"
              height="100%"
            />
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Distribución de Asistencia
          </h3>
          <div className="w-full h-80">
            <Chart
              options={statusOptions}
              series={statusSeries}
              type="donut"
              height="100%"
            />
          </div>
        </Card>
      </div>

      {/* At-Risk Students */}
      {summary.atRiskStudents.length > 0 && (
        <Card className="p-4 bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              Estudiantes en Riesgo ({summary.atRiskStudents.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.atRiskStudents.map((student: any, idx: number) => {
              const riskColor = getRiskColor(student.riskLevel);
              return (
                <div
                  key={`${student.enrollmentId}-${idx}`}
                  className="p-3 bg-white dark:bg-orange-900/20 rounded-lg border border-orange-300 dark:border-orange-800/50"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full ${riskColor.badge} flex items-center justify-center text-xs font-bold`}>
                      {riskColor.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {student.displayName}
                      </p>
                      <span className={`inline-block text-xs font-medium mt-1 px-2 py-0.5 rounded-full ${riskColor.badge}`}>
                        {student.riskLevel || 'SIN RIESGO'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <p>Asistencia: <span className="font-semibold text-slate-900 dark:text-slate-100">{student.attendancePercentage.toFixed(1)}%</span></p>
                    {student.lastAbsenceDate && (
                      <p>Última falta: <span className="font-semibold text-slate-900 dark:text-slate-100">{new Date(student.lastAbsenceDate).toLocaleDateString('es-ES')}</span></p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Students Table */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Resumen de Asistencia Bimestral por Estudiante
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
                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
                  Asistencia %
                </th>
                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
                  Faltas Consecutivas
                </th>
                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
                  Riesgo
                </th>
              </tr>
            </thead>
            <tbody>
              {studentSummary.map((student: any, idx: number) => {
                const riskColor = getRiskColor(student.riskLevel);
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
                    <td className="text-center py-3 px-4">
                      <span className={`font-semibold ${
                        student.attendancePercentage >= 95
                          ? 'text-green-600 dark:text-green-400'
                          : student.attendancePercentage >= 80
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {student.attendancePercentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">
                      {student.consecutiveAbsences || 0}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${riskColor.badge}`}>
                        {student.riskLevel || 'BAJO'}
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
