// src/components/features/grade-ranges/GradeRangesGrid.tsx

import { GradeRange } from "@/types/grade-ranges.types";
import { GradeRangeCard } from "./GradeRangeCard";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GradeRangesGridProps {
  data: GradeRange[];
  isLoading: boolean;
  error: string | null;
  canEdit: boolean;
  canDelete: boolean;
  onView: (gradeRange: GradeRange) => void;
  onEdit: (gradeRange: GradeRange) => void;
  onDelete: (gradeRange: GradeRange) => void;
}

export function GradeRangesGrid({
  data,
  isLoading,
  error,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: GradeRangesGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-600 dark:text-red-400">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            No hay rangos de calificaciones configurados
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
            Crea uno nuevo para comenzar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((gradeRange) => (
        <GradeRangeCard
          key={gradeRange.id}
          gradeRange={gradeRange}
          canEdit={canEdit}
          canDelete={canDelete}
          onView={() => onView(gradeRange)}
          onEdit={() => onEdit(gradeRange)}
          onDelete={() => onDelete(gradeRange)}
        />
      ))}
    </div>
  );
}
