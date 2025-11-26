// src/components/shared/selectors/CycleSelector.tsx

'use client';

import React from 'react';
import { Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useBimesterCycles } from '@/hooks/data/useBimesterCycles';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CycleSelectorProps {
  value?: number | null;
  onValueChange: (cycleId: number) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  showDateRange?: boolean;
  className?: string;
}

/**
 * Selector de ciclos escolares para usuarios con permisos de bimester
 * 
 * Usa el hook useBimesterCycles que consulta:
 * GET /api/bimesters/cycles/available
 * 
 * Solo muestra ciclos NO archivados (disponibles para trabajar)
 * 
 * @example
 * ```tsx
 * <CycleSelector
 *   value={selectedCycleId}
 *   onValueChange={setCycleId}
 *   label="Ciclo Escolar"
 *   required
 *   showDateRange
 * />
 * ```
 */
export function CycleSelector({
  value,
  onValueChange,
  label = 'Ciclo Escolar',
  placeholder = 'Selecciona un ciclo',
  required = false,
  disabled = false,
  showDateRange = true,
  className = '',
}: CycleSelectorProps) {
  const { cycles, activeCycle, isLoading, error, getCycleDetails } = useBimesterCycles();

  // Local merged list so we can inject a missing selected cycle (when editing)
  const [localCycles, setLocalCycles] = React.useState(cycles);
  const fetchedMissing = React.useRef<Set<number>>(new Set());

  // Keep localCycles in sync when cycles update
  React.useEffect(() => {
    setLocalCycles(cycles);
  }, [cycles]);

  // DEBUG: log value/localCycles to help diagnose missing selection when editing
  React.useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.debug('[CycleSelector] value:', value, 'localCycles ids:', localCycles.map((c) => c.id));
    } catch (e) {
      /* ignore */
    }
  }, [value, localCycles]);

  // If there's a selected value that's not in the list, try to fetch it and append
  React.useEffect(() => {
    const selectedId = value ?? undefined;
    // guard: only positive ids are valid (avoid 0 or negative)
    if (selectedId == null || typeof selectedId !== 'number' || selectedId <= 0) return;

    const exists = localCycles.some((c) => c.id === selectedId);
    if (!exists && !fetchedMissing.current.has(selectedId) && getCycleDetails) {
      fetchedMissing.current.add(selectedId);
      (async () => {
        try {
          const cycle = await getCycleDetails(selectedId);
          setLocalCycles((prev) => {
            // avoid duplicates
            if (prev.some((c) => c.id === cycle.id)) return prev;
            return [...prev, cycle];
          });
        } catch (err) {
          // ignore: if cycle can't be loaded, selector will simply not show it
          // eslint-disable-next-line no-console
          console.error('Failed to fetch selected cycle details', err);
        }
      })();
    }
  }, [value, localCycles, getCycleDetails]);

  // Auto-seleccionar el ciclo activo si no hay valor
  // Auto-select active cycle only when value is null/undefined (not when it's 0)
  React.useEffect(() => {
    if ((value === null || value === undefined) && activeCycle && !disabled) {
      onValueChange(activeCycle.id);
    }
  }, [activeCycle, value, onValueChange, disabled]);

  // Formatear rango de fechas
  const formatDateRange = (startDate: string, endDate: string) => {
    try {
      const start = format(new Date(startDate), 'dd MMM yyyy', { locale: es });
      const end = format(new Date(endDate), 'dd MMM yyyy', { locale: es });
      return `${start} - ${end}`;
    } catch {
      return '';
    }
  };

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <Label>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="cycle-selector" className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Select
        value={value?.toString()}
        onValueChange={(val) => onValueChange(Number(val))}
        disabled={disabled || isLoading || localCycles.length === 0}
        required={required}
      >
        <SelectTrigger
          id="cycle-selector"
          className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando ciclos...</span>
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>

        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          {localCycles.length === 0 && !isLoading && (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No hay ciclos disponibles
            </div>
          )}

          {localCycles.map((cycle) => (
            <SelectItem
              key={cycle.id}
              value={cycle.id.toString()}
              className="hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {cycle.name}
                    </span>
                    {cycle.isActive && (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-xs"
                      >
                        Activo
                      </Badge>
                    )}
                  </div>
                  {showDateRange && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateRange(cycle.startDate, cycle.endDate)}
                    </span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Info adicional del ciclo seleccionado */}
      {value && showDateRange && localCycles.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-1">
          {(() => {
            const selectedCycle = localCycles.find((c) => c.id === value);
            if (!selectedCycle) return null;

            const bimestersCount = selectedCycle._count?.bimesters || 0;
            return (
              <span>
                {bimestersCount > 0
                  ? `${bimestersCount} bimestre${bimestersCount !== 1 ? 's' : ''} registrado${bimestersCount !== 1 ? 's' : ''}`
                  : 'Sin bimestres registrados'}
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default CycleSelector;
