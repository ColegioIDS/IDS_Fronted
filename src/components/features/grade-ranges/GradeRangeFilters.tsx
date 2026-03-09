// src/components/features/grade-ranges/GradeRangeFilters.tsx

import { GradeRangeFilters as GradeRangeFiltersType } from "@/types/grade-ranges.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";

interface GradeRangeFiltersProps {
  filters: GradeRangeFiltersType;
  onFiltersChange: (filters: GradeRangeFiltersType) => void;
  onFiltersReset: () => void;
}

export function GradeRangeFilters({
  filters,
  onFiltersChange,
  onFiltersReset,
}: GradeRangeFiltersProps) {
  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== 'all').length;

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Filtros</h3>
          {activeFiltersCount > 0 && (
            <span className="ml-auto text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-200 px-2 py-1 rounded-full">
              {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Search className="w-4 h-4 text-teal-600" />
              Búsqueda
            </label>
            <Input
              placeholder="Buscar por nombre...)"
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
              className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Level Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nivel Educativo</label>
            <Select value={filters.level || 'all'} onValueChange={(v) => onFiltersChange({ ...filters, level: v as any })}>
              <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="Primaria">Primaria</SelectItem>
                <SelectItem value="Secundaria">Secundaria</SelectItem>
                <SelectItem value="Preparatoria">Preparatoria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
            <Select 
              value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
              onValueChange={(v) => {
                if (v === 'all') {
                  onFiltersChange({ ...filters, isActive: undefined });
                } else {
                  onFiltersChange({ ...filters, isActive: v === 'active' });
                }
              }}
            >
              <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reset Button */}
        {activeFiltersCount > 0 && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onFiltersReset}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <X className="w-4 h-4 mr-2" />
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
