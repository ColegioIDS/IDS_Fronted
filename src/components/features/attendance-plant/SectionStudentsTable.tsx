'use client';

/**
 * ====================================================================
 * SectionStudentsTable - Tabla de estudiantes por sección
 * ====================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useAllowedStatuses, useRecordAttendance, useUpdateAttendance, useSectionAttendance, useRecordAttendanceBulk } from '@/hooks/data/attendance-plant';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { SectionStudent, SectionStudentsResponse, AttendanceStatus, SectionAttendanceStudent } from '@/types/attendance-plant.types';
import { Users, AlertCircle, Loader, ArrowUp, ArrowDown, Check, X, Clock, Badge, CheckSquare, Square } from 'lucide-react';

interface SectionStudentsTableProps {
  date: string; // YYYY-MM-DD
  cycleId: number;
  bimesterId: number;
  gradeId: number;
  sectionId: number;
  gradeName: string;
  sectionName: string;
}

interface NotesModalState {
  isOpen: boolean;
  studentId?: number;
  studentName?: string;
  status?: AttendanceStatus;
  notes: string;
}

export function SectionStudentsTable({
  date,
  cycleId,
  bimesterId,
  gradeId,
  sectionId,
  gradeName,
  sectionName,
}: SectionStudentsTableProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [notesModal, setNotesModal] = useState<NotesModalState>({
    isOpen: false,
    notes: '',
  });
  const [recordingStudent, setRecordingStudent] = useState<number | null>(null);
  const [editingAttendanceId, setEditingAttendanceId] = useState<number | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<AttendanceStatus | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const { data: statusesData } = useAllowedStatuses();
  const { isLoading: recordingLoading, error: recordingError, recordAttendance } = useRecordAttendance();
  const { isLoading: updatingLoading, error: updatingError, updateAttendance } = useUpdateAttendance();
  const { isLoading: bulkLoading, error: bulkError, recordBulkAttendance } = useRecordAttendanceBulk();
  const { data: sectionAttendanceData, isLoading: attendanceLoading, error: attendanceError, refetch } = useSectionAttendance({
    date,
    cycleId,
    bimesterId,
    gradeId,
    sectionId,
  });

  const sortedStudents = useMemo(() => {
    if (!sectionAttendanceData?.students) return [];
    
    const sorted = [...sectionAttendanceData.students].sort((a, b) => {
      const nameA = a.fullName.toLowerCase();
      const nameB = b.fullName.toLowerCase();
      
      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB, 'es');
      } else {
        return nameB.localeCompare(nameA, 'es');
      }
    });
    
    return sorted;
  }, [sectionAttendanceData?.students, sortOrder]);

  const handleRecordAttendance = async (
    enrollmentId: number,
    status: AttendanceStatus,
    notes: string
  ) => {
    setRecordingStudent(enrollmentId);
    const result = await recordAttendance({
      enrollmentId,
      sectionId,
      date,
      attendanceStatusId: status.id,
      notes: notes || undefined,
      recordingType: 'TEACHER',
    });

    if (result) {
      const studentName = sectionAttendanceData?.students.find(s => s.enrollmentId === enrollmentId)?.fullName;
      toast.success(`Asistencia registrada para ${studentName}`);
      setNotesModal({ isOpen: false, notes: '' });
      // Refrescar los datos después de registrar
      refetch();
    } else if (recordingError) {
      toast.error(recordingError);
    }
    setRecordingStudent(null);
  };

  const handleUpdateAttendance = async (
    attendanceId: number,
    status: AttendanceStatus,
    notes: string
  ) => {
    setEditingAttendanceId(attendanceId);
    const result = await updateAttendance(attendanceId, {
      newAttendanceStatusId: status.id,
      notes: notes || undefined,
    });

    if (result) {
      const studentName = sectionAttendanceData?.students.find(
        s => s.attendance?.id === attendanceId
      )?.fullName;
      toast.success(`Asistencia actualizada para ${studentName}`);
      setNotesModal({ isOpen: false, notes: '' });
      // Refrescar los datos después de actualizar
      refetch();
    } else if (updatingError) {
      toast.error(updatingError);
    }
    setEditingAttendanceId(null);
  };

  const handleNotesSubmit = () => {
    if (notesModal.studentId && notesModal.status) {
      if (editingAttendanceId) {
        handleUpdateAttendance(editingAttendanceId, notesModal.status, notesModal.notes);
      } else {
        handleRecordAttendance(notesModal.studentId, notesModal.status, notesModal.notes);
      }
    }
  };

  const handleToggleStudent = (enrollmentId: number) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(enrollmentId)) {
      newSelected.delete(enrollmentId);
    } else {
      newSelected.add(enrollmentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === sortedStudents.length) {
      // Deseleccionar todos
      setSelectedStudents(new Set());
    } else {
      // Seleccionar todos
      setSelectedStudents(new Set(sortedStudents.map(s => s.enrollmentId)));
    }
  };

  const handleBulkStatusClick = (status: AttendanceStatus) => {
    setBulkStatus(status);
    setShowBulkConfirm(true);
  };

  const handleBulkSubmit = async () => {
    if (!bulkStatus || selectedStudents.size === 0) return;

    const result = await recordBulkAttendance({
      recordingType: 'TEACHER',
      attendances: Array.from(selectedStudents).map(enrollmentId => ({
        enrollmentId,
        sectionId,
        date,
        attendanceStatusId: bulkStatus.id,
      })),
    });

    if (result) {
      toast.success(`Asistencia registrada para ${selectedStudents.size} estudiantes`);
      setSelectedStudents(new Set());
      setBulkStatus(null);
      setShowBulkConfirm(false);
      refetch();
    } else if (bulkError) {
      toast.error(bulkError);
    }
  };

  if (attendanceLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-center gap-3 py-12">
          <Loader size={24} className="animate-spin text-blue-500" />
          <p className="text-slate-600">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  if (attendanceError) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle size={28} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-1">No se puede cargar la lista</h3>
              <p className="text-amber-800 mb-4">{attendanceError}</p>
              <div className="bg-white bg-opacity-50 rounded-lg p-3 border border-amber-200">
                <p className="text-sm text-amber-700">
                  💡 <strong>Sugerencia:</strong> Intenta seleccionar una fecha dentro de una semana académica activa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sectionAttendanceData) {
    return null;
  }

  const { totalStudents, registeredCount, pendingCount } = sectionAttendanceData;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-slate-900">Lista de Estudiantes</h2>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              <Users size={16} />
              {totalStudents}
            </span>
          </div>
          <p className="text-slate-600 text-sm">
            {gradeName} - Sección {sectionName}
          </p>
        </div>
      </div>

      {/* VALIDATION INFO */}
      <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-600 font-medium uppercase text-xs">Total Estudiantes</p>
            <p className="text-slate-900 font-semibold mt-1">{totalStudents}</p>
          </div>
          <div>
            <p className="text-slate-600 font-medium uppercase text-xs">Registrados</p>
            <p className="text-slate-900 font-semibold mt-1 text-green-600">{registeredCount}</p>
          </div>
          <div>
            <p className="text-slate-600 font-medium uppercase text-xs">Pendientes</p>
            <p className="text-slate-900 font-semibold mt-1 text-amber-600">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* BULK ACTIONS BAR */}
      {selectedStudents.size > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-900">
              {selectedStudents.size} estudiante{selectedStudents.size !== 1 ? 's' : ''} seleccionado{selectedStudents.size !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {statusesData?.statuses && statusesData.statuses.length > 0 ? (
              statusesData.statuses
                .filter((status) => status.permissions?.canCreate)
                .map((status) => (
                  <button
                    key={status.id}
                    onClick={() => handleBulkStatusClick(status)}
                    disabled={bulkLoading}
                    style={{
                      backgroundColor: status.colorCode,
                      borderColor: status.colorCode,
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-white rounded-lg border border-solid transition-all duration-200 hover:shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Registrar ${status.name} para seleccionados`}
                  >
                    {status.code.slice(0, 3)}
                  </button>
                ))
            ) : (
              <span className="text-xs text-blue-600">Sin permisos</span>
            )}
            <button
              onClick={() => setSelectedStudents(new Set())}
              disabled={bulkLoading}
              className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-200 rounded-lg border border-slate-300 transition-all hover:bg-slate-300 disabled:opacity-50"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      {sortedStudents.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-semibold text-slate-700 text-sm w-12">
                  <button
                    onClick={handleSelectAll}
                    disabled={sortedStudents.length === 0}
                    className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
                    title={selectedStudents.size === sortedStudents.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  >
                    {selectedStudents.size === sortedStudents.length ? (
                      <CheckSquare size={18} className="text-blue-600" />
                    ) : (
                      <Square size={18} className="text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 text-sm">No.</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 text-sm">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
                  >
                    Nombre Completo
                    {sortOrder === 'asc' ? (
                      <ArrowUp size={16} className="text-blue-600" />
                    ) : (
                      <ArrowDown size={16} className="text-blue-600" />
                    )}
                  </button>
                </th>
                <th className="text-center px-4 py-3 font-semibold text-blue-700 text-sm bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1.5">
                    <Badge size={16} className="text-blue-600" />
                    <span>Estado Actual</span>
                  </div>
                </th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student: SectionAttendanceStudent, index: number) => (
                <tr
                  key={student.enrollmentId}
                  style={{
                    backgroundColor: selectedStudents.has(student.enrollmentId)
                      ? '#dbeafe'
                      : student.attendance
                      ? `${student.attendance.statusInfo.colorCode}20`
                      : 'transparent',
                  }}
                  className="border-b border-slate-100 hover:bg-slate-100 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-center">
                    <button
                      onClick={() => handleToggleStudent(student.enrollmentId)}
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                      title={selectedStudents.has(student.enrollmentId) ? 'Deseleccionar' : 'Seleccionar'}
                    >
                      {selectedStudents.has(student.enrollmentId) ? (
                        <CheckSquare size={18} className="text-blue-600" />
                      ) : (
                        <Square size={18} className="text-slate-300" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-medium">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium">{student.fullName}</td>
                  <td className="px-4 py-3 text-center">
                    {/* Mostrar estado actual si existe */}
                    {student.attendance ? (
                      <div className="flex items-center justify-center gap-2">
                        <div
                          style={{
                            backgroundColor: student.attendance.statusInfo.colorCode,
                            borderColor: student.attendance.statusInfo.colorCode,
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-white rounded-lg border border-solid flex items-center gap-1.5"
                        >
                          <Check size={14} />
                          {student.attendance.statusInfo.code.slice(0, 3)}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(student.attendance.recordedAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {/* Botones para registrar/cambiar estado */}
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {statusesData?.statuses && statusesData.statuses.length > 0 ? (
                          statusesData.statuses
                            .filter((status) => status.permissions?.canCreate)
                            .map((status) => {
                              // Determinar icono según el código de estado
                              const getStatusIcon = () => {
                                const code = status.code.toUpperCase();
                                if (code.includes('PRESENT')) return <Check size={14} />;
                                if (code.includes('ABSENT')) return <X size={14} />;
                                if (code.includes('LATE')) return <Clock size={14} />;
                                return null;
                              };

                              const handleStatusSelection = () => {
                                if (status.permissions?.requiresNotes) {
                                  // Si requiere notas, abrir modal con status pre-seleccionado
                                  setNotesModal({
                                    isOpen: true,
                                    studentId: student.enrollmentId,
                                    studentName: student.fullName,
                                    status: status,
                                    notes: student.attendance?.notes || '',
                                  });
                                  // Si está editando, guardar el ID
                                  if (student.attendance) {
                                    setEditingAttendanceId(student.attendance.id);
                                  }
                                } else {
                                  // Si no requiere notas, registrar/actualizar directamente
                                  if (student.attendance) {
                                    handleUpdateAttendance(student.attendance.id, status, '');
                                  } else {
                                    handleRecordAttendance(student.enrollmentId, status, '');
                                  }
                                }
                              };

                              return (
                                <button
                                  key={status.id}
                                  onClick={handleStatusSelection}
                                  disabled={recordingLoading || updatingLoading || recordingStudent === student.enrollmentId || editingAttendanceId === student.attendance?.id}
                                  style={{
                                    backgroundColor: status.colorCode,
                                    borderColor: status.colorCode,
                                    opacity: (recordingStudent === student.enrollmentId || editingAttendanceId === student.attendance?.id) ? 0.6 : 1,
                                  }}
                                  className="group relative px-2.5 py-1.5 text-xs font-bold text-white rounded-lg border border-solid transition-all duration-200 hover:shadow-md hover:scale-110 active:scale-95 hover:brightness-110 disabled:cursor-not-allowed"
                                  title={status.name}
                                >
                                  <span className="flex items-center gap-1.5">
                                    {(recordingStudent === student.enrollmentId || editingAttendanceId === student.attendance?.id) ? (
                                      <Loader size={14} className="animate-spin" />
                                    ) : (
                                      getStatusIcon()
                                    )}
                                    <span className="font-semibold">{status.code.slice(0, 3).toUpperCase()}</span>
                                  </span>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                    {status.name}
                                  </div>
                                </button>
                              );
                            })
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sin permisos</span>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center">
          <Users size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No hay estudiantes disponibles</p>
        </div>
      )}

      {/* NOTES MODAL */}
      {notesModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {editingAttendanceId ? 'Cambiar Asistencia' : 'Registrar Asistencia'}
            </h2>
            <p className="text-slate-600 mb-4">
              <span className="font-semibold">{notesModal.studentName}</span>
            </p>

            {/* Mostrar estado seleccionado */}
            {notesModal.status && (
              <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Estado seleccionado:</p>
                <div
                  style={{
                    backgroundColor: notesModal.status.colorCode,
                    borderColor: notesModal.status.colorCode,
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-lg border border-solid"
                >
                  {notesModal.status.code.includes('PRESENT') && <Check size={14} />}
                  {notesModal.status.code.includes('ABSENT') && <X size={14} />}
                  {notesModal.status.code.includes('LATE') && <Clock size={14} />}
                  <span>{notesModal.status.name}</span>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Notas
              </label>
              <textarea
                value={notesModal.notes}
                onChange={(e) =>
                  setNotesModal({ ...notesModal, notes: e.target.value })
                }
                placeholder="Ingresa las notas (ej: llegó tarde, ausente sin justificación, etc.)"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setNotesModal({ isOpen: false, notes: '' })}
                disabled={recordingLoading || updatingLoading}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 font-semibold rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleNotesSubmit}
                disabled={recordingLoading || updatingLoading || !notesModal.notes.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {recordingLoading || updatingLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    {editingAttendanceId ? 'Actualizando...' : 'Registrando...'}
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK CONFIRMATION DIALOG */}
      <ConfirmDialog
        open={showBulkConfirm}
        onOpenChange={setShowBulkConfirm}
        title="Registrar Asistencia en Grupo"
        description={`¿Registrar ${bulkStatus?.name} para ${selectedStudents.size} estudiante${selectedStudents.size !== 1 ? 's' : ''}?`}
        actionLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={handleBulkSubmit}
        isLoading={bulkLoading}
      />
    </div>
  );
}
