// src/components/features/permissions/PermissionModuleCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  CheckCircle2, 
  XCircle,
  Users,
  Layers
} from 'lucide-react';
import { PermissionModule } from '@/types/permissions.types';
import { getModuleTheme, getActionTheme, getStatusTheme } from '@/config/theme.config';
import { PermissionDetailDialog } from './PermissionDetailDialog';

interface PermissionModuleCardProps {
  module: PermissionModule;
}

export function PermissionModuleCard({ module }: PermissionModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPermissionId, setSelectedPermissionId] = useState<number | null>(null);

  const moduleTheme = getModuleTheme(module.module);

  return (
    <>
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300">
        {/* Header - Siempre visible */}
        <CardHeader 
          className={`${moduleTheme.bg} border-b border-gray-200 dark:border-gray-700 cursor-pointer`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            {/* Icono + Nombre */}
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${moduleTheme.gradient} shadow-md`}>
                <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              
              <div>
                <h3 className={`text-lg font-bold ${moduleTheme.text} capitalize flex items-center gap-2`}>
                  {module.module}
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {module.totalPermissions} permiso{module.totalPermissions !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Stats rápidas */}
            <div className="flex items-center gap-4">
              {/* Activos */}
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {module.activePermissions}
                </span>
              </div>

              {/* Inactivos */}
              <div className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {module.totalPermissions - module.activePermissions}
                </span>
              </div>

              {/* Roles */}
              {module.usedInRoles.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {module.usedInRoles.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Content - Expandible */}
        {isExpanded && (
          <CardContent className="p-4 bg-white dark:bg-gray-900">
            <div className="space-y-2">
              {module.permissions.map((permission) => {
                const actionTheme = getActionTheme(permission.action);
                const statusTheme = getStatusTheme(
                  permission.isActive ? 'active' : 'inactive'
                );

                return (
                  <div
                    key={permission.id}
                    className={`
                      p-4 rounded-lg border transition-all duration-200
                      ${moduleTheme.bg} ${moduleTheme.border}
                      hover:shadow-md hover:scale-[1.01]
                    `}
                  >
                    <div className="flex items-center justify-between">
                      {/* Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Badge de acción */}
                          <Badge className={actionTheme.badge}>
                            {permission.action}
                          </Badge>

                          {/* Badge de estado */}
                          <Badge className={statusTheme.badge}>
                            {permission.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>

                          {/* Badge de sistema */}
                          {permission.isSystem && (
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                              Sistema
                            </Badge>
                          )}

                          {/* ID */}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            #{permission.id}
                          </span>
                        </div>

                        {/* Descripción */}
                        {permission.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {permission.description}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {permission.allowedScopes.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              <span>Scopes: {permission.allowedScopes.join(', ')}</span>
                            </div>
                          )}
                          
                          <span>
                            {new Date(permission.createdAt).toLocaleDateString('es-GT', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Acción */}
                      <Button
                        onClick={() => setSelectedPermissionId(permission.id)}
                        variant="ghost"
                        size="sm"
                        className={`${moduleTheme.text} hover:${moduleTheme.bgHover}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalle
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Dialog de detalle */}
      {selectedPermissionId && (
        <PermissionDetailDialog
          permissionId={selectedPermissionId}
          open={!!selectedPermissionId}
          onClose={() => setSelectedPermissionId(null)}
        />
      )}
    </>
  );
}