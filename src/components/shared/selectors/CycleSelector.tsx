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
  const { cycles, activeCycle, isLoading, error } = useBimesterCycles();

  // Auto-seleccionar el ciclo activo si no hay valor
  React.useEffect(() => {
    if (!value && activeCycle && !disabled) {
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
        disabled={disabled || isLoading || cycles.length === 0}
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
          {cycles.length === 0 && !isLoading && (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No hay ciclos disponibles
            </div>
          )}

          {cycles.map((cycle) => (
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
      {value && showDateRange && cycles.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-1">
          {(() => {
            const selectedCycle = cycles.find((c) => c.id === value);
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
