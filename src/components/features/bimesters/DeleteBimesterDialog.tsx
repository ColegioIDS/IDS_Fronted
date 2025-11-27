// src/components/features/bimesters/DeleteBimesterDialog.tsx

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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { Bimester } from '@/types/bimester.types';

interface DeleteBimesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bimester: Bimester | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Dialog de confirmación para eliminar bimestre
 */
export function DeleteBimesterDialog({
  open,
  onOpenChange,
  bimester,
  onConfirm,
  isLoading,
}: DeleteBimesterDialogProps) {
  if (!bimester) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            Confirmar Eliminación
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Esta acción no se puede deshacer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              <p className="font-semibold mb-2">
                ¿Estás seguro de que deseas eliminar este bimestre?
              </p>
              <p className="text-sm">
                Se eliminará permanentemente:
              </p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li><strong>{bimester.name}</strong></li>
                <li>Bimestre {bimester.number}</li>
                <li>
                  Período: {formatISODateWithTimezone(bimester.startDate, 'dd MMM yyyy')} - {formatISODateWithTimezone(bimester.endDate, 'dd MMM yyyy')}
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          {bimester.isActive && (
            <Alert className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-700 dark:text-yellow-300 text-sm">
                Este bimestre está <strong>activo</strong>. Asegúrate de que no existan datos relacionados antes de eliminarlo.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-gray-300 dark:border-gray-700"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>

          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Bimestre
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteBimesterDialog;
