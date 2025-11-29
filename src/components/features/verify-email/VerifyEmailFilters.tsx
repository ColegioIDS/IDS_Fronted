// src/components/features/verify-email/VerifyEmailFilters.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { VerifyEmailQuery } from '@/types/verify-email.types';

interface VerifyEmailFiltersProps {
  query: VerifyEmailQuery;
  onQueryChange: (query: Partial<VerifyEmailQuery>) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

/**
 * Componentes de filtros para usuarios sin verificar
 */
export function VerifyEmailFilters({
  query,
  onQueryChange,
  hasActiveFilters,
  onClearFilters,
}: VerifyEmailFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Fila 1: Búsqueda */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por email..."
                value={query.search || ''}
                onChange={(e) => {
                  onQueryChange({ search: e.target.value, page: 1 });
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Fila 2: Estado y Ordenamiento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Select
              value={query.isVerified?.toString() ?? 'all'}
              onValueChange={(value) => {
                onQueryChange({
                  isVerified: value === 'all' ? undefined : value === 'true',
                  page: 1,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="false">Pendientes</SelectItem>
                <SelectItem value="true">Verificados</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={query.sortBy || 'createdAt'}
              onValueChange={(value) => {
                onQueryChange({ sortBy: value as any, page: 1 });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Fecha Creación</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="verifiedAt">Fecha Verificación</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={query.sortOrder || 'desc'}
              onValueChange={(value) => {
                onQueryChange({ sortOrder: value as any, page: 1 });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Orden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascendente</SelectItem>
                <SelectItem value="desc">Descendente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón Limpiar Filtros */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="w-full gap-2"
            >
              <X className="h-4 w-4" />
              Limpiar Filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
