// src/components/features/school-cycles/SchoolCycleGrid.tsx

'use client';

import { SchoolCycle } from '@/types/school-cycle.types';
import { SchoolCycleCard } from './SchoolCycleCard';
import { EmptyDataState, EmptySearchResults } from '@/components/shared/feedback/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

interface SchoolCycleGridProps {
  cycles: SchoolCycle[];
  isLoading?: boolean;
  hasSearchFilter?: boolean;
  onEdit?: (cycle: SchoolCycle) => void;
  onDelete?: (cycle: SchoolCycle) => void;
  onActivate?: (cycle: SchoolCycle) => void;
  onClose?: (cycle: SchoolCycle) => void;
  onViewDetails?: (cycle: SchoolCycle) => void;
  onCreate?: () => void;
  onClearFilters?: () => void;
}

export function SchoolCycleGrid({
  cycles,
  isLoading = false,
  hasSearchFilter = false,
  onEdit,
  onDelete,
  onActivate,
  onClose,
  onViewDetails,
  onCreate,
  onClearFilters,
}: SchoolCycleGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (cycles.length === 0) {
    if (hasSearchFilter) {
      return (
        <EmptySearchResults
          onClearFilters={onClearFilters}
        />
      );
    }

    return (
      <EmptyDataState
        title="No hay ciclos escolares"
        description="Comienza creando tu primer ciclo escolar"
        onCreate={onCreate}
        createLabel="Crear Ciclo Escolar"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cycles.map((cycle) => (
        <SchoolCycleCard
          key={cycle.id}
          cycle={cycle}
          onEdit={onEdit}
          onDelete={onDelete}
          onActivate={onActivate}
          onClose={onClose}
          onViewDetails={onViewDetails}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}