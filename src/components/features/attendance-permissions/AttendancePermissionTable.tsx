// src/components/features/attendance-permissions/AttendancePermissionTable.tsx
'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  MoreVertical,
  GripVertical,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AttendancePermissionWithRelations } from '@/types/attendance-permissions.types';
import { useAttendancePermissions } from '@/hooks/data/useAttendancePermissions';
import { toast } from 'sonner';

interface AttendancePermissionTableProps {
  permissions: AttendancePermissionWithRelations[];
  onEdit: (permission: AttendancePermissionWithRelations) => void;
  loading?: boolean;
}

export const AttendancePermissionTable: React.FC<
  AttendancePermissionTableProps
> = ({ permissions, onEdit, loading = false }) => {
  const { deletePermission } = useAttendancePermissions();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    permissionId?: {
      roleId: number;
      attendanceStatusId: number;
    };
    roleName?: string;
    statusName?: string;
  }>({ open: false });

  const handleDeleteClick = (permission: AttendancePermissionWithRelations) => {
    setConfirmDialog({
      open: true,
      permissionId: {
        roleId: permission.roleId,
        attendanceStatusId: permission.attendanceStatusId,
      },
      roleName: permission.role?.name,
      statusName: permission.attendanceStatus?.name,
    });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.permissionId) return;

    try {
      await deletePermission(
        confirmDialog.permissionId.roleId,
        confirmDialog.permissionId.attendanceStatusId
      );
      setConfirmDialog({ open: false });
    } catch (error) {
      console.error('Error deleting permission:', error);
    }
  };

  const getPermissionBadgeColor = (
    hasPermission: boolean,
    isDanger?: boolean
  ) => {
    if (isDanger) {
      return hasPermission ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
    return hasPermission ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead className="font-semibold">Rol</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold text-center">Ver</TableHead>
              <TableHead className="font-semibold text-center">Crear</TableHead>
              <TableHead className="font-semibold text-center">
                Modificar
              </TableHead>
              <TableHead className="font-semibold text-center">
                Eliminar
              </TableHead>
              <TableHead className="font-semibold text-center">
                Aprobar
              </TableHead>
              <TableHead className="font-semibold text-center">
                Justificar
              </TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="inline-block animate-spin">
                    <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ) : permissions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No hay permisos registrados
                </TableCell>
              </TableRow>
            ) : (
              permissions.map((permission) => (
                <TableRow
                  key={`${permission.roleId}-${permission.attendanceStatusId}`}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <TableCell className="text-gray-400 dark:text-gray-500">
                    <GripVertical className="h-4 w-4" />
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {permission.role?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                    >
                      {permission.attendanceStatus?.name || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {permission.canView ? (
                      <Eye className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {permission.canCreate ? (
                      <div className="h-4 w-4 rounded bg-green-600 dark:bg-green-400 mx-auto" />
                    ) : (
                      <div className="h-4 w-4 rounded bg-gray-300 dark:bg-gray-600 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {permission.canModify ? (
                      <div className="h-4 w-4 rounded bg-blue-600 dark:bg-blue-400 mx-auto" />
                    ) : (
                      <div className="h-4 w-4 rounded bg-gray-300 dark:bg-gray-600 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {permission.canDelete ? (
                      <div className="h-4 w-4 rounded bg-red-600 dark:bg-red-400 mx-auto" />
                    ) : (
                      <div className="h-4 w-4 rounded bg-gray-300 dark:bg-gray-600 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {permission.canApprove ? (
                      <div className="h-4 w-4 rounded bg-purple-600 dark:bg-purple-400 mx-auto" />
                    ) : (
                      <div className="h-4 w-4 rounded bg-gray-300 dark:bg-gray-600 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {permission.canAddJustification ? (
                      <div className="h-4 w-4 rounded bg-orange-600 dark:bg-orange-400 mx-auto" />
                    ) : (
                      <div className="h-4 w-4 rounded bg-gray-300 dark:bg-gray-600 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(permission)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(permission)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Permiso</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar el permiso para{' '}
              <strong>{confirmDialog.roleName}</strong> en estado{' '}
              <strong>{confirmDialog.statusName}</strong>?
              <br />
              <br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
