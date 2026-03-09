// src/components/features/grade-ranges/GradeRangeCard.tsx

import { GradeRange } from "@/types/grade-ranges.types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Eye, Activity } from "lucide-react";

const LEVEL_COLORS: Record<string, { badge: string; text: string }> = {
  'Primaria': { badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-100', text: 'text-emerald-600' },
  'Secundaria': { badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-100', text: 'text-blue-600' },
  'Preparatoria': { badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-100', text: 'text-purple-600' },
  'all': { badge: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-100', text: 'text-teal-600' },
};

interface GradeRangeCardProps {
  gradeRange: GradeRange;
  canEdit: boolean;
  canDelete: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GradeRangeCard({
  gradeRange,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: GradeRangeCardProps) {
  const levelColor = LEVEL_COLORS[gradeRange.level] || LEVEL_COLORS['all'];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {gradeRange.name}
            </h3>
          </div>
          <div
            className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-600"
            style={{ backgroundColor: gradeRange.hexColor }}
            title={gradeRange.hexColor}
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${levelColor.badge}`}>
            {gradeRange.level}
          </Badge>
          {!gradeRange.isActive && (
            <Badge variant="outline" className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              Inactivo
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rango de Puntuación */}
        <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold">Rango de Puntuación</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            <span className={levelColor.text}>{gradeRange.minScore}</span> - {gradeRange.maxScore}
          </p>
        </div>

        {/* Descripción */}
        {gradeRange.description && (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
              {gradeRange.description}
            </p>
          </div>
        )}

        {/* Letra de Calificación (si existe) */}
        {gradeRange.letterGrade && (
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-600 dark:text-amber-200 font-semibold">Letra de Calificación</p>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-100">{gradeRange.letterGrade}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
          <p>Creado: {new Date(gradeRange.createdAt).toLocaleDateString('es-ES')}</p>
          {gradeRange.updatedAt !== gradeRange.createdAt && (
            <p>Actualizado: {new Date(gradeRange.updatedAt).toLocaleDateString('es-ES')}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver
          </Button>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="flex-1 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
