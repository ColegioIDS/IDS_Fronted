// src/components/features/roles/RoleDetailDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield,
  Users,
  Key,
  Calendar,
  CheckCircle2,
  XCircle,
  Lock,
  AlertCircle,
  Loader2,
  User,
} from 'lucide-react';
import { rolesService } from '@/services/roles.service';
import { RoleWithRelations, RoleStats } from '@/types/roles.types';
import { getModuleTheme, getActionTheme } from '@/config/theme.config';

interface RoleDetailDialogProps {
  roleId: number;
  open: boolean;
  onClose: () => void;
}

export function RoleDetailDialog({ roleId, open, onClose }: RoleDetailDialogProps) {
  const [role, setRole] = useState<RoleWithRelations | null>(null);
  const [stats, setStats] = useState<RoleStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && roleId) {
      loadRoleDetails();
    }
  }, [roleId, open]);

  const loadRoleDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [roleData, statsData] = await Promise.all([
        rolesService.getRoleById(roleId),
        rolesService.getRoleStats(roleId),
      ]);

      setRole(roleData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el rol');
      console.error('Error loading role details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white dark:bg-gray-900">
        <DialogTitle className="sr-only">Detalle del Rol</DialogTitle>
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400">Cargando detalles...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4 max-w-md px-4">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Error al cargar
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
              <Button onClick={loadRoleDetails} variant="outline">
                Reintentar
              </Button>
            </div>
          </div>
        ) : role ? (
          <>
            {/* Header */}
            <div className="bg-purple-600 dark:bg-purple-700 border-b border-purple-700 dark:border-purple-600">
              <DialogHeader className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-purple-500 dark:bg-purple-800 border border-purple-400 dark:border-purple-600">
                    <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>

                  <div className="flex-1 space-y-2">
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                      {role.name}
                      {role.isSystem && (
                        <Lock className="w-5 h-5" />
                      )}
                    </DialogTitle>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={
                        role.isActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700'
                          : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600'
                      }>
                        {role.isActive ? (
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

                      {role.isSystem && (
                        <Badge className="bg-white dark:bg-purple-900 text-purple-600 dark:text-purple-200 border-purple-200 dark:border-purple-700">
                          <Lock className="w-3 h-3 mr-1" />
                          Sistema
                        </Badge>
                      )}

                      <span className="text-xs text-white dark:text-purple-100">
                        ID: {role.id}
                      </span>
                    </div>

                    {role.description && (
                      <p className="text-white dark:text-purple-100 text-sm mt-2">
                        {role.description}
                      </p>
                    )}
                  </div>
                </div>
              </DialogHeader>
            </div>

            {/* Content */}
            <ScrollArea className="max-h-[calc(90vh-250px)]">
              <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Usuarios
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats?.totalUsers || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                          <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Permisos
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats?.totalPermissions || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                          <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Módulos
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats?.permissionsByModule ? Object.keys(stats.permissionsByModule).length : 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Permisos por módulo */}
                {stats?.permissionsByModule && Object.keys(stats.permissionsByModule).length > 0 && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Key className="w-5 h-5 text-purple-600" />
                        Permisos por Módulo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(stats.permissionsByModule).map(([module, count]) => {
                          const moduleTheme = getModuleTheme(module);
                          return (
                            <div
                              key={module}
                              className={`p-3 rounded-lg ${moduleTheme.bg} border ${moduleTheme.border}`}
                            >
                              <p className={`text-xs font-medium ${moduleTheme.text} capitalize`}>
                                {module}
                              </p>
                              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {count}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lista de permisos */}
                {role.permissions && role.permissions.length > 0 && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        Permisos Asignados ({role.permissions.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {role.permissions.map((rolePermission) => {
                          const actionTheme = getActionTheme(rolePermission.permission.action);
                          const moduleTheme = getModuleTheme(rolePermission.permission.module);
                          
                          return (
                            <div
                              key={rolePermission.permissionId}
                              className={`flex items-center justify-between p-3 rounded-lg ${moduleTheme.bg} border ${moduleTheme.border}`}
                            >
                              <div className="flex items-center gap-3">
                                <Badge className={actionTheme.badge}>
                                  {rolePermission.permission.action}
                                </Badge>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                                    {rolePermission.permission.module}
                                  </p>
                                  {rolePermission.permission.description && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {rolePermission.permission.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <Badge variant="outline" className="text-xs">
                                Scope: {rolePermission.scope}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Metadata */}
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Información del Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Creado
                        </label>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(role.createdAt).toLocaleString('es-GT', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {role.createdBy && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            por {role.createdBy.givenNames} {role.createdBy.lastNames}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Última modificación
                        </label>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(role.updatedAt).toLocaleString('es-GT', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {role.modifiedBy && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            por {role.modifiedBy.givenNames} {role.modifiedBy.lastNames}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-end">
                <Button onClick={onClose} variant="outline">
                  Cerrar
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}