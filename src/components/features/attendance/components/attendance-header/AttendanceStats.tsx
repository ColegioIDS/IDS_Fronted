// src/components/attendance/components/attendance-header/AttendanceStats.tsx - REFACTORIZADO FASE 3
"use client";

import { useMemo, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAttendanceData } from '@/hooks/attendance-hooks';
import { useAttendanceConfig } from '@/hooks/attendance-hooks';
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
  const { attendances, stats, loading, error, fetchSectionAttendances, fetchStats } = useAttendanceData();

  // 📡 Cargar datos cuando cambia la sección
  useEffect(() => {
    if (sectionId) {
      const dateStr = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      console.log('📡 Cargando asistencia para sección:', sectionId, 'fecha:', dateStr);
      fetchSectionAttendances(sectionId, {
        dateFrom: dateStr,
        dateTo: dateStr
      }).catch(err => console.error('Error cargando asistencia:', err));
    }
  }, [sectionId, date, fetchSectionAttendances]);

  // 📊 Cargar estadísticas acumuladas del bimestre
  useEffect(() => {
    if (sectionId && bimesterId) {
      console.log('📈 Cargando estadísticas del bimestre:', sectionId, bimesterId);
      fetchStats({
        sectionId,
        bimesterId
      }).catch(err => console.error('Error cargando stats:', err));
    }
  }, [sectionId, bimesterId, fetchStats]);

  // 📡 Cargar estados dinámicamente desde el backend
  const { statuses } = useAttendanceConfig();

  // 🎨 Función para oscurecer colores hex
  const getDarkenColor = (hex: string | null | undefined): string => {
    if (!hex) return '#6b7280';
    
    try {
      // Convertir hex a RGB
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 255;
      const g = (rgb >> 8) & 255;
      const b = rgb & 255;

      // Oscurecer el color multiplicando por 0.7 (70% más fuerte)
      const darkR = Math.max(0, Math.floor(r * 0.7));
      const darkG = Math.max(0, Math.floor(g * 0.7));
      const darkB = Math.max(0, Math.floor(b * 0.7));

      // Convertir de vuelta a hex
      return `#${[darkR, darkG, darkB]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')}`;
    } catch {
      return '#6b7280';
    }
  };

  // 📊 Mapear estatuses para categorías dinámicas
  const statusCategories = useMemo(() => {
    const categories = {
      presentStatuses: [] as AttendanceStatusCode[],
      absentStatuses: [] as AttendanceStatusCode[],
      lateStatuses: [] as AttendanceStatusCode[],
      excusedStatuses: [] as AttendanceStatusCode[],
    };

    statuses.forEach((status: any) => {
      // 📋 Categoría 1: PRESENTES - no negativo, no excusado
      if (!status.isNegative && !status.isExcused) {
        categories.presentStatuses.push(status.code);
      }
      // ❌ Categoría 2: AUSENTES - es negativo pero NO comienza con 'T' (no es tardanza)
      else if (status.isNegative && !status.code.startsWith('T')) {
        categories.absentStatuses.push(status.code);
      }
      // ⏰ Categoría 3: TARDÍOS - código comienza con 'T' y no es excusado
      else if (status.code.startsWith('T') && !status.isExcused) {
        categories.lateStatuses.push(status.code);
      }
      // 📋 Categoría 4: EXCUSADOS - cualquier estado que sea excusado (IJ, TJ, E, M, A, etc)
      if (status.isExcused) {
        categories.excusedStatuses.push(status.code);
      }
    });

    console.log('📊 Categorías mapeadas:', categories);
    return categories;
  }, [statuses]);

  // �📊 Calcular estadísticas del día a partir de datos reales
  const dailyStats = useMemo<StatsType | null>(() => {
    if (!attendances || attendances.length === 0) return null;

    // Crear mapeo de ID → código para las categorías
    const statusCodeMap = new Map(statuses.map(s => [s.id, s.code]));
    
    // Contar dinámicamente según categorías de estados
    const present = attendances.filter(r => {
      const code = statusCodeMap.get(r.attendanceStatusId);
      return code && statusCategories.presentStatuses.includes(code);
    }).length;
    
    const absent = attendances.filter(r => {
      const code = statusCodeMap.get(r.attendanceStatusId);
      return code && statusCategories.absentStatuses.includes(code);
    }).length;
    
    const late = attendances.filter(r => {
      const code = statusCodeMap.get(r.attendanceStatusId);
      return code && statusCategories.lateStatuses.includes(code);
    }).length;
    
    const excused = attendances.filter(r => {
      const code = statusCodeMap.get(r.attendanceStatusId);
      return code && statusCategories.excusedStatuses.includes(code);
    }).length;

    const total = attendances.length;
    const attendanceRate = ((present + late) / total * 100).toFixed(1);

    console.log('📊 Estadísticas del día:', { present, absent, late, excused, total, attendanceRate });
    console.log('📋 Registros por ID:', attendances.map(r => r.attendanceStatusId));

    return {
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate
    };
  }, [attendances, statusCategories, statuses]);

  // 📈 Calcular estadísticas acumuladas (si hay datos del bimestre)
  const bimesterStats = useMemo<StatsType | null>(() => {
    if (!stats || stats.total === 0) return null;

    // Usar datos del servidor directamente
    const total = stats.total || 0;
    const present = stats.present || 0;
    const late = stats.late || 0;
    const excused = (stats.absentJustified || 0) + (stats.lateJustified || 0);
    const absent = stats.absent || 0;

    const attendanceRate = total > 0 ? ((present + late) / total * 100).toFixed(1) : "0";

    console.log('📈 Estadísticas del Bimestre:', { present, late, absent, excused, total, attendanceRate });

    return {
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate
    };
  }, [stats]);

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
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Cargando datos de asistencia...
                </p>
              </>
            ) : (
              <>
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {error ? `Error: ${error}` : 'No hay datos de asistencia disponibles'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {error ? 'Intenta recargar la página' : 'Seleccione una sección válida para ver las estadísticas'}
                </p>
              </>
            )}
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
                  {parseFloat(bimesterStats.attendanceRate) >= 85 ? 'Meta alcanzada' : 'Por debajo de la meta'}
                </span>
              </div>
            </div>

            {/* 📊 Desglose por código de estado */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Desglose de Asistencia</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {statuses
                  .filter(s => s.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map(status => {
                    const darkenedColor = getDarkenColor(status.colorCode);
                    const count = stats?.byStatus?.[status.code] || 0;
                    const percentage = bimesterStats.total > 0 ? ((count / bimesterStats.total) * 100).toFixed(1) : '0';
                    
                    return (
                      <div 
                        key={status.code}
                        className="p-2 rounded border transition-all"
                        style={{
                          backgroundColor: status.colorCode + '26', // 15% opacity
                          borderColor: status.colorCode || '#d1d5db',
                        }}
                      >
                        <div 
                          className="text-lg font-bold"
                          style={{ color: darkenedColor }}
                        >
                          {count}
                        </div>
                        <div 
                          className="text-xs font-medium"
                          style={{ color: darkenedColor }}
                        >
                          {status.code}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage}%
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* ℹ️ Nota informativa */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Datos Acumulados:</strong> Estos son los totales registrados hasta el momento para esta sección. Los datos se actualizan en tiempo real.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
