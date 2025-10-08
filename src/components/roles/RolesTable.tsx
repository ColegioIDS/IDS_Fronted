// src/components/roles/RolesTable.tsx
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { RoleWithRelations } from '@/types/roles';
import RoleDetailDialog from './RoleDetailDialog';

interface RolesTableProps {
  roles: RoleWithRelations[];
  selectedIds: number[];
  onSelectRole: (id: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function RolesTable({
  roles,
  selectedIds,
  onSelectRole,
  onSelectAll,
  onEdit,
  onDelete,
}: RolesTableProps) {
  const [detailRoleId, setDetailRoleId] = useState<number | undefined>();

  const nonSystemRoles = roles.filter((r) => !r.isSystem);
  const allSelected = nonSystemRoles.length > 0 && nonSystemRoles.every((r) => selectedIds.includes(r.id));
  const someSelected = nonSystemRoles.some((r) => selectedIds.includes(r.id)) && !allSelected;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Seleccionar todos"
                  className={someSelected ? 'data-[state=checked]:bg-purple-600' : ''}
                />
              </TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-center">Permisos</TableHead>
              <TableHead className="text-center">Usuarios</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Tipo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow
                key={role.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
              >
                <TableCell>
                  {!role.isSystem && (
                    <Checkbox
                      checked={selectedIds.includes(role.id)}
                      onCheckedChange={(checked) => onSelectRole(role.id, checked as boolean)}
                      aria-label={`Seleccionar ${role.name}`}
                    />
                  )}
                </TableCell>

                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        role.isSystem ? 'bg-purple-500' : 'bg-blue-500'
                      }`}
                    />
                    <span className="text-gray-900 dark:text-gray-100">{role.name}</span>
                  </div>
                </TableCell>

                <TableCell className="max-w-xs">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {role.description || 'Sin descripción'}
                  </p>
                </TableCell>

                <TableCell className="text-center">
                  <Badge variant="outline" className="font-mono">
                    {role.permissions.length}
                  </Badge>
                </TableCell>

                <TableCell className="text-center">
                  <Badge variant="outline" className="font-mono">
                    {role.userCount}
                  </Badge>
                </TableCell>

                <TableCell className="text-center">
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
                </TableCell>

                <TableCell className="text-center">
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

                </TableCell>

                <TableCell className="text-right">
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
                        onClick={() => setDetailRoleId(role.id)}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalle
                      </DropdownMenuItem>

                      {!role.isSystem && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onEdit(role.id)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onDelete(role.id)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {detailRoleId && (
        <RoleDetailDialog
          roleId={detailRoleId}
          open={!!detailRoleId}
          onClose={() => setDetailRoleId(undefined)}
        />
      )}
    </>
  );
}