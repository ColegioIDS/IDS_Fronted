// src/components/shared/info/CycleInfo.tsx

'use client';

import React from 'react';
import { Calendar, Clock, Archive, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useBimesterCycles } from '@/hooks/data/useBimesterCycles';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CycleInfoProps {
  cycleId: number;
  showBimesters?: boolean;
  showStats?: boolean;
  className?: string;
}

/**
 * Componente para mostrar información detallada de un ciclo escolar
 * 
 * Usa el hook useBimesterCycles que consulta:
 * GET /api/bimesters/cycles/:id
 * 
 * @example
 * ```tsx
 * <CycleInfo
 *   cycleId={1}
 *   showBimesters
 *   showStats
 * />
 * ```
 */
export function CycleInfo({
  cycleId,
  showBimesters = true,
  showStats = true,
  className = '',
}: CycleInfoProps) {
  const { getCycleDetails } = useBimesterCycles();
  const [cycle, setCycle] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!cycleId) return;

    const loadCycle = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCycleDetails(cycleId);
        setCycle(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar información del ciclo');
      } finally {
        setIsLoading(false);
      }
    };

    loadCycle();
  }, [cycleId, getCycleDetails]);

  // Formatear fecha
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd MMM yyyy', { locale: es });
    } catch {
      return date;
    }
  };

  if (isLoading) {
    return (
      <Card className={`bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 ${className}`}>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={`bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-700 dark:text-red-300">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!cycle) {
    return null;
  }

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800 ${className}`}>
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {cycle.name}
              </h3>
            </div>

            {/* Badges de estado */}
            <div className="flex flex-wrap items-center gap-2">
              {cycle.isActive && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Activo
                </Badge>
              )}
              {cycle.isArchived && (
                <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 flex items-center gap-1">
                  <Archive className="h-3 w-3" />
                  Archivado
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4 py-3 border-t border-blue-200 dark:border-blue-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              Inicio
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatDate(cycle.startDate)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              Fin
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatDate(cycle.endDate)}
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        {showStats && cycle._count && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-blue-200 dark:border-blue-800">
            <div className="text-center p-2 bg-white dark:bg-gray-900/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {cycle._count.bimesters || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Bimestres</div>
            </div>
            <div className="text-center p-2 bg-white dark:bg-gray-900/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {cycle._count.grades || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Grados</div>
            </div>
            <div className="text-center p-2 bg-white dark:bg-gray-900/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {cycle._count.enrollments || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Matrículas</div>
            </div>
          </div>
        )}

        {/* Bimestres */}
        {showBimesters && cycle.bimesters && cycle.bimesters.length > 0 && (
          <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Bimestres ({cycle.bimesters.length})
            </h4>
            <div className="space-y-2">
              {cycle.bimesters.map((bimester: any) => (
                <div
                  key={bimester.id}
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-900/50 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {bimester.number}. {bimester.name}
                    </span>
                    {bimester.isActive && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-xs">
                        Activo
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {bimester.weeksCount} semanas
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CycleInfo;
