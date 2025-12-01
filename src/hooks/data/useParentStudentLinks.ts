// src/hooks/data/useParentStudentLinks.ts
'use client';

import { useState, useCallback } from 'react';
import {
  ParentStudentLink,
  CreateParentStudentLinkDto,
  UpdateParentStudentLinkDto,
  PaginatedParentStudentLinks,
} from '@/types/users.types';
import { toast } from 'sonner';

interface UseParentStudentLinksState {
  links: ParentStudentLink[];
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
      const response = await fetch(`/api/parent-student-links/parent/${id}/children`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener estudiantes del padre');
      }

      const data = await response.json();
      const links = data.data || data || [];
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

  // Fetch links for a student
  const fetchStudentParents = useCallback(async (studentId: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`/api/parent-student-links/student/${studentId}/parents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener padres del estudiante');
      }

      const data = await response.json();
      const links = data.data || data || [];
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
      const response = await fetch(`/api/parent-student-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear vínculo');
      }

      const newLink = await response.json();
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
        const response = await fetch(`/api/parent-student-links/${linkId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Error al actualizar vínculo');
        }

        const updatedLink = await response.json();
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
      const response = await fetch(`/api/parent-student-links/${linkId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar vínculo');
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
  if (parentId && state.links.length === 0 && !state.isLoading) {
    fetchParentChildren(parentId);
  }

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
