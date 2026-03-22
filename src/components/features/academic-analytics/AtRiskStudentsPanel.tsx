'use client';

import { AlertCircle, AlertTriangle, Zap, Shield, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AtRiskStudentsData, RiskLevel } from '@/types/academic-analytics.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AtRiskStudentsPanelProps {
  data: AtRiskStudentsData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Panel que muestra estudiantes en riesgo académico o de asistencia
 * Incluye:
 * - Conteos de riesgo por nivel
 * - Tabla de estudiantes con detalles de riesgo
 * - Alertas de asistencia
 * - Recomendaciones
 */
export function AtRiskStudentsPanel({
  data,
  isLoading,
  error,
}: AtRiskStudentsPanelProps) {
  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300 dark:border-red-700';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border border-orange-300 dark:border-orange-700';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700';
      case 'LOW':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return <Zap className="w-4 h-4" />;
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4" />;
      case 'MEDIUM':
        return <AlertCircle className="w-4 h-4" />;
      case 'LOW':
        return <Shield className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No hay datos de estudiantes en riesgo</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Estudiantes en Riesgo - {data.grade.name}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sección {data.section.name}
        </p>
      </div>

      {/* Resumen de Riesgos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Riesgo Crítico</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {data.criticalRiskCount}
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Riesgo Alto</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {data.highRiskCount}
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Total en Riesgo</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {data.totalStudentsAtRisk}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">% de Estudiantes</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {((data.totalStudentsAtRisk / Math.max(1, data.students.length + data.totalStudentsAtRisk)) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Tabla de Estudiantes */}
      {data.students.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Detalles de Estudiantes
          </h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <TableHead className="text-gray-900 dark:text-white font-semibold">Estudiante</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">Promedio</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">Riesgo Académico</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">Riesgo Asistencia</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">Ausencias</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.students.map((student, idx) => (
                  <TableRow
                    key={student.student.id}
                    className={`border-b border-gray-200 dark:border-slate-700 ${
                      idx % 2 === 0
                        ? 'bg-white dark:bg-slate-900'
                        : 'bg-gray-50 dark:bg-slate-800'
                    } hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors`}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {student.student.lastNames}, {student.student.givenNames}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-white">
                      {student.promedio.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`flex items-center gap-1 w-fit ${getRiskLevelColor(student.academicRiskLevel)}`}>
                        {getRiskIcon(student.academicRiskLevel)}
                        {student.academicRiskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {student.attendanceAlert.isAlert ? (
                        <Badge className="flex items-center gap-1 w-fit bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300 dark:border-red-700">
                          <Clock className="w-3 h-3" />
                          Alerta
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          Normal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {student.absenceDetails.totalAbsences}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {student.absenceDetails.unjustifiedAbsences} injustificadas
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <Alert className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
          <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-200">
            ¡Excelente! No hay estudiantes en riesgo en esta sección.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
