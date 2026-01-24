'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AttendanceSummary, RiskStudent } from '@/types/attendance-reports.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
} from 'lucide-react';

interface AttendanceSummaryChartsProps {
  data: AttendanceSummary;
  isLoading?: boolean;
}

export function AttendanceSummaryCharts({
  data,
  isLoading = false,
}: AttendanceSummaryChartsProps) {
  const COLORS = {
    present: '#10b981', // emerald
    absent: '#ef4444', // red
    late: '#f59e0b', // amber
    justified: '#3b82f6', // blue
  };

  // Preparar datos para gráficas
  const summaryPercentages = useMemo(() => {
    return [
      { name: 'Asistencia', value: data.summary.attendancePercentage, color: COLORS.present },
      { name: 'Ausencia', value: data.summary.absencePercentage, color: COLORS.absent },
      { name: 'Tarde', value: data.summary.lateArrivalsPercentage, color: COLORS.late },
      { name: 'Justificado', value: data.summary.justifiedPercentage, color: COLORS.justified },
    ];
  }, [data.summary]);

  // Datos para gráfica de tendencia diaria
  const dailyTrendData = useMemo(() => {
    return data.byDay.slice(-14).map((day) => ({
      date: new Date(day.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      presente: day.present,
      ausente: day.absent,
      tarde: day.lateArrivals,
      percentage: parseFloat(day.percentage.toFixed(1)),
    }));
  }, [data.byDay]);

  // Datos para tabla de cursos
  const courseData = useMemo(() => {
    return data.byCourse.map((course) => ({
      ...course,
      displayName: `${course.courseName} (${course.courseCode})`,
    }));
  }, [data.byCourse]);

  // Clasificar estudiantes en riesgo por severidad
  const riskStudentsByStatus = useMemo(() => {
    return {
      high: data.riskStudents.filter((s) => s.status === 'HIGH_RISK'),
      medium: data.riskStudents.filter((s) => s.status === 'MEDIUM_RISK'),
      low: data.riskStudents.filter((s) => s.status === 'LOW_RISK'),
    };
  }, [data.riskStudents]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <Skeleton className="w-full h-64 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Asistencia
                </p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {data.summary.attendancePercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {data.summary.totalAttendances} de {data.summary.totalAttendances + data.summary.totalAbsences} registros
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Ausencias
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {data.summary.absencePercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {data.summary.totalAbsences} registros
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Llegadas Tardías
                </p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                  {data.summary.lateArrivalsPercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {data.summary.totalLateArrivals} estudiantes
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Justificadas
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {data.summary.justifiedPercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {data.summary.totalJustified} registros
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen General */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Resumen de Asistencia
          </CardTitle>
          <CardDescription>
            {data.section.name} - {data.summary.totalClasses} clases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summaryPercentages.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                  <span className="text-gray-600 dark:text-gray-400">{item.value.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Distribución de Asistencia
          </CardTitle>
          <CardDescription>Gráfica visual de los porcentajes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  data={summaryPercentages}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {summaryPercentages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${parseFloat(String(value)).toFixed(1)}%`}
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Leyenda personalizada sin sobreposición */}
            <div className="grid grid-cols-2 gap-4 mt-4 w-full">
              {summaryPercentages.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {item.value.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tendencia Diaria */}
      {dailyTrendData.length > 0 && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Tendencia Diaria (Últimas 2 Semanas)</CardTitle>
            <CardDescription>Distribución de asistencia por día</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dailyTrendData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-200 dark:stroke-gray-700"
                />
                <XAxis dataKey="date" className="text-xs fill-gray-600 dark:fill-gray-400" />
                <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="presente" fill={COLORS.present} radius={[8, 8, 0, 0]} />
                <Bar dataKey="ausente" fill={COLORS.absent} radius={[8, 8, 0, 0]} />
                <Bar dataKey="tarde" fill={COLORS.late} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Por Curso */}
      {courseData.length > 0 && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Análisis por Curso</CardTitle>
            <CardDescription>Estadísticas de asistencia para cada curso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courseData.map((course) => (
                <div key={course.courseId} className="border-l-4 pl-4 py-2 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {course.displayName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Docente: {course.teacherName}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300">
                      {course.attendancePercentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${course.attendancePercentage}%` }}
                    />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>Clases: {course.totalClasses}</span>
                    <span>Presentes: {course.totalAttendances}</span>
                    <span>Ausentes: {course.totalAbsences}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estudiantes en Riesgo */}
      {data.riskStudents.length > 0 && (
        <Card className="border-l-4 border-red-500 dark:border-red-600 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Estudiantes en Riesgo ({data.riskStudents.length})
            </CardTitle>
            <CardDescription>
              Estudiantes con baja asistencia que requieren atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Alto Riesgo */}
              {riskStudentsByStatus.high.length > 0 && (
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400 mb-3 text-sm">
                    ALTO RIESGO ({riskStudentsByStatus.high.length})
                  </p>
                  <div className="space-y-2">
                    {riskStudentsByStatus.high.map((student) => (
                      <div
                        key={student.studentId}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {student.givenNames} {student.lastNames}
                          </p>
                        </div>
                        <Badge className="bg-red-600 hover:bg-red-700">
                          {student.attendancePercentage.toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Riesgo Medio */}
              {riskStudentsByStatus.medium.length > 0 && (
                <div>
                  <p className="font-semibold text-amber-700 dark:text-amber-400 mb-3 text-sm">
                    RIESGO MEDIO ({riskStudentsByStatus.medium.length})
                  </p>
                  <div className="space-y-2">
                    {riskStudentsByStatus.medium.map((student) => (
                      <div
                        key={student.studentId}
                        className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {student.givenNames} {student.lastNames}
                          </p>
                        </div>
                        <Badge className="bg-amber-600 hover:bg-amber-700">
                          {student.attendancePercentage.toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bajo Riesgo */}
              {riskStudentsByStatus.low.length > 0 && (
                <div>
                  <p className="font-semibold text-yellow-700 dark:text-yellow-400 mb-3 text-sm">
                    BAJO RIESGO ({riskStudentsByStatus.low.length})
                  </p>
                  <div className="space-y-2">
                    {riskStudentsByStatus.low.map((student) => (
                      <div
                        key={student.studentId}
                        className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {student.givenNames} {student.lastNames}
                          </p>
                        </div>
                        <Badge className="bg-yellow-600 hover:bg-yellow-700">
                          {student.attendancePercentage.toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
