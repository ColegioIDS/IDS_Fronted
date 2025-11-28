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
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCheck,
  XCircle,
  MessageSquare,
  FileText,
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
      toast.success('Permiso eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar el permiso');
    }
  };

  const getPermissionBadgeVariant = (
    hasPermission: boolean,
    isDanger?: boolean
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (!hasPermission) return 'outline';
    if (isDanger) return 'destructive';
    return 'default';
  };

  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? (
      <CheckCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
    ) : (
      <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
    );
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
        <Table>
          <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Rol</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Estado</TableHead>
              <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-300">Ver</TableHead>
              <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-300">Crear</TableHead>
              <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-300">
                Modificar
              </TableHead>
              <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-300">
                Eliminar
              </TableHead>
              <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-300">
                Aprobar
              </TableHead>
              <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-300">
                Justificar
              </TableHead>
              <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-300">
                <MessageSquare className="h-4 w-4 mx-auto" />
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="inline-flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-600 dark:text-gray-400">Cargando permisos...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : permissions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-12 text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 opacity-50" />
                    <p>No hay permisos registrados</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              permissions.map((permission) => (
                <TableRow
                  key={`${permission.roleId}-${permission.attendanceStatusId}`}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-200 dark:border-gray-700"
                >
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    <div>
                      <p className="font-semibold">{permission.role?.name || '-'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {permission.role?.roleType || '-'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                      style={{ backgroundColor: permission.attendanceStatus?.colorCode + '20' }}
                    >
                      {permission.attendanceStatus?.name || '-'} ({permission.attendanceStatus?.code})
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getPermissionIcon(permission.canView)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getPermissionIcon(permission.canCreate)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getPermissionIcon(permission.canModify)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getPermissionIcon(permission.canDelete)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getPermissionIcon(permission.canApprove)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getPermissionIcon(permission.canAddJustification)}
                  </TableCell>
                  <TableCell className="text-center">
                    {permission.justificationRequired ? (
                      <Badge variant="default" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        Sí
                      </Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
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
                          className="text-red-600 dark:text-red-400 focus:text-red-600 focus:dark:text-red-400"
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
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
