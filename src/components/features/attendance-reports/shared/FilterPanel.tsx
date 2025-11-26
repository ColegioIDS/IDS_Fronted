'use client';

import { useGradesByCycle } from '@/hooks/data/attendance-reports';
import { useSectionsByGrade } from '@/hooks/data/attendance-reports';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Layers } from 'lucide-react';

interface GradesSelectorProps {
  cycleId: number | undefined;
  value: number | undefined;
  onChange: (gradeId: number) => void;
  disabled?: boolean;
}

export function GradesSelector({ cycleId, value, onChange, disabled = false }: GradesSelectorProps) {
  const { data: grades, isLoading } = useGradesByCycle(cycleId, !!cycleId);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <BookOpen className="w-4 h-4" />
        Seleccionar Grado
      </label>
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Select value={value?.toString() || ''} onValueChange={(v) => onChange(Number(v))}>
          <SelectTrigger disabled={disabled || !grades?.length}>
            <SelectValue placeholder="Elige un grado" />
          </SelectTrigger>
          <SelectContent>
            {grades?.map((grade) => (
              <SelectItem key={grade.id} value={grade.id.toString()}>
                {grade.name} ({grade.totalSections} secciones)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

interface SectionsSelectorProps {
  gradeId: number | undefined;
  value: number | undefined;
  onChange: (sectionId: number) => void;
  disabled?: boolean;
}

export function SectionsSelector({ gradeId, value, onChange, disabled = false }: SectionsSelectorProps) {
  const { data: sections, isLoading } = useSectionsByGrade(gradeId, !!gradeId);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <Layers className="w-4 h-4" />
        Seleccionar Sección
      </label>
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Select value={value?.toString() || ''} onValueChange={(v) => onChange(Number(v))}>
          <SelectTrigger disabled={disabled || !sections?.length}>
            <SelectValue placeholder="Elige una sección" />
          </SelectTrigger>
          <SelectContent>
            {sections?.map((section) => (
              <SelectItem key={section.id} value={section.id.toString()}>
                {section.name} ({section.totalStudents}/{section.capacity} estudiantes)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
