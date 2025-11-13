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

interface SectionSelectorProps {
  gradeId: number;
  selectedSectionId: number | null;
  onSectionChange: (sectionId: number | null) => void;
  disabled?: boolean;
}

export default function SectionSelector({
  gradeId,
  selectedSectionId,
  onSectionChange,
  disabled = false,
}: SectionSelectorProps) {
  const {
    grades = [],
    isLoading,
  } = useAttendanceConfig();

  const sections = useMemo(() => {
    if (!grades) return [];
    const grade = grades.find((g: any) => g.id === gradeId);
    return grade?.sections || [];
  }, [grades, gradeId]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Sección
      </label>
      <Select
        value={selectedSectionId ? String(selectedSectionId) : ''}
        onValueChange={(value) => onSectionChange(value ? parseInt(value) : null)}
        disabled={disabled || isLoading || sections.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecciona una sección" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas las secciones</SelectItem>
          {sections.map((section: any) => (
            <SelectItem key={section.id} value={String(section.id)}>
              {section.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
