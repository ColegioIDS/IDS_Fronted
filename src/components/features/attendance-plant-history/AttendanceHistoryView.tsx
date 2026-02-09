'use client';

/**
 * ====================================================================
 * AttendanceHistoryView - Vista del historial de asistencia de la sección
 * ====================================================================
 * Tabla de matriz: Estudiantes (Y) x Semanas/Días (X)
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAttendanceHistory, useAttendanceJustification } from '@/hooks/data/attendance-plant';
import { useAllowedStatuses } from '@/hooks/data/attendance-plant';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader, AlertCircle, ArrowUpDown, X, RotateCcw, Upload, CheckCircle2, CheckCircle, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { validateDocument, validateNotes } from '@/constants/attendance-document.config';
import { updateDailyAttendance } from '@/services/attendance-plant.service';
import type { StudentHistoryData, HistoryWeek, HistoryDayAttendance, AttendanceStatus } from '@/types/attendance-plant.types';

interface AttendanceHistoryViewProps {
  gradeId: number;
  gradeName: string;
  sectionId: number;
  sectionName: string;
  bimesterId: number;
  bimesterName: string;
  cycleId: number;
}

export function AttendanceHistoryView({
  gradeId,
  gradeName,
  sectionId,
  sectionName,
  bimesterId,
  bimesterName,
  cycleId,
}: AttendanceHistoryViewProps) {
  const { data: historyData, isLoading, error, refetch } = useAttendanceHistory({
    gradeId,
    sectionId,
    bimesterId,
    cycleId,
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-center gap-3 py-12">
          <Loader size={24} className="animate-spin text-blue-500" />
          <p className="text-slate-600">Cargando historial de la sección...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-xl">
          <div className="flex items-start gap-4">
            <AlertCircle size={28} className="text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-1">Error al cargar historial</h3>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!historyData || !historyData.students || historyData.students.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-xl">
          <h3 className="text-lg font-bold text-blue-900">No hay datos disponibles</h3>
          <p className="text-blue-800 mt-1">No se encontraron registros de asistencia para esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {gradeName} - Sección {sectionName}
            </h2>
            <p className="text-sm text-slate-600 mt-1">{bimesterName}</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
            title="Recargar datos"
          >
            <RotateCcw size={18} className={isLoading ? 'animate-spin' : ''} />
            Recargar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <AttendanceTable students={historyData.students} onUpdateSuccess={refetch} />
      </div>
    </div>
  );
}

interface AttendanceTableProps {
  students: StudentHistoryData[];
  onUpdateSuccess?: () => Promise<any>;
}

function AttendanceTable({ students, onUpdateSuccess }: AttendanceTableProps) {
  const { data: allowedStatuses } = useAllowedStatuses();
  const { can } = usePermissions();
  const canUpdateAttendance = can.update('attendance-plant');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedAttendance, setSelectedAttendance] = useState<{
    attendance: HistoryDayAttendance;
    studentName: string;
    date: string;
    dayOfWeek: string;
    status: AttendanceStatus | null;
  } | null>(null);
  const { data: justificationData } = useAttendanceJustification(selectedAttendance?.attendance.id);
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [justification, setJustification] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ notes?: string; file?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState<{ code: string; message: string; detail: string } | null>(null);

  // Ordenar estudiantes
  const sortedStudents = [...students].sort((a, b) => {
    const nameA = a.student.name.toLowerCase();
    const nameB = b.student.name.toLowerCase();
    
    if (sortOrder === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  // Cargar datos de justificación previos cuando se abre el diálogo
  React.useEffect(() => {
    if (justificationData && selectedAttendance) {
      // Pre-llenar con datos existentes
      if (justificationData.description) {
        setNotes(justificationData.description);
      }
      if (justificationData.documentUrl && justificationData.documentName) {
        // Crear un archivo "fake" para mostrar que ya existe un documento
        const fakeFile = new File(
          [''],
          justificationData.documentName,
          { type: justificationData.documentType || 'application/pdf' }
        );
        setUploadedFile(fakeFile);
      }
    }
  }, [justificationData, selectedAttendance]);

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Obtener todas las semanas y días de la primera para construir el header
  const firstStudent = students[0];
  const allWeeks = firstStudent.weeks;

  // Construir estructura de columnas por semana
  const weekColumns = allWeeks.map((week) => ({
    week,
    days: week.days,
  }));

  const getStatusColor = (status?: string): string => {
    if (!status || !allowedStatuses?.statuses) return '#D1D5DB'; // gray-300
    
    const statusObj = allowedStatuses.statuses.find((s: any) => s.code === status);
    return statusObj?.colorCode || '#D1D5DB';
  };

  const parseDate = (dateString: string): Date => {
    // Parsear "2026-01-12" correctamente sin problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getDayLabel = (dayOfWeek: string): string => {
    const labels: Record<string, string> = {
      Lunes: 'L',
      Martes: 'M',
      Miércoles: 'Mi',
      Jueves: 'J',
      Viernes: 'V',
      Sábado: 'S',
      Domingo: 'D',
    };
    return labels[dayOfWeek] || dayOfWeek.substring(0, 1);
  };

  // Función para actualizar asistencia
  const handleUpdateAttendance = async (newStatusId: number | undefined, file: File | null) => {
    if (!selectedAttendance || !newStatusId) return;

    setIsSaving(true);
    setServerError(null);
    setSuccessMessage('');

    try {
      // Llamar al servicio
      const result = await (updateDailyAttendance as any)(
        selectedAttendance.attendance.id,
        {
          newAttendanceStatusId: newStatusId,
          notes: notes.trim() || undefined,
          modificationReason: 'Actualización desde historial de asistencia',
        },
        file || undefined
      );

      // Éxito
      setSuccessMessage('Asistencia actualizada correctamente');
      toast.success('Asistencia actualizada correctamente');
      setIsSaving(false);

      // Refrescar los datos
      await onUpdateSuccess?.();

      // Cerrar dialog después de 1.5 segundos
      setTimeout(() => {
        setSelectedAttendance(null);
        setSelectedStatus(null);
        setNotes('');
        setJustification('');
        setUploadedFile(null);
        setValidationErrors({});
        setSuccessMessage('');
      }, 1500);
    } catch (error: any) {
      console.error('Error al actualizar asistencia:', error);

      // Extraer información del error desde Axios response o desde el error
      let errorCode = 'UNKNOWN_ERROR';
      let message = 'Error al actualizar la asistencia';
      let detail = '';

      // Si es un error de Axios con response del servidor
      if (error.response?.data) {
        const responseData = error.response.data;
        errorCode = responseData.errorCode || 'UNKNOWN_ERROR';
        message = responseData.message || message;
        detail = responseData.detail || '';
      } else if (error.message) {
        // Si es otro tipo de error, usar el mensaje
        message = error.message;
      }

      setServerError({
        code: errorCode,
        message,
        detail,
      });
      setIsSaving(false);
    }
  };

  return (
    <>
      <table className="w-full border-collapse text-sm">
      {/* Header: Semanas y días */}
      <thead>
        {/* Fila 1: Semanas */}
        <tr>
          <th className="sticky left-0 z-20 bg-slate-100 border border-slate-300 px-3 py-2 text-left font-semibold text-slate-900 min-w-[200px]">
            <button
              onClick={toggleSort}
              className="flex items-center gap-2 hover:text-blue-600 transition-colors w-full"
              title={`Ordenar ${sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
            >
              Estudiante
              <ArrowUpDown size={16} className={sortOrder === 'desc' ? 'rotate-180' : ''} />
            </button>
          </th>
          {weekColumns.map((column, weekIdx) => (
            <th
              key={column.week.weekId}
              colSpan={column.days.length}
              className={`border px-2 py-2 text-center font-semibold text-slate-900 ${
                weekIdx % 2 === 0 ? 'bg-blue-100' : 'bg-slate-200'
              } ${
                weekIdx < weekColumns.length - 1 ? 'border-r-4 border-slate-400' : 'border-slate-300'
              } border-slate-300`}
            >
              <div>Semana {column.week.weekNumber}</div>
              <div className="text-xs font-normal text-slate-700">
                {parseDate(column.week.startDate).getDate()}/{parseDate(column.week.startDate).getMonth() + 1}/{parseDate(column.week.startDate).getFullYear()} - {parseDate(column.week.endDate).getDate()}/{parseDate(column.week.endDate).getMonth() + 1}/{parseDate(column.week.endDate).getFullYear()}
              </div>
            </th>
          ))}
        </tr>

        {/* Fila 2: Días de la semana */}
        <tr>
          <th className="sticky left-0 z-20 bg-slate-100 border border-slate-300"></th>
          {weekColumns.map((column, weekIdx) =>
            column.days.map((day, idx) => (
              <th
                key={`${column.week.weekId}-${idx}`}
                className={`border px-1.5 py-2 text-center font-medium text-slate-700 text-xs ${
                  weekIdx % 2 === 0 ? 'bg-blue-50' : 'bg-slate-100'
                } ${
                  idx === column.days.length - 1 && weekIdx < weekColumns.length - 1
                    ? 'border-r-4 border-slate-400'
                    : 'border-slate-300'
                } border-slate-300`}
              >
                <div className="whitespace-nowrap font-bold text-sm">{getDayLabel(day.dayOfWeek)}</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {parseDate(day.date).getDate()}
                </div>
              </th>
            ))
          )}
        </tr>
      </thead>

      {/* Body: Estudiantes y estados */}
      <tbody>
        {sortedStudents.map((student) => (
          <tr key={student.student.id} className="hover:bg-slate-50">
            {/* Nombre del estudiante */}
            <td className="sticky left-0 z-10 bg-white border border-slate-300 px-3 py-3 font-medium text-slate-900 min-w-[200px]">
              <div className="truncate">{student.student.name}</div>
              <div className="text-xs text-slate-500">ID: {student.student.id}</div>
            </td>

            {/* Celdas de asistencia */}
            {student.weeks.map((week, weekIdx) =>
              week.days.map((day, dayIdx) => (
                <td
                  key={`${student.student.id}-${week.weekId}-${dayIdx}`}
                  className={`px-1.5 py-2 text-center ${
                    weekIdx % 2 === 0 ? 'bg-blue-50' : 'bg-white'
                  } ${
                    dayIdx === week.days.length - 1 && weekIdx < sortedStudents[0].weeks.length - 1
                      ? 'border-r-4 border-slate-400'
                      : 'border-slate-300'
                  } border border-slate-300`}
                >
                  {day.attendance ? (
                    <button
                      onClick={() => {
                        // Validar permiso antes de abrir
                        if (!canUpdateAttendance) {
                          return;
                        }
                        
                        if (day.attendance) {
                          const statusObj = allowedStatuses?.statuses?.find(
                            (s) => s.code === day.attendance!.status
                          );
                          setSelectedAttendance({
                            attendance: day.attendance,
                            studentName: student.student.name,
                            date: day.date,
                            dayOfWeek: day.dayOfWeek,
                            status: statusObj || null,
                          });
                          setSelectedStatus(null); // Reset el estado seleccionado
                          setNotes('');
                          setJustification('');
                          setUploadedFile(null);
                          setValidationErrors({});
                        }
                      }}
                      style={{
                        backgroundColor: getStatusColor(day.attendance.status),
                        opacity: canUpdateAttendance ? 1 : 0.5,
                      }}
                      disabled={!canUpdateAttendance}
                      className="w-8 h-8 rounded flex items-center justify-center mx-auto text-white font-bold text-xs cursor-pointer transition-transform hover:scale-125 hover:shadow-lg disabled:cursor-not-allowed"
                      title={canUpdateAttendance ? `${day.attendance.statusName} - Registrado por ${day.attendance.recordedBy}` : 'No tienes permiso para actualizar asistencia'}
                    >
                      {day.attendance.status}
                    </button>
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-200 mx-auto"></div>
                  )}
                </td>
              ))
            )}
          </tr>
        ))}
      </tbody>
    </table>

    {/* Attendance Editor Dialog */}
    <Dialog
      open={!!selectedAttendance}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedAttendance(null);
          setSelectedStatus(null);
          setNotes('');
          setJustification('');
          setUploadedFile(null);
          setValidationErrors({});
          setServerError(null);
          setSuccessMessage('');
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Asistencia</DialogTitle>
          <DialogDescription>
            {selectedAttendance?.studentName} - {selectedAttendance?.dayOfWeek},{' '}
            {selectedAttendance && parseDate(selectedAttendance.date).getDate()}/
            {selectedAttendance && parseDate(selectedAttendance.date).getMonth() + 1}/
            {selectedAttendance && parseDate(selectedAttendance.date).getFullYear()}
          </DialogDescription>
        </DialogHeader>

        {/* Mostrar justificación previa si existe */}
        {justificationData && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-sm text-blue-900">Justificación Anterior</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Estado:</span>
                <div className="flex gap-2">
                  {justificationData.status === 'approved' && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      ✓ Aprobada
                    </span>
                  )}
                  {justificationData.status === 'pending' && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                      ⏳ Pendiente
                    </span>
                  )}
                  {justificationData.status === 'rejected' && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                      ✗ Rechazada
                    </span>
                  )}
                </div>
              </div>
              {justificationData.description && (
                <div>
                  <span className="text-gray-600 font-medium">Descripción:</span>
                  <p className="text-gray-700 mt-1 italic bg-white p-2 rounded border border-blue-100">
                    "{justificationData.description}"
                  </p>
                </div>
              )}
              {justificationData.documentUrl && (
                <div className="flex items-center gap-2 p-2 bg-white rounded border border-blue-100">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <a
                    href={justificationData.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-xs font-medium"
                  >
                    Descargar {justificationData.documentName}
                  </a>
                </div>
              )}
              {justificationData.approvedAt && (
                <div className="text-xs text-gray-600 border-t border-blue-200 pt-2 mt-2">
                  <p>
                    Aprobado por <strong>{justificationData.approvedBy?.email}</strong> el{' '}
                    {new Date(justificationData.approvedAt).toLocaleDateString('es-ES')}{' '}
                    {new Date(justificationData.approvedAt).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedAttendance && (
          <div className="space-y-6">
            {/* Estado y Detalles */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Estado</label>
                <select
                  value={selectedStatus?.id || selectedAttendance.status?.id || ''}
                  onChange={(e) => {
                    const newStatus = allowedStatuses?.statuses?.find(
                      (s) => s.id === parseInt(e.target.value)
                    );
                    setSelectedStatus(newStatus || null);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  {allowedStatuses?.statuses?.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
                {(selectedStatus || selectedAttendance.status) && (
                  <div className="mt-2 flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div
                      style={{
                        backgroundColor: getStatusColor((selectedStatus || selectedAttendance.status)?.code || ''),
                      }}
                      className="w-6 h-6 rounded"
                    ></div>
                    <p className="text-xs text-slate-600">
                      {(selectedStatus || selectedAttendance.status)?.code}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Registrado por</label>
                <p className="mt-2 p-3 bg-slate-50 rounded-lg text-slate-900">
                  {selectedAttendance.attendance.recordedBy}
                </p>
              </div>
            </div>

            {/* Descripción del Estado */}
            {(selectedStatus || selectedAttendance.status)?.description && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">{(selectedStatus || selectedAttendance.status)?.description}</p>
              </div>
            )}

            {/* Notas */}
            {(selectedStatus || selectedAttendance.status)?.permissions?.requiresNotes && (
              <div>
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  Notas
                  {(selectedStatus || selectedAttendance.status)?.permissions?.justificationRequired && (
                    <span className="text-red-600">*</span>
                  )}
                </label>
                <p className="text-xs text-slate-600 mt-1">
                  {(selectedStatus || selectedAttendance.status)?.permissions?.minNotesLength && 
                    `Mínimo: ${(selectedStatus || selectedAttendance.status)?.permissions?.minNotesLength} caracteres`}
                  {(selectedStatus || selectedAttendance.status)?.permissions?.minNotesLength && 
                    (selectedStatus || selectedAttendance.status)?.permissions?.maxNotesLength && ' • '}
                  {(selectedStatus || selectedAttendance.status)?.permissions?.maxNotesLength && 
                    `Máximo: ${(selectedStatus || selectedAttendance.status)?.permissions?.maxNotesLength} caracteres`}
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    // Validar en tiempo real
                    const validation = validateNotes(
                      e.target.value,
                      (selectedStatus || selectedAttendance.status)?.permissions?.minNotesLength,
                      (selectedStatus || selectedAttendance.status)?.permissions?.maxNotesLength,
                      (selectedStatus || selectedAttendance.status)?.permissions?.requiresNotes
                    );
                    if (!validation.valid) {
                      setValidationErrors({ ...validationErrors, notes: validation.error });
                    } else {
                      setValidationErrors({ ...validationErrors, notes: undefined });
                    }
                  }}
                  placeholder="Ingresa notas sobre esta asistencia..."
                  className={`mt-2 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm resize-none ${
                    validationErrors.notes
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                  rows={4}
                  maxLength={(selectedStatus || selectedAttendance.status)?.permissions?.maxNotesLength || undefined}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-slate-500">
                    {notes.length}
                    {(selectedStatus || selectedAttendance.status)?.permissions?.maxNotesLength && ` / ${(selectedStatus || selectedAttendance.status)?.permissions?.maxNotesLength}`}
                  </p>
                  {validationErrors.notes && (
                    <p className="text-xs text-red-600">{validationErrors.notes}</p>
                  )}
                </div>
              </div>
            )}

            {/* Justificación */}
            {(selectedStatus || selectedAttendance.status)?.permissions?.justificationRequired && (
              <div>
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  Justificación
                  <span className="text-red-600">*</span>
                </label>
                <p className="text-xs text-slate-600 mt-1">
                  {(selectedStatus || selectedAttendance.status)?.permissions?.notes}
                </p>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Proporciona una justificación para esta ausencia..."
                  className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  rows={4}
                />
              </div>
            )}

            {/* Subir Archivo/Imagen - Solo si justificationRequired && canAddJustification */}
            {(selectedStatus || selectedAttendance.status)?.permissions?.justificationRequired &&
              (selectedStatus || selectedAttendance.status)?.permissions?.canAddJustification && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Documento de Justificación
                    <span className="text-red-600">*</span>
                  </label>
                  <p className="text-xs text-slate-600 mt-1">
                    Formatos: PDF, JPG, PNG, DOC (máx 5 MB, mín 100 KB)
                  </p>
                  <div
                    className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      uploadedFile
                        ? 'border-green-300 bg-green-50'
                        : validationErrors.file
                          ? 'border-red-300 bg-red-50'
                          : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setUploadedFile(file);

                        // Validar archivo
                        if (file) {
                          const validation = validateDocument(file);
                          if (!validation.valid) {
                            setValidationErrors({ ...validationErrors, file: validation.error });
                          } else {
                            setValidationErrors({ ...validationErrors, file: undefined });
                          }
                        } else {
                          setValidationErrors({ ...validationErrors, file: undefined });
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      {uploadedFile ? (
                        <>
                          <CheckCircle2 size={24} className="text-green-600" />
                          <p className="text-sm font-medium text-green-900">{uploadedFile.name}</p>
                          <p className="text-xs text-green-700">
                            ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload size={24} className="text-slate-400" />
                          <p className="text-sm font-medium text-slate-900">
                            Haz clic para seleccionar archivo
                          </p>
                          <p className="text-xs text-slate-600">o arrastra un archivo aquí</p>
                        </>
                      )}
                    </label>
                  </div>
                  {validationErrors.file && (
                    <p className="text-xs text-red-600 mt-2">{validationErrors.file}</p>
                  )}
                </div>
              )}


            {/* Botones de Acción */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setSelectedAttendance(null)}
                className="flex-1 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-900 font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Validar antes de guardar
                  const currentStatus = selectedStatus || selectedAttendance.status;
                  const newErrors: { notes?: string; file?: string } = {};

                  // Validar notas
                  if (currentStatus?.permissions?.requiresNotes) {
                    const notesValidation = validateNotes(
                      notes,
                      currentStatus.permissions.minNotesLength,
                      currentStatus.permissions.maxNotesLength,
                      true
                    );
                    if (!notesValidation.valid) {
                      newErrors.notes = notesValidation.error;
                    }
                  }

                  // Validar documento si es requerido
                  if (
                    currentStatus?.permissions?.justificationRequired &&
                    currentStatus?.permissions?.canAddJustification
                  ) {
                    if (!uploadedFile) {
                      newErrors.file = 'El documento de justificación es requerido';
                    } else {
                      const fileValidation = validateDocument(uploadedFile);
                      if (!fileValidation.valid) {
                        newErrors.file = fileValidation.error;
                      }
                    }
                  }

                  if (Object.keys(newErrors).length > 0) {
                    setValidationErrors(newErrors);
                    return;
                  }

                  // Llamar al endpoint PATCH para actualizar asistencia
                  handleUpdateAttendance(currentStatus?.id, uploadedFile);
                }}
                disabled={
                  // Tiene errores de validación
                  Object.values(validationErrors).some(v => v !== undefined) ||
                  // Requiere notas pero no las tiene
                  ((selectedStatus || selectedAttendance.status)?.permissions?.requiresNotes &&
                    !notes.trim()) ||
                  // Requiere documento pero no lo tiene
                  ((selectedStatus || selectedAttendance.status)?.permissions?.justificationRequired &&
                    (selectedStatus || selectedAttendance.status)?.permissions?.canAddJustification &&
                    !uploadedFile) ||
                  // Está guardando
                  isSaving
                }
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    Actualizando...
                  </span>
                ) : (
                  'Actualizar'
                )}
              </button>
            </div>

            {/* Mensaje de Error */}
            {serverError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-900 mb-1">{serverError.message}</p>
                <p className="text-xs text-red-700 mb-1">Código: {serverError.code}</p>
                {serverError.detail && (
                  <p className="text-xs text-red-600">{serverError.detail}</p>
                )}
              </div>
            )}

            {/* Mensaje de Éxito */}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-900">{successMessage}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
