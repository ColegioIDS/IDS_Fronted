// src/components/features/permissions/PermissionFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { PermissionsQuery } from '@/types/permissions.types';
import { Card } from '@/components/ui/card';

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
  const [showAdvanced, setShowAdvanced] = useState(false);


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
    <Card className="p-4 space-y-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      {/* Header con resultados */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Filtros
          </h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">{totalResults}</span>
          <span>resultado{totalResults !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Búsqueda principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por módulo, acción o descripción..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 pr-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtros rápidos en una fila */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Módulo */}
        <Select
          value={query.module || 'all'}
          onValueChange={(value) => 
            onQueryChange({ module: value === 'all' ? undefined : value, page: 1 })
          }
        >
          <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            <SelectValue placeholder="Todos los módulos" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-900">
            <SelectItem value="all">Todos los módulos</SelectItem>
            {modules.map((module) => (
              <SelectItem key={module} value={module} className="capitalize">
                {module}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Estado */}
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
          <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-900">
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        {/* Tipo */}
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
          <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-900">
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="system">Sistema</SelectItem>
            <SelectItem value="custom">Personalizados</SelectItem>
          </SelectContent>
        </Select>

        {/* Ordenar */}
        <Select
          value={`${query.sortBy || 'module'}-${query.sortOrder || 'asc'}`}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split('-') as [any, 'asc' | 'desc'];
            onQueryChange({ sortBy, sortOrder });
          }}
        >
          <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-900">
            <SelectItem value="module-asc">Módulo (A-Z)</SelectItem>
            <SelectItem value="module-desc">Módulo (Z-A)</SelectItem>
            <SelectItem value="action-asc">Acción (A-Z)</SelectItem>
            <SelectItem value="action-desc">Acción (Z-A)</SelectItem>
            <SelectItem value="createdAt-desc">Más recientes</SelectItem>
            <SelectItem value="createdAt-asc">Más antiguos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Botón de reset */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* Filtros activos (pills) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {query.search && (
            <Badge 
              variant="secondary" 
              className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 pr-1"
            >
              Búsqueda: {query.search}
              <button
                onClick={() => onQueryChange({ search: undefined, page: 1 })}
                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {query.module && (
            <Badge 
              variant="secondary" 
              className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 pr-1 capitalize"
            >
              Módulo: {query.module}
              <button
                onClick={() => onQueryChange({ module: undefined, page: 1 })}
                className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {query.isActive !== undefined && (
            <Badge 
              variant="secondary" 
              className={`pr-1 ${
                query.isActive 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
              }`}
            >
              {query.isActive ? 'Activos' : 'Inactivos'}
              <button
                onClick={() => onQueryChange({ isActive: undefined, page: 1 })}
                className={`ml-1 rounded-full p-0.5 ${
                  query.isActive 
                    ? 'hover:bg-green-200 dark:hover:bg-green-800'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {query.isSystem !== undefined && (
            <Badge 
              variant="secondary" 
              className={`pr-1 ${
                query.isSystem 
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
              }`}
            >
              {query.isSystem ? 'Sistema' : 'Personalizados'}
              <button
                onClick={() => onQueryChange({ isSystem: undefined, page: 1 })}
                className={`ml-1 rounded-full p-0.5 ${
                  query.isSystem 
                    ? 'hover:bg-purple-200 dark:hover:bg-purple-800'
                    : 'hover:bg-orange-200 dark:hover:bg-orange-800'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
}