'use client';

import React, { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAttendanceConfig } from '@/hooks/attendance-hooks';

interface GradeSelectorProps {
  selectedGradeId: number | null;
  onGradeChange: (gradeId: number | null) => void;
  disabled?: boolean;
}

export default function GradeSelector({
  selectedGradeId,
  onGradeChange,
  disabled = false,
}: GradeSelectorProps) {
  const {
    grades = [],
    isLoading,
  } = useAttendanceConfig();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Grado
      </label>
      <Select
        value={selectedGradeId ? String(selectedGradeId) : ''}
        onValueChange={(value) => onGradeChange(value ? parseInt(value) : null)}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un grado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos los grados</SelectItem>
          {grades.map((grade: any) => (
            <SelectItem key={grade.id} value={String(grade.id)}>
              {grade.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
