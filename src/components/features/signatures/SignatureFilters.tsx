// src/components/features/signatures/SignatureFilters.tsx

'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface SignatureFiltersProps {
  filters: {
    search: string;
    type: string;
    status: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function SignatureFilters({
  filters,
  onFiltersChange,
}: SignatureFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({ ...filters, type: value === 'all' ? '' : value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value });
  };

  const handleReset = () => {
    onFiltersChange({
      search: '',
      type: '',
      status: 'all',
    });
  };

  const hasFilters = filters.search || filters.type || filters.status !== 'all';

  return (
    <div className="flex gap-3 items-center flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[250px]">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar firma..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Type Filter */}
      <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo de firma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          <SelectItem value="director">Director</SelectItem>
          <SelectItem value="coordinator">Coordinador</SelectItem>
          <SelectItem value="teacher">Maestro</SelectItem>
          <SelectItem value="admin">Administrativo</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={filters.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Activas</SelectItem>
          <SelectItem value="inactive">Inactivas</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          title="Limpiar filtros"
        >
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
