// src/hooks/data/useSectionsByGrade.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { sectionsService } from '@/services/sections.service';
import type { Section } from '@/types/sections.types';

export function useSectionsByGrade(gradeId: number | null, autoFetch = true) {
  const [data, setData] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSections = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const sections = await sectionsService.getByGrade(id);
      setData(Array.isArray(sections) ? sections : []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error fetching sections by grade'));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    if (gradeId) {
      fetchSections(gradeId);
    }
  }, [gradeId, fetchSections]);

  useEffect(() => {
    if (gradeId && autoFetch) {
      fetchSections(gradeId);
    }
  }, [gradeId, autoFetch, fetchSections]);

  return {
    data,
    isLoading,
    error,
    refresh,
    fetchSections,
  };
}
