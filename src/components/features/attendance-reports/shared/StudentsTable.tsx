'use client';

import { useMemo } from 'react';
import { StudentAttendanceDetail } from '@/types/attendance-reports.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, AlertTriangle, TrendingUp } from 'lucide-react';

interface StudentsTableProps {
  students: StudentAttendanceDetail[];
  totalClasses: number;
  averageAttendance: number;
  isLoading?: boolean;
}

export function StudentsTable({
  students,
  totalClasses,
  averageAttendance,
  isLoading = false,
}: StudentsTableProps) {
  // Validar que students sea un array válido
  const validStudents = Array.isArray(students) ? students : [];

  const statusConfig = {
    NORMAL: { badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '✓' },
    LOW_RISK: { badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: '!' },
    MEDIUM_RISK: { badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: '⚠' },
    HIGH_RISK: { badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: '✕' },
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NORMAL: 'Normal',
      LOW_RISK: 'Riesgo Bajo',
      MEDIUM_RISK: 'Riesgo Medio',
      HIGH_RISK: 'Riesgo Alto',
    };
    return labels[status] || status;
  };

  const riskCounts = useMemo(() => {
    return {
      high: validStudents.filter((s) => s.riskStatus === 'HIGH_RISK').length,
      medium: validStudents.filter((s) => s.riskStatus === 'MEDIUM_RISK').length,
      low: validStudents.filter((s) => s.riskStatus === 'LOW_RISK').length,
      normal: validStudents.filter((s) => s.riskStatus === 'NORMAL').length,
    };
  }, [validStudents]);

  // Extraer todos los códigos únicos de asistencia para crear columnas dinámicas
  const allAttendanceCodes = useMemo(() => {
    const codesMap = new Map<string, string>();
    validStudents.forEach((student) => {
      if (student.attendanceCounts && Array.isArray(student.attendanceCounts)) {
        student.attendanceCounts.forEach((count) => {
          if (!codesMap.has(count.code)) {
            codesMap.set(count.code, count.name);
          }
        });
      }
    });
    return Array.from(codesMap.entries()).map(([code, name]) => ({ code, name }));
  }, [validStudents]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Normales</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{riskCounts.normal}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Riesgo Bajo</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{riskCounts.low}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold">!</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Riesgo Medio</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{riskCounts.medium}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-400 font-bold">⚠</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Riesgo Alto</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{riskCounts.high}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 font-bold">✕</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <CardTitle>Asistencia por Estudiante</CardTitle>
              <CardDescription>{validStudents.length} estudiantes registrados</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Estudiante</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Clases</th>
                  {allAttendanceCodes.map((code) => (
                    <th
                      key={code.code}
                      className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300"
                      title={code.name}
                    >
                      <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold">
                        {code.code}
                      </span>
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Asistencia %</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Estado</th>
                </tr>
              </thead>
              <tbody>
                {validStudents.map((student) => (
                  <tr
                    key={student.studentId}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {student.givenNames} {student.lastNames}
                        </p>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">
                      {student.totalClasses}
                    </td>
                    {allAttendanceCodes.map((code) => {
                      const count = student.attendanceCounts?.find((c) => c.code === code.code);
                      const value = count?.count ?? 0;
                      return (
                        <td key={code.code} className="text-center py-3 px-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium text-sm">
                            {value}
                          </span>
                        </td>
                      );
                    })}
                    <td className="text-center py-3 px-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                          {student.attendancePercentage.toFixed(1)}%
                        </span>
                        <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              student.attendancePercentage >= 85
                                ? 'bg-green-500'
                                : student.attendancePercentage >= 70
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${student.attendancePercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge
                        className={
                          statusConfig[student.riskStatus as keyof typeof statusConfig]?.badge ||
                          statusConfig.NORMAL.badge
                        }
                      >
                        {getStatusLabel(student.riskStatus)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {validStudents.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No hay registros de asistencia</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
