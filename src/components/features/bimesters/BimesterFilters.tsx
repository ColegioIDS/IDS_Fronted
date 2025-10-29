// src/components/features/bimesters/BimesterFilters.tsx

'use client';

import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
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
 * Componente de filtros avanzados para bimestres
 */
export function BimesterFilters({ 
  onFilterChange, 
  isLoading,
  currentCycleId 
}: BimesterFiltersProps) {
  const [search, setSearch] = useState('');
  const [cycleId, setCycleId] = useState<number | null>(currentCycleId || null);
  const [isActive, setIsActive] = useState<string>('all');
  const [number, setNumber] = useState<string>('all');

  const handleSearch = (value: string) => {
    setSearch(value);
    applyFilters({ search: value });
  };

  const handleCycleChange = (id: number) => {
    setCycleId(id);
    applyFilters({ schoolCycleId: id });
  };

  const handleStatusChange = (value: string) => {
    setIsActive(value);
    applyFilters({ isActive: value === 'all' ? undefined : value === 'active' });
  };

  const handleNumberChange = (value: string) => {
    setNumber(value);
    applyFilters({ number: value === 'all' ? undefined : parseInt(value) });
  };

  const applyFilters = (newFilters: any) => {
    const filters = {
      search,
      schoolCycleId: cycleId,
      isActive: isActive === 'all' ? undefined : isActive === 'active',
      number: number === 'all' ? undefined : parseInt(number),
      ...newFilters,
    };

    // Remover valores undefined
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
        delete filters[key];
      }
    });

    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCycleId(currentCycleId || null);
    setIsActive('all');
    setNumber('all');
    onFilterChange({ schoolCycleId: currentCycleId });
  };

  const hasActiveFilters = search || isActive !== 'all' || number !== 'all';

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filtros
          </h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              disabled={isLoading}
              className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                disabled={isLoading}
                className="pl-10 bg-white dark:bg-gray-900"
              />
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

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={isActive}
              onValueChange={handleStatusChange}
              disabled={isLoading}
            >
              <SelectTrigger id="status" className="bg-white dark:bg-gray-900">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Número */}
          <div className="space-y-2">
            <Label htmlFor="number">Número de Bimestre</Label>
            <Select
              value={number}
              onValueChange={handleNumberChange}
              disabled={isLoading}
            >
              <SelectTrigger id="number" className="bg-white dark:bg-gray-900">
                <SelectValue placeholder="Seleccionar número" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="1">1 - Primer Bimestre</SelectItem>
                <SelectItem value="2">2 - Segundo Bimestre</SelectItem>
                <SelectItem value="3">3 - Tercer Bimestre</SelectItem>
                <SelectItem value="4">4 - Cuarto Bimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BimesterFilters;
