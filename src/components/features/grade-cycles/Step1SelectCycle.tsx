// src/components/features/grade-cycles/Step1SelectCycle.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  Loader2,
  AlertTriangle,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import type { AvailableCycle } from '@/types/grade-cycles.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { gradeCyclesService } from '@/services/grade-cycles.service';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Step1SelectCycleProps {
  selectedCycle: AvailableCycle | null;
  onSelect: (cycle: AvailableCycle) => void;
  onNext: () => void;
}

/**
 * 📅 Paso 1: Seleccionar ciclo escolar - Diseño moderno
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
        setError(err.message || 'Error al cargar ciclos');
      } finally {
        setIsLoading(false);
      }
    };

    loadCycles();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-600 dark:text-indigo-500" strokeWidth={2.5} />
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-indigo-500/20 animate-ping" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Cargando ciclos escolares
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Por favor espera un momento...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-10 text-center">
        <div className="inline-flex p-4 bg-red-100 dark:bg-red-950/40 rounded-2xl mb-4">
          <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" strokeWidth={2.5} />
        </div>
        <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">Error al Cargar</h3>
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-indigo-100 dark:bg-indigo-950/30 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 shadow-lg shadow-indigo-500/10">
            <CalendarDays className="w-10 h-10 text-indigo-600 dark:text-indigo-500" strokeWidth={2.5} />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Selecciona el Ciclo Escolar
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Elige el ciclo escolar para configurar los grados disponibles durante este período académico
          </p>
        </div>

        {/* Ciclos */}
        {cycles.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-16 text-center">
            <Calendar className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-5" strokeWidth={1.5} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No hay ciclos disponibles
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron ciclos escolares para mostrar
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cycles.map((cycle) => {
              const isSelected = selectedCycle?.id === cycle.id;
              const startDate = new Date(cycle.startDate);
              const endDate = new Date(cycle.endDate);

              return (
                <Tooltip key={cycle.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelect(cycle)}
                      className={`group relative p-7 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-2xl shadow-indigo-500/30 scale-[1.02]'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl hover:scale-[1.01]'
                      }`}
                    >
                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute -top-3 -right-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-xl shadow-indigo-500/50 animate-in zoom-in-50 duration-300">
                          <CheckCircle2 className="w-7 h-7" strokeWidth={2.5} />
                        </div>
                      )}

                      {/* Icon decorativo de fondo */}
                      <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Calendar className="w-32 h-32 text-indigo-600" strokeWidth={1} />
                      </div>

                      {/* Content */}
                      <div className="relative space-y-5">
                        <div className="flex items-start gap-4">
                          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all ${
                            isSelected
                              ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/30'
                              : 'bg-indigo-100 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/40'
                          }`}>
                            <Calendar className={`w-8 h-8 transition-colors ${
                              isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-500'
                            }`} strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {cycle.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              Año académico
                            </p>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" strokeWidth={2.5} />
                              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                Inicio
                              </p>
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {format(startDate, 'dd MMM yyyy', { locale: es })}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Clock className="w-3.5 h-3.5 text-red-600 dark:text-red-500" strokeWidth={2.5} />
                              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                Fin
                              </p>
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {format(endDate, 'dd MMM yyyy', { locale: es })}
                            </p>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {cycle.isActive && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-2 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-bold text-xs px-3 py-1.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 mr-1.5 animate-pulse" />
                              Activo
                            </Badge>
                          )}
                          {cycle.canEnroll && (
                            <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 font-bold text-xs px-3 py-1.5">
                              <Sparkles className="w-3 h-3 mr-1.5" strokeWidth={2.5} />
                              Inscripción Abierta
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Bottom accent */}
                      <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-all ${
                        isSelected ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-transparent group-hover:bg-indigo-400'
                      }`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0 px-4 py-2">
                    <p className="font-semibold">Click para seleccionar {cycle.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        {cycles.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t-2 border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              {selectedCycle ? (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {selectedCycle.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Ciclo seleccionado
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Selecciona un ciclo para continuar
                </p>
              )}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onNext}
                  disabled={!selectedCycle}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] h-12 text-base font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all border-2 border-indigo-700 dark:border-indigo-500"
                >
                  Continuar
                  <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">
                  {selectedCycle ? 'Ir al siguiente paso' : 'Debes seleccionar un ciclo primero'}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
