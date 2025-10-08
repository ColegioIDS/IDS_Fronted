// src/components/permissions/PermissionCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Shield, Eye, MoreHorizontal, Users } from 'lucide-react';
import { PermissionWithRelations } from '@/types/permissions';
import PermissionDetailDialog from './PermissionDetailDialog';

interface PermissionCardProps {
  permission: PermissionWithRelations;
}

export default function PermissionCard({ permission }: PermissionCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const getModuleColor = (module: string): { bg: string; text: string; icon: string } => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      user: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-600 dark:text-blue-400' },
      role: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', icon: 'text-purple-600 dark:text-purple-400' },
      permission: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', icon: 'text-indigo-600 dark:text-indigo-400' },
      student: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', icon: 'text-green-600 dark:text-green-400' },
      parent: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400', icon: 'text-teal-600 dark:text-teal-400' },
      teacher: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400', icon: 'text-cyan-600 dark:text-cyan-400' },
      enrollment: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', icon: 'text-orange-600 dark:text-orange-400' },
      grade: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', icon: 'text-yellow-600 dark:text-yellow-400' },
      attendance: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400', icon: 'text-pink-600 dark:text-pink-400' },
      course: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', icon: 'text-red-600 dark:text-red-400' },
      schedule: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', icon: 'text-violet-600 dark:text-violet-400' },
      assignment: { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', text: 'text-fuchsia-600 dark:text-fuchsia-400', icon: 'text-fuchsia-600 dark:text-fuchsia-400' },
      section: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400', icon: 'text-rose-600 dark:text-rose-400' },
      academic_record: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', icon: 'text-amber-600 dark:text-amber-400' },
      bus_service: { bg: 'bg-lime-100 dark:bg-lime-900/30', text: 'text-lime-600 dark:text-lime-400', icon: 'text-lime-600 dark:text-lime-400' },
      medical_info: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', icon: 'text-emerald-600 dark:text-emerald-400' },
    };

    return colors[module.toLowerCase()] || { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-600 dark:text-gray-400', icon: 'text-gray-600 dark:text-gray-400' };
  };

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

  const moduleColors = getModuleColor(permission.module);

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${moduleColors.bg}`}>
              <Shield className={`h-5 w-5 ${moduleColors.icon}`} />
            </div>
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
                <DropdownMenuItem
                  onClick={() => setShowDetail(true)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalle
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <h3 className={`text-lg font-semibold ${moduleColors.text} capitalize`}>
              {permission.module}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {permission.description || 'Sin descripción'}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Acción */}
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={`${getActionBadgeColor(permission.action)} font-medium`}
            >
              {permission.action}
            </Badge>

            <div className="flex items-center gap-2">
              {permission.isSystem && (
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs"
                >
                  Sistema
                </Badge>
              )}
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
            </div>
          </div>

          {/* Usado en roles */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>Usado en {permission.rolesCount} rol(es)</span>
            </div>

            {permission.usedInRoles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {permission.usedInRoles.slice(0, 2).map((role) => (
                  <Badge
                    key={role.id}
                    variant="outline"
                    className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    {role.name}
                  </Badge>
                ))}
                {permission.usedInRoles.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    +{permission.usedInRoles.length - 2} más
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Footer con ID */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ID: {permission.id}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(permission.createdAt).toLocaleDateString('es-GT', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de detalle */}
      <PermissionDetailDialog
        permissionId={permission.id}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  );
}