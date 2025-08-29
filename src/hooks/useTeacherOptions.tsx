// src/hooks/useTeacherOptions.tsx
'use client';

import { useMemo, useEffect, useState } from 'react';
import { getTeachersForCourseAssignment } from '@/services/teacherService';
import type { CourseAssignmentTeachersResponse, TeacherForCourseAssignment } from '@/services/teacherService';

export interface TeacherOptionExtended {
  value: number;
  label: string;
  teacherType: 'Titular (Esta sección)' | 'Titular (Otra sección)' | 'Especialista';
  isCurrentSectionTeacher: boolean;
  isHomeroomTeacher: boolean;
  isActive: boolean;
  academicDegree?: string;
  sections?: string[]; // Secciones que maneja si es titular
  teacher: {
    id: number;
    givenNames: string;
    lastNames: string;
    email?: string;
    phone?: string;
    teacherDetails?: {
      isHomeroomTeacher: boolean;
      academicDegree?: string;
      hiredDate?: string;
    };
  };
}

export interface UseTeacherOptionsProps {
  currentSectionId?: number;
  includeInactive?: boolean;
  filterBySpecialty?: string;
}

export function useTeacherOptions({
  currentSectionId,
  includeInactive = false,
  filterBySpecialty
}: UseTeacherOptionsProps = {}) {
  
  // Estado local para los datos del endpoint
  const [data, setData] = useState<CourseAssignmentTeachersResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos cuando cambia la sección
  useEffect(() => {
    const loadTeachers = async () => {
      if (!currentSectionId) {
        console.log('⚠️ No section ID provided');
        setData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔄 Loading teachers for section:', currentSectionId);
        const responseData = await getTeachersForCourseAssignment(currentSectionId);
        console.log('✅ Teachers loaded successfully:', responseData);
        setData(responseData);
      } catch (err) {
        console.error('❌ Error loading teachers:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar maestros');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, [currentSectionId]);

  // Convertir los datos del endpoint a TeacherOptionExtended
  const teacherOptions = useMemo(() => {
    if (!data) return [];

    const options: TeacherOptionExtended[] = [];

    // 1. Maestro titular de esta sección
    if (data.teachers.sectionTeacher) {
      const teacher = data.teachers.sectionTeacher;
      options.push({
        value: teacher.id,
        label: `${teacher.givenNames} ${teacher.lastNames}`,
        teacherType: 'Titular (Esta sección)',
        isCurrentSectionTeacher: true,
        isHomeroomTeacher: true,
        isActive: teacher.isActive !== false,
        academicDegree: teacher.teacherDetails?.academicDegree,
        sections: teacher.currentSection 
          ? [`${teacher.currentSection.gradeName} - ${teacher.currentSection.name}`] 
          : [],
        teacher: {
          id: teacher.id,
          givenNames: teacher.givenNames,
          lastNames: teacher.lastNames,
          email: teacher.email,
          phone: teacher.phone,
          teacherDetails: teacher.teacherDetails
        }
      });
    }

    // 2. Maestros especialistas (sin sección)
    data.teachers.specialists.forEach(teacher => {
      // Aplicar filtros
      if (!includeInactive && teacher.isActive === false) return;
      if (filterBySpecialty && 
          !teacher.teacherDetails?.academicDegree?.toLowerCase().includes(filterBySpecialty.toLowerCase())) {
        return;
      }

      options.push({
        value: teacher.id,
        label: `${teacher.givenNames} ${teacher.lastNames}`,
        teacherType: 'Especialista',
        isCurrentSectionTeacher: false,
        isHomeroomTeacher: false,
        isActive: teacher.isActive !== false,
        academicDegree: teacher.teacherDetails?.academicDegree,
        sections: [],
        teacher: {
          id: teacher.id,
          givenNames: teacher.givenNames,
          lastNames: teacher.lastNames,
          email: teacher.email,
          phone: teacher.phone,
          teacherDetails: teacher.teacherDetails
        }
      });
    });

    // 3. Otros maestros titulares (de otras secciones)
    data.teachers.otherTeachers.forEach(teacher => {
      // Aplicar filtros
      if (!includeInactive && teacher.isActive === false) return;
      if (filterBySpecialty && 
          !teacher.teacherDetails?.academicDegree?.toLowerCase().includes(filterBySpecialty.toLowerCase())) {
        return;
      }

      options.push({
        value: teacher.id,
        label: `${teacher.givenNames} ${teacher.lastNames}`,
        teacherType: 'Titular (Otra sección)',
        isCurrentSectionTeacher: false,
        isHomeroomTeacher: true,
        isActive: teacher.isActive !== false,
        academicDegree: teacher.teacherDetails?.academicDegree,
        sections: teacher.currentSection 
          ? [`${teacher.currentSection.gradeName} - ${teacher.currentSection.name}`]
          : [],
        teacher: {
          id: teacher.id,
          givenNames: teacher.givenNames,
          lastNames: teacher.lastNames,
          email: teacher.email,
          phone: teacher.phone,
          teacherDetails: teacher.teacherDetails
        }
      });
    });

    console.log('📋 Processed teacher options:', {
      total: options.length,
      titular: options.filter(o => o.teacherType === 'Titular (Esta sección)').length,
      specialists: options.filter(o => o.teacherType === 'Especialista').length,
      otherTitular: options.filter(o => o.teacherType === 'Titular (Otra sección)').length
    });

    return options;
  }, [data, includeInactive, filterBySpecialty]);

  // Categorizar maestros
  const categorized = useMemo(() => {
    const titular = teacherOptions.filter(t => t.isCurrentSectionTeacher);
    const specialists = teacherOptions.filter(t => t.teacherType === 'Especialista');
    const otherTitular = teacherOptions.filter(t => t.teacherType === 'Titular (Otra sección)');

    return {
      titular,           // Maestro titular de esta sección
      specialists,       // Maestros especialistas (sin sección)
      otherTitular,      // Maestros titulares de otras secciones
      all: teacherOptions
    };
  }, [teacherOptions]);

  // Información de la sección actual
  const currentSection = useMemo(() => {
    if (!data?.sectionInfo) return null;
    return {
      id: data.sectionInfo.id,
      name: data.sectionInfo.name,
      grade: data.sectionInfo.grade,
      teacher: data.teachers.sectionTeacher,
      teacherId: data.teachers.sectionTeacher?.id
    };
  }, [data]);

  // Estadísticas
  const stats = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        titular: 0,
        specialists: 0,
        otherTitular: 0,
        active: 0,
        withDegree: 0
      };
    }

    return {
      total: data.stats.total,
      titular: data.stats.sectionTeacher,
      specialists: data.stats.specialists,
      otherTitular: data.stats.otherTeachers,
      active: teacherOptions.filter(t => t.isActive).length,
      withDegree: teacherOptions.filter(t => t.academicDegree).length
    };
  }, [data, teacherOptions]);

  // Funciones de utilidad
  const getTeacherById = (id: number) => {
    return teacherOptions.find(t => t.value === id);
  };

  const getTeachersByType = (type: TeacherOptionExtended['teacherType']) => {
    return teacherOptions.filter(t => t.teacherType === type);
  };

  const searchTeachers = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return teacherOptions.filter(teacher => 
      teacher.label.toLowerCase().includes(lowerQuery) ||
      teacher.academicDegree?.toLowerCase().includes(lowerQuery) ||
      teacher.sections?.some(section => section.toLowerCase().includes(lowerQuery))
    );
  };

  // Función para obtener opciones formatted para Select components
  const getSelectOptions = () => {
    return teacherOptions.map(teacher => ({
      value: teacher.value.toString(),
      label: teacher.label,
      group: teacher.teacherType,
      disabled: !teacher.isActive,
      extra: {
        type: teacher.teacherType,
        degree: teacher.academicDegree,
        sections: teacher.sections
      }
    }));
  };

  return {
    // Datos principales
    teachers: teacherOptions,
    categorized,
    currentSection,
    
    // Estados
    loading,
    error,
    
    // Estadísticas
    stats,
    
    // Funciones de utilidad
    getTeacherById,
    getTeachersByType,
    searchTeachers,
    getSelectOptions,
    
    // Datos para componentes específicos
    selectOptions: getSelectOptions(),
    isEmpty: teacherOptions.length === 0,
    hasSpecialists: categorized.specialists.length > 0,
    hasTitular: categorized.titular.length > 0
  };
}