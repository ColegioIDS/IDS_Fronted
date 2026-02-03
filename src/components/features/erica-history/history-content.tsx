// src/components/features/erica-history/history-content.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  EricaHistoryFilters,
  EricaHistoryFilterResponse,
  CascadeOption,
} from '@/types/erica-history';
import { ericaHistoryService } from '@/services/erica-history.service';
import { HistoryFilterControls } from './history-filter-controls';
import { HistoryStatistics } from './history-statistics';
import { HistoryWeekSection } from './history-week-section';

interface HistoryContentProps {
  cascadeData: {
    bimesters: CascadeOption[];
    courses: CascadeOption[];
    sections: CascadeOption[];
    academicWeeks: CascadeOption[];
  };
}

export const HistoryContent: React.FC<HistoryContentProps> = ({ cascadeData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EricaHistoryFilterResponse | null>(null);
  const [filters, setFilters] = useState<EricaHistoryFilters>({});
  const [hasSearched, setHasSearched] = useState(false);

  const handleFiltersChange = async (newFilters: EricaHistoryFilters) => {
    try {
      setLoading(true);
      setError(null);
      setFilters(newFilters);
      setHasSearched(true);

      const response = await ericaHistoryService.getEvaluationsByFilters(newFilters);
      setData(response);

      if (response.weeks.length === 0) {
        toast.info('No hay evaluaciones que coincidan con los filtros seleccionados');
      } else {
        toast.success(`Se encontraron ${response.summary.totalEvaluations} evaluaciones`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar evaluaciones';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <HistoryFilterControls
        cascadeData={cascadeData}
        onFiltersChange={handleFiltersChange}
        isLoading={loading}
      />

      {/* Estadísticas */}
      {data && <HistoryStatistics stats={data.summary} />}

      {/* Errores */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Cargando */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {hasSearched && !loading && data && data.weeks.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay evaluaciones que coincidan con los filtros seleccionados</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Semanas de evaluaciones */}
      {data && data.weeks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Evaluaciones por Semana
          </h2>
          {data.weeks.map((weekData) => (
            <HistoryWeekSection key={weekData.weekId} weekData={weekData} />
          ))}
        </div>
      )}
    </div>
  );
};
