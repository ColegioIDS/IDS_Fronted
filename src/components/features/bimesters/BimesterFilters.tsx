// src/components/features/bimesters/BimesterFilters.tsx

'use client';

import React, { useState, useRef } from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CycleSelector } from '@/components/shared/selectors/CycleSelector';

interface BimesterFiltersProps {
  onFilterChange: (filters: any) => void;
  isLoading: boolean;
  currentCycleId?: number;
}

/**
 * 🔍 Componente de filtros profesionales para bimestres
 * 
 * NUEVA ARQUITECTURA SIMPLIFICADA:
 * - Sin useEffect complejos
 * - Aplicación directa de filtros
 * - Debounce manual para búsqueda
 * - Estado interno simple
 */
export function BimesterFilters({ 
  onFilterChange, 
  isLoading,
  currentCycleId 
}: BimesterFiltersProps) {
  // Estado UI (lo que el usuario ve)
  const [searchInput, setSearchInput] = useState('');
  const [cycleId, setCycleId] = useState<number | null>(currentCycleId || null);
  const [isActive, setIsActive] = useState<string>('all');
  const [number, setNumber] = useState<string>('all');
  
  // Ref para debounce
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Construir y aplicar filtros
   * Esta es la ÚNICA función que llama a onFilterChange
   */
  const applyFilters = (overrides: {
    search?: string;
    cycleId?: number | null;
    isActive?: string;
    number?: string;
  } = {}) => {
    // Usar valores actuales + overrides
    const currentSearch = overrides.search !== undefined ? overrides.search : searchInput;
    const currentCycleId = overrides.cycleId !== undefined ? overrides.cycleId : cycleId;
    const currentIsActive = overrides.isActive !== undefined ? overrides.isActive : isActive;
    const currentNumber = overrides.number !== undefined ? overrides.number : number;

    const payload: any = {};

    // Ciclo escolar (OPCIONAL - se puede filtrar por ciclo específico o solo mostrar bimestres en general)
    if (currentCycleId) {
      payload.schoolCycleId = currentCycleId;
    }

    // Búsqueda
    if (currentSearch && currentSearch.trim()) {
      payload.search = currentSearch.trim();
    }

    // Estado activo/inactivo
    if (currentIsActive !== 'all') {
      payload.isActive = currentIsActive === 'active';
    }

    // Número de bimestre
    if (currentNumber !== 'all') {
      payload.number = parseInt(currentNumber);
    }

    onFilterChange(payload);
  };

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Búsqueda con debounce (500ms)
   */
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    
    // Limpiar timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Aplicar después de 500ms
    debounceTimer.current = setTimeout(() => {
      applyFilters({ search: value });
    }, 500);
  };

  /**
   * Cambio de ciclo escolar (inmediato)
   */
  const handleCycleChange = (id: number) => {
    setCycleId(id);
    applyFilters({ cycleId: id });
  };

  /**
   * Cambio de estado (inmediato)
   */
  const handleStatusChange = (value: string) => {
    setIsActive(value);
    applyFilters({ isActive: value });
  };

  /**
   * Cambio de número (inmediato)
   */
  const handleNumberChange = (value: string) => {
    setNumber(value);
    applyFilters({ number: value });
  };

  /**
   * Limpiar todos los filtros
   */
  const handleClearFilters = () => {
    
    // Limpiar debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Resetear UI
    setSearchInput('');
    setCycleId(null);
    setIsActive('all');
    setNumber('all');
    
    // Aplicar filtros completamente limpios (sin ciclo, sin búsqueda, sin estados)
    onFilterChange({});
  };

  const hasActiveFilters = 
    searchInput !== '' || 
    isActive !== 'all' || 
    number !== 'all';

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        {/* Header con indicador de filtros activos */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filtros de Búsqueda
          </h3>
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
              Activos
            </span>
          )}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              disabled={isLoading}
              className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Restablecer
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda por nombre CON DEBOUNCE */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-gray-700 dark:text-gray-300">
              Buscar
              <span className="text-xs text-gray-400 ml-2">(escribe y espera 0.5s)</span>
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Nombre del bimestre..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                disabled={isLoading}
                className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              />
              {searchInput && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Ciclo Escolar */}
          <div className="space-y-2">
            <CycleSelector
              value={cycleId}
              onValueChange={handleCycleChange}
              label="Ciclo Escolar"
              disabled={isLoading}
              showDateRange={false}
            />
          </div>

          {/* Estado Activo/Inactivo */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">
              Estado
            </Label>
            <Select
              value={isActive}
              onValueChange={handleStatusChange}
              disabled={isLoading}
            >
              <SelectTrigger 
                id="status" 
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              >
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900">
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    Todos los estados
                  </span>
                </SelectItem>
                <SelectItem value="active">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Activos
                  </span>
                </SelectItem>
                <SelectItem value="inactive">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Inactivos
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Número de Bimestre */}
          <div className="space-y-2">
            <Label htmlFor="number" className="text-gray-700 dark:text-gray-300">
              Número de Bimestre
            </Label>
            <Select
              value={number}
              onValueChange={handleNumberChange}
              disabled={isLoading}
            >
              <SelectTrigger 
                id="number" 
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              >
                <SelectValue placeholder="Seleccionar número" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900">
                <SelectItem value="all">Todos los bimestres</SelectItem>
                <SelectItem value="1">
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                      1
                    </span>
                    Primer Bimestre
                  </span>
                </SelectItem>
                <SelectItem value="2">
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                      2
                    </span>
                    Segundo Bimestre
                  </span>
                </SelectItem>
                <SelectItem value="3">
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                      3
                    </span>
                    Tercer Bimestre
                  </span>
                </SelectItem>
                <SelectItem value="4">
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                      4
                    </span>
                    Cuarto Bimestre
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Indicador de resultados filtrados */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <Filter className="inline h-4 w-4 mr-1" />
              Mostrando resultados filtrados
              {searchInput && <span className="font-medium"> • Búsqueda: "{searchInput}"</span>}
              {isActive !== 'all' && <span className="font-medium"> • Estado: {isActive === 'active' ? 'Activos' : 'Inactivos'}</span>}
              {number !== 'all' && <span className="font-medium"> • Bimestre #{number}</span>}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BimesterFilters;
