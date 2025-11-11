// src/components/features/attendance-statuses/AttendanceStatusFilters.tsx
'use client';

import { AttendanceStatusQuery } from '@/types/attendance-status.types';
import { useTheme } from 'next-themes';
import { Search, X } from 'lucide-react';

interface AttendanceStatusFiltersProps {
  onFilterChange: (filters: AttendanceStatusQuery) => void;
  filters: AttendanceStatusQuery;
}

export const AttendanceStatusFilters = ({
  onFilterChange,
  filters,
}: AttendanceStatusFiltersProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const inputBg = isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-300';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const labelColor = isDark ? 'text-slate-300' : 'text-slate-700';

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value || undefined, page: 1 });
  };

  const handleActiveChange = (value: string) => {
    const isActive = value === '' ? undefined : value === 'true';
    onFilterChange({ ...filters, isActive, page: 1 });
  };

  const handleNegativeChange = (value: string) => {
    const isNegative = value === '' ? undefined : value === 'true';
    onFilterChange({ ...filters, isNegative, page: 1 });
  };

  const handleJustificationChange = (value: string) => {
    const requiresJustification = value === '' ? undefined : value === 'true';
    onFilterChange({ ...filters, requiresJustification, page: 1 });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split(':') as [
      'code' | 'name' | 'order' | 'createdAt' | 'updatedAt',
      'asc' | 'desc'
    ];
    onFilterChange({ ...filters, sortBy, sortOrder, page: 1 });
  };

  const handleReset = () => {
    onFilterChange({ page: 1, limit: 10 });
  };

  return (
    <div className={`border ${bgColor} rounded-lg p-4 space-y-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-semibold ${textColor}`}>Filtros</h3>
        {(filters.search ||
          filters.isActive !== undefined ||
          filters.isNegative !== undefined ||
          filters.requiresJustification !== undefined) && (
          <button
            onClick={handleReset}
            className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors ${
              isDark
                ? 'text-blue-400 hover:bg-slate-700'
                : 'text-blue-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Búsqueda */}
        <div className="relative">
          <label className={`block text-xs font-medium ${labelColor} mb-1`}>Búsqueda</label>
          <div className="relative">
            <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Código, nombre..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded border ${inputBg} ${textColor} placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm`}
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className={`block text-xs font-medium ${labelColor} mb-1`}>Estado</label>
          <select
            value={filters.isActive === undefined ? '' : filters.isActive ? 'true' : 'false'}
            onChange={(e) => handleActiveChange(e.target.value)}
            className={`w-full px-3 py-2 rounded border ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm`}
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        {/* Ausencia */}
        <div>
          <label className={`block text-xs font-medium ${labelColor} mb-1`}>Tipo</label>
          <select
            value={filters.isNegative === undefined ? '' : filters.isNegative ? 'true' : 'false'}
            onChange={(e) => handleNegativeChange(e.target.value)}
            className={`w-full px-3 py-2 rounded border ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm`}
          >
            <option value="">Todos</option>
            <option value="true">Ausencias</option>
            <option value="false">Presencias</option>
          </select>
        </div>

        {/* Justificación */}
        <div>
          <label className={`block text-xs font-medium ${labelColor} mb-1`}>Justificación</label>
          <select
            value={filters.requiresJustification === undefined ? '' : filters.requiresJustification ? 'true' : 'false'}
            onChange={(e) => handleJustificationChange(e.target.value)}
            className={`w-full px-3 py-2 rounded border ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm`}
          >
            <option value="">Todos</option>
            <option value="true">Requieren Justificación</option>
            <option value="false">Sin Justificación</option>
          </select>
        </div>

        {/* Ordenar */}
        <div>
          <label className={`block text-xs font-medium ${labelColor} mb-1`}>Ordenar</label>
          <select
            value={`${filters.sortBy || 'order'}:${filters.sortOrder || 'asc'}`}
            onChange={(e) => handleSortChange(e.target.value)}
            className={`w-full px-3 py-2 rounded border ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm`}
          >
            <option value="order:asc">Orden Ascendente</option>
            <option value="order:desc">Orden Descendente</option>
            <option value="code:asc">Código A-Z</option>
            <option value="code:desc">Código Z-A</option>
            <option value="name:asc">Nombre A-Z</option>
            <option value="name:desc">Nombre Z-A</option>
            <option value="createdAt:desc">Más Recientes</option>
            <option value="createdAt:asc">Más Antiguos</option>
          </select>
        </div>
      </div>
    </div>
  );
};
