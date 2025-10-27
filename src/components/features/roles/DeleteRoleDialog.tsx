// src/components/features/roles/DeleteRoleDialog.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { rolesService } from '@/services/roles.service';
import { Role } from '@/types/roles.types';
import { toast } from 'sonner';

interface DeleteRoleDialogProps {
  role: Role;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteRoleDialog({ role, open, onClose, onSuccess }: DeleteRoleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await rolesService.deleteRole(role.id);
      toast.success('Rol eliminado exitosamente');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el rol');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Eliminar Rol
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            ¿Estás seguro que deseas eliminar este rol?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Role info */}
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {role.name}
            </p>
            {role.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {role.description}
              </p>
            )}
          </div>

          {/* Warning */}
          {role.isSystem && (
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Este es un rol del sistema. No se recomienda eliminarlo ya que puede afectar el funcionamiento de la aplicación.
                </span>
              </p>
            </div>
          )}

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-gray-100">Nota:</strong> Esta acción marcará el rol como inactivo. Los usuarios que tienen este rol asignado no podrán acceder a los permisos asociados.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || role.isSystem}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Rol
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}