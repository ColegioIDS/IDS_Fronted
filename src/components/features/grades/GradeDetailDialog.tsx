// src/components/features/grades/GradeDetailDialog.tsx

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Hash, Layers, X } from 'lucide-react';
import { Grade } from '@/types/grades.types';

interface GradeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: Grade | null;
}

/**
 * 👁️ Dialog de detalle de grado
 */
export function GradeDetailDialog({
  open,
  onOpenChange,
  grade,
}: GradeDetailDialogProps) {
  if (!grade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Detalle del Grado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nombre */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Nombre del Grado
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {grade.name}
              </p>
            </div>
          </div>

          {/* Nivel */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Nivel Educativo
              </p>
              <Badge variant="outline" className="font-medium text-base">
                {grade.level}
              </Badge>
            </div>
          </div>

          {/* Orden */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <Hash className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Orden de Visualización
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {grade.order}
              </p>
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Estado
            </p>
            <Badge
              variant={grade.isActive ? 'default' : 'secondary'}
              className={
                grade.isActive
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }
            >
              {grade.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-300 dark:border-gray-600"
          >
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GradeDetailDialog;
