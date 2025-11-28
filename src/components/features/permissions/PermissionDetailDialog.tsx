// src/components/features/permissions/PermissionDetailDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield,
  Users,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  Lock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { permissionsService } from '@/services/permissions.service';
import { PermissionWithRelations, Permission } from '@/types/permissions.types';
import { getModuleTheme, getActionTheme, getStatusTheme } from '@/config/theme.config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PermissionDetailDialogProps {
  permissionId: number;
  open: boolean;
  onClose: () => void;
}

export function PermissionDetailDialog({
  permissionId,
  open,
  onClose,
}: PermissionDetailDialogProps) {
  const [permission, setPermission] = useState<PermissionWithRelations | null>(null);
  const [dependents, setDependents] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && permissionId) {
      loadPermissionDetails();
    }
  }, [permissionId, open]);

  const loadPermissionDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [permData, depsData] = await Promise.all([
        permissionsService.getPermissionById(permissionId),
        permissionsService.getDependentPermissions(permissionId),
      ]);

      setPermission(permData);
      setDependents(depsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el permiso');
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  const moduleTheme = permission ? getModuleTheme(permission.module) : null;
  const actionTheme = permission ? getActionTheme(permission.action) : null;
  const statusTheme = permission ? getStatusTheme(permission.isActive ? 'active' : 'inactive') : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 bg-white dark:bg-gray-900">
        {isLoading ? (
          // Loading state
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400">Cargando detalles...</p>
            </div>
          </div>
        ) : error ? (
          // Error state
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4 max-w-md px-4">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Error al cargar
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
              <Button onClick={loadPermissionDetails} variant="outline">
                Reintentar
              </Button>
            </div>
          </div>
        ) : permission ? (
          <>
            {/* Header con gradiente */}
            <div className={`${moduleTheme?.bg} border-b border-gray-200 dark:border-gray-700`}>
              <DialogHeader className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${moduleTheme?.gradient} shadow-lg`}>
                    <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>

                  <div className="flex-1 space-y-2">
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                      {permission.module}
                    </DialogTitle>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={actionTheme?.badge}>
                        {permission.action}
                      </Badge>
                      
                      <Badge className={statusTheme?.badge}>
                        {permission.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </Badge>

                      {permission.isSystem && (
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                          <Lock className="w-3 h-3 mr-1" />
                          Sistema
                        </Badge>
                      )}

                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {permission.id}
                      </span>
                    </div>

                    {permission.description && (
                      <DialogDescription className="text-gray-600 dark:text-gray-400 text-base">
                        {permission.description}
                      </DialogDescription>
                    )}
                  </div>
                </div>
              </DialogHeader>
            </div>

            {/* Content scrollable */}
            <ScrollArea className="max-h-[calc(90vh-200px)]">
              <div className="p-6 space-y-6">
                {/* Información general */}
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-600" />
                      Información General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Scopes permitidos */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        Scopes Permitidos
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {permission.allowedScopes.map((scope) => (
                          <Badge
                            key={scope}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                          >
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Permisos requeridos */}
                    {permission.requiredPermissions.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                          Permisos Requeridos
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {permission.requiredPermissions.map((reqId) => (
                            <Badge
                              key={reqId}
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                            >
                              ID: {reqId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Creado
                        </label>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(permission.createdAt).toLocaleString('es-GT', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Actualizado
                        </label>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(permission.updatedAt).toLocaleString('es-GT', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Roles que usan este permiso */}
                {permission.roles && permission.roles.length > 0 && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Usado en {permission.roles.length} Rol{permission.roles.length !== 1 ? 'es' : ''}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {permission.roles.map((rolePermission) => (
                          <div
                            key={rolePermission.roleId}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {rolePermission.role.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {rolePermission.role.id}
                                </p>
                              </div>
                            </div>

                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                            >
                              Scope: {rolePermission.scope}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Permisos dependientes */}
                {dependents.length > 0 && (
                  <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-900 dark:text-amber-100">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        Permisos Dependientes ({dependents.length})
                      </CardTitle>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Estos permisos requieren este permiso para funcionar
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {dependents.map((dep) => (
                          <div
                            key={dep.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700"
                          >
                            <div className="flex items-center gap-2">
                              <Badge className={getActionTheme(dep.action).badge}>
                                {dep.action}
                              </Badge>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                                {dep.module}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {dep.id}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-end gap-3">
                <Button onClick={onClose} variant="outline">
                  Cerrar
                </Button>
                {/* Aquí puedes agregar más acciones si tienes permisos de edición */}
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}