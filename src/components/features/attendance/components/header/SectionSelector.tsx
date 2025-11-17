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
    sections = [],
    isLoading,
  } = useAttendanceConfig();

  const gradeSections = useMemo(() => {
    return sections.filter((section: any) => section.gradeId === gradeId);
  }, [sections, gradeId]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Sección
      </label>
      <Select
        value={selectedSectionId ? String(selectedSectionId) : '0'}
        onValueChange={(value) => onSectionChange(value === '0' ? null : parseInt(value))}
        disabled={disabled || isLoading || gradeSections.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecciona una sección" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Todas las secciones</SelectItem>
          {gradeSections.map((section: any) => (
            <SelectItem key={section.id} value={String(section.id)}>
              {section.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
