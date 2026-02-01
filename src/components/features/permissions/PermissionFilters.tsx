'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Search, X, Filter, RotateCcw, Layers, ToggleLeft, Shield, ArrowUpDown } from 'lucide-react';
import { PermissionsQuery } from '@/types/permissions.types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface PermissionFiltersProps {
  modules: string[];
  query: PermissionsQuery;
  onQueryChange: (query: Partial<PermissionsQuery>) => void;
  onReset: () => void;
  totalResults?: number;
}

export function PermissionFilters({
  modules,
  query,
  onQueryChange,
  onReset,
  totalResults = 0,
}: PermissionFiltersProps) {
  const [searchInput, setSearchInput] = useState(query.search || '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== query.search) {
        onQueryChange({ search: searchInput || undefined, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, query.search, onQueryChange]);

  const hasActiveFilters = 
    query.search || 
    query.module || 
    query.isActive !== undefined || 
    query.isSystem !== undefined;

  const activeFiltersCount = [
    query.search,
    query.module,
    query.isActive !== undefined,
    query.isSystem !== undefined,
  ].filter(Boolean).length;

  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4 space-y-0 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800/50 dark:to-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <Filter className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Filtros y búsqueda
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Refina el listado por módulo, estado o tipo
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-0">
                {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {totalResults}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              resultado{totalResults !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Búsqueda */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            Búsqueda
          </Label>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              type="text"
              placeholder="Módulo, acción o descripción..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-10 h-11 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-shadow"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtros rápidos
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Módulo
              </span>
              <Select
                value={query.module || 'all'}
                onValueChange={(value) =>
                  onQueryChange({ module: value === 'all' ? undefined : value, page: 1 })
                }
              >
                <SelectTrigger className="h-11 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <SelectValue placeholder="Todos los módulos" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="all">Todos los módulos</SelectItem>
                  {modules.map((mod) => (
                    <SelectItem key={mod} value={mod} className="capitalize">
                      {mod}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <ToggleLeft className="w-3.5 h-3.5" />
                Estado
              </span>
              <Select
                value={
                  query.isActive === undefined
                    ? 'all'
                    : query.isActive
                      ? 'active'
                      : 'inactive'
                }
                onValueChange={(value) =>
                  onQueryChange({
                    isActive: value === 'all' ? undefined : value === 'active',
                    page: 1,
                  })
                }
              >
                <SelectTrigger className="h-11 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Tipo
              </span>
              <Select
                value={
                  query.isSystem === undefined
                    ? 'all'
                    : query.isSystem
                      ? 'system'
                      : 'custom'
                }
                onValueChange={(value) =>
                  onQueryChange({
                    isSystem: value === 'all' ? undefined : value === 'system',
                    page: 1,
                  })
                }
              >
                <SelectTrigger className="h-11 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="custom">Personalizados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Ordenar
              </span>
              <Select
                value={`${query.sortBy || 'module'}-${query.sortOrder || 'asc'}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-');
                  onQueryChange({ 
                    sortBy: sortBy as 'module' | 'action' | 'createdAt', 
                    sortOrder: sortOrder as 'asc' | 'desc' 
                  });
                }}
              >
                <SelectTrigger className="h-11 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="module-asc">Módulo (A-Z)</SelectItem>
                  <SelectItem value="module-desc">Módulo (Z-A)</SelectItem>
                  <SelectItem value="action-asc">Acción (A-Z)</SelectItem>
                  <SelectItem value="action-desc">Acción (Z-A)</SelectItem>
                  <SelectItem value="createdAt-desc">Más recientes</SelectItem>
                  <SelectItem value="createdAt-asc">Más antiguos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Acciones y pills */}
        {hasActiveFilters && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Filtros aplicados
              </span>
              <Button
                onClick={onReset}
                variant="outline"
                size="sm"
                className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpiar todo
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {query.search && (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-0 py-1.5 px-2.5 gap-1.5">
                  Búsqueda: {query.search}
                  <button
                    type="button"
                    onClick={() => onQueryChange({ search: undefined, page: 1 })}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    aria-label="Quitar búsqueda"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {query.module && (
                <Badge className="bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200 border-0 py-1.5 px-2.5 gap-1.5 capitalize">
                  Módulo: {query.module}
                  <button
                    type="button"
                    onClick={() => onQueryChange({ module: undefined, page: 1 })}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors"
                    aria-label="Quitar módulo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {query.isActive !== undefined && (
                <Badge
                  className={
                    query.isActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border-0 py-1.5 px-2.5'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-0 py-1.5 px-2.5'
                  }
                >
                  {query.isActive ? 'Activos' : 'Inactivos'}
                  <button
                    type="button"
                    onClick={() => onQueryChange({ isActive: undefined, page: 1 })}
                    className="ml-1 rounded-full p-0.5 hover:opacity-80 transition-opacity"
                    aria-label="Quitar estado"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {query.isSystem !== undefined && (
                <Badge
                  className={
                    query.isSystem
                      ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200 border-0 py-1.5 px-2.5'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-0 py-1.5 px-2.5'
                  }
                >
                  {query.isSystem ? 'Sistema' : 'Personalizados'}
                  <button
                    type="button"
                    onClick={() => onQueryChange({ isSystem: undefined, page: 1 })}
                    className="ml-1 rounded-full p-0.5 hover:opacity-80 transition-opacity"
                    aria-label="Quitar tipo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}