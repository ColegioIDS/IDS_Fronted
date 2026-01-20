// hooks/data/erica-evaluations/useEricaEvaluationStats.ts
import { useState, useCallback } from 'react';
import { ericaEvaluationsService } from '@/services/erica-evaluations.service';
import {
  TopicStats,
  EricaDimension,
  EricaState,
  DIMENSION_LABELS,
  STATE_LABELS,
  STATE_POINTS,
} from '@/types/erica-evaluations';

interface UseStatsState {
  stats: TopicStats | null;
  isLoading: boolean;
  error: string | null;
}

interface FormattedDimensionStats {
  dimension: EricaDimension;
  dimensionLabel: string;
  stateDistribution: Array<{
    state: EricaState;
    stateLabel: string;
    count: number;
    percentage: number;
    points: number;
  }>;
  averagePoints: number;
  totalEvaluations: number;
}

interface UseStatsReturn extends UseStatsState {
  // Load stats
  loadTopicStats: (topicId: number) => Promise<void>;
  
  // Formatted getters
  getFormattedStats: () => FormattedDimensionStats[];
  getOverallAverage: () => number;
  getTotalStudents: () => number;
  
  // Dimension specific
  getDimensionStats: (dimension: EricaDimension) => FormattedDimensionStats | null;
  
  // State distribution
  getStateCount: (dimension: EricaDimension, state: EricaState) => number;
  getStatePercentage: (dimension: EricaDimension, state: EricaState) => number;
  
  // Utility
  clearStats: () => void;
  refreshStats: () => Promise<void>;
}

export function useEricaEvaluationStats(): UseStatsReturn {
  const [state, setState] = useState<UseStatsState>({
    stats: null,
    isLoading: false,
    error: null,
  });
  
  const [currentTopicId, setCurrentTopicId] = useState<number | null>(null);

  // Load topic stats
  const loadTopicStats = useCallback(async (topicId: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    setCurrentTopicId(topicId);
    
    try {
      const data = await ericaEvaluationsService.getTopicStats(topicId);
      
      setState({
        stats: data,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState({
        stats: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error al cargar estadísticas',
      });
    }
  }, []);

  // Get formatted stats for all dimensions
  const getFormattedStats = useCallback((): FormattedDimensionStats[] => {
    if (!state.stats) return [];
    
    const dimensions: EricaDimension[] = ['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'APLICA'];
    
    return dimensions.map(dimension => {
      const dimStats = state.stats!.dimensionStats[dimension];
      const states: EricaState[] = ['E', 'B', 'P', 'C', 'N'];
      
      const totalEvaluations = states.reduce(
        (sum, s) => sum + (dimStats?.[s] ?? 0),
        0
      );
      
      return {
        dimension,
        dimensionLabel: DIMENSION_LABELS[dimension],
        stateDistribution: states.map(s => ({
          state: s,
          stateLabel: STATE_LABELS[s],
          count: dimStats?.[s] ?? 0,
          percentage: totalEvaluations > 0 
            ? ((dimStats?.[s] ?? 0) / totalEvaluations) * 100 
            : 0,
          points: STATE_POINTS[s],
        })),
        averagePoints: dimStats?.averagePoints ?? 0,
        totalEvaluations,
      };
    });
  }, [state.stats]);

  // Get overall average
  const getOverallAverage = useCallback((): number => {
    return state.stats?.overallAverage ?? 0;
  }, [state.stats]);

  // Get total students
  const getTotalStudents = useCallback((): number => {
    return state.stats?.totalStudents ?? 0;
  }, [state.stats]);

  // Get stats for specific dimension
  const getDimensionStats = useCallback((dimension: EricaDimension): FormattedDimensionStats | null => {
    const allStats = getFormattedStats();
    return allStats.find(s => s.dimension === dimension) ?? null;
  }, [getFormattedStats]);

  // Get count for specific state in dimension
  const getStateCount = useCallback((dimension: EricaDimension, stateKey: EricaState): number => {
    if (!state.stats) return 0;
    return state.stats.dimensionStats[dimension]?.[stateKey] ?? 0;
  }, [state.stats]);

  // Get percentage for specific state in dimension
  const getStatePercentage = useCallback((dimension: EricaDimension, stateKey: EricaState): number => {
    const dimStats = getDimensionStats(dimension);
    if (!dimStats) return 0;
    
    const stateInfo = dimStats.stateDistribution.find(s => s.state === stateKey);
    return stateInfo?.percentage ?? 0;
  }, [getDimensionStats]);

  // Clear stats
  const clearStats = useCallback(() => {
    setState({
      stats: null,
      isLoading: false,
      error: null,
    });
    setCurrentTopicId(null);
  }, []);

  // Refresh current stats
  const refreshStats = useCallback(async () => {
    if (currentTopicId) {
      await loadTopicStats(currentTopicId);
    }
  }, [currentTopicId, loadTopicStats]);

  return {
    // State
    stats: state.stats,
    isLoading: state.isLoading,
    error: state.error,
    
    // Load
    loadTopicStats,
    
    // Formatted getters
    getFormattedStats,
    getOverallAverage,
    getTotalStudents,
    
    // Dimension specific
    getDimensionStats,
    
    // State distribution
    getStateCount,
    getStatePercentage,
    
    // Utility
    clearStats,
    refreshStats,
  };
}

export default useEricaEvaluationStats;
