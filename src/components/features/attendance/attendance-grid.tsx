'use client';

import { useState, useCallback, useEffect } from 'react';
import { useGradesAndSections } from '@/hooks/attendance/useGradesAndSections';
import { useStudentsBySection } from '@/hooks/data';
import { useAttendanceByDate } from '@/hooks/attendance/useAttendanceByDate';
import { useActiveCycleId } from '@/hooks/attendance/useActiveCycleId';
import { AttendanceStatusProvider } from '@/context/AttendanceStatusContext';
import AttendanceHeader from './components/header/AttendanceHeader';
import SimpleAttendanceTable from './components/table/SimpleAttendanceTable';
import EmptyState from './components/states/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { attendanceRecordService } from '@/services/attendance-record.service';
import { toast } from 'sonner';

function AttendanceGridContent() {
  // ========== OBTENER ID DEL CICLO ACTIVO ==========
  const { cycleId: activeCycleId } = useActiveCycleId();

  // ========== HOOK PARA CARGAR SECCIONES ==========
  const { sections: loadedSections, fetchSectionsByGrade } = useGradesAndSections();

  // ========== ESTADOS LOCALES ==========
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // ========== CARGAR ESTUDIANTES DE LA SECCIÓN ==========
  const { students, loading: loadingStudents, error: studentsError } = useStudentsBySection(
    selectedGradeId,
    selectedSectionId
  );

  // ========== CARGAR ASISTENCIA PARA LA FECHA SELECCIONADA ==========
  const { attendance: existingAttendance, loading: loadingAttendance, loadAttendance } = useAttendanceByDate({
    sectionId: selectedSectionId || undefined,
    cycleId: activeCycleId || undefined,
    date: selectedDate,
  });

  // Cargar asistencia cuando cambia sección o fecha
  useEffect(() => {
    if (selectedSectionId && activeCycleId) {
      loadAttendance();
    }
  }, [selectedSectionId, selectedDate, activeCycleId, loadAttendance]);

  // ========== MAPEAR ESTUDIANTES AL FORMATO ESPERADO ==========
  const mappedStudents = students.map((enrollment: any) => ({
    enrollmentId: enrollment.id,
    studentName: `${enrollment.student?.givenNames || ''} ${enrollment.student?.lastNames || ''}`.trim() || 'Sin nombre',
    studentId: enrollment.student?.id,
    codeSIRE: enrollment.student?.codeSIRE,
    sectionId: enrollment.sectionId,
    gradeId: enrollment.gradeId,
  }));

  console.log('🎯 Estado de attendance-grid:', {
    selectedGradeId,
    selectedSectionId,
    studentsCount: students.length,
    loadedSectionsCount: loadedSections.length,
    loadingStudents,
    studentsError,
  });

  // ========== HANDLERS ==========
  const handleGradeChange = useCallback(
    (gradeId: number | null) => {
      console.log('📍 handleGradeChange:', gradeId);
      setSelectedGradeId(gradeId);
      setSelectedSectionId(null);

      // Load sections for the selected grade
      if (gradeId) {
        console.log('🔄 Fetching sections for grade:', gradeId);
        fetchSectionsByGrade(gradeId);
      }
    },
    [fetchSectionsByGrade]
  );

  const handleSectionChange = useCallback((sectionId: number | null) => {
    console.log('📍 handleSectionChange:', sectionId);
    setSelectedSectionId(sectionId);
  }, []);

  const handleDateChange = useCallback((date: Date) => {
    console.log('📍 handleDateChange:', date);
    setSelectedDate(date);
  }, []);

  // ========== HANDLER PARA CAMBIAR ESTADO DE ASISTENCIA ==========
  const handleAttendanceStatusChange = useCallback(
    async (enrollmentId: number, statusId: number, studentName: string) => {
      try {
        // Buscar el registro de asistencia existente
        const existingRecord = existingAttendance[enrollmentId];

        if (!existingRecord) {
          // Si no existe, crear uno nuevo
          console.log('[handleAttendanceStatusChange] Creating new attendance record');
          toast.error('No se encontró registro de asistencia. Por favor recarga la página.');
          return;
        }

        const changeReason = 'Asistencia registrada por docente en clase';
        console.log('[handleAttendanceStatusChange] Updating attendance:', {
          attendanceId: existingRecord.id,
          statusId,
          changeReason,
        });

        // Actualizar en backend
        await attendanceRecordService.updateAttendanceStatus(
          existingRecord.id,
          statusId,
          changeReason
        );

        console.log('✅ Asistencia actualizada:', studentName);
        toast.success(`${studentName}: Asistencia registrada`);

        // Recargar asistencia para reflejar el cambio
        loadAttendance();
      } catch (error) {
        console.error('[handleAttendanceStatusChange] Error:', error);
        const message = error instanceof Error ? error.message : 'Error al registrar asistencia';
        toast.error(message);
      }
    },
    [existingAttendance, loadAttendance]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 📋 Header con selectores */}
        <AttendanceHeader
          selectedGradeId={selectedGradeId}
          selectedSectionId={selectedSectionId}
          selectedDate={selectedDate}
          onGradeChange={handleGradeChange}
          onSectionChange={handleSectionChange}
          onDateChange={handleDateChange}
          sections={loadedSections}
        />

        {/* 🎯 Área principal */}
        <div className="space-y-6">
          {/* Estado: Sin grado seleccionado */}
          {!selectedGradeId && (
            <EmptyState message="Selecciona un grado para ver la asistencia" />
          )}

          {/* Estado: Sin sección seleccionada */}
          {selectedGradeId && !selectedSectionId && (
            <EmptyState message="Selecciona una sección para ver la asistencia" />
          )}

          {/* Contenido principal: Lista de estudiantes */}
          {selectedGradeId && selectedSectionId && (
            <div className="space-y-4">
              {loadingStudents && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <div className="inline-flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando estudiantes...</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {studentsError && (
                <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                  <CardContent className="py-8 text-center text-red-600 dark:text-red-400">
                    No hay estudiantes registrados en esta sección
                  </CardContent>
                </Card>
              )}

              {!loadingStudents && students.length > 0 && (
                <SimpleAttendanceTable 
                  data={mappedStudents} 
                  selectedDate={selectedDate}
                  onStatusChange={handleAttendanceStatusChange}
                  preFilledStatuses={Object.fromEntries(
                    Object.entries(existingAttendance).map(([enrollmentId, record]) => [
                      enrollmentId,
                      record.attendanceStatusId
                    ])
                  )}
                />
              )}

              {!loadingStudents && students.length === 0 && !studentsError && (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No hay estudiantes en esta sección
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper que proporciona el contexto de estados de asistencia
 */
export default function AttendancePageWrapper() {
  return (
    <AttendanceStatusProvider>
      <AttendanceGridContent />
    </AttendanceStatusProvider>
  );
}
