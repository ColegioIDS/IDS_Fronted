/**
 * ====================================================================
 * ATTENDANCE FILTERS - Panel de Selección
 * ====================================================================
 *
 * Componente para seleccionar:
 * • Ciclo escolar
 * • Bimestre
 * • Grado
 * • Sección
 *
 * Debe estar ANTES de los TABs para filtrar los datos
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { useCycles } from '@/hooks/data/useCycles';
import { useBimestersByCycle } from '@/hooks/data/attendance/useBimestersByCycle';
import { useGradesByCycle } from '@/hooks/data/attendance/useGradesByCycle';
import { useSectionsByGrade } from '@/hooks/data/attendance/useSectionsByGrade';
import { useActiveCycleAndBimester } from '@/hooks/data/attendance/useActiveCycleAndBimester';
import { useStudentsBySection } from '@/hooks/data/attendance/useStudentsBySection';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Filter, CheckCircle, Users } from 'lucide-react';

export function AttendanceFilters() {
  const { state: attendanceState, actions: attendanceActions } = useAttendanceContext();
  const cyclesData = useCycles();
  
  // Hooks para obtener datos reales
  const { activeCycle } = useActiveCycleAndBimester();
  const bimestresData = useBimestersByCycle();
  const gradesData = useGradesByCycle();
  
  // Estado local para grado seleccionado
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  
  // Hook para obtener secciones cuando se selecciona un grado
  const sectionsData = useSectionsByGrade(attendanceState.selectedCycleId, selectedGradeId);
  
  // Hook para obtener estudiantes cuando se selecciona una sección
  const studentsData = useStudentsBySection(
    attendanceState.selectedSectionId,
    attendanceState.selectedCycleId,
    attendanceState.selectedDate
  );

  // Refs para evitar loops infinitos
  const cycleLoadedRef = useRef(false);
  const bimesterLoadedRef = useRef(false);
  const studentsLoadedRef = useRef(false);

  // Efecto para cargar ciclo activo por defecto
  useEffect(() => {
    if (activeCycle?.id && !attendanceState.selectedCycleId && !cycleLoadedRef.current) {
      cycleLoadedRef.current = true;
      attendanceActions.selectCycle(activeCycle.id);
    }
  }, [activeCycle?.id, attendanceState.selectedCycleId, attendanceActions]);

  // Efecto para cargar bimestre activo después del ciclo
  useEffect(() => {
      bimestresLength: bimestresData.bimesters?.length,
      selectedCycleId: attendanceState.selectedCycleId,
      selectedBimesterId: attendanceState.selectedBimesterId,
      bimesterLoadedRef: bimesterLoadedRef.current,
    });
    
    if (
      bimestresData.bimesters?.length &&
      attendanceState.selectedCycleId &&
      !attendanceState.selectedBimesterId &&
      !bimesterLoadedRef.current
    ) {
      const activeBimData = bimestresData.bimesters[0];
      bimesterLoadedRef.current = true;
      attendanceActions.selectBimester(activeBimData.id);
    }
  }, [bimestresData.bimesters, attendanceState.selectedCycleId, attendanceState.selectedBimesterId, attendanceActions]);

  // Efecto para cargar grado activo después del bimestre
  const gradesLoadedRef = useRef(false);
  useEffect(() => {
    if (
      gradesData.grades?.length &&
      attendanceState.selectedBimesterId &&
      !selectedGradeId &&
      !gradesLoadedRef.current
    ) {
      const firstGrade = gradesData.grades[0];
      gradesLoadedRef.current = true;
      setSelectedGradeId(firstGrade.id);
    }
  }, [gradesData.grades, attendanceState.selectedBimesterId, selectedGradeId]);

  // Efecto para cargar sección después de seleccionar grado
  const sectionsLoadedRef = useRef(false);
  useEffect(() => {
    if (
      sectionsData.sections?.length &&
      selectedGradeId &&
      !attendanceState.selectedSectionId &&
      !sectionsLoadedRef.current
    ) {
      const firstSection = sectionsData.sections[0];
      sectionsLoadedRef.current = true;
      attendanceActions.selectSection(firstSection.id);
    }
  }, [sectionsData.sections, selectedGradeId, attendanceState.selectedSectionId, attendanceActions]);

  // Efecto para cargar estudiantes cuando se selecciona una sección
  useEffect(() => {
      selectedSectionId: attendanceState.selectedSectionId,
      studentsLength: studentsData.students?.length,
      studentsLoadedRef: studentsLoadedRef.current,
      students: studentsData.students,
    });
    
    if (attendanceState.selectedSectionId && studentsData.students?.length && !studentsLoadedRef.current) {
      // Convertir StudentData a estructura básica compatible con AttendanceRecord
      const convertedStudents = studentsData.students.map(student => ({
        id: student.id,
        enrollmentId: student.id,
        name: student.name, // ✅ AGREGAR NOMBRE
        enrollmentNumber: student.enrollmentNumber, // ✅ AGREGAR NÚMERO DE MATRÍCULA
        email: student.email, // ✅ AGREGAR EMAIL
        identificationNumber: student.identificationNumber, // ✅ AGREGAR CÉDULA/SIRE
        date: attendanceState.selectedDate,
        scheduleId: 0,
        originalStatus: '',
        currentStatus: '',
        attendanceStatusId: 0,
        isEarlyExit: false,
        recordedBy: '',
        recordedAt: new Date().toISOString(),
      }));
      studentsLoadedRef.current = true;
      attendanceActions.setStudents(convertedStudents);
    }
  }, [studentsData.students, attendanceState.selectedSectionId, attendanceState.selectedDate, attendanceActions]);

  const handleCycleChange = (cycleId: string) => {
    const id = parseInt(cycleId, 10);
    attendanceActions.selectCycle(id);
    setSelectedGradeId(null);
    cycleLoadedRef.current = false;
    bimesterLoadedRef.current = false;
    gradesLoadedRef.current = false;
    sectionsLoadedRef.current = false;
    studentsLoadedRef.current = false;
  };

  const handleBimesterChange = (bimesterId: string) => {
    const id = parseInt(bimesterId, 10);
    attendanceActions.selectBimester(id);
    setSelectedGradeId(null);
    gradesLoadedRef.current = false;
    sectionsLoadedRef.current = false;
    studentsLoadedRef.current = false;
  };

  const handleGradeChange = (gradeId: string) => {
    const id = parseInt(gradeId, 10);
    setSelectedGradeId(id);
    sectionsLoadedRef.current = false;
    studentsLoadedRef.current = false;
  };

  const handleSectionChange = (sectionId: string) => {
    const id = parseInt(sectionId, 10);
    attendanceActions.selectSection(id);
    studentsLoadedRef.current = false;
  };

  const selectedGrade = gradesData.grades.find((g) => g.id === selectedGradeId);
  const selectedSection = sectionsData.sections.find((s) => s.id === attendanceState.selectedSectionId);

  return (
    <div className="space-y-6 rounded-xl border-2 border-indigo-200 bg-white p-8 shadow-lg dark:border-indigo-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md dark:bg-indigo-500">
          <Filter className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Filtros de Asistencia</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecciona el ciclo, bimestre, grado y sección para continuar
          </p>
        </div>
      </div>

      {/* Error Display */}
      {attendanceState.error && (
        <Alert className="animate-in fade-in-50 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertDescription className="font-medium text-red-900 dark:text-red-100">{attendanceState.error.message}</AlertDescription>
        </Alert>
      )}

      {/* Filters Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Ciclo Escolar */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Ciclo Escolar</label>
          {cyclesData.loading ? (
            <div className="flex items-center gap-2 rounded border border-gray-300 bg-gray-50 p-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando...
            </div>
          ) : (
            <Select
              value={attendanceState.selectedCycleId?.toString() || ''}
              onValueChange={handleCycleChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un ciclo" />
              </SelectTrigger>
              <SelectContent>
                {cyclesData.cycles && cyclesData.cycles.length > 0 ? (
                  cyclesData.cycles.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id.toString()}>
                      {cycle.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">No hay ciclos disponibles</div>
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Bimestre */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Bimestre</label>
          {bimestresData.loading ? (
            <div className="flex items-center gap-2 rounded border border-gray-300 bg-gray-50 p-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando...
            </div>
          ) : (
            <Select
              value={attendanceState.selectedBimesterId?.toString() || ''}
              onValueChange={handleBimesterChange}
              disabled={!attendanceState.selectedCycleId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un bimestre" />
              </SelectTrigger>
              <SelectContent>
                {bimestresData.bimesters && bimestresData.bimesters.length > 0 ? (
                  bimestresData.bimesters.map((bimester) => (
                    <SelectItem key={bimester.id} value={bimester.id.toString()}>
                      {bimester.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    {attendanceState.selectedCycleId ? 'No hay bimestres disponibles' : 'Selecciona un ciclo primero'}
                  </div>
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Grado */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Grado</label>
          {gradesData.loading ? (
            <div className="flex items-center gap-2 rounded border border-gray-300 bg-gray-50 p-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando...
            </div>
          ) : (
            <Select
              value={selectedGradeId?.toString() || ''}
              onValueChange={handleGradeChange}
              disabled={!attendanceState.selectedBimesterId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un grado" />
              </SelectTrigger>
              <SelectContent>
                {gradesData.grades && gradesData.grades.length > 0 ? (
                  gradesData.grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id.toString()}>
                      {grade.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    {attendanceState.selectedBimesterId ? 'No hay grados disponibles' : 'Selecciona un bimestre primero'}
                  </div>
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Sección */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Sección</label>
          {sectionsData.loading ? (
            <div className="flex items-center gap-2 rounded border border-gray-300 bg-gray-50 p-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando...
            </div>
          ) : (
            <Select
              value={attendanceState.selectedSectionId?.toString() || ''}
              onValueChange={handleSectionChange}
              disabled={!selectedGradeId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una sección" />
              </SelectTrigger>
              <SelectContent>
                {sectionsData.sections && sectionsData.sections.length > 0 ? (
                  sectionsData.sections.map((section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      Sección {section.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    {selectedGradeId ? 'No hay secciones disponibles' : 'Selecciona un grado primero'}
                  </div>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Summary */}
      {attendanceState.selectedSectionId && selectedSection && selectedGrade && (
        <div className="animate-in fade-in-50 slide-in-from-bottom-5 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5 shadow-md dark:border-emerald-600 dark:bg-emerald-950/30">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md dark:bg-emerald-500">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Selección completada</p>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                {selectedGrade.name} • Sección {selectedSection.name}
              </p>
              {studentsData.students && studentsData.students.length > 0 && (
                <p className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <Users className="h-4 w-4" />
                  {studentsData.students.length} estudiante{studentsData.students.length !== 1 ? 's' : ''} encontrado{studentsData.students.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
