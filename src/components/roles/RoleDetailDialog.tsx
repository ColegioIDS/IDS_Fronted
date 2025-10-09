// src/components/roles/RoleDetailDialog.tsx
'use client';

import { useRole } from '@/hooks/useRoles';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Loader2, Calendar, Users, Key, AlertCircle } from 'lucide-react';
import { Permission } from '@/types/permissions';

interface RoleDetailDialogProps {
  roleId: number;
  open: boolean;
  onClose: () => void;
}

export default function RoleDetailDialog({ roleId, open, onClose }: RoleDetailDialogProps) {
  const { data: role, isLoading } = useRole(roleId, open);
  console.log(role, "Rol name")

  const getActionBadgeColor = (action: string): string => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      read: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      update: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      manage: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    };
    return colors[action.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const groupedPermissions = (role?.permissions ?? []).reduce((acc, permission) => {
    const module = permission.module;
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Shield className="w-5 h-5" />
            Detalle del Rol
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : role ? (
          <ScrollArea className="h-[calc(90vh-120px)]">
            <div className="space-y-6 pr-4">
              {/* Header del rol */}
              <div className="relative overflow-hidden bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-400/5 rounded-full -mr-16 -mt-16" />
                <div className="relative flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {role.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {role.description || 'Sin descripción'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge
                      variant={role.isActive ? 'default' : 'secondary'}
                      className={
                        role.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }
                    >
                      {role.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>

                    {role.isSystem ? (
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        Sistema
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                      >
                        Personalizado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Permisos</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {role.permissions?.length ?? 0}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Usuarios</p>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {role.userCount ?? 0}
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">ID</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    #{role.id}
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              {/* Información de auditoría */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Creado por</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {role.createdBy?.fullName || 'Sistema'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {new Date(role.createdAt).toLocaleDateString('es-GT', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {role.modifiedBy && (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Modificado por</p>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {role.modifiedBy.fullName}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Última modificación</p>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {new Date(role.updatedAt).toLocaleDateString('es-GT', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              {/* Permisos agrupados */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Permisos Asignados
                </h3>

                {(!role.permissions || role.permissions.length === 0) ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        Sin permisos asignados
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                        Este rol no tiene ningún permiso asignado actualmente.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([module, permissions]) => (
                      <div
                        key={module}
                        className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 capitalize">
                          {module}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {permissions.map((permission) => (
                            <Badge
                              key={permission.id}
                              className={getActionBadgeColor(permission.action)}
                            >
                              {permission.action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No se pudo cargar el rol
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}