// src/components/features/attendance-permissions/AttendancePermissionMatrix.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionMatrix } from '@/types/attendance-permissions.types';
import { Grid3X3, Loader2, AlertCircle } from 'lucide-react';

interface AttendancePermissionMatrixProps {
  matrix: PermissionMatrix | null;
  loading?: boolean;
  onRoleTypeFilter?: (roleType: string) => void;
}

const roleTypes = [
  'ADMIN',
  'TEACHER',
  'COORDINATOR',
  'PARENT',
  'STUDENT',
  'STAFF',
  'CUSTOM',
];

export const AttendancePermissionMatrix: React.FC<
  AttendancePermissionMatrixProps
> = ({ matrix, loading = false, onRoleTypeFilter }) => {
  const [selectedRoleType, setSelectedRoleType] = useState('all');

  const handleRoleTypeChange = (value: string) => {
    setSelectedRoleType(value);
    onRoleTypeFilter?.(value === 'all' ? '' : value);
  };

  const getCellColor = (permission: any | null) => {
    if (!permission) return 'bg-gray-100 dark:bg-gray-800 text-gray-500';
    if (permission.canApprove) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    if (permission.canModify)
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    if (permission.canView)
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
    return 'bg-gray-100 dark:bg-gray-800 text-gray-500';
  };

  const getPermissionLabel = (permission: any | null) => {
    if (!permission) return '—';
    if (permission.canApprove) return 'Aprobar';
    if (permission.canModify) return 'Modificar';
    if (permission.canView) return 'Ver';
    return 'Sin acceso';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!matrix) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <p className="text-amber-700 dark:text-amber-300">
            No hay datos de matriz disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Matriz de Permisos de Asistencia
          </CardTitle>
          <CardDescription>
            Visualiza los permisos asignados a cada rol por estado de asistencia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Filtrar por tipo de rol</label>
              <Select value={selectedRoleType || 'all'} onValueChange={handleRoleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {roleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>{matrix.summary.configuredCells}</strong> de{' '}
                <strong>{matrix.summary.totalCells}</strong> configurados (
                {((matrix.summary.configuredCells / matrix.summary.totalCells) * 100).toFixed(1)}%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matrix Table */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
            <TableRow>
              <TableHead className="font-semibold w-40">Rol</TableHead>
              {matrix.statuses.map((status) => (
                <TableHead key={status.id} className="text-center font-semibold">
                  <div className="flex flex-col items-center gap-1">
                    <Badge variant="outline">{status.code}</Badge>
                    <span className="text-xs">{status.name}</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {matrix.matrix.map((row) => (
              <TableRow key={row.role.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                  <div>
                    <p>{row.role.name}</p>
                    {row.role.roleType && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {row.role.roleType}
                      </p>
                    )}
                  </div>
                </TableCell>
                {row.statuses.map((cell, idx) => (
                  <TableCell key={idx} className="text-center p-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getCellColor(cell.permission)}`}>
                      {getPermissionLabel(cell.permission)}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Roles</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {matrix.summary.totalRoles}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Estados</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {matrix.summary.totalStatuses}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Celdas Configuradas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {matrix.summary.configuredCells}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Faltantes</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {matrix.summary.unconfiguredCells}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
