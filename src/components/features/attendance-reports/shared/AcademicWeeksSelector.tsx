'use client';

import { useAcademicWeeksByBimester } from '@/hooks/data/attendance-reports';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';

interface AcademicWeeksSelectProps {
  bimesterId: number | undefined;
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function AcademicWeeksSelector({
  bimesterId,
  value,
  onChange,
  disabled = false,
}: AcademicWeeksSelectProps) {
  const { data: weeks = [], isLoading, error } = useAcademicWeeksByBimester(bimesterId, !!bimesterId);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <BookOpen className="w-4 h-4" />
        Seleccionar Semana
      </label>
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : error ? (
        <div className="text-xs text-red-600 dark:text-red-400">Error al cargar semanas</div>
      ) : (
        <Select value={value?.toString() || ''} onValueChange={(v) => onChange(Number(v))}>
          <SelectTrigger disabled={disabled || !weeks?.length}>
            <SelectValue placeholder="Elige una semana" />
          </SelectTrigger>
          <SelectContent>
            {weeks?.map((week) => (
              <SelectItem key={week.id} value={week.id.toString()}>
                Semana {week.number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
