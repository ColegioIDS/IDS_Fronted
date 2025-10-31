// src/hooks/data/useSectionStats.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { sectionsService } from '@/services/sections.service';
import type { SectionStats } from '@/types/sections.types';

export function useSectionStats(id: number | null, autoFetch = true) {
  const [data, setData] = useState<SectionStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async (sectionId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const stats = await sectionsService.getStats(sectionId);
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error fetching section stats'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    if (id) {
      fetchStats(id);
    }
  }, [id, fetchStats]);

  useEffect(() => {
    if (id && autoFetch) {
      fetchStats(id);
    }
  }, [id, autoFetch, fetchStats]);

  return {
    data,
    isLoading,
    error,
    refresh,
    fetchStats,
  };
}
