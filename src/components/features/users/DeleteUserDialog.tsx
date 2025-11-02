// src/components/features/users/DeleteUserDialog.tsx
'use client';

import { useState } from 'react';
import { User } from '@/types/users.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface DeleteUserDialogProps {
  user: User | null;
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: (user: User) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUserDialog({
  user,
  isOpen,
  isLoading,
  onConfirm,
  onOpenChange,
}: DeleteUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await onConfirm(user);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-white">Eliminar Usuario</AlertDialogTitle>
          <AlertDialogDescription className="dark:text-slate-400">
            ¿Estás seguro de que deseas eliminar a{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {user?.givenNames} {user?.lastNames}
            </span>
            ? Esta acción no se puede deshacer, pero el usuario puede ser restaurado por un
            administrador.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-lg">
          <p className="text-sm text-orange-800 dark:text-orange-300">
            <strong>Nota:</strong> Los datos del usuario se marcarán como eliminados (soft delete).
          </p>
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <AlertDialogCancel
            disabled={isSubmitting || isLoading}
            className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting || isLoading}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
