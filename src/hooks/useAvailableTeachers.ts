// src/hooks/useAvailableTeachers.ts

import { useState, useEffect, useMemo } from 'react';
import { useTeachers } from './useTeachers';
import { useSectionContext } from '@/context/SectionsContext';
import { User } from '@/types/user';

interface UseAvailableTeachersOptions {
  currentSectionId?: number; // Para excluir en modo edición
}

export function useAvailableTeachers(options: UseAvailableTeachersOptions = {}) {
  const { teachers: allTeachers, isLoading, error } = useTeachers();
  const { state: { sections } } = useSectionContext();

  // Obtener profesores asignados (excluyendo la sección actual si está editando)
  const assignedTeacherIds = useMemo(() => {
    return sections
      .filter(section => 
        section.teacherId && 
        section.id !== options.currentSectionId
      )
      .map(section => section.teacherId!)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
  }, [sections, options.currentSectionId]);

  // Filtrar profesores disponibles
  const availableTeachers = useMemo(() => {
    return allTeachers.filter(teacher => 
      !assignedTeacherIds.includes(teacher.id)
    );
  }, [allTeachers, assignedTeacherIds]);

  // Obtener profesor actualmente asignado (para modo edición)
  const currentAssignedTeacher = useMemo(() => {
    if (!options.currentSectionId) return null;
    
    const currentSection = sections.find(s => s.id === options.currentSectionId);
    return currentSection?.teacher || null;
  }, [sections, options.currentSectionId]);

  // Lista final: disponibles + actual asignado (si existe)
  const selectableTeachers = useMemo(() => {
    if (currentAssignedTeacher) {
      // Si hay un profesor asignado actualmente, incluirlo en la lista
      const isCurrentInAvailable = availableTeachers.some(t => t.id === currentAssignedTeacher.id);
      if (!isCurrentInAvailable) {
        return [currentAssignedTeacher, ...availableTeachers];
      }
    }
    return availableTeachers;
  }, [availableTeachers, currentAssignedTeacher]);

  return {
    teachers: selectableTeachers,
    availableTeachers,
    assignedTeachers: allTeachers.filter(teacher => 
      assignedTeacherIds.includes(teacher.id)
    ),
    currentAssignedTeacher,
    isLoading,
    error,
    stats: {
      total: allTeachers.length,
      assigned: assignedTeacherIds.length,
      available: availableTeachers.length
    }
  };
}