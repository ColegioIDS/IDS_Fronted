// src/hooks/data/useSection.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { sectionsService } from '@/services/sections.service';
import type { Section } from '@/types/sections.types';

export function useSection(id: number | null, autoFetch = true) {
  const [data, setData] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSection = useCallback(async (sectionId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const section = await sectionsService.getById(sectionId);
      setData(section);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error fetching section'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    if (id) {
      fetchSection(id);
    }
  }, [id, fetchSection]);

  useEffect(() => {
    if (id && autoFetch) {
      fetchSection(id);
    }
  }, [id, autoFetch, fetchSection]);

  return {
    data,
    isLoading,
    error,
    refresh,
    fetchSection,
  };
}
