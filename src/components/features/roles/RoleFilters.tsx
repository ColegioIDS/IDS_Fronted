// src/components/features/roles/RoleFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  X, 
  Filter, 
  RotateCcw,
  ArrowDownAZ,
  ArrowUpAZ,
  Calendar,
  CheckCircle2,
  XCircle,
  Shield,
  Users
} from 'lucide-react';
import { RolesQuery } from '@/types/roles.types';

interface RoleFiltersProps {
  query: RolesQuery;
  onQueryChange: (query: Partial<RolesQuery>) => void;
  onReset: () => void;
  totalResults?: number;
}

export function RoleFilters({
  query,
  onQueryChange,
  onReset,
  totalResults = 0,
}: RoleFiltersProps) {
  const [searchInput, setSearchInput] = useState(query.search || '');

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
    query.isActive !== undefined || 
    query.isSystem !== undefined;

  const activeFiltersCount = [
    query.search,
    query.isActive !== undefined,
    query.isSystem !== undefined,
  ].filter(Boolean).length;

  return (
    <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
      <CardContent className="p-6 space-y-6">
        {/* Header con contador de resultados */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Filtros de búsqueda
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <Badge className="bg-purple-600 text-white">
                {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {hasActiveFilters && (
            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <RotateCcw className="w-4 h-4" />
              Limpiar todo
            </Button>
          )}
        </div>

        {/* Barra de búsqueda destacada */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar por nombre o descripción del rol..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-12 pr-12 h-12 text-base bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros en grid mejorado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Estado del rol */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-500" />
              Estado
            </label>
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
              <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900">
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    Todos los estados
                  </span>
                </SelectItem>
                <SelectItem value="active">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Activos
                  </span>
                </SelectItem>
                <SelectItem value="inactive">
                  <span className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-gray-600" />
                    Inactivos
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de rol */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              Tipo de rol
            </label>
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
              <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900">
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    Todos los tipos
                  </span>
                </SelectItem>
                <SelectItem value="system">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Roles del sistema
                  </span>
                </SelectItem>
                <SelectItem value="custom">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    Roles personalizados
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ordenamiento */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ArrowDownAZ className="w-4 h-4 text-gray-500" />
              Ordenar por
            </label>
            <Select
              value={`${query.sortBy || 'name'}-${query.sortOrder || 'asc'}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-') as [any, 'asc' | 'desc'];
                onQueryChange({ sortBy, sortOrder });
              }}
            >
              <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                <SelectValue placeholder="Seleccionar orden" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900">
                <SelectItem value="name-asc">
                  <span className="flex items-center gap-2">
                    <ArrowDownAZ className="w-4 h-4" />
                    Nombre (A-Z)
                  </span>
                </SelectItem>
                <SelectItem value="name-desc">
                  <span className="flex items-center gap-2">
                    <ArrowUpAZ className="w-4 h-4" />
                    Nombre (Z-A)
                  </span>
                </SelectItem>
                <SelectItem value="createdAt-desc">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Más recientes primero
                  </span>
                </SelectItem>
                <SelectItem value="createdAt-asc">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Más antiguos primero
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pills de filtros activos */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filtros aplicados:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {query.search && (
                <Badge 
                  variant="secondary" 
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors group"
                >
                  <Search className="w-3 h-3 mr-1.5" />
                  <span className="font-medium">"{query.search}"</span>
                  <button
                    onClick={() => {
                      setSearchInput('');
                      onQueryChange({ search: undefined, page: 1 });
                    }}
                    className="ml-2 hover:bg-purple-300 dark:hover:bg-purple-800 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {query.isActive !== undefined && (
                <Badge 
                  variant="secondary" 
                  className={`px-3 py-1.5 transition-colors group ${
                    query.isActive 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {query.isActive ? (
                    <CheckCircle2 className="w-3 h-3 mr-1.5" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1.5" />
                  )}
                  <span className="font-medium">{query.isActive ? 'Activos' : 'Inactivos'}</span>
                  <button
                    onClick={() => onQueryChange({ isActive: undefined, page: 1 })}
                    className={`ml-2 rounded-full p-0.5 transition-colors ${
                      query.isActive 
                        ? 'hover:bg-green-300 dark:hover:bg-green-800'
                        : 'hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {query.isSystem !== undefined && (
                <Badge 
                  variant="secondary" 
                  className={`px-3 py-1.5 transition-colors group ${
                    query.isSystem 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                  }`}
                >
                  {query.isSystem ? (
                    <Shield className="w-3 h-3 mr-1.5" />
                  ) : (
                    <Users className="w-3 h-3 mr-1.5" />
                  )}
                  <span className="font-medium">{query.isSystem ? 'Sistema' : 'Personalizados'}</span>
                  <button
                    onClick={() => onQueryChange({ isSystem: undefined, page: 1 })}
                    className={`ml-2 rounded-full p-0.5 transition-colors ${
                      query.isSystem 
                        ? 'hover:bg-blue-300 dark:hover:bg-blue-800'
                        : 'hover:bg-orange-300 dark:hover:bg-orange-800'
                    }`}
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