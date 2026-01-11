// src/components/features/signatures/DeleteSignatureDialog.tsx

'use client';

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface DeleteSignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signature?: any;
}

export function DeleteSignatureDialog({
  open,
  onOpenChange,
  signature,
}: DeleteSignatureDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!signature) return;

    setIsDeleting(true);
    try {
      // TODO: Eliminar firma con API
      toast.success('Firma eliminada correctamente');
      onOpenChange(false);
    } catch (error) {
      toast.error('Error al eliminar la firma');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar firma digital?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar la firma <strong>{signature?.name}</strong>
            . Esta acción no se puede deshacer.
            {signature?.isDefault && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                ⚠️ Esta es la firma por defecto para su tipo.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3">
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
