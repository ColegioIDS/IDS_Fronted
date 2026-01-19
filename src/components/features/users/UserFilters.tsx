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
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Sliders, 
  Filter, 
  Zap, 
  Clock, 
  RefreshCw,
  Settings2,
  Trash2,
  Shield,
  Users,
  AtSign,
  Loader2,
} from 'lucide-react';

interface UserFiltersProps {
  query: UsersQuery;
  onQueryChange: (query: Partial<UsersQuery>) => void;
  isLoading?: boolean;
  roles?: Array<{ id: number; name: string }>;
}

export function UserFilters({ query, onQueryChange, isLoading, roles = [] }: UserFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState(query.search || '');

  const handleSearchClick = () => {
    onQueryChange({ search: searchInput || undefined, page: 1 });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onQueryChange({ search: undefined, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    const isActive = value === 'all' ? undefined : value === 'active';
    onQueryChange({ isActive, page: 1 });
  };

  const handleAccessChange = (value: string) => {
    const canAccessPlatform = value === 'all' ? undefined : value === 'true';
    onQueryChange({ canAccessPlatform, page: 1 });
  };

  const handleRoleChange = (value: string) => {
    const roleId = value === 'all' ? undefined : parseInt(value);
    onQueryChange({ roleId, page: 1 });
  };

  const handleSortChange = (value: string) => {
    onQueryChange({ sortBy: value as any, page: 1 });
  };

  // Funciones para eliminar filtros individuales
  const removeSearchFilter = () => {
    setSearchInput('');
    onQueryChange({ search: undefined, page: 1 });
  };

  const removeStatusFilter = () => {
    onQueryChange({ isActive: undefined, page: 1 });
  };

  const removeAccessFilter = () => {
    onQueryChange({ canAccessPlatform: undefined, page: 1 });
  };

  const removeRoleFilter = () => {
    onQueryChange({ roleId: undefined, page: 1 });
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

  const getRoleName = (roleId?: number) => {
    if (!roleId) return 'N/A';
    return roles.find(r => r.id === roleId)?.name || 'N/A';
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center gap-2">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Search className="w-5 h-5" />
          </div>
          <Input
            placeholder="Buscar por nombre, email o DPI..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
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
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="
                absolute right-[110px] top-1/2 -translate-y-1/2
                p-1.5 rounded-md
                hover:bg-slate-100 dark:hover:bg-slate-800
                text-slate-400 dark:text-slate-500
                hover:text-slate-600 dark:hover:text-slate-300
                transition-colors duration-200
              "
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <Button
            onClick={handleSearchClick}
            disabled={isLoading || !searchInput}
            className="
              h-10 px-4
              bg-gradient-to-r from-blue-500 to-blue-600
              hover:from-blue-600 hover:to-blue-700
              dark:from-blue-600 dark:to-blue-700
              dark:hover:from-blue-700 dark:hover:to-blue-800
              text-white font-semibold
              transition-all duration-300
              rounded-lg
              shadow-sm hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
              whitespace-nowrap
            "
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Buscar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="space-y-3">
        {/* Filtros principales en grid responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Status Filter */}
          <Select
            value={query.isActive === undefined ? 'all' : query.isActive ? 'active' : 'inactive'}
            onValueChange={handleStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger className="
              w-full
              bg-gradient-to-br from-white to-slate-50/50
              dark:from-slate-900/80 dark:to-slate-900/40
              border border-slate-200/60 dark:border-slate-700/60
              hover:border-slate-300/80 dark:hover:border-slate-600/80
              text-slate-900 dark:text-white
              transition-all duration-300
              rounded-lg
              shadow-sm hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:ring-2 focus:ring-blue-500/20
            ">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="
              bg-white dark:bg-slate-900
              border border-slate-200/50 dark:border-slate-700/50
              shadow-xl rounded-lg
            ">
              <SelectItem value="all" className="hover:bg-blue-50 dark:hover:bg-blue-950/30">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  Todos
                </span>
              </SelectItem>
              <SelectItem value="active" className="hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
              w-full
              bg-gradient-to-br from-white to-slate-50/50
              dark:from-slate-900/80 dark:to-slate-900/40
              border border-slate-200/60 dark:border-slate-700/60
              hover:border-slate-300/80 dark:hover:border-slate-600/80
              text-slate-900 dark:text-white
              transition-all duration-300
              rounded-lg
              shadow-sm hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:ring-2 focus:ring-blue-500/20
            ">
              <SelectValue placeholder="Acceso a plataforma" />
            </SelectTrigger>
            <SelectContent className="
              bg-white dark:bg-slate-900
              border border-slate-200/50 dark:border-slate-700/50
              shadow-xl rounded-lg
            ">
              <SelectItem value="all">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  Todos
                </span>
              </SelectItem>
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

          {/* Role Filter */}
          <Select
            value={query.roleId ? query.roleId.toString() : 'all'}
            onValueChange={handleRoleChange}
            disabled={isLoading}
          >
            <SelectTrigger className="
              w-full
              bg-gradient-to-br from-white to-slate-50/50
              dark:from-slate-900/80 dark:to-slate-900/40
              border border-slate-200/60 dark:border-slate-700/60
              hover:border-slate-300/80 dark:hover:border-slate-600/80
              text-slate-900 dark:text-white
              transition-all duration-300
              rounded-lg
              shadow-sm hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:ring-2 focus:ring-blue-500/20
            ">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent className="
              bg-white dark:bg-slate-900
              border border-slate-200/50 dark:border-slate-700/50
              shadow-xl rounded-lg
            ">
              <SelectItem value="all">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Todos los roles
                </span>
              </SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {role.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select
            value={query.sortBy || 'createdAt'}
            onValueChange={handleSortChange}
            disabled={isLoading}
          >
            <SelectTrigger className="
              w-full
              bg-gradient-to-br from-white to-slate-50/50
              dark:from-slate-900/80 dark:to-slate-900/40
              border border-slate-200/60 dark:border-slate-700/60
              hover:border-slate-300/80 dark:hover:border-slate-600/80
              text-slate-900 dark:text-white
              transition-all duration-300
              rounded-lg
              shadow-sm hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:ring-2 focus:ring-blue-500/20
            ">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="
              bg-white dark:bg-slate-900
              border border-slate-200/50 dark:border-slate-700/50
              shadow-xl rounded-lg
            ">
              <SelectItem value="givenNames">
                <span className="flex items-center gap-2">
                  <AtSign className="w-4 h-4" />
                  Nombre (A-Z)
                </span>
              </SelectItem>
              <SelectItem value="email">
                <span className="flex items-center gap-2">
                  📧 Email
                </span>
              </SelectItem>
              <SelectItem value="createdAt">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Más reciente
                </span>
              </SelectItem>
              <SelectItem value="updatedAt">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Actualizado
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isLoading}
              className="
                bg-gradient-to-r from-red-50 to-red-50/50
                dark:from-red-950/40 dark:to-red-950/20
                text-red-700 dark:text-red-300
                hover:from-red-100 hover:to-red-100/60
                dark:hover:from-red-900/60 dark:hover:to-red-900/30
                border border-red-200/50 dark:border-red-800/50
                hover:border-red-300/80 dark:hover:border-red-700/80
                transition-all duration-300
                font-semibold
                h-10 px-4
                rounded-lg
                group
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Limpiando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Limpiar Filtros
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Active Filters Display - Enhanced */}
      {hasActiveFilters && (
        <div className="
          space-y-3
          p-4
          bg-gradient-to-br from-blue-50/60 via-purple-50/40 to-pink-50/30
          dark:from-blue-950/25 dark:via-purple-950/15 dark:to-pink-950/15
          border-2 border-dashed border-blue-200/60 dark:border-blue-800/40
          rounded-xl
          backdrop-blur-sm
        ">
          {/* Header */}
          <div className="flex items-center gap-3 pb-1">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-full">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Filtros Activos
              </span>
              <Badge variant="secondary" className="ml-2 bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold">
                {[query.search, query.isActive !== undefined, query.canAccessPlatform !== undefined, query.roleId].filter(Boolean).length}
              </Badge>
            </div>
          </div>

          {/* Badges Container */}
          <div className="flex flex-wrap gap-2.5">
            {/* Search Filter Badge */}
            {query.search && (
              <div className="
                group
                flex items-center gap-2
                px-3.5 py-2.5
                bg-gradient-to-r from-slate-100 to-slate-50
                dark:from-slate-700/60 dark:to-slate-800/40
                border-2 border-slate-300/60 dark:border-slate-600/40
                rounded-full
                text-sm font-semibold
                text-slate-700 dark:text-slate-200
                hover:shadow-lg dark:hover:shadow-slate-900/50
                transition-all duration-300
                cursor-default
                hover:border-slate-400 dark:hover:border-slate-500/60
              ">
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="max-w-[150px] truncate">{query.search}</span>
                <button
                  onClick={removeSearchFilter}
                  disabled={isLoading}
                  className="
                    ml-1 p-1
                    hover:bg-slate-300/60 dark:hover:bg-slate-600/60
                    rounded-full
                    text-slate-600 dark:text-slate-300
                    hover:text-slate-800 dark:hover:text-slate-100
                    transition-all duration-200
                    group-hover:scale-110
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  title="Eliminar filtro de búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Status Filter Badge */}
            {query.isActive !== undefined && (
              <div className="
                group
                flex items-center gap-2
                px-3.5 py-2.5
                bg-gradient-to-r from-emerald-100 to-emerald-50
                dark:from-emerald-900/40 dark:to-emerald-800/30
                border-2 border-emerald-300/60 dark:border-emerald-700/40
                rounded-full
                text-sm font-semibold
                text-emerald-700 dark:text-emerald-200
                hover:shadow-lg dark:hover:shadow-emerald-950/50
                transition-all duration-300
                cursor-default
                hover:border-emerald-400 dark:hover:border-emerald-600/60
              ">
                <span className={`
                  w-2.5 h-2.5 rounded-full animate-pulse
                  ${query.isActive ? 'bg-emerald-500' : 'bg-slate-400'}
                `} />
                <span>
                  {query.isActive ? '✓ Activos' : '○ Inactivos'}
                </span>
                <button
                  onClick={removeStatusFilter}
                  disabled={isLoading}
                  className="
                    ml-1 p-1
                    hover:bg-emerald-300/60 dark:hover:bg-emerald-700/60
                    rounded-full
                    text-emerald-600 dark:text-emerald-300
                    hover:text-emerald-800 dark:hover:text-emerald-100
                    transition-all duration-200
                    group-hover:scale-110
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  title="Eliminar filtro de estado"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Access Filter Badge */}
            {query.canAccessPlatform !== undefined && (
              <div className="
                group
                flex items-center gap-2
                px-3.5 py-2.5
                bg-gradient-to-r from-blue-100 to-blue-50
                dark:from-blue-900/40 dark:to-blue-800/30
                border-2 border-blue-300/60 dark:border-blue-700/40
                rounded-full
                text-sm font-semibold
                text-blue-700 dark:text-blue-200
                hover:shadow-lg dark:hover:shadow-blue-950/50
                transition-all duration-300
                cursor-default
                hover:border-blue-400 dark:hover:border-blue-600/60
              ">
                <span className={`
                  w-2.5 h-2.5 rounded-full animate-pulse
                  ${query.canAccessPlatform ? 'bg-blue-500' : 'bg-slate-400'}
                `} />
                <span>
                  {query.canAccessPlatform ? '🔓 Con Acceso' : '🔒 Sin Acceso'}
                </span>
                <button
                  onClick={removeAccessFilter}
                  disabled={isLoading}
                  className="
                    ml-1 p-1
                    hover:bg-blue-300/60 dark:hover:bg-blue-700/60
                    rounded-full
                    text-blue-600 dark:text-blue-300
                    hover:text-blue-800 dark:hover:text-blue-100
                    transition-all duration-200
                    group-hover:scale-110
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  title="Eliminar filtro de acceso"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Role Filter Badge */}
            {query.roleId !== undefined && (
              <div className="
                group
                flex items-center gap-2
                px-3.5 py-2.5
                bg-gradient-to-r from-purple-100 to-purple-50
                dark:from-purple-900/40 dark:to-purple-800/30
                border-2 border-purple-300/60 dark:border-purple-700/40
                rounded-full
                text-sm font-semibold
                text-purple-700 dark:text-purple-200
                hover:shadow-lg dark:hover:shadow-purple-950/50
                transition-all duration-300
                cursor-default
                hover:border-purple-400 dark:hover:border-purple-600/60
              ">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="max-w-[120px] truncate">
                  {getRoleName(query.roleId)}
                </span>
                <button
                  onClick={removeRoleFilter}
                  disabled={isLoading}
                  className="
                    ml-1 p-1
                    hover:bg-purple-300/60 dark:hover:bg-purple-700/60
                    rounded-full
                    text-purple-600 dark:text-purple-300
                    hover:text-purple-800 dark:hover:text-purple-100
                    transition-all duration-200
                    group-hover:scale-110
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  title="Eliminar filtro de rol"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Info text */}
          <div className="flex items-center gap-2 pt-2 text-xs text-slate-600 dark:text-slate-400">
            <Settings2 className="w-3.5 h-3.5" />
            <span>Haz clic en la X para eliminar filtros individuales o usa "Limpiar Filtros" para remover todos</span>
          </div>
        </div>
      )}    </div>
  );
}