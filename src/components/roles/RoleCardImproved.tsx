// src/components/roles/RoleCardImproved.tsx
'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext'; // ✅ Importar useAuth
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProtectedContent from '@/components/common/ProtectedContent';
import { Shield, Eye, Edit, Trash2, MoreHorizontal, Users, Key, Calendar, User } from 'lucide-react';
import { RoleWithRelations } from '@/types/roles';
import RoleDetailDialog from './RoleDetailDialog';

interface RoleCardImprovedProps {
  role: RoleWithRelations;
  isSelected: boolean;
  onSelect: (id: number, selected: boolean) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function RoleCardImproved({
  role,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: RoleCardImprovedProps) {
  const [showDetail, setShowDetail] = useState(false);
  const { hasPermission } = useAuth(); // ✅ Usar hook de auth

  // ✅ Verificar permisos disponibles
  const canReadOne = hasPermission('role', 'read-one');
  const canUpdate = hasPermission('role', 'update');
  const canDelete = hasPermission('role', 'delete');
  const canDeleteBulk = hasPermission('role', 'delete-bulk');

  // ✅ Determinar si mostrar el dropdown (al menos un permiso debe estar disponible)
  const hasAnyAction = canReadOne || (!role.isSystem && (canUpdate || canDelete));

  // Agrupar permisos por módulo
  const permissionsByModule = useMemo(() => {
    return role.permissions.reduce((acc, permission) => {
      const module = permission.module;
      acc[module] = (acc[module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [role.permissions]);

  const moduleCount = Object.keys(permissionsByModule).length;

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {/* ✅ Checkbox solo si puede eliminar en bulk Y no es sistema */}
              {!role.isSystem && canDeleteBulk && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelect(role.id, checked as boolean)}
                  className="mt-1"
                />
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${role.isSystem ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                    <Shield className={`h-5 w-5 ${role.isSystem ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {role.name}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {role.description || 'Sin descripción disponible'}
                </p>
              </div>
            </div>

            {/* ✅ Dropdown Menu - solo mostrar si tiene al menos un permiso */}
            {hasAnyAction && (
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
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  {/* Ver Detalle */}
                  {canReadOne && (
                    <DropdownMenuItem
                      onClick={() => setShowDetail(true)}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalle
                    </DropdownMenuItem>
                  )}

                  {/* Editar - solo si no es sistema */}
                  {!role.isSystem && canUpdate && (
                    <DropdownMenuItem
                      onClick={() => onEdit(role.id)}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}

                  {/* Eliminar - solo si no es sistema */}
                  {!role.isSystem && canDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(role.id)}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
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
          </div>
        </CardHeader>

        <CardContent className="space-y-3 flex-1">
          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  Permisos
                </p>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {role.permissions.length}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                  Usuarios
                </p>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {role.userCount}
              </p>
            </div>
          </div>

          {/* Módulos con permisos */}
          {moduleCount > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Módulos ({moduleCount}):
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(permissionsByModule)
                  .slice(0, 4)
                  .map(([module, count]) => (
                    <Badge
                      key={module}
                      variant="outline"
                      className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      {module} ({count})
                    </Badge>
                  ))}
                {moduleCount > 4 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    +{moduleCount - 4} más
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Info adicional */}
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {role.createdBy && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <User className="w-3 h-3" />
                <span>Creado por: {role.createdBy.fullName}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(role.createdAt).toLocaleDateString('es-GT', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* ✅ Botón de ver detalles - solo mostrar si tiene permiso */}
          {canReadOne ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetail(true)}
              className="w-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Ver todos los detalles
            </Button>
          ) : (
            <p className="text-xs text-gray-400 text-center w-full py-2">
              Información básica del rol
            </p>
          )}
        </CardFooter>
      </Card>

      {/* ✅ Solo abrir modal si tiene permiso */}
      {canReadOne && (
        <RoleDetailDialog 
          roleId={role.id} 
          open={showDetail} 
          onClose={() => setShowDetail(false)} 
        />
      )}
    </>
  );
}