// src/hooks/useEricaTopics.ts
import { useState, useCallback } from 'react';
import { ericaTopicsService } from '@/services/erica-topics.service';
import {
  EricaTopic,
  EricaTopicWithRelations,
  CreateEricaTopicDto,
  UpdateEricaTopicDto,
  EricaTopicsQuery,
  PaginatedEricaTopics,
  EricaTopicStats,
} from '@/types/erica-topics.types';

export const useEricaTopics = () => {
  const [topics, setTopics] = useState<EricaTopic[]>([]);
  const [currentTopic, setCurrentTopic] = useState<EricaTopicWithRelations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  /**
   * Obtener temas con paginación
   */
  const fetchTopics = useCallback(async (query: EricaTopicsQuery = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await ericaTopicsService.getEricaTopics(query);
      setTopics(result.data);
      setPagination(result.meta);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar temas';
      setError(errorMsg);
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener tema por ID
   */
  const fetchTopicById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await ericaTopicsService.getEricaTopicById(id);
      setCurrentTopic(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar tema';
      setError(errorMsg);
      console.error('Error fetching topic:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo tema
   */
  const createTopic = useCallback(async (data: CreateEricaTopicDto) => {
    try {
      setLoading(true);
      setError(null);
      const newTopic = await ericaTopicsService.createEricaTopic(data);
      setTopics((prev) => [newTopic, ...prev]);
      return newTopic;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear tema';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar tema
   */
  const updateTopic = useCallback(async (id: number, data: UpdateEricaTopicDto) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await ericaTopicsService.updateEricaTopic(id, data);
      setTopics((prev) =>
        prev.map((topic) => (topic.id === id ? updated : topic))
      );
      if (currentTopic?.id === id) {
        setCurrentTopic({ ...currentTopic, ...updated });
      }
      return updated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar tema';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentTopic]);

  /**
   * Eliminar tema
   */
  const deleteTopic = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await ericaTopicsService.deleteEricaTopic(id);
      setTopics((prev) => prev.filter((topic) => topic.id !== id));
      if (currentTopic?.id === id) {
        setCurrentTopic(null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar tema';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentTopic]);

  /**
   * Obtener temas por docente
   */
  const fetchTopicsByTeacher = useCallback(async (teacherId: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await ericaTopicsService.getEricaTopicsByTeacher(teacherId);
      setTopics(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar temas del docente';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener temas por sección
   */
  const fetchTopicsBySection = useCallback(async (sectionId: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await ericaTopicsService.getEricaTopicsBySection(sectionId);
      setTopics(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar temas de la sección';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener temas por semana
   */
  const fetchTopicsByWeek = useCallback(async (weekId: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await ericaTopicsService.getEricaTopicsByWeek(weekId);
      setTopics(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar temas de la semana';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Duplicar tema
   */
  const duplicateTopic = useCallback(async (id: number, newWeekId: number) => {
    try {
      setLoading(true);
      setError(null);
      const duplicated = await ericaTopicsService.duplicateEricaTopic(id, {
        newWeekId,
      });
      setTopics((prev) => [duplicated, ...prev]);
      return duplicated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al duplicar tema';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Marcar como completado
   */
  const completeTopic = useCallback(async (id: number, completed: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await ericaTopicsService.completeEricaTopic(id, { completed });
      setTopics((prev) =>
        prev.map((topic) => (topic.id === id ? updated : topic))
      );
      return updated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar estado';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    topics,
    currentTopic,
    loading,
    error,
    pagination,
    fetchTopics,
    fetchTopicById,
    createTopic,
    updateTopic,
    deleteTopic,
    fetchTopicsByTeacher,
    fetchTopicsBySection,
    fetchTopicsByWeek,
    duplicateTopic,
    completeTopic,
  };
};
