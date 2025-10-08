// src/components/permissions/PermissionModuleDetailDialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Users, Check, X } from 'lucide-react';
import { PermissionWithRelations } from '@/types/permissions';

interface PermissionModuleDetailDialogProps {
  group: {
    module: string;
    permissions: PermissionWithRelations[];
    totalActive: number;
    totalInactive: number;
    usedInRolesCount: number;
  };
  open: boolean;
  onClose: () => void;
}

export default function PermissionModuleDetailDialog({
  group,
  open,
  onClose,
}: PermissionModuleDetailDialogProps) {
  const getActionBadgeColor = (action: string): string => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700',
      read: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      update: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
      delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700',
      manage: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    };

    return colors[action.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
  };

  // Obtener todos los roles únicos
  const allRoles = [...new Map(
    group.permissions.flatMap(p => p.usedInRoles).map(role => [role.id, role])
  ).values()];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Shield className="w-5 h-5" />
            Módulo: <span className="capitalize">{group.module}</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Stats del módulo */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {group.permissions.length}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Activos</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {group.totalActive}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">En Uso</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {group.usedInRolesCount}
                </p>
              </div>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            {/* Lista de permisos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Permisos del Módulo
              </h3>

              <div className="space-y-3">
                {group.permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`${getActionBadgeColor(permission.action)} font-medium`}
                        >
                          {permission.action}
                        </Badge>

                        {permission.isActive ? (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Check className="w-4 h-4" />
                            <span className="text-xs">Activo</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400">
                            <X className="w-4 h-4" />
                            <span className="text-xs">Inactivo</span>
                          </div>
                        )}

                        {permission.isSystem && (
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs"
                          >
                            Sistema
                          </Badge>
                        )}
                      </div>

                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {permission.id}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {permission.description || 'Sin descripción'}
                    </p>

                    {/* Roles que usan este permiso */}
                    {permission.usedInRoles.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Users className="w-3 h-3" />
                          <span>Usado en {permission.rolesCount} rol(es):</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {permission.usedInRoles.map((role) => (
                            <Badge
                              key={role.id}
                              variant="outline"
                              className="text-xs border-gray-300 dark:border-gray-600"
                            >
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen de roles */}
            {allRoles.length > 0 && (
              <>
                <Separator className="bg-gray-200 dark:bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Roles que usan este módulo
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {allRoles.map((role) => {
                      const permissionsCount = group.permissions.filter(p =>
                        p.usedInRoles.some(r => r.id === role.id)
                      ).length;

                      return (
                        <div
                          key={role.id}
                          className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                        >
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {role.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {permissionsCount} permiso(s) de este módulo
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}