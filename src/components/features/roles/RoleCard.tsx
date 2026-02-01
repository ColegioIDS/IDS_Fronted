// src/components/features/roles/RoleCard.tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { rolesService } from '@/services/roles.service';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  Calendar,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { Role } from '@/types/roles.types';
import { getRoleTheme } from '@/config/theme.config';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import { RoleDetailDialog } from './RoleDetailDialog';
import { DeleteRoleDialog } from './DeleteRoleDialog';

interface RoleCardProps {
  role: Role & { _count?: { users: number; permissions: number } };
  onUpdate?: () => void;
    onEdit?: (roleId: number) => void; 
}

export function RoleCard({ role, onUpdate, onEdit }: RoleCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const { hasPermission } = useAuth();

  const roleTheme = getRoleTheme(role.name.toLowerCase());
  const canViewDetails = hasPermission(
    MODULES_PERMISSIONS.ROLE.READ_ONE.module,
    MODULES_PERMISSIONS.ROLE.READ_ONE.action
  );
  const canUpdate = hasPermission(
    MODULES_PERMISSIONS.ROLE.UPDATE.module,
    MODULES_PERMISSIONS.ROLE.UPDATE.action
  );
  const canDelete = hasPermission(
    MODULES_PERMISSIONS.ROLE.DELETE.module,
    MODULES_PERMISSIONS.ROLE.DELETE.action
  );
  const canAssignPermissions = hasPermission(
    MODULES_PERMISSIONS.ROLE.ASSIGN_PERMISSIONS.module,
    MODULES_PERMISSIONS.ROLE.ASSIGN_PERMISSIONS.action
  );
  const canRestore = hasPermission(
    MODULES_PERMISSIONS.ROLE.RESTORE.module,
    MODULES_PERMISSIONS.ROLE.RESTORE.action
  );

  const handleSuccess = () => {
    onUpdate?.();
    setShowEdit(false);
    setShowDelete(false);
  };

  const handleRestore = async () => {
    try {
      await rolesService.restoreRole(role.id);
      toast.success('Rol restaurado correctamente');
      onUpdate?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al restaurar el rol';
      toast.error(message);
    }
  };

  const isInactive = !role.isActive;

  return (
    <TooltipProvider>
      <Card className={`group relative overflow-hidden border-2
        transition-all duration-300 ease-out
        animate-in fade-in-0 slide-in-from-bottom-4 duration-500
        ${isInactive
          ? 'border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/80 opacity-90 hover:opacity-95 shadow-md'
          : 'border-gray-200 dark:border-gray-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-lg hover:shadow-2xl hover:-translate-y-1'
        }`}>

        {/* System Role Ribbon */}
        {role.isSystem && (
          <div className="absolute top-4 -right-12 w-40 h-8 bg-purple-600 dark:bg-purple-500
            rotate-45 flex items-center justify-center shadow-lg z-20">
            <Lock className="w-4 h-4 text-white mr-2" strokeWidth={2.5} />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Sistema</span>
          </div>
        )}

        {/* Activity Indicator - Activo */}
        {role.isActive && (
          <div className="absolute top-3 left-3 z-10">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-400 rounded-full
                animate-pulse shadow-lg" />
              <div className="absolute inset-0 bg-emerald-500 dark:bg-emerald-400 rounded-full
                animate-ping opacity-75" />
            </div>
          </div>
        )}

        {/* Inactivo ribbon */}
        {isInactive && !role.isSystem && (
          <div className="absolute top-4 -right-10 w-36 h-8 bg-gray-500 dark:bg-gray-600
            rotate-45 flex items-center justify-center shadow-lg z-20">
            <XCircle className="w-4 h-4 text-white mr-1" strokeWidth={2.5} />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Inactivo</span>
          </div>
        )}

        {/* Header */}
        <CardHeader className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700
          group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative p-4 rounded-xl bg-purple-100 dark:bg-purple-900/30
                    border-2 border-purple-200 dark:border-purple-800
                    shadow-md group-hover:shadow-lg group-hover:scale-110
                    transition-all duration-300 ease-out cursor-help">
                    <Shield className="w-7 h-7 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
                    <div className="absolute inset-0 bg-purple-400 dark:bg-purple-500 opacity-0
                      group-hover:opacity-10 rounded-xl transition-opacity duration-300" />
                    {/* Badge count indicator */}
                    <div className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5
                      bg-purple-600 dark:bg-purple-500 rounded-full
                      flex items-center justify-center
                      border-2 border-white dark:border-gray-900
                      shadow-md animate-in zoom-in-0 duration-300">
                      <span className="text-xs font-bold text-white">
                        {(role._count?.users || 0) + (role._count?.permissions || 0)}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">Rol de {role.roleType || 'CUSTOM'}</p>
                </TooltipContent>
              </Tooltip>
              
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
                {canViewDetails && (
                  <DropdownMenuItem
                    onClick={() => setShowDetail(true)}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalle
                  </DropdownMenuItem>
                )}

                {canUpdate && !role.isSystem && role.isActive && (
                  <DropdownMenuItem
                    onClick={() => onEdit?.(role.id)}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}

                {!role.isActive && canRestore && !role.isSystem && (
                  <DropdownMenuItem
                    onClick={() => handleRestore()}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restaurar
                  </DropdownMenuItem>
                )}

                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    {role.isSystem ? (
                      <DropdownMenuItem
                        disabled
                        className="text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-80"
                        title="Los roles del sistema no se pueden eliminar"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar (no permitido)
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => setShowDelete(true)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer focus:bg-red-50 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {role.isActive ? 'Eliminar' : 'Eliminar por completo'}
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-4 space-y-4 bg-white dark:bg-gray-900">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Role Type Badge with Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-800 border-2 border-blue-200
                    dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700
                    hover:bg-blue-100 dark:hover:bg-blue-900/50
                    transition-colors duration-200 cursor-help
                    font-semibold px-3 py-1"
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                  {role.roleType || 'CUSTOM'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p>Categoría del rol</p>
              </TooltipContent>
            </Tooltip>

            {/* Status Badge with Animation */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={role.isActive ? 'default' : 'secondary'}
                  className={`${
                    role.isActive
                      ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700'
                      : 'bg-gray-100 text-gray-800 border-2 border-gray-300 dark:bg-gray-900/40 dark:text-gray-300 dark:border-gray-600'
                  } hover:scale-105 transition-transform duration-200 cursor-help font-semibold px-3 py-1`}
                >
                  {role.isActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 animate-pulse" strokeWidth={2.5} />
                      Activo
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                      Inactivo
                    </>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p>{role.isActive ? 'Rol activo y asignable' : 'Rol desactivado'}</p>
              </TooltipContent>
            </Tooltip>

            {/* Creation Date Badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-xs border-2 border-gray-300 dark:border-gray-600
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    transition-colors duration-200 cursor-help font-medium px-2.5 py-1"
                >
                  <Calendar className="w-3 h-3 mr-1" strokeWidth={2.5} />
                  ID: {role.id}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="text-xs">
                  Creado: {new Date(role.createdAt).toLocaleDateString('es-GT', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Stats with Tooltips */}
          <div className="grid grid-cols-2 gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative flex items-center gap-3 p-4 rounded-xl
                  bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800
                  shadow-sm hover:shadow-md transition-all duration-200 group/stat overflow-hidden cursor-help">
                  <div className="relative z-10 p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/50
                    border-2 border-blue-300 dark:border-blue-700
                    group-hover/stat:scale-110 transition-transform duration-200">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 flex items-center gap-1">
                      Usuarios
                      {role._count?.users! > 0 && (
                        <TrendingUp className="w-3 h-3 animate-bounce" strokeWidth={2.5} />
                      )}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                      {role._count?.users || 0}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-blue-100 dark:bg-blue-800 opacity-0
                    group-hover/stat:opacity-20 transition-opacity duration-200" />
                  {/* Progress bar indicator */}
                  <div className="absolute bottom-0 left-0 h-1 bg-blue-600 dark:bg-blue-400
                    transition-all duration-300 group-hover/stat:h-1.5"
                    style={{ width: `${Math.min((role._count?.users || 0) * 10, 100)}%` }} />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">{role._count?.users || 0} usuarios asignados</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative flex items-center gap-3 p-4 rounded-xl
                  bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800
                  shadow-sm hover:shadow-md transition-all duration-200 group/stat overflow-hidden cursor-help">
                  <div className="relative z-10 p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/50
                    border-2 border-purple-300 dark:border-purple-700
                    group-hover/stat:scale-110 transition-transform duration-200">
                    <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-bold uppercase tracking-wide text-purple-700 dark:text-purple-400 flex items-center gap-1">
                      Permisos
                      {role._count?.permissions! > 0 && (
                        <TrendingUp className="w-3 h-3 animate-bounce" strokeWidth={2.5} />
                      )}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                      {role._count?.permissions || 0}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-purple-100 dark:bg-purple-800 opacity-0
                    group-hover/stat:opacity-20 transition-opacity duration-200" />
                  {/* Progress bar indicator */}
                  <div className="absolute bottom-0 left-0 h-1 bg-purple-600 dark:bg-purple-400
                    transition-all duration-300 group-hover/stat:h-1.5"
                    style={{ width: `${Math.min((role._count?.permissions || 0) * 5, 100)}%` }} />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">{role._count?.permissions || 0} permisos configurados</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Footer - Enhanced */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-help">
                  <Calendar className="w-4 h-4" strokeWidth={2.5} />
                  <span className="font-medium">
                    {new Date(role.createdAt).toLocaleDateString('es-GT', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="text-xs">Fecha de creación</p>
              </TooltipContent>
            </Tooltip>

            {canViewDetails && (
              <Button
                onClick={() => setShowDetail(true)}
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400
                  hover:bg-purple-50 dark:hover:bg-purple-900/30
                  font-semibold transition-all duration-200
                  hover:scale-105"
              >
                <Eye className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                Ver detalles
              </Button>
            )}
          </div>
        </CardContent>

        {/* Decorative bottom border */}
        <div className="h-1.5 bg-purple-600 dark:bg-purple-500 opacity-0 group-hover:opacity-100
          transition-opacity duration-300" />
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
    </TooltipProvider>
  );
}