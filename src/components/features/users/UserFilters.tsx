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
import { Search, X, Sliders, Filter, Zap } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Search className="w-5 h-5" />
          </div>
          <Input
            placeholder="Buscar por nombre, email o DPI..."
            value={query.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={isLoading}
            className="
              pl-12 pr-4 py-2.5
              text-base font-medium
              bg-white dark:bg-slate-900/80
              border border-slate-200/60 dark:border-slate-700/60
              hover:border-slate-300/80 dark:hover:border-slate-600/80
              focus:border-blue-400 dark:focus:border-blue-500
              focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20
              text-slate-900 dark:text-white
              placeholder-slate-500 dark:placeholder-slate-400
              transition-all duration-300
              rounded-lg
            "
          />
          {query.search && (
            <button
              onClick={() => handleSearch('')}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                p-1.5 rounded-md
                hover:bg-slate-100 dark:hover:bg-slate-800
                text-slate-400 dark:text-slate-500
                hover:text-slate-600 dark:hover:text-slate-300
                transition-colors duration-200
              "
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1 min-w-0 flex gap-2 flex-wrap">
          {/* Status Filter */}
          <Select
            value={query.isActive === undefined ? 'all' : query.isActive ? 'active' : 'inactive'}
            onValueChange={handleStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger className="
              flex-1 sm:flex-none w-full sm:w-[160px]
              bg-gradient-to-br from-white to-slate-50/50
              dark:from-slate-900/80 dark:to-slate-900/40
              border border-slate-200/60 dark:border-slate-700/60
              hover:border-slate-300/80 dark:hover:border-slate-600/80
              text-slate-900 dark:text-white
              transition-all duration-300
              rounded-lg
              shadow-sm hover:shadow-md
            ">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="
              bg-white dark:bg-slate-900
              border border-slate-200/50 dark:border-slate-700/50
              shadow-lg rounded-lg
            ">
              <SelectItem value="all" className="hover:bg-blue-50 dark:hover:bg-blue-950/30">
                Todos
              </SelectItem>
              <SelectItem value="active" className="hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Activos
                </span>
              </SelectItem>
              <SelectItem value="inactive" className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Inactivos
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Access Filter */}
          <Select
            value={query.canAccessPlatform === undefined ? 'all' : query.canAccessPlatform.toString()}
            onValueChange={handleAccessChange}
            disabled={isLoading}
          >
            <SelectTrigger className="
              flex-1 sm:flex-none w-full sm:w-[160px]
              bg-gradient-to-br from-white to-slate-50/50
              dark:from-slate-900/80 dark:to-slate-900/40
              border border-slate-200/60 dark:border-slate-700/60
              hover:border-slate-300/80 dark:hover:border-slate-600/80
              text-slate-900 dark:text-white
              transition-all duration-300
              rounded-lg
              shadow-sm hover:shadow-md
            ">
              <SelectValue placeholder="Acceso" />
            </SelectTrigger>
            <SelectContent className="
              bg-white dark:bg-slate-900
              border border-slate-200/50 dark:border-slate-700/50
              shadow-lg rounded-lg
            ">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true" className="hover:bg-blue-50 dark:hover:bg-blue-950/30">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Con Acceso
                </span>
              </SelectItem>
              <SelectItem value="false" className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Sin Acceso
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select
            value={query.sortBy || 'createdAt'}
            onValueChange={handleSortChange}
            disabled={isLoading}
          >
            <SelectTrigger className="
              flex-1 sm:flex-none w-full sm:w-[170px]
              bg-gradient-to-br from-white to-slate-50/50
              dark:from-slate-900/80 dark:to-slate-900/40
              border border-slate-200/60 dark:border-slate-700/60
              hover:border-slate-300/80 dark:hover:border-slate-600/80
              text-slate-900 dark:text-white
              transition-all duration-300
              rounded-lg
              shadow-sm hover:shadow-md
            ">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="
              bg-white dark:bg-slate-900
              border border-slate-200/50 dark:border-slate-700/50
              shadow-lg rounded-lg
            ">
              <SelectItem value="givenNames">
                <span className="flex items-center gap-2">
                  <span className="text-base">A-Z</span>
                  Nombre
                </span>
              </SelectItem>
              <SelectItem value="email">
                <span className="flex items-center gap-2">
                  ✉️ Email
                </span>
              </SelectItem>
              <SelectItem value="createdAt">
                <span className="flex items-center gap-2">
                  ⏰ Más reciente
                </span>
              </SelectItem>
              <SelectItem value="updatedAt">
                <span className="flex items-center gap-2">
                  ↻ Actualizado
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isLoading}
            className="
              w-full sm:w-auto
              bg-gradient-to-r from-red-50 to-red-50/50
              dark:from-red-950/40 dark:to-red-950/20
              text-red-700 dark:text-red-300
              hover:from-red-100 hover:to-red-100/60
              dark:hover:from-red-900/60 dark:hover:to-red-900/30
              border border-red-200/50 dark:border-red-800/50
              hover:border-red-300/80 dark:hover:border-red-700/80
              transition-all duration-300
              font-semibold
              h-10
              rounded-lg
              group
            "
          >
            <X className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Limpiar Filtros
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="
          p-3 px-4
          bg-gradient-to-r from-blue-50/50 to-purple-50/50
          dark:from-blue-950/20 dark:to-purple-950/20
          border border-blue-200/50 dark:border-blue-800/30
          rounded-lg
          flex flex-wrap gap-2 items-center
        ">
          <Zap className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Filtros activos:</span>
          
          {query.search && (
            <div className="
              inline-flex items-center gap-2
              px-2.5 py-1
              bg-white dark:bg-slate-800/60
              border border-slate-200/50 dark:border-slate-700/50
              rounded-full
              text-xs font-medium
              text-slate-700 dark:text-slate-300
            ">
              <Search className="w-3 h-3" />
              {query.search}
            </div>
          )}

          {query.isActive !== undefined && (
            <div className="
              inline-flex items-center gap-2
              px-2.5 py-1
              bg-white dark:bg-slate-800/60
              border border-slate-200/50 dark:border-slate-700/50
              rounded-full
              text-xs font-medium
              text-slate-700 dark:text-slate-300
            ">
              <span className={`w-2 h-2 rounded-full ${query.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {query.isActive ? 'Activos' : 'Inactivos'}
            </div>
          )}

          {query.canAccessPlatform !== undefined && (
            <div className="
              inline-flex items-center gap-2
              px-2.5 py-1
              bg-white dark:bg-slate-800/60
              border border-slate-200/50 dark:border-slate-700/50
              rounded-full
              text-xs font-medium
              text-slate-700 dark:text-slate-300
            ">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {query.canAccessPlatform ? 'Con Acceso' : 'Sin Acceso'}
            </div>
          )}
        </div>
      )}

      {/* Advanced Filters Toggle */}
      {isExpanded && (
        <Card className="
          p-4 space-y-3
          bg-gradient-to-br from-white/50 to-slate-50/50
          dark:from-slate-800/40 dark:to-slate-900/30
          border border-slate-200/50 dark:border-slate-700/50
          rounded-lg
        ">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Filtros Adicionales
            </p>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Más opciones de filtrado disponibles (roles, rango de fechas, etc.)
          </p>
        </Card>
      )}
    </div>
  );
}