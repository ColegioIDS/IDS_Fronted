// src/components/features/holidays/HolidayFilters.tsx

'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HolidayFilters as IHolidayFilters } from '@/types/holidays.types';
import { useHolidayCycles } from '@/hooks/data/useHolidayCycles';
import { useHolidayBimesters } from '@/hooks/data/useHolidayBimesters';

interface HolidayFiltersProps {
  filters: IHolidayFilters;
  onFilterChange: (filters: Partial<IHolidayFilters>) => void;
  onReset: () => void;
}

/**
 * 🔍 Filtros para días festivos
 */
export function HolidayFilters({
  filters,
  onFilterChange,
  onReset,
}: HolidayFiltersProps) {
  const { cycles, error: cyclesError } = useHolidayCycles();
  const { bimesters, error: bimestersError } = useHolidayBimesters(filters.cycleId);

  // Si hay error de permisos, mostrar mensaje
  if (cyclesError) {
    return (
      <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
        <Filter className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          No tienes permisos para acceder a los filtros. Contacta al administrador.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filtros:
        </span>
      </div>

      {/* Ciclo Escolar */}
      <Select
        value={filters.cycleId?.toString()}
        onValueChange={(value) => {
          const cycleId = parseInt(value);
          // Al cambiar ciclo, resetear bimestre pero mantener otros filtros
          onFilterChange({ 
            cycleId, 
            bimesterId: undefined 
          });
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Ciclo Escolar" />
        </SelectTrigger>
        <SelectContent>
          {cycles && cycles.length > 0 ? (
            cycles.map((cycle) => (
              <SelectItem key={cycle.id} value={cycle.id.toString()}>
                {cycle.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-data" disabled>
              No hay ciclos disponibles
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Bimestre */}
      <Select
        value={filters.bimesterId?.toString()}
        onValueChange={(value) => {
          // Mantener cycleId y solo actualizar bimesterId
          onFilterChange({ 
            cycleId: filters.cycleId,
            bimesterId: parseInt(value) 
          });
        }}
        disabled={!filters.cycleId || bimestersError !== null}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Bimestre" />
        </SelectTrigger>
        <SelectContent>
          {bimesters && bimesters.length > 0 ? (
            bimesters.map((bimester) => (
              <SelectItem key={bimester.id} value={bimester.id.toString()}>
                Bimestre {bimester.number}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-data" disabled>
              {bimestersError ? 'Error al cargar bimestres' : 'Selecciona un ciclo primero'}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Recuperable */}
      <Select
        value={filters.isRecovered === undefined ? 'all' : filters.isRecovered.toString()}
        onValueChange={(value) => {
          // Mantener cycleId y bimesterId, solo cambiar isRecovered
          onFilterChange({ 
            cycleId: filters.cycleId,
            bimesterId: filters.bimesterId,
            isRecovered: value === 'all' ? undefined : value === 'true' 
          });
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="true">Recuperables</SelectItem>
          <SelectItem value="false">No Recuperables</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset */}
      <Button variant="outline" onClick={onReset}>
        Limpiar
      </Button>
    </div>
  );
}

export default HolidayFilters;
