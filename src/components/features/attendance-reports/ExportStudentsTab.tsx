'use client';

import { useState } from 'react';
import { useExportStudentReport, useExportSectionReport } from '@/hooks/data/attendance-reports';
import { StudentAttendanceDetail, ExportFormat } from '@/types/attendance-reports.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Download, AlertTriangle, CheckCircle, Calendar as CalendarIcon, X, Sheet, File, Database, Users } from 'lucide-react';

interface ExportStudentsTabProps {
  students: StudentAttendanceDetail[];
  isLoading?: boolean;
  gradeId?: number;
  sectionId?: number;
  courseId?: number;
  bimesterId?: number | null;
  academicWeekId?: number | null;
  cycleId?: number;
}

export function ExportStudentsTab({
  students,
  isLoading = false,
  gradeId,
  sectionId,
  courseId,
  bimesterId,
  academicWeekId,
  cycleId,
}: ExportStudentsTabProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  
  const exportMutation = useExportStudentReport();
  const exportSectionMutation = useExportSectionReport();

  // Helper function to build export parameters with priority logic
  const getExportParams = () => {
    // academicWeekId (highest priority) - if set, also send bimesterId and ignore dates
    if (academicWeekId) {
      return {
        bimesterId,
        academicWeekId,
        startDate: undefined,
        endDate: undefined,
      };
    }

    // bimesterId (medium priority) - if set, ignore dates
    if (bimesterId) {
      return {
        bimesterId,
        academicWeekId: undefined,
        startDate: undefined,
        endDate: undefined,
      };
    }

    // startDate/endDate (lowest priority) - only if no bimesterId or academicWeekId
    return {
      bimesterId: undefined,
      academicWeekId: undefined,
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    };
  };

  const handleSelectStudent = (studentId: number) => {
    const newSelected = new Set(selectedStudentIds);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudentIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.size === students.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(students.map((s) => s.studentId)));
    }
  };

  const handleExportStudent = (studentId: number) => {
    if (!gradeId || !sectionId || !courseId) {
      alert('Por favor selecciona grado, sección y curso primero');
      return;
    }

    const exportParams = getExportParams();

    exportMutation.mutate({
      studentId,
      format: selectedFormat,
      gradeId,
      sectionId,
      courseId,
      bimesterId: exportParams.bimesterId,
      academicWeekId: exportParams.academicWeekId,
      startDate: exportParams.startDate,
      endDate: exportParams.endDate,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-700">
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No hay estudiantes para exportar</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Selecciona filtros para ver estudiantes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Format Selector */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg">
              <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Descargar Reportes</CardTitle>
              <CardDescription className="mt-1">
                Selecciona el formato y filtros para exportar los reportes de asistencia
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: Format, Dates, Selection */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Formato de Exportación
              </label>
              <Select value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as ExportFormat)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <Sheet className="w-4 h-4" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4" />
                      PDF
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      CSV
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Desde {(bimesterId || academicWeekId) && <span className="text-xs text-gray-500">(deshabilitado)</span>}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={!!bimesterId || !!academicWeekId}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : 'Selecciona fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={es}
                    disabled={(date) => endDate ? date > endDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hasta {(bimesterId || academicWeekId) && <span className="text-xs text-gray-500">(deshabilitado)</span>}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={!!bimesterId || !!academicWeekId}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : 'Selecciona fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    locale={es}
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Seleccionados
              </label>
              <div className="flex items-center justify-center h-10 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <span className="text-blue-900 dark:text-blue-100 font-semibold">
                  {selectedStudentIds.size} / {students.length}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                &nbsp;
              </label>
              <Button
                onClick={handleSelectAll}
                variant="outline"
                className="w-full"
              >
                {selectedStudentIds.size === students.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
              </Button>
            </div>
          </div>

          {/* Row 2: Active Filters Display and Priority Alert */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros activos:</span>
              {academicWeekId && (
                <Badge className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800">
                  Semana {academicWeekId} ⭐ (Máxima prioridad)
                </Badge>
              )}
              {!academicWeekId && bimesterId && (
                <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800">
                  Bimestre {bimesterId} ⭐ (Media prioridad)
                </Badge>
              )}
              {!academicWeekId && !bimesterId && startDate && (
                <Badge className="bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800">
                  {format(startDate, 'dd/MM')}
                </Badge>
              )}
              {!academicWeekId && !bimesterId && endDate && (
                <Badge className="bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800">
                  → {format(endDate, 'dd/MM')}
                </Badge>
              )}
            </div>

            {/* Priority Alert */}
            {academicWeekId && (
              <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800">
                <AlertTriangle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <AlertDescription className="text-purple-800 dark:text-purple-200">
                  <strong>Máxima prioridad: Semana Académica activada.</strong> Se ignoran el bimestre y rango de fechas.
                </AlertDescription>
              </Alert>
            )}

            {!academicWeekId && bimesterId && (
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Media prioridad: Bimestre activado.</strong> Se ignora el rango de fechas. Para usar fechas, debes cambiar el bimestre en Filtros Temporales.
                </AlertDescription>
              </Alert>
            )}

            {!academicWeekId && !bimesterId && (startDate || endDate) && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong>Mínima prioridad: Rango de fechas activado.</strong> Se utilizarán estas fechas en la exportación.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Clear Dates Button */}
          {(startDate || endDate) && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <X className="w-4 h-4" />
                Limpiar fechas
              </Button>
              {startDate && endDate && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-sm text-amber-800 dark:text-amber-200">
                  <CalendarIcon className="w-4 h-4" />
                  {format(startDate, 'dd/MM/yyyy')} - {format(endDate, 'dd/MM/yyyy')}
                </div>
              )}
            </div>
          )}

          {exportMutation.isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {exportMutation.error?.message || 'Error al exportar el reporte'}
              </AlertDescription>
            </Alert>
          )}

          {exportSectionMutation.isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {exportSectionMutation.error?.message || 'Error al exportar la sección'}
              </AlertDescription>
            </Alert>
          )}

          {exportMutation.isSuccess && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Reporte descargado exitosamente
              </AlertDescription>
            </Alert>
          )}

          {exportSectionMutation.isSuccess && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Reporte de la sección descargado exitosamente
              </AlertDescription>
            </Alert>
          )}

          {/* Export Section Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => {
                if (!sectionId) {
                  alert('Sección no disponible');
                  return;
                }
                const exportParams = getExportParams();
                exportSectionMutation.mutate({
                  sectionId,
                  format: selectedFormat,
                  gradeId,
                  courseId,
                  bimesterId: exportParams.bimesterId,
                  academicWeekId: exportParams.academicWeekId,
                  startDate: exportParams.startDate,
                  endDate: exportParams.endDate,
                });
              }}
              disabled={exportSectionMutation.isPending}
              size="lg"
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="w-5 h-5" />
              {exportSectionMutation.isPending ? 'Descargando Sección...' : 'Descargar Reporte Completo de la Sección'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Estudiantes ({students.length})</CardTitle>
              <CardDescription className="mt-1">
                Selecciona los estudiantes cuyos reportes deseas exportar individualmente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student.studentId}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.has(student.studentId)}
                    onChange={() => handleSelectStudent(student.studentId)}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {student.givenNames} {student.lastNames}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ID: {student.studentId} • Clases: {student.totalClasses}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {student.attendancePercentage.toFixed(1)}%
                    </p>
                    <Badge
                      variant={
                        student.riskStatus === 'NORMAL'
                          ? 'secondary'
                          : student.riskStatus === 'HIGH_RISK'
                            ? 'destructive'
                            : 'outline'
                      }
                      className={
                        student.riskStatus === 'NORMAL'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                          : student.riskStatus === 'HIGH_RISK'
                            ? ''
                            : 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800'
                      }
                    >
                      {student.riskStatus === 'NORMAL'
                        ? 'Normal'
                        : student.riskStatus === 'HIGH_RISK'
                          ? 'Alto Riesgo'
                          : 'Medio Riesgo'}
                    </Badge>
                  </div>

                  <Button
                    onClick={() => handleExportStudent(student.studentId)}
                    disabled={exportMutation.isPending}
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {exportMutation.isPending ? 'Descargando...' : 'Descargar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Export Button */}
      {selectedStudentIds.size > 0 && (
        <div className="flex gap-4">
          <Button
            onClick={() => {
              selectedStudentIds.forEach((studentId) => {
                setTimeout(() => {
                  handleExportStudent(studentId);
                }, 300);
              });
            }}
            disabled={exportMutation.isPending}
            size="lg"
            className="flex-1 gap-2"
          >
            <Download className="w-5 h-5" />
            Descargar {selectedStudentIds.size} Reporte{selectedStudentIds.size > 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
}
