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
        setCascadeData(data);
        setState(prev => ({
          ...prev,
          grades: data.grades,
          selectedBimester: data.activeBimester,
          cycleName: data.cycle?.name,
          isLoadingGrades: false,
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

  const updateSections = useCallback(() => {
    if (!state.selectedGrade || !cascadeData) {
      setState(prev => ({
        ...prev,
        sections: [],
        selectedSection: null,
        courses: [],
        selectedCourse: null,
      }));
      return;
    }

    const sectionsData = cascadeData.gradesSections[state.selectedGrade.id] || [];
    const sections: SectionOption[] = sectionsData.map(s => ({
      id: s.id,
      name: s.name,
      gradeId: s.gradeId,
    }));

    setState(prev => ({
      ...prev,
      sections,
      selectedSection: null,
      courses: [],
      selectedCourse: null,
      isLoadingSections: false,
    }));
  }, [state.selectedGrade, cascadeData]);

  // ==================== ACTUALIZAR CURSOS ====================

  const updateCourses = useCallback(() => {
    if (!state.selectedSection || !cascadeData) {
      setState(prev => ({
        ...prev,
        courses: [],
        selectedCourse: null,
      }));
      return;
    }

    const sectionData = cascadeData.gradesSections[state.selectedGrade?.id || 0]?.find(
      s => s.id === state.selectedSection?.id
    );

    const courses: CourseOption[] = sectionData?.courseAssignments?.map(ca => ({
      id: ca.course.id,
      name: ca.course.name,
      code: ca.course.code,
      area: ca.course.area,
      color: ca.course.color,
      isActive: ca.course.isActive,
    })) || [];

    setState(prev => ({
      ...prev,
      courses,
      selectedCourse: null,
      isLoadingCourses: false,
    }));
  }, [state.selectedGrade?.id, state.selectedSection, cascadeData]);

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
    }));
  }, [cascadeData?.activeBimester]);

  // ==================== EFECTOS ====================

  // Cargar datos al montar (una sola vez)
  useEffect(() => {
    fetchCascadeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío = ejecutar solo una vez al montar

  // Actualizar secciones cuando cambia grado
  useEffect(() => {
    updateSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedGrade]); // Solo cuando cambia el grado

  // Actualizar cursos cuando cambia sección
  useEffect(() => {
    updateCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedSection]); // Solo cuando cambia la sección

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
