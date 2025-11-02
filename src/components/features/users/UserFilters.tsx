// src/components/features/users/UserFilters.tsx
'use client';

import { useState } from 'react';
import { UsersQuery } from '@/types/users.types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, X, Sliders } from 'lucide-react';

interface UserFiltersProps {
  query: UsersQuery;
  onQueryChange: (query: Partial<UsersQuery>) => void;
  isLoading?: boolean;
}

export function UserFilters({ query, onQueryChange, isLoading }: UserFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (search: string) => {
    onQueryChange({ search: search || undefined, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    const isActive = value === 'all' ? undefined : value === 'active';
    onQueryChange({ isActive, page: 1 });
  };

  const handleAccessChange = (value: string) => {
    const canAccessPlatform = value === 'all' ? undefined : value === 'true';
    onQueryChange({ canAccessPlatform, page: 1 });
  };

  const handleSortChange = (value: string) => {
    onQueryChange({ sortBy: value as any, page: 1 });
  };

  const handleReset = () => {
    onQueryChange({
      search: undefined,
      isActive: undefined,
      canAccessPlatform: undefined,
      roleId: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
    });
  };

  const hasActiveFilters = !!(
    query.search ||
    query.isActive !== undefined ||
    query.canAccessPlatform !== undefined ||
    query.roleId !== undefined
  );

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none" />
        <Input
          placeholder="Buscar por nombre, email o DPI..."
          value={query.search || ''}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={isLoading}
          className="pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex-1 min-w-0 flex gap-2 flex-wrap">
          {/* Status Filter */}
          <Select
            value={query.isActive === undefined ? 'all' : query.isActive ? 'active' : 'inactive'}
            onValueChange={handleStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px] dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          {/* Access Filter */}
          <Select
            value={query.canAccessPlatform === undefined ? 'all' : query.canAccessPlatform.toString()}
            onValueChange={handleAccessChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px] dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <SelectValue placeholder="Acceso" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Con Acceso</SelectItem>
              <SelectItem value="false">Sin Acceso</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select
            value={query.sortBy || 'createdAt'}
            onValueChange={handleSortChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px] dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="givenNames">Nombre</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="createdAt">Más reciente</SelectItem>
              <SelectItem value="updatedAt">Actualizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isLoading}
            className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 w-full sm:w-auto"
          >
            <X className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Advanced Filters Toggle */}
      {isExpanded && (
        <Card className="p-4 space-y-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Filtros adicionales disponibles aquí (roles, rango de fechas, etc.)
          </p>
        </Card>
      )}
    </div>
  );
}
