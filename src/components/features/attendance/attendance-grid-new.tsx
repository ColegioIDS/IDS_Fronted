'use client';

import { useState, useCallback } from 'react';
import { useGradesAndSections } from '@/hooks/attendance/useGradesAndSections';
import { useStudentsBySection } from '@/hooks/data';
import { AttendanceStatusProvider } from '@/context/AttendanceStatusContext';
import AttendanceHeader from './components/header/AttendanceHeader';
import EmptyState from './components/states/EmptyState';
import { Card, CardContent } from '@/components/ui/card';

function AttendanceGridContent() {
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
                <Card>
                  <CardContent className="py-6">
                    <div className="space-y-3">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">
                        Estudiantes ({students.length})
                      </h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {students.map((student: any, index: number) => (
                          <div
                            key={student.enrollmentId || index}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                  {(student.studentName || 'E')[0]}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                  {student.studentName || 'Sin nombre'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  ID: {student.enrollmentId}
                                </p>
                              </div>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-semibold text-blue-600 dark:text-blue-400">
                              Presente
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
