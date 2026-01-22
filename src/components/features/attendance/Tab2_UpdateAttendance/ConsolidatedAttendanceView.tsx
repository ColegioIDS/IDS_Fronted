/**
 * VISTA CONSOLIDADA DE ASISTENCIA
 * Muestra asistencias agrupadas por estudiante con detalles por curso
 * 
 * Características:
 * - Tabla expandible por estudiante
 * - Indicador visual de modificaciones
 * - Comparación Original vs Actual
 * - Estados dinámicos con colores
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Edit2, Save, X, Info } from 'lucide-react';
import { ConsolidatedAttendanceView, ConsolidatedStudentAttendance, AttendanceStatus } from '@/types/attendance.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConsolidatedAttendanceViewProps {
  data: ConsolidatedAttendanceView;
  allowedStatuses?: AttendanceStatus[];
  onStatusUpdate?: (classAttendanceId: number, newStatusId: number, reason?: string) => Promise<void>;
}

/**
 * Obtener el estado general de un estudiante
 * "Completo" si todos los cursos tienen mismo status
 * "Mixto" si hay diferentes statuses
 */
function getStudentOverallStatus(student: ConsolidatedStudentAttendance, allowedStatuses?: AttendanceStatus[]): {
  type: 'complete' | 'mixed';
  label: string;
  icon: React.ReactNode;
} {
  const statuses = new Set(student.courses.map(c => c.currentStatus));
  
  if (statuses.size === 1) {
    // Obtener el nombre del status desde allowedStatuses o usar el código
    const statusCode = student.courses[0].currentStatus;
    const statusName = allowedStatuses?.find(s => s.code === statusCode)?.name || student.courses[0].currentStatusName || statusCode;
    
    return {
      type: 'complete',
      label: `${statusName} (${student.courses.length} cursos)`,
      icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    };
  }
  
  // Contar tipos de status para mostrar resumen
  const statusCounts: Record<string, number> = {};
  student.courses.forEach(c => {
    const statusName = allowedStatuses?.find(s => s.code === c.currentStatus)?.name || c.currentStatusName || c.currentStatus;
    statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
  });

  const summary = Object.entries(statusCounts)
    .map(([name, count]) => `${count}× ${name}`)
    .join(' / ');

  return {
    type: 'mixed',
    label: `Mixto: ${summary}`,
    icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
  };
}

/**
 * Obtener el nombre del día en español a partir de una fecha
 */
function getDayNameInSpanish(dateString: string): string {
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const date = new Date(dateString + 'T00:00:00Z'); // Agregar hora para evitar problemas de zona horaria
  return dayNames[date.getUTCDay()] || 'Desconocido';
}

/**
 * Obtener el color para un status dinámico
 */
function getStatusColor(colorCode?: string): string {
  if (!colorCode) return '#808080'; // gray por defecto
  // Si es un código hex válido, devolverlo directamente
  if (/^#[0-9A-F]{6}$/i.test(colorCode)) {
    return colorCode;
  }
  // Si es nombre de color de Tailwind o similar, devolver hex
  const colorMap: Record<string, string> = {
    'green': '#10b981',
    'red': '#ef4444',
    'blue': '#3b82f6',
    'yellow': '#f59e0b',
    'purple': '#a855f7',
  };
  return colorMap[colorCode] || '#808080';
}

/**
 * Componente de fila expandible para estudiante (CON EDICIÓN INLINE)
 */
interface EditingState {
  courseId: number;
  newStatusId: number;
  reason: string;
  isSaving: boolean;
}

function StudentRow({
  student,
  allowedStatuses,
  onStatusUpdate,
}: {
  student: ConsolidatedStudentAttendance;
  allowedStatuses?: AttendanceStatus[];
  onStatusUpdate?: (classAttendanceId: number, newStatusId: number, reason?: string) => Promise<void>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingCourse, setEditingCourse] = useState<EditingState | null>(null);
  const overallStatus = getStudentOverallStatus(student, allowedStatuses);
  const hasModifications = student.courses.some(c => c.hasModifications);

  const handleEditClick = (courseId: number, currentStatusId: number) => {
    setEditingCourse({
      courseId,
      newStatusId: currentStatusId,
      reason: '',
      isSaving: false,
    });
  };

  const handleSaveStatus = async () => {
    if (!editingCourse || !onStatusUpdate) return;
    
    // Buscar el course para obtener su classAttendanceId
    const course = student.courses.find(c => c.courseId === editingCourse.courseId);
    if (!course) return;
    
    if (!course.classAttendanceId) {
      throw new Error('El backend no devuelve el ID de asistencia (classAttendanceId). Contacta al administrador.');
    }
    
    setEditingCourse(prev => prev ? { ...prev, isSaving: true } : null);
    try {
      await onStatusUpdate(course.classAttendanceId, editingCourse.newStatusId, editingCourse.reason);
      setEditingCourse(null);
    } catch (error: any) {
      
      // Re-lanzar con mejor mensaje
      let errorMessage = 'Error al actualizar el estado.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setEditingCourse(prev => prev ? { ...prev, isSaving: false } : null);
    }
  };

  return (
    <>
      {/* Fila principal del estudiante */}
      <TableRow
        className={`cursor-pointer transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30 ${
          hasModifications ? 'bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500' : 'hover:shadow-md'
        } ${
          isExpanded ? 'bg-blue-50 dark:bg-blue-950/30' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="w-8">
          <button className="rounded p-1 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </TableCell>
        <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
          {student.studentName}
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="rounded bg-violet-100 px-2 py-0.5 font-medium text-violet-700 dark:bg-violet-900 dark:text-violet-300">
              #{student.studentId}
            </span>
            <span className="rounded bg-sky-100 px-2 py-0.5 font-medium text-sky-700 dark:bg-sky-900 dark:text-sky-300">
              Matrícula: {student.enrollmentId}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {overallStatus.icon}
            <span
              className={`font-semibold ${
                overallStatus.type === 'mixed' 
                  ? 'text-amber-700 dark:text-amber-400' 
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {overallStatus.label}
            </span>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            {student.courses.length} curso{student.courses.length !== 1 ? 's' : ''}
          </span>
        </TableCell>
      </TableRow>

      {/* Filas expandidas con detalles de cursos */}
      {isExpanded &&
        student.courses.map((course, idx) => {
          const originalStatus = allowedStatuses?.find(
            s => s.code === course.originalStatus
          );
          const currentStatus = allowedStatuses?.find(
            s => s.code === course.currentStatus
          );
          const isEditing = editingCourse?.courseId === course.courseId;

          return (
            <TableRow
              key={`${student.enrollmentId}-${course.courseId}-${idx}`}
              className={`transition-all ${
                course.hasModifications 
                  ? 'border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' 
                  : 'bg-gray-50/50 dark:bg-gray-800/50'
              } ${
                isEditing ? 'bg-blue-50 dark:bg-blue-950/30 shadow-inner' : ''
              }`}
            >
              <TableCell />
              <TableCell className="pl-12">
                <div className="flex items-center gap-2">
                  <div 
                    className="h-2.5 w-2.5 rounded-full border border-gray-300 dark:border-gray-600" 
                    style={{ backgroundColor: course.courseColor || '#6366f1' }}
                  />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {course.courseName}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nuevo estado:</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "cursor-pointer px-4 py-2 text-sm font-semibold transition-all hover:opacity-80 flex items-center gap-2 border-2 shadow-sm",
                              !editingCourse.newStatusId && "border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            )}
                            style={
                              editingCourse.newStatusId > 0
                                ? {
                                    borderColor: allowedStatuses?.find(s => s.id === editingCourse.newStatusId)?.colorCode || '#808080',
                                    backgroundColor: `${allowedStatuses?.find(s => s.id === editingCourse.newStatusId)?.colorCode || '#808080'}20`,
                                    color: allowedStatuses?.find(s => s.id === editingCourse.newStatusId)?.colorCode || '#808080',
                                  }
                                : undefined
                            }
                          >
                            {editingCourse.newStatusId > 0 
                              ? allowedStatuses?.find(s => s.id === editingCourse.newStatusId)?.name || 'Seleccionar...'
                              : 'Seleccionar estado...'}
                            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px]">
                          {allowedStatuses?.map((status) => (
                            <DropdownMenuItem
                              key={status.id}
                              onClick={() =>
                                setEditingCourse({
                                  ...editingCourse,
                                  newStatusId: status.id,
                                })
                              }
                              className="cursor-pointer font-medium"
                            >
                              <div 
                                className="mr-2 h-2.5 w-2.5 rounded-full" 
                                style={{ backgroundColor: status.colorCode }}
                              />
                              {status.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Motivo:</label>
                      <input
                        type="text"
                        className="flex-1 rounded-lg border-2 border-blue-300 bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-blue-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-800"
                        placeholder="Ej: Cambio de estado..."
                        value={editingCourse.reason}
                        onChange={(e) =>
                          setEditingCourse({
                            ...editingCourse,
                            reason: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Original:</span>
                      <div className="flex items-center gap-2">
                        {originalStatus?.colorCode && (
                          <div
                            className="h-4 w-4 rounded-full border-2 border-gray-300 shadow-sm dark:border-gray-600"
                            style={{
                              backgroundColor: getStatusColor(originalStatus.colorCode),
                            }}
                          />
                        )}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {course.originalStatusName || originalStatus?.name || course.originalStatus || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Actual:</span>
                      <div className="flex items-center gap-2">
                        {currentStatus?.colorCode && (
                          <div
                            className="h-4 w-4 rounded-full border-2 border-gray-300 shadow-sm dark:border-gray-600"
                            style={{
                              backgroundColor: getStatusColor(currentStatus.colorCode),
                            }}
                          />
                        )}
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {course.currentStatusName || currentStatus?.name || course.currentStatus || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                {isEditing ? (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await handleSaveStatus();
                        } catch (err: any) {
                          // El error se propagará al componente padre a través de onStatusUpdate
                        }
                      }}
                      disabled={editingCourse.isSaving || !editingCourse.newStatusId}
                      className="rounded-lg bg-emerald-600 p-2 text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed dark:bg-emerald-500 dark:hover:bg-emerald-600"
                      title="Guardar cambios"
                    >
                      <Save className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setEditingCourse(null)}
                      disabled={editingCourse.isSaving}
                      className="rounded-lg bg-red-600 p-2 text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                      title="Cancelar"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {course.hasModifications ? (
                        <div className="flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 shadow-sm dark:bg-amber-900 dark:text-amber-100">
                          <AlertCircle className="h-4 w-4" />
                          <span>Modificado</span>
                        </div>
                      ) : (
                        <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">Original</span>
                      )}
                      {onStatusUpdate && (
                        <button
                          onClick={() => handleEditClick(course.courseId, currentStatus?.id || 0)}
                          className="rounded-lg bg-blue-600 p-2 text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg dark:bg-blue-500 dark:hover:bg-blue-600"
                          title="Editar estado"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {course.modificationDetails && (
                      <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        <div className="font-medium">Modificado por: {course.modificationDetails.modifiedBy}</div>
                        <div className="mt-1">{course.modificationDetails.reason}</div>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Registrado por: {course.recordedBy}
                    </div>
                  </div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
    </>
  );
}

export function ConsolidatedAttendanceViewComponent({
  data,
  allowedStatuses = [],
  onStatusUpdate,
}: ConsolidatedAttendanceViewProps) {
  // Validar estructura de datos
  if (!data || !data.students) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-900">
          Error: Estructura de datos inválida. Por favor contacta al administrador.
        </AlertDescription>
      </Alert>
    );
  }

  const studentsWithModifications = data.students.filter(s =>
    s.courses?.some((c: any) => c.hasModifications)
  );

  // Filtrar solo estudiantes que tienen al menos un curso con asistencia registrada
  const studentsWithAttendance = data.students.filter(student =>
    student.courses?.some((course: any) => course.currentStatus !== null && course.currentStatus !== undefined && course.currentStatus !== '')
  );

  return (
    <div className="space-y-6">
      {/* Header con información general */}
      <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="group rounded-lg border border-blue-200 bg-white p-4 shadow-md transition-all hover:shadow-lg dark:border-blue-700 dark:bg-slate-800">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Fecha</div>
            <div className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">{data.date}</div>
          </div>
          <div className="group rounded-lg border border-indigo-200 bg-white p-4 shadow-md transition-all hover:shadow-lg dark:border-indigo-700 dark:bg-slate-800">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Día</div>
            <div className="mt-1 text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {data.dayName || getDayNameInSpanish(data.date)}
            </div>
          </div>
          <div className="group rounded-lg border border-emerald-200 bg-white p-4 shadow-md transition-all hover:shadow-lg dark:border-emerald-700 dark:bg-slate-800">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Estudiantes</div>
            <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">{data.totalStudents}</div>
          </div>
          <div className="group rounded-lg border border-violet-200 bg-white p-4 shadow-md transition-all hover:shadow-lg dark:border-violet-700 dark:bg-slate-800">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Registros Actuales</div>
            <div className="mt-1 text-xl font-bold text-violet-600 dark:text-violet-400">{studentsWithAttendance.length}</div>
          </div>
        </div>

        {/* Alerta si hay modificaciones */}
        {studentsWithModifications.length > 0 && (
          <div className="mt-4 rounded-lg border-2 border-amber-200 bg-amber-50 p-4 shadow-md dark:border-amber-800 dark:bg-amber-950/30">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-amber-900 dark:text-amber-100">
                {studentsWithModifications.length} estudiante(s) tienen registros modificados
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de estudiantes y cursos */}
      <div className="overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <TableHead className="w-8 text-white" />
              <TableHead className="font-semibold text-white">Estudiante</TableHead>
              <TableHead className="font-semibold text-white">Estado General</TableHead>
              <TableHead className="text-right font-semibold text-white">Detalles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white dark:bg-gray-900">
            {studentsWithAttendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">No hay registros de asistencia para esta fecha</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              studentsWithAttendance.map((student) => (
                <StudentRow
                  key={student.enrollmentId}
                  student={student}
                  allowedStatuses={allowedStatuses}
                  onStatusUpdate={onStatusUpdate}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pie de página con ayuda */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <Info className="inline h-4 w-4 mr-1" />
          Haz clic en un estudiante para ver detalles de cada curso
        </p>
      </div>
    </div>
  );
}
