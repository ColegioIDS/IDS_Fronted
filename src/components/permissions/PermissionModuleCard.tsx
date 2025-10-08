// src/components/permissions/PermissionModuleCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Eye, Users, ChevronRight } from 'lucide-react';
import { PermissionWithRelations } from '@/types/permissions';
import PermissionModuleDetailDialog from './PermissionModuleDetailDialog';

interface PermissionModuleCardProps {
  group: {
    module: string;
    permissions: PermissionWithRelations[];
    totalActive: number;
    totalInactive: number;
    usedInRolesCount: number;
  };
}

export default function PermissionModuleCard({ group }: PermissionModuleCardProps) {
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

  const moduleColors = getModuleColor(group.module);

  // Obtener acciones únicas
  const uniqueActions = [...new Set(group.permissions.map(p => p.action))];

  return (
    <>
      <Card 
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        onClick={() => setShowDetail(true)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-lg ${moduleColors.bg}`}>
              <Shield className={`h-6 w-6 ${moduleColors.icon}`} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetail(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <h3 className={`text-xl font-bold ${moduleColors.text} capitalize`}>
              {group.module}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {group.permissions.length} permiso(s)
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Acciones disponibles */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Acciones:</p>
            <div className="flex flex-wrap gap-1">
              {uniqueActions.map((action) => (
                <Badge
                  key={action}
                  variant="outline"
                  className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  {action}
                </Badge>
              ))}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Activos</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {group.totalActive}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">En Uso</p>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {group.usedInRolesCount}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetail(true);
            }}
          >
            <span className="text-sm">Ver todos los permisos</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Dialog con todos los permisos del módulo */}
      <PermissionModuleDetailDialog
        group={group}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  );
}