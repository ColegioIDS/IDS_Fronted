// src/components/attendance/components/attendance-header/AttendanceStats.tsx - REFACTORIZADO FASE 3
"use client";

import { useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAttendanceData } from '@/hooks/attendance';
import { AttendanceStatusCode } from '@/types/attendance.types';

interface AttendanceStatsProps {
  sectionId: number;
  date: Date;
  bimesterId?: number | null;
}

interface StatsType {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: string;
}

export default function AttendanceStats({
  sectionId,
  date,
  bimesterId
}: AttendanceStatsProps) {
  // 📊 Obtener datos de asistencia del hook
  const { attendances, stats, loading, error } = useAttendanceData();

  // 📊 Calcular estadísticas del día a partir de datos reales
  const dailyStats = useMemo<StatsType | null>(() => {
    if (!attendances || attendances.length === 0) return null;

    // Contar por código de estado de asistencia
    const present = attendances.filter(r => r.statusCode === 'A').length;
    const absent = attendances.filter(r => r.statusCode === 'I').length;
    const absentJustified = attendances.filter(r => r.statusCode === 'IJ').length;
    const late = attendances.filter(r => r.statusCode === 'TI').length;
    const lateJustified = attendances.filter(r => r.statusCode === 'TJ').length;

    const total = attendances.length;
    const excused = absentJustified + lateJustified;

    const attendanceRate = ((present + late) / total * 100).toFixed(1);

    return {
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate
    };
  }, [attendances]);

  // 📈 Usar estadísticas del servidor si están disponibles
  const bimesterStats = useMemo<StatsType | null>(() => {
    if (!stats || !bimesterId) return null;

    const total = stats.total || 0;
    const present = stats.present || 0;
    const late = stats.late || 0;
    const excused = stats.absentJustified + stats.lateJustified;
    const absent = total - present - late - excused;

    const attendanceRate = total > 0 ? ((present + late) / total * 100).toFixed(1) : "0";

    return {
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate
    };
  }, [stats, bimesterId]);

  // 📊 Función para calcular porcentajes
  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  };

  // 🎨 Obtener color según el porcentaje de asistencia
  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 dark:text-green-400";
    if (rate >= 80) return "text-yellow-600 dark:text-yellow-400";
    if (rate >= 70) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getAttendanceBadgeVariant = (rate: number): "default" | "secondary" | "outline" | "destructive" => {
    if (rate >= 90) return "default";
    if (rate >= 80) return "secondary";
    if (rate >= 70) return "outline";
    return "destructive";
  };

  // 📊 Verificar si hay datos
  if (!dailyStats && !bimesterStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-gray-500" />
            Estadísticas de Asistencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              No hay datos de asistencia disponibles
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Seleccione una sección válida para ver las estadísticas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 📅 Estadísticas del Día */}
      {dailyStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              Asistencia del Día
              <Badge variant="outline" className="ml-2 text-xs">
                {date.toLocaleDateString('es-GT', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 📊 Resumen principal */}
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getAttendanceColor(parseFloat(dailyStats.attendanceRate))}`}>
                  {parseFloat(dailyStats.attendanceRate)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Asistencia general
                </div>
              </div>
              <Badge
                variant={getAttendanceBadgeVariant(parseFloat(dailyStats.attendanceRate))}
                className="text-lg px-3 py-1"
              >
                {dailyStats.present + dailyStats.late}/{dailyStats.total}
              </Badge>
            </div>

            {/* 📈 Barra de progreso */}
            <div className="space-y-2">
              <Progress
                value={parseFloat(dailyStats.attendanceRate)}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* 📊 Desglose detallado */}
            <div className="grid grid-cols-2 gap-3">
              {/* ✅ Presentes */}
              <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <div className="text-sm font-medium text-green-900 dark:text-green-100">
                    {dailyStats.present}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    Presentes ({calculatePercentage(dailyStats.present, dailyStats.total)}%)
                  </div>
                </div>
              </div>

              {/* ❌ Ausentes */}
              <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <div>
                  <div className="text-sm font-medium text-red-900 dark:text-red-100">
                    {dailyStats.absent}
                  </div>
                  <div className="text-xs text-red-700 dark:text-red-300">
                    Ausentes ({calculatePercentage(dailyStats.absent, dailyStats.total)}%)
                  </div>
                </div>
              </div>

              {/* ⏰ Tardíos */}
              {dailyStats.late > 0 && (
                <div className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <div className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      {dailyStats.late}
                    </div>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300">
                      Tardíos ({calculatePercentage(dailyStats.late, dailyStats.total)}%)
                    </div>
                  </div>
                </div>
              )}

              {/* 📋 Justificados */}
              {dailyStats.excused > 0 && (
                <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {dailyStats.excused}
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      Justificados ({calculatePercentage(dailyStats.excused, dailyStats.total)}%)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 📈 Estadísticas del Bimestre */}
      {bimesterStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
              Tendencia del Bimestre
              <Badge variant="secondary" className="ml-2 text-xs">
                Promedio
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 📊 Promedio del bimestre */}
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getAttendanceColor(parseFloat(bimesterStats.attendanceRate))}`}>
                  {parseFloat(bimesterStats.attendanceRate)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Promedio del bimestre
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {bimesterStats.total} estudiantes
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  registrados
                </div>
              </div>
            </div>

            {/* 📈 Progreso del bimestre */}
            <div className="space-y-2">
              <Progress
                value={parseFloat(bimesterStats.attendanceRate)}
                className="h-2"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Meta: 85%
                </span>
                <span className={`text-xs font-medium ${parseFloat(bimesterStats.attendanceRate) >= 85 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {parseFloat(bimesterStats.attendanceRate) >= 85 ? '✅ Meta alcanzada' : '⚠️ Por debajo de la meta'}
                </span>
              </div>
            </div>

            {/* 📊 Comparativa */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {bimesterStats.present}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Presentes</div>
              </div>

              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {bimesterStats.absent}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Ausentes</div>
              </div>

              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                  {bimesterStats.late}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Tardíos</div>
              </div>

              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {bimesterStats.excused}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Justif.</div>
              </div>
            </div>

            {/* ℹ️ Nota informativa */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Nota:</strong> Las estadísticas del bimestre son datos simulados para demostración.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
