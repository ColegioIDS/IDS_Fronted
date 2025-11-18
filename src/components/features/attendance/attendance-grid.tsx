'use client';

import { useState, useCallback, useEffect } from 'react';
import { useGradesAndSections } from '@/hooks/attendance/useGradesAndSections';
import { useStudentsBySection } from '@/hooks/data';
import { useAttendanceByDate } from '@/hooks/attendance/useAttendanceByDate';
import { useActiveCycleId } from '@/hooks/attendance/useActiveCycleId';
import { AttendanceStatusProvider } from '@/context/AttendanceStatusContext';
import AttendanceHeader from './components/header/AttendanceHeader';
import AttendanceTableWithToggle from './components/table/AttendanceTableWithToggle';
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
  const { attendance: existingAttendance, allRecords, loading: loadingAttendance, loadAttendance } = useAttendanceByDate({
    sectionId: selectedSectionId || undefined,
    cycleId: activeCycleId || undefined,
    gradeId: selectedGradeId || undefined,
    date: selectedDate,
  });

  // Cargar asistencia cuando cambia sección, grado o fecha
  useEffect(() => {
    if (selectedSectionId && activeCycleId && selectedGradeId) {
      loadAttendance();
    }
  }, [selectedSectionId, selectedGradeId, selectedDate, activeCycleId, loadAttendance]);

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
    loadingAttendance,
    existingAttendanceKeys: Object.keys(existingAttendance),
    existingAttendanceSize: Object.keys(existingAttendance).length,
    allRecordsCount: allRecords.length,
    allRecordsFirst: allRecords[0],
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
    async (enrollmentId: string, statusId: string, studentName: string) => {
      try {
        console.log('[handleAttendanceStatusChange] 📌 CLICK DETECTADO:', {
          enrollmentId,
          statusId,
          studentName,
          existingAttendanceKeys: Object.keys(existingAttendance),
          existingAttendanceLength: Object.keys(existingAttendance).length,
        });

        // Buscar el registro de asistencia existente
        let existingRecord = existingAttendance[enrollmentId];

        console.log('[handleAttendanceStatusChange] 🔍 Búsqueda de registro:', {
          enrollmentId,
          existingRecord,
          foundRecord: !!existingRecord,
        });

        // Si no existe el registro, crearlo ahora
        if (!existingRecord) {
          console.log('[handleAttendanceStatusChange] 📝 NO EXISTE REGISTRO - Creando para este estudiante...');
          
          if (!selectedSectionId) {
            console.error('[handleAttendanceStatusChange] ❌ Falta sectionId');
            toast.error('Error: Falta datos de sección');
            return;
          }

          const dateString = selectedDate.toISOString().split('T')[0];
          
          try {
            // Crear registro INDIVIDUAL para este estudiante específico
            const newRecord = await attendanceRecordService.createSingleAttendance(
              parseInt(enrollmentId as string),
              dateString,
              parseInt(statusId as string)
            );

            console.log('[handleAttendanceStatusChange] ✅ Registro individual creado:', newRecord);

            if (!newRecord || !newRecord.id) {
              console.error('[handleAttendanceStatusChange] ❌ Respuesta inválida del servidor');
              toast.error('Error: Respuesta inválida del servidor');
              return;
            }

            existingRecord = newRecord;
            console.log('[handleAttendanceStatusChange] ✅ Registro obtenido:', existingRecord);
          } catch (createErr: any) {
            console.error('[handleAttendanceStatusChange] ❌ Error creando registro:', createErr);
            
            // Extraer mensaje de error más informativo
            let errorMessage = 'Error al crear registro de asistencia';
            
            if (createErr?.response?.data?.message) {
              errorMessage = createErr.response.data.message;
            } else if (createErr?.message) {
              errorMessage = createErr.message;
            }
            
            toast.error(errorMessage);
            return;
          }
        }

        // Ahora actualizar el registro
        const changeReason = 'Asistencia registrada por docente en clase';
        console.log('[handleAttendanceStatusChange] ✏️ Actualizando attendance:', {
          attendanceId: existingRecord.id,
          statusId,
          changeReason,
        });

        // Actualizar en backend
        const updateResponse = await attendanceRecordService.updateAttendanceStatus(
          parseInt(existingRecord.id as string),
          parseInt(statusId as string),
          changeReason
        );

        console.log('✅ Respuesta del backend:', updateResponse);
        console.log('✅ Asistencia actualizada:', studentName);

        // Recargar asistencia para reflejar el cambio
        console.log('[handleAttendanceStatusChange] 🔄 Recargando datos...');
        await loadAttendance();
        console.log('[handleAttendanceStatusChange] ✅ Datos recargados');
        
        // NO mostrar toast aquí - AttendanceTableWithToggle se encargará
      } catch (error: any) {
        console.error('[handleAttendanceStatusChange] ❌ Error:', error);
        
        // Extraer mensaje de error más informativo
        let message = 'Error al registrar asistencia';
        
        if (error?.response?.data?.message) {
          message = error.response.data.message;
        } else if (error?.response?.data?.details) {
          // Si hay detalles específicos
          const details = Array.isArray(error.response.data.details) 
            ? error.response.data.details.join(', ')
            : error.response.data.details;
          message = details;
        } else if (error?.message) {
          message = error.message;
        }
        
        // Relanzar el error para que AttendanceTableWithToggle lo maneje
        const customError: any = new Error(message);
        customError.response = error?.response;
        throw customError;
      }
    },
    [existingAttendance, loadAttendance, selectedSectionId, selectedGradeId, activeCycleId, selectedDate]
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
                <AttendanceTableWithToggle 
                  data={allRecords} 
                  selectedDate={selectedDate}
                  onStatusChange={handleAttendanceStatusChange}
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
