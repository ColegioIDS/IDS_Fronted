/**
 * Hook useAssignmentsCascade
 * Maneja la lógica de cascada usando un único endpoint
 * GET /api/assignments/cascade
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  BimesterOption,
  CourseOption,
  CascadeFormState,
  CascadeFormActions,
  GradeOption,
  SectionOption,
} from '@/types/assignments.types';
import { assignmentsCascadeService } from '@/services/assignments.service';

// ==================== TIPOS PARA EL ENDPOINT ====================

interface CascadeData {
  cycle: { id: number; name: string; };
  activeBimester: BimesterOption;
  weeks: Array<{ id: number; }>;
  grades: GradeOption[];
  gradesSections: Record<number, Array<{
    id: number;
    name: string;
    gradeId: number;
    teacher?: { id: number; givenNames: string; lastNames: string; };
    courseAssignments: Array<{
      id: number;
      course: CourseOption;
      teacher?: { id: number; givenNames: string; lastNames: string; };
    }>;
  }>>;
}

// ==================== ESTADO INICIAL ====================

const INITIAL_STATE: CascadeFormState = {
  selectedGrade: null,
  selectedSection: null,
  selectedCourse: null,
  selectedBimester: null,
  grades: [],
  sections: [],
  courses: [],
  bimesters: [],
  isLoadingGrades: false,
  isLoadingSections: false,
  isLoadingCourses: false,
  isLoadingBimesters: false,
  error: undefined,
  cascadeDataLoaded: false,
};

// ==================== HOOK ====================

export function useAssignmentsCascade() {
  const [state, setState] = useState<CascadeFormState>(INITIAL_STATE);
  const [cascadeData, setCascadeData] = useState<CascadeData | null>(null);

  // ==================== GETTERS ====================

  const getSelectedValues = useCallback(() => ({
    gradeId: state.selectedGrade?.id,
    sectionId: state.selectedSection?.id,
    courseId: state.selectedCourse?.id,
    bimesterId: state.selectedBimester?.id,
  }), [state.selectedGrade, state.selectedSection, state.selectedCourse, state.selectedBimester]);

  const isFormComplete = useCallback(() => {
    return !!(
      state.selectedGrade &&
      state.selectedSection &&
      state.selectedCourse &&
      state.selectedBimester
    );
  }, [state.selectedGrade, state.selectedSection, state.selectedCourse, state.selectedBimester]);

  const isLoading = useCallback(() => {
    return (
      state.isLoadingGrades ||
      state.isLoadingSections ||
      state.isLoadingCourses ||
      state.isLoadingBimesters
    );
  }, [
    state.isLoadingGrades,
    state.isLoadingSections,
    state.isLoadingCourses,
    state.isLoadingBimesters,
  ]);

  // ==================== FETCH CASCADE DATA ====================

  const fetchCascadeData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingGrades: true, error: undefined }));
    try {
      const data = await assignmentsCascadeService.getCascadeData(true);

      if (data) {
        // Auto-seleccionar si hay solo 1 grado
        const gradesLength = data.grades.length;
        const autoSelectGrade = gradesLength === 1 ? data.grades[0] : null;
        
        // Actualizar cascadeData y estado juntos
        setCascadeData(data);
        setState(prev => ({
          ...prev,
          grades: data.grades,
          selectedGrade: autoSelectGrade,
          selectedBimester: data.activeBimester,
          cycleName: data.cycle?.name,
          isLoadingGrades: false,
          cascadeDataLoaded: true, // Flag para saber que los datos ya están listos
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoadingGrades: false,
          error: 'Error cargando datos',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoadingGrades: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  }, []);

  // ==================== ACTUALIZAR SECCIONES ====================

  const updateSections = useCallback((selectedGrade: GradeOption | null, cascadeDataParam: CascadeData | null) => {
    if (!selectedGrade || !cascadeDataParam) {
      setState(prev => ({
        ...prev,
        sections: [],
        selectedSection: null,
        courses: [],
        selectedCourse: null,
      }));
      return;
    }

    const sectionsData = cascadeDataParam.gradesSections[selectedGrade.id] || [];
    const sections: SectionOption[] = sectionsData.map(s => ({
      id: s.id,
      name: s.name,
      gradeId: s.gradeId,
    }));

    // Auto-seleccionar si hay solo 1 sección
    const autoSelectSection = sections.length === 1 ? sections[0] : null;

    setState(prev => ({
      ...prev,
      sections,
      selectedSection: autoSelectSection,
      courses: [],
      selectedCourse: null,
      isLoadingSections: false,
    }));
  }, []);

  // ==================== ACTUALIZAR CURSOS ====================

  const updateCourses = useCallback((selectedGrade: GradeOption | null, selectedSection: SectionOption | null, cascadeDataParam: CascadeData | null) => {
    if (!selectedSection || !cascadeDataParam) {
      setState(prev => ({
        ...prev,
        courses: [],
        selectedCourse: null,
      }));
      return;
    }

    const sectionData = cascadeDataParam.gradesSections[selectedGrade?.id || 0]?.find(
      s => s.id === selectedSection?.id
    );

    const courses: CourseOption[] = sectionData?.courseAssignments?.map(ca => ({
      id: ca.course.id,
      name: ca.course.name,
      code: ca.course.code,
      area: ca.course.area,
      color: ca.course.color,
      isActive: ca.course.isActive,
    })) || [];

    // Auto-seleccionar si hay solo 1 curso
    const autoSelectCourse = courses.length === 1 ? courses[0] : null;

    setState(prev => ({
      ...prev,
      courses,
      selectedCourse: autoSelectCourse,
      isLoadingCourses: false,
    }));
  }, []);

  // ==================== SETTERS ====================

  const setSelectedGrade = useCallback((grade: GradeOption | null) => {
    setState(prev => ({
      ...prev,
      selectedGrade: grade,
      selectedSection: null,
      selectedCourse: null,
      sections: [],
      courses: [],
      isLoadingSections: true,
    }));
  }, []);

  const setSelectedSection = useCallback((section: SectionOption | null) => {
    setState(prev => ({
      ...prev,
      selectedSection: section,
      selectedCourse: null,
      courses: [],
      isLoadingCourses: true,
    }));
  }, []);

  const setSelectedCourse = useCallback((course: CourseOption | null) => {
    setState(prev => ({
      ...prev,
      selectedCourse: course,
    }));
  }, []);

  const setSelectedBimester = useCallback((bimester: BimesterOption | null) => {
    setState(prev => ({
      ...prev,
      selectedBimester: bimester,
    }));
  }, []);

  // ==================== RESET ====================

  const reset = useCallback(() => {
    setState(prev => ({
      ...INITIAL_STATE,
      grades: prev.grades,
      selectedBimester: cascadeData?.activeBimester || null,
      cascadeDataLoaded: prev.cascadeDataLoaded,
    }));
  }, [cascadeData?.activeBimester]);

  // ==================== EFECTOS ====================

  // Cargar datos al montar (una sola vez)
  useEffect(() => {
    fetchCascadeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío = ejecutar solo una vez al montar

  // Actualizar secciones cuando cambia grado Y cascadeData está listo
  useEffect(() => {
    if (state.cascadeDataLoaded && state.selectedGrade && cascadeData) {
      updateSections(state.selectedGrade, cascadeData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedGrade, state.cascadeDataLoaded, cascadeData]);

  // Actualizar cursos cuando cambia sección Y cascadeData está listo
  useEffect(() => {
    if (state.cascadeDataLoaded && state.selectedSection && cascadeData) {
      updateCourses(state.selectedGrade, state.selectedSection, cascadeData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedSection, state.cascadeDataLoaded, cascadeData]);

  // ==================== ACCIONES ====================

  const actions: CascadeFormActions = {
    setSelectedGrade,
    setSelectedSection,
    setSelectedCourse,
    setSelectedBimester,
    fetchGrades: fetchCascadeData,
    fetchSections: async () => {},
    fetchCourses: async () => {},
    fetchBimesters: async () => {},
    reset,
  };

  return { state, actions, getSelectedValues, isFormComplete, isLoading };
}

// ==================== TIPOS EXPORTADOS ====================

export type UseAssignmentsCascadeReturn = ReturnType<typeof useAssignmentsCascade>;
