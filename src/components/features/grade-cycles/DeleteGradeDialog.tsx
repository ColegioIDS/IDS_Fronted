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
import { AlertTriangle, Loader2, X } from 'lucide-react';
import type { AvailableGrade } from '@/types/grade-cycles.types';

interface DeleteGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: AvailableGrade | null;
  cycleName: string;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">Eliminar Grado</DialogTitle>
              <DialogDescription className="mt-1">
                Esta acción no se puede deshacer
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              ¿Estás seguro de que deseas eliminar el siguiente grado?
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-400">Grado:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{grade.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-400">Nivel:</span>
                <span className="text-gray-900 dark:text-white">{grade.level}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-400">Ciclo:</span>
                <span className="text-gray-900 dark:text-white">{cycleName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
            <p>
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
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Eliminar Grado
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
