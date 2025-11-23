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
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Edit2, Save, X } from 'lucide-react';
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
function getStudentOverallStatus(student: ConsolidatedStudentAttendance): {
  type: 'complete' | 'mixed';
  label: string;
  icon: React.ReactNode;
} {
  const statuses = new Set(student.courses.map(c => c.currentStatus));
  
  if (statuses.size === 1) {
    return {
      type: 'complete',
      label: `${student.courses[0].currentStatusName} (${student.courses.length} cursos)`,
      icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    };
  }
  
  // Contar tipos de status para mostrar resumen
  const statusCounts: Record<string, number> = {};
  student.courses.forEach(c => {
    statusCounts[c.currentStatusName] = (statusCounts[c.currentStatusName] || 0) + 1;
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
 * Obtener color para un status dinámico
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
  const overallStatus = getStudentOverallStatus(student);
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
    
    setEditingCourse(prev => prev ? { ...prev, isSaving: true } : null);
    try {
      await onStatusUpdate(course.classAttendanceId, editingCourse.newStatusId, editingCourse.reason);
      setEditingCourse(null);
    } catch (error) {
      console.error('Error updating status:', error);
      // El error será manejado por el componente padre
    } finally {
      setEditingCourse(prev => prev ? { ...prev, isSaving: false } : null);
    }
  };

  return (
    <>
      {/* Fila principal del estudiante */}
      <TableRow
        className={`cursor-pointer hover:bg-gray-50 ${
          hasModifications ? 'bg-amber-50' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="w-8">
          <button className="p-1">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </TableCell>
        <TableCell className="font-medium text-gray-900">
          {student.studentName}
          <div className="text-xs text-gray-500">
            #{student.studentId} • Matrícula: {student.enrollmentId}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {overallStatus.icon}
            <span
              className={`text-sm font-medium ${
                overallStatus.type === 'mixed' ? 'text-amber-700' : 'text-green-700'
              }`}
            >
              {overallStatus.label}
            </span>
          </div>
        </TableCell>
        <TableCell className="text-right text-sm text-gray-600">
          {student.courses.length} cursos
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
              className={`bg-gray-50 ${
                course.hasModifications ? 'border-l-4 border-amber-500' : ''
              } ${isEditing ? 'bg-blue-50' : ''}`}
            >
              <TableCell />
              <TableCell className="pl-12 text-sm">
                <span className="font-medium text-gray-900">
                  {course.courseName}
                </span>
              </TableCell>
              <TableCell className="text-sm">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">Nuevo estado:</label>
                      <select
                        className="rounded border border-blue-300 bg-white px-2 py-1 text-sm"
                        value={editingCourse.newStatusId}
                        onChange={(e) =>
                          setEditingCourse({
                            ...editingCourse,
                            newStatusId: parseInt(e.target.value),
                          })
                        }
                      >
                        <option value="">Seleccionar...</option>
                        {allowedStatuses?.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">Motivo:</label>
                      <input
                        type="text"
                        className="rounded border border-blue-300 bg-white px-2 py-1 text-sm flex-1"
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
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Original:</span>
                      <div className="flex items-center gap-2">
                        {originalStatus?.colorCode && (
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: getStatusColor(originalStatus.colorCode),
                            }}
                          />
                        )}
                        <span className="text-gray-700">
                          {course.originalStatusName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Actual:</span>
                      <div className="flex items-center gap-2">
                        {currentStatus?.colorCode && (
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: getStatusColor(currentStatus.colorCode),
                            }}
                          />
                        )}
                        <span className="text-gray-700 font-medium">
                          {course.currentStatusName}
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
                      onClick={handleSaveStatus}
                      disabled={editingCourse.isSaving || !editingCourse.newStatusId}
                      className="p-1 rounded hover:bg-green-100 disabled:opacity-50"
                      title="Guardar cambios"
                    >
                      <Save className="h-4 w-4 text-green-600" />
                    </button>
                    <button
                      onClick={() => setEditingCourse(null)}
                      disabled={editingCourse.isSaving}
                      className="p-1 rounded hover:bg-red-100"
                      title="Cancelar"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {course.hasModifications ? (
                        <div className="flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">
                          <AlertCircle className="h-3 w-3" />
                          <span>Modificado</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Original</span>
                      )}
                      {onStatusUpdate && (
                        <button
                          onClick={() => handleEditClick(course.courseId, currentStatus?.id || 0)}
                          className="p-1 rounded hover:bg-blue-100 transition"
                          title="Editar estado"
                        >
                          <Edit2 className="h-4 w-4 text-blue-600" />
                        </button>
                      )}
                    </div>
                    {course.modificationDetails && (
                      <div className="text-xs text-gray-500">
                        <div>Modificado por: {course.modificationDetails.modifiedBy}</div>
                        <div>{course.modificationDetails.reason}</div>
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
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

  return (
    <div className="space-y-4">
      {/* Header con información general */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="text-sm text-gray-600">Fecha</div>
            <div className="font-semibold text-gray-900">{data.date}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Día</div>
            <div className="font-semibold text-gray-900">{data.dayName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Estudiantes</div>
            <div className="font-semibold text-gray-900">{data.totalStudents}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Registros</div>
            <div className="font-semibold text-gray-900">{data.totalRecords}</div>
          </div>
        </div>

        {/* Alerta si hay modificaciones */}
        {studentsWithModifications.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                {studentsWithModifications.length} estudiante(s) tienen registros modificados
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de estudiantes y cursos */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-8" />
              <TableHead>Estudiante</TableHead>
              <TableHead>Estado General</TableHead>
              <TableHead className="text-right">Detalles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No hay registros de asistencia para esta fecha
                </TableCell>
              </TableRow>
            ) : (
              data.students.map((student) => (
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

      {/* Resumen */}
      <div className="text-xs text-gray-500 text-center">
        Haz clic en un estudiante para ver detalles de cada curso
      </div>
    </div>
  );
}
