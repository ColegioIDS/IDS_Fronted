// src/components/attendance/components/attendance-header/AttendanceStats.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { useEnrollmentContext } from '@/context/EnrollmentContext';

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
  const { 
    state: { attendances, loading: attendanceLoading },
    fetchAttendances,
    fetchAttendancesByBimester
  } = useAttendanceContext();
  
  const {
    fetchEnrollmentsBySection,
    state: { enrollments, loading: enrollmentLoading }
  } = useEnrollmentContext();

  const [dailyStats, setDailyStats] = useState<StatsType | null>(null);
  const [bimesterStats, setBimesterStats] = useState<StatsType | null>(null);

  // 📊 Cargar matrículas de la sección
  useEffect(() => {
    if (sectionId) {
      fetchEnrollmentsBySection(sectionId);
    }
  }, [sectionId, fetchEnrollmentsBySection]);

  // 📅 Cargar todas las asistencias (sin filtros)
  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  // 📈 Cargar asistencias del bimestre si aplica
  useEffect(() => {
    if (bimesterId) {
      fetchAttendancesByBimester(bimesterId);
    }
  }, [bimesterId, fetchAttendancesByBimester]);

  // 🛠️ Función auxiliar para convertir fechas a string de manera segura
  const dateToString = (dateValue: any): string => {
    if (!dateValue) return '';
    
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0];
    }
    
    if (typeof dateValue === 'string') {
      return dateValue.split('T')[0];
    }
    
    return '';
  };

  // 📊 Calcular estadísticas del día
  const calculatedDailyStats = useMemo(() => {
    if (!attendances.length || !enrollments.length) return null;

    const targetDate = date.toISOString().split('T')[0];
    
    // Filtrar asistencias del día específico y de la sección
    const dayAttendances = attendances.filter(att => {
      const attDate = dateToString(att.date);
      return attDate === targetDate;
    });

    // Filtrar solo asistencias de estudiantes de esta sección
    const sectionEnrollments = enrollments.filter(enrollment => 
      enrollment.sectionId === sectionId && 
      enrollment.status === 'active'
    );

    const sectionStudentIds = sectionEnrollments.map(e => e.studentId);
    const sectionDayAttendances = dayAttendances.filter(att => 
      sectionStudentIds.includes(att.enrollment.student.id)
    );

    const total = sectionEnrollments.length;
    const present = sectionDayAttendances.filter(att => att.status === 'present').length;
    const absent = sectionDayAttendances.filter(att => att.status === 'absent').length;
    const late = sectionDayAttendances.filter(att => att.status === 'late').length;
    const excused = sectionDayAttendances.filter(att => att.status === 'excused').length;

    // Calcular ausentes: estudiantes sin registro de asistencia + registros de ausencia
    const studentsWithAttendance = sectionDayAttendances.length;
    const studentsWithoutRecord = total - studentsWithAttendance;
    const actualAbsent = absent + studentsWithoutRecord;
    
    const attendanceRate = total > 0 ? ((present + late) / total * 100).toFixed(1) : "0";

    return {
      total,
      present,
      absent: actualAbsent,
      late,
      excused,
      attendanceRate
    };
  }, [attendances, enrollments, sectionId, date]);

  // 📈 Calcular estadísticas del bimestre
  const calculatedBimesterStats = useMemo(() => {
    if (!attendances.length || !enrollments.length || !bimesterId) return null;

    // Filtrar asistencias del bimestre
    const bimesterAttendances = attendances.filter(att => 
      att.bimesterId === bimesterId
    );

    // Obtener estudiantes de la sección
    const sectionEnrollments = enrollments.filter(enrollment => 
      enrollment.sectionId === sectionId && 
      enrollment.status === 'active'
    );

    const sectionStudentIds = sectionEnrollments.map(e => e.studentId);
    const sectionBimesterAttendances = bimesterAttendances.filter(att => 
      sectionStudentIds.includes(att.enrollment.student.id)
    );

    const total = sectionEnrollments.length;
    
    // Obtener días únicos del bimestre
    const uniqueDates = [...new Set(sectionBimesterAttendances.map(att => {
      return dateToString(att.date);
    }))].filter(date => date !== '');
    
    const totalPossibleAttendances = total * uniqueDates.length;
    
    if (totalPossibleAttendances === 0) return null;

    const presentCount = sectionBimesterAttendances.filter(att => att.status === 'present').length;
    const lateCount = sectionBimesterAttendances.filter(att => att.status === 'late').length;
    const absentCount = sectionBimesterAttendances.filter(att => att.status === 'absent').length;
    const excusedCount = sectionBimesterAttendances.filter(att => att.status === 'excused').length;

    const attendanceRate = ((presentCount + lateCount) / totalPossibleAttendances * 100).toFixed(1);

    // 🔍 DEBUG - Agregar este console.log temporal
    console.log('🔍 Debug Bimestre Stats:', {
      // Datos originales
      bimesterId,
      sectionId,
      todosLosRegistrosBimestre: bimesterAttendances.length,
      registrosFiltradosSeccion: sectionBimesterAttendances.length,
      
      // Estudiantes de la sección
      estudiantesSeccion: sectionStudentIds,
      totalEstudiantes: total,
      
      // Días únicos
      diasUnicos: uniqueDates,
      cantidadDias: uniqueDates.length,
      
      // Conteos totales (antes del promedio)
      presentCountTotal: presentCount,
      absentCountTotal: absentCount,
      lateCountTotal: lateCount,
      excusedCountTotal: excusedCount,
      
      // Cálculos finales
      totalPossibleAttendances,
      attendanceRate,
      
      // Promedios por día (lo que se muestra en la UI)
      presentePromedio: Math.round(presentCount / uniqueDates.length),
      ausentesPromedio: Math.round(absentCount / uniqueDates.length),
      tardiosPromedio: Math.round(lateCount / uniqueDates.length),
      excusedPromedio: Math.round(excusedCount / uniqueDates.length)
    });

    return {
      total,
      present: uniqueDates.length > 0 ? Math.round(presentCount / uniqueDates.length) : 0,
      absent: uniqueDates.length > 0 ? Math.round(absentCount / uniqueDates.length) : 0,
      late: uniqueDates.length > 0 ? Math.round(lateCount / uniqueDates.length) : 0,
      excused: uniqueDates.length > 0 ? Math.round(excusedCount / uniqueDates.length) : 0,
      attendanceRate
    };
  }, [attendances, enrollments, sectionId, bimesterId]);

  // Actualizar estados locales
  useEffect(() => {
    setDailyStats(calculatedDailyStats);
  }, [calculatedDailyStats]);

  useEffect(() => {
    setBimesterStats(calculatedBimesterStats);
  }, [calculatedBimesterStats]);

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

  // ⏳ Estado de carga
  const isLoading = attendanceLoading || enrollmentLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-blue-500" />
            Estadísticas de Asistencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
              Seleccione una sección y fecha válidas para ver las estadísticas
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}