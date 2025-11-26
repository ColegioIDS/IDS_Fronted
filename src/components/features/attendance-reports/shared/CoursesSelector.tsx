'use client';

import { useCoursesBySection } from '@/hooks/data/attendance-reports';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';

interface CoursesSelectProps {
  sectionId: number | undefined;
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function CoursesSelector({
  sectionId,
  value,
  onChange,
  disabled = false,
}: CoursesSelectProps) {
  const { data: courses = [], isLoading, error } = useCoursesBySection(sectionId, !!sectionId);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <BookOpen className="w-4 h-4" />
        Seleccionar Curso
      </label>
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : error ? (
        <div className="text-xs text-red-600 dark:text-red-400">Error al cargar cursos</div>
      ) : (
        <Select value={value?.toString() || ''} onValueChange={(v) => onChange(Number(v))}>
          <SelectTrigger disabled={disabled || !courses?.length}>
            <SelectValue placeholder="Elige un curso" />
          </SelectTrigger>
          <SelectContent>
            {courses?.map((course) => (
              <SelectItem key={course.id} value={course.id.toString()}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: course.color }}
                  />
                  <span>{course.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
