// src/components/permissions/PermissionDetailDialog.tsx
'use client';

import { usePermission } from '@/hooks/usePermissions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Loader2, Calendar, Users, AlertCircle } from 'lucide-react';

interface PermissionDetailDialogProps {
  permissionId: number;
  open: boolean;
  onClose: () => void;
}

export default function PermissionDetailDialog({
  permissionId,
  open,
  onClose,
}: PermissionDetailDialogProps) {
  const { data: permission, isLoading } = usePermission(permissionId, open);

  const getActionColor = (action: string | undefined): string => {
    if (!action) return 'text-gray-600 dark:text-gray-400';
    
    const colors: Record<string, string> = {
      create: 'text-green-600 dark:text-green-400',
      read: 'text-blue-600 dark:text-blue-400',
      update: 'text-yellow-600 dark:text-yellow-400',
      delete: 'text-red-600 dark:text-red-400',
      manage: 'text-purple-600 dark:text-purple-400',
    };

    return colors[action.toLowerCase()] || 'text-gray-600 dark:text-gray-400';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Shield className="w-5 h-5" />
            Detalle del Permiso
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : permission ? (
          <div className="space-y-6">
            {/* Información principal */}
            <div className="relative overflow-hidden bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-400/5 rounded-full -mr-16 -mt-16" />
              <div className="relative flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                    {permission.module}
                  </h3>
                  <p className={`text-lg font-semibold ${getActionColor(permission.action)}`}>
                    {permission.action}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge
                    variant={permission.isActive ? 'default' : 'secondary'}
                    className={
                      permission.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }
                  >
                    {permission.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {permission.isSystem && (
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                    >
                      Sistema
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {permission.description || 'Sin descripción disponible'}
              </p>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            {/* Metadatos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>ID</span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  #{permission.id}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Creado</span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {new Date(permission.createdAt).toLocaleDateString('es-GT', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            {/* Roles que usan este permiso */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Usado en {permission.rolesCount} rol(es)
                </h4>
              </div>

              {permission.usedInRoles && permission.usedInRoles.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {permission.usedInRoles.map((role) => (
                    <div
                      key={role.id}
                      className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                    >
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {role.name}
                      </p>
                      {role.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {role.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Sin asignación
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                      Este permiso no está asignado a ningún rol actualmente.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No se pudo cargar el permiso
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}