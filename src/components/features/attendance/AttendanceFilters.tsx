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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Filter, CheckCircle, Users, ChevronRight } from 'lucide-react';

interface FilterSectionProps {
  title: string;
  description: string;
  loading: boolean;
  items: any[];
  selectedId: number | null | undefined;
  onSelect: (id: number) => void;
  isAutoSelected: boolean;
  getItemLabel: (item: any) => string;
  forceShowAsCards?: boolean; // Forzar mostrar como tarjetas incluso si hay 1 item
}

interface StudentData {
  id?: number;
  enrollmentId: number;
  name?: string;
  enrollmentNumber?: string;
  email?: string;
  identificationNumber?: string;
}

function FilterSection({
  title,
  description,
  loading,
  items,
  selectedId,
  onSelect,
  isAutoSelected,
  getItemLabel,
  forceShowAsCards = false,
}: FilterSectionProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-600 dark:bg-slate-800 dark:border-slate-700">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando {title.toLowerCase()}...
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  // Si hay solo 1 opción Y no forzamos tarjetas, mostrar como chip compacto
  if (items.length === 1 && !forceShowAsCards) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{title}:</span>
        <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-full px-3 py-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{getItemLabel(items[0])}</span>
        </div>
      </div>
    );
  }

  // Si hay múltiples opciones O forzamos tarjetas, mostrar como tarjetas seleccionables
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`relative group rounded-lg p-4 transition-all duration-200 ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-lg scale-105 border-2 border-blue-400'
                  : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{getItemLabel(item)}</span>
                {isSelected && <ChevronRight className="h-5 w-5" />}
              </div>
              {isSelected && (
                <div className="mt-2 text-xs font-medium opacity-90">
                  ✓ Seleccionado
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
  const gradeLoadedRef = useRef(false);
  const sectionLoadedRef = useRef(false);
  const studentsLoadedRef = useRef(false);

  // Efecto para cargar ciclo activo por defecto o auto-seleccionar si hay solo 1
  useEffect(() => {
    if (cyclesData.cycles && !attendanceState.selectedCycleId && !cycleLoadedRef.current) {
      cycleLoadedRef.current = true;
      
      // Si hay solo 1 ciclo, auto-seleccionar
      if (cyclesData.cycles.length === 1) {
        attendanceActions.selectCycle(cyclesData.cycles[0].id);
      } else if (activeCycle?.id) {
        // Si hay múltiples, seleccionar el activo
        attendanceActions.selectCycle(activeCycle.id);
      }
    }
  }, [cyclesData.cycles, attendanceState.selectedCycleId, activeCycle?.id]);

  // Efecto para auto-seleccionar bimestre si hay solo 1
  useEffect(() => {
    if (
      bimestresData.bimesters?.length &&
      attendanceState.selectedCycleId &&
      !attendanceState.selectedBimesterId &&
      !bimesterLoadedRef.current
    ) {
      bimesterLoadedRef.current = true;
      const bimesterToSelect = bimestresData.bimesters[0];
      attendanceActions.selectBimester(bimesterToSelect.id);
    }
  }, [bimestresData.bimesters?.length, attendanceState.selectedCycleId, attendanceState.selectedBimesterId]);

  // Efecto para auto-seleccionar grado si hay solo 1
  useEffect(() => {
    if (
      gradesData.grades?.length === 1 &&
      attendanceState.selectedBimesterId &&
      !selectedGradeId &&
      !gradeLoadedRef.current
    ) {
      gradeLoadedRef.current = true;
      setSelectedGradeId(gradesData.grades[0].id);
    }
  }, [gradesData.grades?.length, attendanceState.selectedBimesterId, selectedGradeId]);

  // ❌ NO AUTO-SELECT PARA SECCIÓN - Usuario SIEMPRE debe seleccionar manualmente

  // Efecto DIRECTO para limpiar estudiantes cuando la sección se pone en undefined
  // Esto evita mostrar datos de la sección anterior
  useEffect(() => {
    console.log('🔍 [EFECTO LIMPIEZA] selectedSectionId cambió:', attendanceState.selectedSectionId);
    if (!attendanceState.selectedSectionId) {
      console.log('❌ [LIMPIEZA] No hay sección, limpiando estudiantes');
      attendanceActions.setStudents([]);
    }
  }, [attendanceState.selectedSectionId]);

  // Efecto para cargar estudiantes cuando se selecciona una sección
  // Este efecto actualiza automáticamente cuando el hook trae nuevos datos
  useEffect(() => {
    console.log('🔍 [EFECTO ESTUDIANTES] Ejecutándose:', {
      selectedSectionId: attendanceState.selectedSectionId,
      selectedGradeId,
      studentsCount: studentsData.students?.length ?? 0,
      isLoading: studentsData.loading,
      firstStudent: studentsData.students?.[0]?.name,
    });

    // Si no hay sección seleccionada, salir (ya fue limpiado arriba)
    if (!attendanceState.selectedSectionId) {
      console.log('⚠️ [EFECTO ESTUDIANTES] Sin sección, retornando');
      return;
    }

    // Actualizar con los nuevos datos del hook
    if (studentsData.students && studentsData.students.length > 0) {
      console.log('✅ [EFECTO ESTUDIANTES] Cargando', studentsData.students.length, 'estudiantes');
      const convertedStudents = studentsData.students.map(student => ({
        id: student.id,
        enrollmentId: student.enrollmentId,  // ✅ Usar enrollmentId del hook (viene del backend)
        name: student.name,
        enrollmentNumber: student.enrollmentNumber,
        email: student.email,
        identificationNumber: student.identificationNumber,
        date: attendanceState.selectedDate,
        scheduleId: 0,
        originalStatus: '',
        currentStatus: '',
        attendanceStatusId: 0,
        isEarlyExit: false,
        recordedBy: '',
        recordedAt: new Date().toISOString(),
      }));
      attendanceActions.setStudents(convertedStudents);
    } else if (!studentsData.loading) {
      // Solo limpiar si no está cargando
      console.log('⚠️ [EFECTO ESTUDIANTES] Sin estudiantes y no cargando, limpiando');
      attendanceActions.setStudents([]);
    } else {
      console.log('⏳ [EFECTO ESTUDIANTES] Aún cargando...');
    }
  }, [studentsData.students, attendanceState.selectedSectionId, selectedGradeId]);

  const handleCycleChange = (cycleId: number) => {
    attendanceActions.selectCycle(cycleId);
    attendanceActions.setStudents([]);
    setSelectedGradeId(null);
    gradeLoadedRef.current = false;
    bimesterLoadedRef.current = false;
    sectionLoadedRef.current = false;
    studentsLoadedRef.current = false;
  };

  const handleBimesterChange = (bimesterId: number) => {
    attendanceActions.selectBimester(bimesterId);
    attendanceActions.setStudents([]);
    setSelectedGradeId(null);
    gradeLoadedRef.current = false;
    sectionLoadedRef.current = false;
    studentsLoadedRef.current = false;
  };

  const handleGradeChange = (gradeId: number) => {
    console.log('🎓 [handleGradeChange] Cambiando a grado:', gradeId);
    // Resetear el ref PRIMERO para permitir re-selección de sección
    sectionLoadedRef.current = false;
    console.log('🔄 [handleGradeChange] Resetear sectionLoadedRef');
    // Cambiar el grado
    setSelectedGradeId(gradeId);
    // Limpiar sección y estudiantes cuando cambia de grado
    console.log('📍 [handleGradeChange] Poniendo sección en undefined');
    attendanceActions.selectSection(undefined);
    console.log('👥 [handleGradeChange] Limpiando estudiantes');
    attendanceActions.setStudents([]);
    studentsLoadedRef.current = false;
  };

  const handleSectionChange = (sectionId: number) => {
    attendanceActions.setStudents([]);
    attendanceActions.selectSection(sectionId);
    studentsLoadedRef.current = false;
  };

  // Resetear el ref de estudiantes cuando cambia la sección
  useEffect(() => {
    studentsLoadedRef.current = false;
  }, [attendanceState.selectedSectionId]);

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
      <div className="space-y-6">
        {/* Auto-selected filters - compact row */}
        <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-gray-200 dark:border-slate-700">
          {/* Ciclo Escolar */}
          {cyclesData.cycles && cyclesData.cycles.length === 1 && !cyclesData.loading && (
            <FilterSection
              title="Ciclo Escolar"
              description=""
              loading={cyclesData.loading}
              items={cyclesData.cycles}
              selectedId={attendanceState.selectedCycleId}
              onSelect={handleCycleChange}
              isAutoSelected={true}
              getItemLabel={(item: any) => item.name}
            />
          )}

          {/* Bimestre */}
          {attendanceState.selectedCycleId && bimestresData.bimesters && bimestresData.bimesters.length === 1 && !bimestresData.loading && (
            <FilterSection
              title="Bimestre"
              description=""
              loading={bimestresData.loading}
              items={bimestresData.bimesters}
              selectedId={attendanceState.selectedBimesterId}
              onSelect={handleBimesterChange}
              isAutoSelected={true}
              getItemLabel={(item: any) => item.name}
            />
          )}

          {/* Grado */}
          {attendanceState.selectedBimesterId && gradesData.grades && gradesData.grades.length === 1 && !gradesData.loading && (
            <FilterSection
              title="Grado"
              description=""
              loading={gradesData.loading}
              items={gradesData.grades}
              selectedId={selectedGradeId}
              onSelect={handleGradeChange}
              isAutoSelected={true}
              getItemLabel={(item: any) => item.name}
            />
          )}
        </div>

        {/* Ciclo Escolar - selectable if > 1 */}
        {cyclesData.cycles && cyclesData.cycles.length > 1 && (
          <FilterSection
            title="Ciclo Escolar"
            description={cyclesData.cycles && cyclesData.cycles.length === 1 ? "Seleccionado automáticamente" : "Elige el ciclo escolar"}
            loading={cyclesData.loading}
            items={cyclesData.cycles}
            selectedId={attendanceState.selectedCycleId}
            onSelect={handleCycleChange}
            isAutoSelected={false}
            getItemLabel={(item: any) => item.name}
          />
        )}

        {/* Bimestre - selectable if > 1 */}
        {attendanceState.selectedCycleId && bimestresData.bimesters && bimestresData.bimesters.length > 1 && (
          <FilterSection
            title="Bimestre"
            description={bimestresData.bimesters && bimestresData.bimesters.length === 1 ? "Seleccionado automáticamente" : "Elige el bimestre"}
            loading={bimestresData.loading}
            items={bimestresData.bimesters}
            selectedId={attendanceState.selectedBimesterId}
            onSelect={handleBimesterChange}
            isAutoSelected={false}
            getItemLabel={(item: any) => item.name}
          />
        )}

        {/* Grado - selectable if > 1 */}
        {attendanceState.selectedBimesterId && gradesData.grades && gradesData.grades.length > 1 && (
          <FilterSection
            title="Grado"
            description={gradesData.grades && gradesData.grades.length === 1 ? "Seleccionado automáticamente" : "Elige el grado"}
            loading={gradesData.loading}
            items={gradesData.grades}
            selectedId={selectedGradeId}
            onSelect={handleGradeChange}
            isAutoSelected={false}
            getItemLabel={(item: any) => item.name}
          />
        )}

        {/* Sección - selectable (FORCE CARDS) - Solo mostrar si hay 1 grado o múltiples grados */}
        {selectedGradeId && sectionsData.sections && (
          // Si hay múltiples grados, mostrar con mensaje de selección manual requerida
          gradesData.grades && gradesData.grades.length > 1 ? (
            <FilterSection
              title="Sección"
              description="Elige la sección (selección manual requerida)"
              loading={sectionsData.loading}
              items={sectionsData.sections}
              selectedId={attendanceState.selectedSectionId}
              onSelect={handleSectionChange}
              isAutoSelected={false}
              getItemLabel={(item: any) => `Sección ${item.name}`}
              forceShowAsCards={true}
            />
          ) : (
            // Si hay 1 grado, mostrar normalmente
            <FilterSection
              title="Sección"
              description="Elige la sección"
              loading={sectionsData.loading}
              items={sectionsData.sections}
              selectedId={attendanceState.selectedSectionId}
              onSelect={handleSectionChange}
              isAutoSelected={false}
              getItemLabel={(item: any) => `Sección ${item.name}`}
              forceShowAsCards={true}
            />
          )
        )}
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
