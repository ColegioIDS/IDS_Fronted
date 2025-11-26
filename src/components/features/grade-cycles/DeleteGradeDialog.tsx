// src/components/features/grade-cycles/DeleteGradeDialog.tsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, X, Info } from 'lucide-react';
import type { AvailableGrade } from '@/types/grade-cycles.types';

interface DeleteGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: AvailableGrade | null;
  cycleName: string;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

/**
 * 🗑️ Dialog de confirmación para eliminar grado - Diseño moderno
 */
export function DeleteGradeDialog({
  open,
  onOpenChange,
  grade,
  cycleName,
  onConfirm,
  isDeleting,
}: DeleteGradeDialogProps) {
  if (!grade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-2 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 flex-shrink-0">
              <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Eliminar Grado
              </DialogTitle>
              <DialogDescription className="mt-2 text-gray-600 dark:text-gray-400">
                Esta acción no se puede deshacer
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-5">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 font-medium">
              ¿Estás seguro de que deseas eliminar el siguiente grado del ciclo?
            </p>

            <div className="space-y-3 bg-white dark:bg-gray-950 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Grado:
                </span>
                <span className="text-base font-bold text-gray-900 dark:text-white">
                  {grade.name}
                </span>
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-800" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Nivel:
                </span>
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {grade.level}
                </span>
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-800" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Ciclo:
                </span>
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {cycleName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border-2 border-amber-200 dark:border-amber-800">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-500" strokeWidth={2.5} />
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Los estudiantes y cursos existentes NO serán eliminados, pero este grado dejará
              de estar disponible para nuevas inscripciones en este ciclo.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="gap-2 border-2 h-11 px-5 font-semibold"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700 h-11 px-5 font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 border-2 border-red-700 dark:border-red-500 transition-all"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                Eliminando...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" strokeWidth={2.5} />
                Eliminar Grado
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
