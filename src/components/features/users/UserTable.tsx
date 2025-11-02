// src/components/features/users/UserTable.tsx
'use client';

import { User, UserWithRelations } from '@/types/users.types';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, Lock, Eye, MoreHorizontal, Edit, Trash2, Key } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserTableProps {
  users: (User | UserWithRelations)[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onViewDetails?: (user: User) => void;
  onChangePassword?: (user: User) => void;
  isLoading?: boolean;
}

export function UserTable({
  users,
  onEdit,
  onDelete,
  onViewDetails,
  onChangePassword,
  isLoading,
}: UserTableProps) {
  const isUserWithRelations = (u: any): u is UserWithRelations => 'role' in u;

  const getInitials = (user: User) => {
    const given = user.givenNames?.split(' ')[0]?.[0] || '';
    const last = user.lastNames?.split(' ')[0]?.[0] || '';
    return `${given}${last}`.toUpperCase();
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">No hay usuarios para mostrar</p>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <TableHead className="text-slate-700 dark:text-slate-300">Usuario</TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300">Email</TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300">Rol</TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300">Estado</TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300">Acceso</TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300">Creado</TableHead>
            <TableHead className="text-right text-slate-700 dark:text-slate-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const roleName = isUserWithRelations(user) ? user.role.name : 'N/A';
            const createdDate = new Date(user.createdAt);

            return (
              <TableRow
                key={user.id}
                className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                  !user.isActive ? 'opacity-60' : ''
                }`}
              >
                {/* Usuario */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                      <AvatarFallback className="text-xs dark:bg-slate-700 dark:text-white">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {user.givenNames} {user.lastNames}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{user.email}</span>
                    {user.accountVerified && (
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    )}
                  </div>
                </TableCell>

                {/* Rol */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className="dark:border-slate-600 dark:text-slate-300"
                  >
                    {roleName}
                  </Badge>
                </TableCell>

                {/* Estado */}
                <TableCell>
                  <Badge
                    variant={user.isActive ? 'default' : 'secondary'}
                    className={
                      user.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-0'
                    }
                  >
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>

                {/* Acceso */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    {user.canAccessPlatform ? (
                      <>
                        <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Con acceso
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Sin acceso
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>

                {/* Creado */}
                <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDistanceToNow(createdDate, { addSuffix: true, locale: es })}
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        className="h-8 w-8 p-0 dark:hover:bg-slate-800"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="dark:bg-slate-800 dark:border-slate-700"
                    >
                      <DropdownMenuItem
                        onClick={() => onViewDetails?.(user)}
                        className="dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalles
                      </DropdownMenuItem>
                      {onEdit && (
                        <DropdownMenuItem
                          onClick={() => onEdit(user)}
                          className="dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {onChangePassword && (
                        <>
                          <DropdownMenuSeparator className="dark:bg-slate-700" />
                          <DropdownMenuItem
                            onClick={() => onChangePassword(user)}
                            className="dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            <Key className="w-4 h-4 mr-2" />
                            Cambiar contraseña
                          </DropdownMenuItem>
                        </>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator className="dark:bg-slate-700" />
                          <DropdownMenuItem
                            onClick={() => onDelete(user)}
                            className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
