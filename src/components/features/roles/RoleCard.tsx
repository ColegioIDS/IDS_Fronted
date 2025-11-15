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
      <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800
        hover:border-purple-400 dark:hover:border-purple-600
        shadow-lg hover:shadow-2xl hover:-translate-y-1
        transition-all duration-300 ease-out">
        {/* Header */}
        <CardHeader className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700
          group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative p-4 rounded-xl bg-purple-100 dark:bg-purple-900/30
                border-2 border-purple-200 dark:border-purple-800
                shadow-md group-hover:shadow-lg group-hover:scale-110
                transition-all duration-300 ease-out">
                <Shield className="w-7 h-7 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
                <div className="absolute inset-0 bg-purple-400 dark:bg-purple-500 opacity-0
                  group-hover:opacity-10 rounded-xl transition-opacity duration-300" />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="relative flex items-center gap-3 p-4 rounded-xl
              bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800
              shadow-sm hover:shadow-md transition-all duration-200 group/stat overflow-hidden">
              <div className="relative z-10 p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/50
                border-2 border-blue-300 dark:border-blue-700
                group-hover/stat:scale-110 transition-transform duration-200">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400">
                  Usuarios
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {role._count?.users || 0}
                </p>
              </div>
              <div className="absolute inset-0 bg-blue-100 dark:bg-blue-800 opacity-0
                group-hover/stat:opacity-20 transition-opacity duration-200" />
            </div>

            <div className="relative flex items-center gap-3 p-4 rounded-xl
              bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800
              shadow-sm hover:shadow-md transition-all duration-200 group/stat overflow-hidden">
              <div className="relative z-10 p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/50
                border-2 border-purple-300 dark:border-purple-700
                group-hover/stat:scale-110 transition-transform duration-200">
                <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-wide text-purple-700 dark:text-purple-400">
                  Permisos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {role._count?.permissions || 0}
                </p>
              </div>
              <div className="absolute inset-0 bg-purple-100 dark:bg-purple-800 opacity-0
                group-hover/stat:opacity-20 transition-opacity duration-200" />
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