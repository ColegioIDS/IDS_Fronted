// hooks/data/erica-history/useEricaHistoryCascade.ts
// Reutiliza la cascada de evaluations pero orientada a history

import { useState, useEffect, useCallback } from 'react';
import { ericaHistoryService } from '@/services/erica-history.service';
import {
  CascadeResponse,
} from '@/types/erica-history';
import {
  CascadeBimester,
  CascadeWeek,
  CascadeGrade,
  CascadeSection,
  CascadeCourse,
  CascadeCourseAssignment,
} from '@/types/erica-evaluations';

// Helper: Convertir gradesSections (objeto) a array de sections
const flattenGradesSections = (gradesSections: Record<string, any>): CascadeSection[] => {
  const sections: CascadeSection[] = [];
  
  if (!gradesSections || typeof gradesSections !== 'object') {
    return sections;
  }
  
  Object.values(gradesSections).forEach((gradeSections: any) => {
    if (Array.isArray(gradeSections)) {
      sections.push(...gradeSections);
    }
  });
  
  return sections;
};

// Helper: Extraer cursos de los courseAssignments de todas las secciones
const flattenCourses = (sections: CascadeSection[]): CascadeCourse[] => {
  const coursesMap = new Map<number, CascadeCourse>();
  
  sections.forEach((section: any) => {
    if (section.courseAssignments && Array.isArray(section.courseAssignments)) {
      section.courseAssignments.forEach((assignment: any) => {
        if (assignment.course && !coursesMap.has(assignment.course.id)) {
          coursesMap.set(assignment.course.id, {
            id: assignment.course.id,
            name: assignment.course.name,
            code: assignment.course.code,
            area: assignment.course.area,
            color: assignment.course.color,
            isActive: assignment.course.isActive,
          });
        }
      });
    }
  });
  
  return Array.from(coursesMap.values());
};

// Helper: Normalizar el formato de respuesta del endpoint
const normalizeCascadeData = (data: any): CascadeResponse => {
  // Primero extraer secciones
  const sections = data.sections || flattenGradesSections(data.gradesSections || {});
  
  // Luego extraer cursos de las secciones
  const courses = data.courses || flattenCourses(sections);
  
  return {
    ...data,
    // Si viene cycle singular, convertir a array cycles
    cycles: data.cycles || (data.cycle ? [data.cycle] : []),
    // Si viene activeBimester, convertir a array bimesters
    bimesters: data.bimesters || (data.activeBimester ? [data.activeBimester] : []),
    // Si viene weeks, renombrar a academicWeeks
    academicWeeks: data.academicWeeks || data.weeks || [],
    // Si viene gradesSections, convertir a array sections
    sections: sections,
    // Guardar grades
    grades: data.grades || [],
    // Extraer cursos de los courseAssignments
    courses: courses,
  };
};

interface CascadeError {
  message: string;
  errorCode?: string;
  errorType?: string;
}

interface UseCascadeState {
  cascadeData: CascadeResponse | null;
  isLoading: boolean;
  error: CascadeError | null;
}

interface SelectedCascadeItems {
  bimester: CascadeBimester | null;
  week: CascadeWeek | null;
  grade: CascadeGrade | null;
  section: CascadeSection | null;
  course: CascadeCourse | null;
}

interface UseEricaHistoryCascadeReturn extends UseCascadeState {
  // Selection state
  selected: SelectedCascadeItems;
  
  // Selection actions
  selectBimester: (bimester: CascadeBimester | null) => void;
  selectWeek: (week: CascadeWeek | null) => void;
  selectGrade: (grade: CascadeGrade | null) => void;
  selectSection: (section: CascadeSection | null) => void;
  selectCourse: (course: CascadeCourse | null) => void;
  
  // Derived getters
  getBimesters: () => CascadeBimester[];
  getWeeks: () => CascadeWeek[];
  getGrades: () => CascadeGrade[];
  getSections: () => CascadeSection[];
  getCourses: () => CascadeCourse[];
  
  // Utility
  isSelectionComplete: boolean;
  resetSelection: () => void;
  refreshCascade: () => Promise<void>;
}

const initialSelection: SelectedCascadeItems = {
  bimester: null,
  week: null,
  grade: null,
  section: null,
  course: null,
};

export function useEricaHistoryCascade(): UseEricaHistoryCascadeReturn {
  const [state, setState] = useState<UseCascadeState>({
    cascadeData: null,
    isLoading: true,
    error: null,
  });
  
  const [selected, setSelected] = useState<SelectedCascadeItems>(initialSelection);

  // Fetch cascade data
  const fetchCascade = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const rawData = await ericaHistoryService.getCascadeData();
      const data = normalizeCascadeData(rawData);
      
      // Validate required data exists
      if (!data.bimesters || data.bimesters.length === 0) {
        setState({
          cascadeData: data,
          isLoading: false,
          error: {
            message: 'No hay bimestres registrados para el ciclo escolar actual',
            errorCode: 'NO_ACTIVE_BIMESTER',
            errorType: 'CONFIGURATION_ERROR',
          },
        });
        return;
      }
      
      if (!data.academicWeeks || data.academicWeeks.length === 0) {
        setState({
          cascadeData: data,
          isLoading: false,
          error: {
            message: 'No hay semanas académicas registradas para este bimestre',
            errorCode: 'NO_WEEKS',
            errorType: 'CONFIGURATION_ERROR',
          },
        });
        return;
      }
      
      if (!data.grades || data.grades.length === 0) {
        setState({
          cascadeData: data,
          isLoading: false,
          error: {
            message: 'No hay grados registrados para este ciclo escolar',
            errorCode: 'NO_GRADES',
            errorType: 'CONFIGURATION_ERROR',
          },
        });
        return;
      }
      
      setState({
        cascadeData: data,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      let errorInfo: CascadeError = {
        message: 'Error al cargar datos jerárquicos',
      };
      
      if (err instanceof Error) {
        const customErr = err as Error & { errorCode?: string; errorType?: string; detail?: string };
        errorInfo = {
          message: customErr.message,
          errorCode: customErr.errorCode,
          errorType: customErr.errorType,
        };
      } else if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; errorCode?: string; errorType?: string } } };
        if (axiosErr.response?.data) {
          errorInfo = {
            message: axiosErr.response.data.message || errorInfo.message,
            errorCode: axiosErr.response.data.errorCode,
            errorType: axiosErr.response.data.errorType,
          };
        }
      }
      
      setState({
        cascadeData: null,
        isLoading: false,
        error: errorInfo,
      });
    }
  }, []);

  useEffect(() => {
    fetchCascade();
  }, [fetchCascade]);

  // Selection handlers - cascade down when parent changes
  const selectBimester = useCallback((bimester: CascadeBimester | null) => {
    setSelected({
      bimester,
      week: null,
      grade: null,
      section: null,
      course: null,
    });
  }, []);

  // Auto-seleccionar el bimestre activo si existe
  useEffect(() => {
    if (state.cascadeData?.bimesters && state.cascadeData.bimesters.length > 0 && !selected.bimester) {
      // Buscar bimestre activo
      const activeBimester = state.cascadeData.bimesters.find((b: any) => b.isActive === true);
      if (activeBimester) {
        selectBimester(activeBimester as CascadeBimester);
      }
    }
  }, [state.cascadeData?.bimesters, selected.bimester, selectBimester]);

  const selectWeek = useCallback((week: CascadeWeek | null) => {
    setSelected(prev => ({
      ...prev,
      week,
      grade: null,
      section: null,
      course: null,
    }));
  }, []);

  const selectGrade = useCallback((grade: CascadeGrade | null) => {
    setSelected(prev => ({
      ...prev,
      grade,
      section: null,
      course: null,
    }));
  }, []);

  const selectSection = useCallback((section: CascadeSection | null) => {
    setSelected(prev => ({
      ...prev,
      section,
      course: null,
    }));
  }, []);

  const selectCourse = useCallback((course: CascadeCourse | null) => {
    setSelected(prev => ({
      ...prev,
      course,
    }));
  }, []);

  // Derived getters
  const getBimesters = useCallback((): CascadeBimester[] => {
    // El nuevo endpoint devuelve bimesters como array plano
    return (state.cascadeData?.bimesters || []) as CascadeBimester[];
  }, [state.cascadeData]);

  const getWeeks = useCallback((): CascadeWeek[] => {
    if (!selected.bimester || !state.cascadeData?.academicWeeks) return [];
    // Filtrar semanas que pertenecen al bimestre seleccionado
    return state.cascadeData.academicWeeks.filter((week: any) => {
      // Asumiendo que week tiene bimesterId o similaridad con estructura CascadeWeek
      return week.bimesterId === selected.bimester!.id;
    }) as CascadeWeek[];
  }, [selected.bimester, state.cascadeData]);

  const getGrades = useCallback((): CascadeGrade[] => {
    return (state.cascadeData?.grades || []) as CascadeGrade[];
  }, [state.cascadeData]);

  const getSections = useCallback((): CascadeSection[] => {
    if (!selected.grade || !state.cascadeData?.sections) return [];
    // Filtrar secciones que pertenecen al grado seleccionado
    return state.cascadeData.sections.filter((section: any) => section.gradeId === selected.grade!.id) as CascadeSection[];
  }, [selected.grade, state.cascadeData]);

  const getCourses = useCallback((): CascadeCourse[] => {
    if (!selected.section) return [];
    
    // Obtener la sección seleccionada de las secciones del estado
    const section = state.cascadeData?.sections?.find((s: any) => s.id === selected.section!.id);
    
    if (!section || !section.courseAssignments || !Array.isArray(section.courseAssignments)) {
      return [];
    }
    
    // Extraer cursos de los courseAssignments de la sección
    const courses = section.courseAssignments
      .filter((assignment: any) => assignment.course && assignment.isActive !== false)
      .map((assignment: any) => ({
        id: assignment.course.id,
        name: assignment.course.name,
        code: assignment.course.code,
        area: assignment.course.area,
        color: assignment.course.color,
        isActive: assignment.course.isActive,
      }));
    
    return courses as CascadeCourse[];
  }, [selected.section, state.cascadeData]);

  const isSelectionComplete = Boolean(
    selected.bimester &&
    selected.week &&
    selected.grade &&
    selected.section &&
    selected.course
  );

  const resetSelection = useCallback(() => {
    setSelected(initialSelection);
  }, []);

  const refreshCascade = useCallback(async () => {
    await fetchCascade();
  }, [fetchCascade]);

  return {
    cascadeData: state.cascadeData,
    isLoading: state.isLoading,
    error: state.error,
    selected,
    selectBimester,
    selectWeek,
    selectGrade,
    selectSection,
    selectCourse,
    getBimesters,
    getWeeks,
    getGrades,
    getSections,
    getCourses,
    isSelectionComplete,
    resetSelection,
    refreshCascade,
  };
}
