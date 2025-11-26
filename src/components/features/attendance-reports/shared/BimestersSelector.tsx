'use client';

import { useBimestersByCycle } from '@/hooks/data/attendance-reports';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';

interface BimestersSelectProps {
  cycleId: number | undefined;
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function BimestersSelector({
  cycleId,
  value,
  onChange,
  disabled = false,
}: BimestersSelectProps) {
  const { data: bimesters = [], isLoading, error } = useBimestersByCycle(cycleId, !!cycleId);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <Calendar className="w-4 h-4" />
        Seleccionar Bimestre
      </label>
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : error ? (
        <div className="text-xs text-red-600 dark:text-red-400">Error al cargar bimestres</div>
      ) : (
        <Select value={value?.toString() || ''} onValueChange={(v) => onChange(Number(v))}>
          <SelectTrigger disabled={disabled || !bimesters?.length}>
            <SelectValue placeholder="Elige un bimestre" />
          </SelectTrigger>
          <SelectContent>
            {bimesters?.map((bimester) => (
              <SelectItem key={bimester.id} value={bimester.id.toString()}>
                {bimester.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
