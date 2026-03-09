// src/components/features/grade-ranges/GradeRangeDetailDialog.tsx

import { GradeRange } from "@/types/grade-ranges.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";

const LEVEL_COLORS: Record<string, { badge: string }> = {
  'Primaria': { badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-100' },
  'Secundaria': { badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-100' },
  'Preparatoria': { badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-100' },
  'all': { badge: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-100' },
};

interface GradeRangeDetailDialogProps {
  open: boolean;
  gradeRange?: GradeRange;
  canEdit: boolean;
  canDelete: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (gradeRange: GradeRange) => void;
  onDelete: (gradeRange: GradeRange) => void;
}

export function GradeRangeDetailDialog({
  open,
  gradeRange,
  canEdit,
  canDelete,
  onOpenChange,
  onEdit,
  onDelete,
}: GradeRangeDetailDialogProps) {
  if (!gradeRange) return null;

  const levelColor = LEVEL_COLORS[gradeRange.level] || LEVEL_COLORS['all'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{gradeRange.name}</DialogTitle>
          <DialogDescription>
            Detalles del rango de calificaciones
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badge y Color */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge className={levelColor.badge}>
                {gradeRange.level}
              </Badge>
              {!gradeRange.isActive && (
                <Badge variant="outline" className="bg-slate-100 dark:bg-slate-700">
                  Inactivo
                </Badge>
              )}
            </div>
            <div
              className="w-12 h-12 rounded-lg border-2 border-slate-200 dark:border-slate-600"
              style={{ backgroundColor: gradeRange.hexColor }}
              title={gradeRange.hexColor}
            />
          </div>

          {/* Rango */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Rango de Puntuación</p>
            <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
              {gradeRange.minScore} - {gradeRange.maxScore}
            </p>
          </div>

          {/* Descripción */}
          {gradeRange.description && (
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-2">Descripción</p>
              <p className="text-slate-700 dark:text-slate-300">{gradeRange.description}</p>
            </div>
          )}

          {/* Letra de Calificación */}
          {gradeRange.letterGrade && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-600 dark:text-amber-200 font-semibold mb-1">Letra de Calificación</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-100">{gradeRange.letterGrade}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-4">
            <p>Creado: {new Date(gradeRange.createdAt).toLocaleString('es-ES')}</p>
            {gradeRange.updatedAt !== gradeRange.createdAt && (
              <p>Actualizado: {new Date(gradeRange.updatedAt).toLocaleString('es-ES')}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            {canEdit && (
              <Button
                onClick={() => {
                  onEdit(gradeRange);
                  onOpenChange(false);
                }}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
            {canDelete && (
              <Button
                onClick={() => {
                  onDelete(gradeRange);
                  onOpenChange(false);
                }}
                variant="outline"
                className="flex-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
