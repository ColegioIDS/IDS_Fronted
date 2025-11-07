'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter, AlertCircle, Calendar } from 'lucide-react';
import { EnrollmentsQuery } from '@/types/enrollments.types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface EnrollmentFiltersProps {
  onFiltersChange: (filters: EnrollmentsQuery) => void;
  onCycleChange?: (cycleId: number | null) => void;
  onGradeChange?: (gradeId: number | null) => void;
  loading?: boolean;
  cycles?: Array<{ id: number; name: string }>;
  grades?: Array<{ id: number; name: string }>;
  sections?: Array<{ id: number; name: string }>;
}

export const EnrollmentFilters = ({ 
  onFiltersChange, 
  onCycleChange,
  onGradeChange,
  loading = false,
  cycles = [
    { id: 1, name: 'Ciclo escolar 2025' },
  ],
  grades = [
    { id: 1, name: 'Preescolar' },
    { id: 2, name: 'Primer Grado' },
    { id: 3, name: 'Segundo Grado' },
  ],
  sections = [
    { id: 1, name: 'A' },
    { id: 2, name: 'B' },
    { id: 3, name: 'C' },
  ],
}: EnrollmentFiltersProps) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [cycleId, setCycleId] = useState<string>('');
  const [gradeId, setGradeId] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);

  const activeFilters = [search, status, gradeId, sectionId].filter(Boolean).length;
  const hasCycleSelected = !!cycleId;

  // Notificar cambio de ciclo
  useEffect(() => {
    if (onCycleChange) {
      onCycleChange(cycleId ? parseInt(cycleId) : null);
    }
  }, [cycleId, onCycleChange]);

  const handleApplyFilters = () => {
    if (!cycleId) {
      return;
    }

    const filters: EnrollmentsQuery = {
      cycleId: parseInt(cycleId),
    };

    if (search) filters.search = search;
    if (status && status !== 'ALL') filters.status = status;
    if (gradeId && gradeId !== 'ALL') filters.gradeId = parseInt(gradeId);
    if (sectionId && sectionId !== 'ALL') filters.sectionId = parseInt(sectionId);

    onFiltersChange(filters);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setGradeId('');
    setSectionId('');
    // Mantener cicleId seleccionado, pero limpiar otros
    if (cycleId) {
      onFiltersChange({ cycleId: parseInt(cycleId) });
    }
  };

  return (
    <div className="space-y-3">
      {/* Alerta: Ciclo obligatorio */}
      {!hasCycleSelected && (
        <Alert className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Selecciona un ciclo escolar para ver las matrículas
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Filtros</h3>
          {activeFilters > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
              {activeFilters} activos
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="text-xs"
        >
          {isExpanded ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>

      {/* Filtros expandibles */}
      {isExpanded && (
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Ciclo - OBLIGATORIO */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Ciclo Escolar <span className="text-red-500">*</span>
            </label>
            <Select value={cycleId} onValueChange={setCycleId} disabled={loading}>
              <SelectTrigger className={cn(
                'text-sm focus-visible:ring-1',
                !cycleId && 'border-red-300 dark:border-red-700 focus-visible:ring-red-500'
              )}>
                <SelectValue placeholder="Seleccionar ciclo..." />
              </SelectTrigger>
              <SelectContent>
                {cycles.map((cycle) => (
                  <SelectItem key={cycle.id} value={cycle.id.toString()}>
                    {cycle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtros opcionales (solo si hay ciclo) */}
          {hasCycleSelected && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Búsqueda */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Nombre estudiante..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Estado
                </label>
                <Select value={status} onValueChange={setStatus} disabled={loading}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                    <SelectItem value="GRADUATED">Graduado</SelectItem>
                    <SelectItem value="TRANSFERRED">Transferido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Grado */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Grado
                </label>
                <Select 
                  value={gradeId} 
                  onValueChange={(value) => {
                    setGradeId(value);
                    if (onGradeChange) {
                      onGradeChange(value === 'ALL' ? null : parseInt(value));
                    }
                  }} 
                  disabled={loading}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    {grades.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id.toString()}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sección */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Sección
                </label>
                <Select value={sectionId} onValueChange={setSectionId} disabled={loading}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas</SelectItem>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id.toString()}>
                        Sección {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Botones */}
          {hasCycleSelected && (
            <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <Button
                onClick={handleApplyFilters}
                disabled={loading}
                className="flex-1 text-sm gap-2"
                size="sm"
              >
                <Filter className="h-3.5 w-3.5" />
                Aplicar Filtros
              </Button>
              {activeFilters > 0 && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  disabled={loading}
                  className="flex-1 text-sm"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
