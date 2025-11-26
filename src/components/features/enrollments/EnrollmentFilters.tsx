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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Search, X, Filter, AlertCircle, Calendar, GraduationCap, Users, CheckCircle } from 'lucide-react';
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
    <TooltipProvider>
      <div className="space-y-4">
        {/* Alerta: Ciclo obligatorio */}
        {!hasCycleSelected && (
          <Alert className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 shadow-sm">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-900 dark:text-amber-100 font-medium">
              Selecciona un ciclo escolar para ver las matrículas
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
              <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Filtros</h3>
            {activeFilters > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="px-3 py-1.5 text-sm font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full border-2 border-blue-200 dark:border-blue-800 cursor-help">
                    {activeFilters} activo{activeFilters !== 1 && 's'}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{activeFilters} filtro{activeFilters !== 1 && 's'} aplicado{activeFilters !== 1 && 's'}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                className="text-sm font-medium"
              >
                {isExpanded ? 'Ocultar' : 'Mostrar'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">{isExpanded ? 'Ocultar' : 'Mostrar'} filtros</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Filtros expandibles */}
        {isExpanded && (
          <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-slate-200 dark:border-slate-800 shadow-md">
            {/* Ciclo - OBLIGATORIO */}
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <div className="p-1 rounded bg-blue-100 dark:bg-blue-950/30">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Ciclo Escolar <span className="text-red-500 ml-1">*</span>
              </label>
              <Select value={cycleId} onValueChange={setCycleId} disabled={loading}>
                <SelectTrigger className={cn(
                  'text-sm focus-visible:ring-2 border-2 h-11',
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
              <div className="flex gap-3 pt-4 border-t-2 border-slate-200 dark:border-slate-700">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleApplyFilters}
                      disabled={loading}
                      className="flex-1 text-sm gap-2 h-11 shadow-md hover:shadow-lg font-semibold"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aplicar Filtros
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                    <p className="font-semibold">Aplicar los filtros seleccionados</p>
                  </TooltipContent>
                </Tooltip>
                {activeFilters > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleClearFilters}
                        variant="outline"
                        disabled={loading}
                        className="flex-1 text-sm gap-2 h-11 border-2 shadow-sm hover:shadow-md font-semibold"
                      >
                        <X className="h-4 w-4" />
                        Limpiar
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                      <p className="font-semibold">Limpiar todos los filtros</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
