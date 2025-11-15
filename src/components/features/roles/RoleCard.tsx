// src/components/features/roles/RoleCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Shield,
  Users,
  Key,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Lock,
} from 'lucide-react';
import { Role } from '@/types/roles.types';
import { getRoleTheme } from '@/config/theme.config';
import { RoleDetailDialog } from './RoleDetailDialog';
import { DeleteRoleDialog } from './DeleteRoleDialog';
import { ProtectedButton } from '@/components/shared/permissions/ProtectedButton';

interface RoleCardProps {
  role: Role & { _count?: { users: number; permissions: number } };
  onUpdate?: () => void;
    onEdit?: (roleId: number) => void; 
}

export function RoleCard({ role, onUpdate, onEdit }: RoleCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const roleTheme = getRoleTheme(role.name.toLowerCase());

  const handleSuccess = () => {
    onUpdate?.();
    setShowEdit(false);
    setShowDelete(false);
  };

  return (
    <>
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
        {/* Header */}
        <CardHeader className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {role.name}
                  {role.isSystem && (
                    <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  )}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                  {role.description || 'Sin descripción'}
                </p>
              </div>
            </div>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800">
                <DropdownMenuItem
                  onClick={() => setShowDetail(true)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalle
                </DropdownMenuItem>

                <ProtectedButton
                  module="role"
                  action="update"
                  hideOnNoPermission
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start px-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => onEdit?.(role.id)} // ✅ CAMBIAR AQUÍ

                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </ProtectedButton>

                {!role.isActive && (
                  <ProtectedButton
                    module="role"
                    action="restore"
                    hideOnNoPermission
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {/* TODO: Implement restore */}}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restaurar
                  </ProtectedButton>
                )}

                <DropdownMenuSeparator />

                <ProtectedButton
                  module="role"
                  action="delete"
                  hideOnNoPermission
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start px-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => setShowDelete(true)}
                  disabled={role.isSystem}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </ProtectedButton>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-4 space-y-4 bg-white dark:bg-gray-900">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Role Type Badge */}
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
            >
              {role.roleType || 'CUSTOM'}
            </Badge>

            <Badge
              variant={role.isActive ? 'default' : 'secondary'}
              className={
                role.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300'
              }
            >
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
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                <Lock className="w-3 h-3 mr-1" />
                Sistema
              </Badge>
            )}

            <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
              ID: {role.id}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Usuarios</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {role._count?.users || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700">
                <Key className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Permisos</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {role._count?.permissions || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(role.createdAt).toLocaleDateString('es-GT', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>

            <Button
              onClick={() => setShowDetail(true)}
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              Ver más
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <RoleDetailDialog
        roleId={role.id}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />

     

      <DeleteRoleDialog
        role={role}
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}