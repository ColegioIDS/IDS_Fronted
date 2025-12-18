// src/hooks/data/useParentStudentLinks.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/config/api';
import {
  ParentStudentLink,
  CreateParentStudentLinkDto,
  UpdateParentStudentLinkDto,
  PaginatedParentStudentLinks,
  StudentWithEnrollments,
} from '@/types/users.types';
import { toast } from 'sonner';

interface UseParentStudentLinksState {
  links: StudentWithEnrollments[]; // Array de estudiantes con matrícula
  isLoading: boolean;
  error: Error | null;
}

export function useParentStudentLinks(parentId?: number) {
  const [state, setState] = useState<UseParentStudentLinksState>({
    links: [],
    isLoading: false,
    error: null,
  });

  // Fetch links for a parent
  const fetchParentChildren = useCallback(async (id: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await api.get(`/api/users/parent/${id}/children`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener estudiantes del padre');
      }

      // Extrae los estudiantes del objeto ParentStudentLink
      const links = response.data?.data || [];
      const students = links.map((link: any) => ({
        ...link.student,
        parentStudentLinkId: link.id,
        relationshipType: link.relationshipType,
        isPrimaryContact: link.isPrimaryContact,
        hasLegalCustody: link.hasLegalCustody,
        canAccessInfo: link.canAccessInfo,
        livesWithStudent: link.livesWithStudent,
        financialResponsible: link.financialResponsible,
        emergencyContactPriority: link.emergencyContactPriority,
        receivesSchoolNotices: link.receivesSchoolNotices,
      }));

      setState((prev) => ({
        ...prev,
        links: Array.isArray(students) ? students : [],
        isLoading: false,
      }));
      return students;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      setState((prev) => ({
        ...prev,
        error: err,
        isLoading: false,
      }));
      toast.error(err.message);
      return [];
    }
  }, []);

  // Fetch links for a student
  const fetchStudentParents = useCallback(async (studentId: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await api.get(`/api/parent-student-links/student/${studentId}/parents`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener padres del estudiante');
      }

      const links = response.data?.data || [];
      setState((prev) => ({
        ...prev,
        links: Array.isArray(links) ? links : [],
        isLoading: false,
      }));
      return links;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      setState((prev) => ({
        ...prev,
        error: err,
        isLoading: false,
      }));
      toast.error(err.message);
      return [];
    }
  }, []);

  // Create new link
  const createLink = useCallback(async (data: CreateParentStudentLinkDto): Promise<ParentStudentLink | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await api.post(`/api/parent-student-links`, data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al crear vínculo');
      }

      const newLink = response.data?.data || response.data;
      setState((prev) => ({
        ...prev,
        links: [...prev.links, newLink],
        isLoading: false,
      }));
      toast.success('Vínculo creado exitosamente');
      return newLink;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      setState((prev) => ({
        ...prev,
        error: err,
        isLoading: false,
      }));
      toast.error(err.message);
      return null;
    }
  }, []);

  // Update link
  const updateLink = useCallback(
    async (linkId: number, data: UpdateParentStudentLinkDto): Promise<ParentStudentLink | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await api.patch(`/api/parent-student-links/${linkId}`, data);

        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Error al actualizar vínculo');
        }

        const updatedLink = response.data?.data || response.data;
        setState((prev) => ({
          ...prev,
          links: prev.links.map((l) => (l.id === linkId ? updatedLink : l)),
          isLoading: false,
        }));
        toast.success('Vínculo actualizado exitosamente');
        return updatedLink;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Error desconocido');
        setState((prev) => ({
          ...prev,
          error: err,
          isLoading: false,
        }));
        toast.error(err.message);
        return null;
      }
    },
    []
  );

  // Delete link
  const deleteLink = useCallback(async (linkId: number): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await api.delete(`/api/parent-student-links/${linkId}`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al eliminar vínculo');
      }

      setState((prev) => ({
        ...prev,
        links: prev.links.filter((l) => l.id !== linkId),
        isLoading: false,
      }));
      toast.success('Vínculo eliminado exitosamente');
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      setState((prev) => ({
        ...prev,
        error: err,
        isLoading: false,
      }));
      toast.error(err.message);
      return false;
    }
  }, []);

  // Auto-fetch if parentId is provided
  useEffect(() => {
    if (parentId && state.links.length === 0 && !state.isLoading && !state.error) {
      fetchParentChildren(parentId);
    }
  }, [parentId, state.links.length, state.isLoading, state.error, fetchParentChildren]);

  return {
    links: state.links,
    isLoading: state.isLoading,
    error: state.error,
    fetchParentChildren,
    fetchStudentParents,
    createLink,
    updateLink,
    deleteLink,
  };
}
