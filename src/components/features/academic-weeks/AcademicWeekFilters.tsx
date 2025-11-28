// src/components/features/academic-weeks/AcademicWeekFilters.tsx

'use client';

import React, { useState, useRef } from 'react';
import { Search, X, Filter, RotateCcw, Calendar as CalendarIcon } from 'lucide-react';
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
import { WeekType, AcademicMonth, WEEK_TYPE_LABELS, MONTH_LABELS } from '@/types/academic-week.types';
import { getWeekTypeTheme } from '@/config/theme.config';

interface AcademicWeekFiltersProps {
  onFilterChange: (filters: any) => void;
  isLoading: boolean;
  currentCycleId?: number;
  currentBimesterId?: number;
  availableCycles?: Array<{ id: number; name: string }>;
  availableBimesters?: Array<{ id: number; name: string; number: number }>;
}

/**
 * 🔍 Componente de filtros profesionales para Academic Weeks
 * 
 * Filtros disponibles:
 * - Búsqueda por nombre
 * - Ciclo escolar
 * - Bimestre
 * - Tipo de semana (REGULAR, EVALUATION, REVIEW)
 * - Estado (activo/inactivo)
 * - Año
 * - Mes
 * - Número de semana
 */
export function AcademicWeekFilters({
  onFilterChange,
  isLoading,
  currentCycleId,
  currentBimesterId,
  availableCycles = [],
  availableBimesters = [],
}: AcademicWeekFiltersProps) {
  // Estados UI
  const [searchInput, setSearchInput] = useState('');
  const [cycleId, setCycleId] = useState<number | null>(currentCycleId || null);
  const [bimesterId, setBimesterId] = useState<number | null>(currentBimesterId || null);
  const [weekType, setWeekType] = useState<string>('all');
  const [isActive, setIsActive] = useState<string>('all');
  const [year, setYear] = useState<string>('all');
  const [month, setMonth] = useState<string>('all');
  const [weekNumber, setWeekNumber] = useState<string>('all');

  // Ref para debounce
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Construir y aplicar filtros
   */
  const applyFilters = (overrides: any = {}) => {
    const currentSearch = overrides.search !== undefined ? overrides.search : searchInput;
    const currentCycleId = overrides.cycleId !== undefined ? overrides.cycleId : cycleId;
    const currentBimesterId = overrides.bimesterId !== undefined ? overrides.bimesterId : bimesterId;
    const currentWeekType = overrides.weekType !== undefined ? overrides.weekType : weekType;
    const currentIsActive = overrides.isActive !== undefined ? overrides.isActive : isActive;
    const currentYear = overrides.year !== undefined ? overrides.year : year;
    const currentMonth = overrides.month !== undefined ? overrides.month : month;
    const currentWeekNumber = overrides.weekNumber !== undefined ? overrides.weekNumber : weekNumber;

    const payload: any = {};

    // Búsqueda
    if (currentSearch && currentSearch.trim()) {
      payload.search = currentSearch.trim();
    }

    // Ciclo escolar
    if (currentCycleId) {
      payload.cycleId = currentCycleId;
    }

    // Bimestre
    if (currentBimesterId) {
      payload.bimesterId = currentBimesterId;
    }

    // Tipo de semana
    if (currentWeekType !== 'all') {
      payload.weekType = currentWeekType as WeekType;
    }

    // Estado activo/inactivo
    if (currentIsActive !== 'all') {
      payload.isActive = currentIsActive === 'active';
    }

    // Año
    if (currentYear !== 'all') {
      payload.year = parseInt(currentYear);
    }

    // Mes
    if (currentMonth !== 'all') {
      payload.month = currentMonth as AcademicMonth;
    }

    // Número de semana
    if (currentWeekNumber !== 'all') {
      payload.weekNumber = parseInt(currentWeekNumber);
    }

    onFilterChange(payload);
  };

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchInput(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      applyFilters({ search: value });
    }, 500);
  };

  const handleCycleChange = (id: string) => {
    const numericId = id === 'all' ? null : parseInt(id);
    setCycleId(numericId);
    setBimesterId(null); // Reset bimestre cuando cambia ciclo
    applyFilters({ cycleId: numericId, bimesterId: null });
  };

  const handleBimesterChange = (id: string) => {
    const numericId = id === 'all' ? null : parseInt(id);
    setBimesterId(numericId);
    applyFilters({ bimesterId: numericId });
  };

  const handleWeekTypeChange = (value: string) => {
    setWeekType(value);
    applyFilters({ weekType: value });
  };

  const handleStatusChange = (value: string) => {
    setIsActive(value);
    applyFilters({ isActive: value });
  };

  const handleYearChange = (value: string) => {
    setYear(value);
    applyFilters({ year: value });
  };

  const handleMonthChange = (value: string) => {
    setMonth(value);
    applyFilters({ month: value });
  };

  const handleWeekNumberChange = (value: string) => {
    setWeekNumber(value);
    applyFilters({ weekNumber: value });
  };

  const handleClearFilters = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setSearchInput('');
    setCycleId(currentCycleId || null);
    setBimesterId(currentBimesterId || null);
    setWeekType('all');
    setIsActive('all');
    setYear('all');
    setMonth('all');
    setWeekNumber('all');

    applyFilters({
      search: '',
      cycleId: currentCycleId || null,
      bimesterId: currentBimesterId || null,
      weekType: 'all',
      isActive: 'all',
      year: 'all',
      month: 'all',
      weekNumber: 'all',
    });
  };

  const hasActiveFilters =
    searchInput !== '' ||
    weekType !== 'all' ||
    isActive !== 'all' ||
    year !== 'all' ||
    month !== 'all' ||
    weekNumber !== 'all';

  // Generar años disponibles (últimos 5 años + próximos 2)
  const currentYearValue = new Date().getFullYear();
  const availableYears = Array.from({ length: 8 }, (_, i) => currentYearValue - 5 + i);

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filtros de Búsqueda
          </h3>
          {hasActiveFilters && (
            <>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-full">
                Activos
              </span>
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
            </>
          )}
        </div>

        {/* Filtros principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Búsqueda */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-gray-700 dark:text-gray-300">
              Buscar
              <span className="text-xs text-gray-400 ml-2">(0.5s)</span>
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Nombre de la semana..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                disabled={isLoading}
                className="pl-10"
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
            <Label htmlFor="cycle" className="text-gray-700 dark:text-gray-300">
              Ciclo Escolar
            </Label>
            <Select
              value={cycleId?.toString() || 'all'}
              onValueChange={handleCycleChange}
              disabled={isLoading}
            >
              <SelectTrigger id="cycle">
                <SelectValue placeholder="Seleccionar ciclo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los ciclos</SelectItem>
                {availableCycles.map((cycle) => (
                  <SelectItem key={cycle.id} value={cycle.id.toString()}>
                    {cycle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bimestre */}
          <div className="space-y-2">
            <Label htmlFor="bimester" className="text-gray-700 dark:text-gray-300">
              Bimestre
            </Label>
            <Select
              value={bimesterId?.toString() || 'all'}
              onValueChange={handleBimesterChange}
              disabled={isLoading || !cycleId}
            >
              <SelectTrigger id="bimester">
                <SelectValue placeholder="Seleccionar bimestre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los bimestres</SelectItem>
                {availableBimesters.map((bimester) => (
                  <SelectItem key={bimester.id} value={bimester.id.toString()}>
                    Bimestre {bimester.number} - {bimester.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Semana */}
          <div className="space-y-2">
            <Label htmlFor="weekType" className="text-gray-700 dark:text-gray-300">
              Tipo de Semana
            </Label>
            <Select
              value={weekType}
              onValueChange={handleWeekTypeChange}
              disabled={isLoading}
            >
              <SelectTrigger id="weekType">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.entries(WEEK_TYPE_LABELS).map(([key, label]) => {
                  const theme = getWeekTypeTheme(key as any);
                  return (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${theme.icon}`} />
                        {label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros avanzados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">
              Estado
            </Label>
            <Select
              value={isActive}
              onValueChange={handleStatusChange}
              disabled={isLoading}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="inactive">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Año */}
          <div className="space-y-2">
            <Label htmlFor="year" className="text-gray-700 dark:text-gray-300">
              Año
            </Label>
            <Select
              value={year}
              onValueChange={handleYearChange}
              disabled={isLoading}
            >
              <SelectTrigger id="year">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mes */}
          <div className="space-y-2">
            <Label htmlFor="month" className="text-gray-700 dark:text-gray-300">
              Mes
            </Label>
            <Select
              value={month}
              onValueChange={handleMonthChange}
              disabled={isLoading}
            >
              <SelectTrigger id="month">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(MONTH_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Número de Semana */}
          <div className="space-y-2">
            <Label htmlFor="weekNumber" className="text-gray-700 dark:text-gray-300">
              # Semana
            </Label>
            <Select
              value={weekNumber}
              onValueChange={handleWeekNumberChange}
              disabled={isLoading}
            >
              <SelectTrigger id="weekNumber">
                <SelectValue placeholder="Número" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {[...Array(20)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Semana {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Indicador de filtros activos */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              <Filter className="inline h-4 w-4 mr-1" />
              Mostrando resultados filtrados
              {searchInput && <span className="font-medium"> • Búsqueda: "{searchInput}"</span>}
              {weekType !== 'all' && <span className="font-medium"> • Tipo: {WEEK_TYPE_LABELS[weekType as WeekType]}</span>}
              {month !== 'all' && <span className="font-medium"> • Mes: {MONTH_LABELS[month as AcademicMonth]}</span>}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AcademicWeekFilters;
