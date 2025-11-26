// src/components/features/grade-cycles/Step1SelectCycle.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, Clock, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import type { AvailableCycle } from '@/types/grade-cycles.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { gradeCyclesService } from '@/services/grade-cycles.service';

interface Step1SelectCycleProps {
  selectedCycle: AvailableCycle | null;
  onSelect: (cycle: AvailableCycle) => void;
  onNext: () => void;
}

/**
 * Paso 1: Seleccionar ciclo escolar
 */
export function Step1SelectCycle({
  selectedCycle,
  onSelect,
  onNext,
}: Step1SelectCycleProps) {
  const [cycles, setCycles] = useState<AvailableCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCycles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await gradeCyclesService.getAvailableCycles();
        setCycles(data);
      } catch (err: any) {
        console.error('Error loading cycles:', err);
        setError(err.message || 'Error al cargar ciclos');
      } finally {
        setIsLoading(false);
      }
    };

    loadCycles();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-lime-600 dark:text-lime-500" />
        <p className="text-gray-600 dark:text-gray-400">Cargando ciclos escolares...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
        <p className="text-red-800 dark:text-red-300 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Selecciona el Ciclo Escolar
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Elige el ciclo escolar para configurar los grados disponibles
        </p>
        <div className="h-1 w-20 bg-lime-600 dark:bg-lime-500 rounded-full" />
      </div>

      {/* Ciclos */}
      {cycles.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No hay ciclos escolares disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cycles.map((cycle) => {
            const isSelected = selectedCycle?.id === cycle.id;
            const startDate = new Date(cycle.startDate);
            const endDate = new Date(cycle.endDate);

            return (
              <button
                key={cycle.id}
                onClick={() => onSelect(cycle)}
                className={`group relative p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-lime-500 dark:border-lime-500 bg-lime-50 dark:bg-lime-950/30 shadow-lg shadow-lime-500/20'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-lime-300 dark:hover:border-lime-700 hover:shadow-md'
                }`}
              >
                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-lime-600 text-white shadow-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}

                {/* Content */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 pr-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-lime-100 dark:bg-lime-950/30 border-2 border-lime-200 dark:border-lime-800 flex-shrink-0 group-hover:shadow-md transition-shadow">
                      <Calendar className="w-7 h-7 text-lime-600 dark:text-lime-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {cycle.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ciclo escolar
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 pl-18">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {format(startDate, 'dd MMM yyyy', { locale: es })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {format(endDate, 'dd MMM yyyy', { locale: es })}
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {cycle.isActive && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-2 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-semibold text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Activo
                      </Badge>
                    )}
                    {cycle.canEnroll && (
                      <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-semibold text-xs">
                        Inscripción Abierta
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Navigation */}
      {cycles.length > 0 && (
        <div className="flex justify-between items-center pt-8 border-t-2 border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedCycle ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-lime-600" />
                <strong>{selectedCycle.name}</strong> seleccionado
              </span>
            ) : (
              'Selecciona un ciclo para continuar'
            )}
          </p>
          <Button
            onClick={onNext}
            disabled={!selectedCycle}
            className="gap-2 bg-lime-600 hover:bg-lime-700 text-white dark:bg-lime-600 dark:hover:bg-lime-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
