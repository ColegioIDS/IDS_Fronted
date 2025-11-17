'use client';

import React, { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Section } from '@/types/attendance.types';

interface SectionSelectorProps {
  gradeId: number;
  selectedSectionId: number | null;
  onSectionChange: (sectionId: number | null) => void;
  disabled?: boolean;
  sections?: Section[];
}

export default function SectionSelector({
  gradeId,
  selectedSectionId,
  onSectionChange,
  disabled = false,
  sections = [],
}: SectionSelectorProps) {
  const gradeSections = useMemo(() => {
    console.log('[SectionSelector] Total sections received:', sections);
    console.log('[SectionSelector] Current gradeId:', gradeId);
    const filtered = sections.filter((section: any) => section.gradeId === gradeId);
    console.log('[SectionSelector] Filtered sections for gradeId:', filtered);
    return filtered;
  }, [sections, gradeId]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Sección
      </label>
      <Select
        value={selectedSectionId ? String(selectedSectionId) : '0'}
        onValueChange={(value) => onSectionChange(value === '0' ? null : parseInt(value))}
        disabled={disabled || gradeSections.length === 0}
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
