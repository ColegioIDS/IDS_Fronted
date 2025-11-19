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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Lock, Eye, MoreHorizontal, Edit, Trash2, Key, Check, Circle } from 'lucide-react';
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

  const getProfilePicture = (user: User | UserWithRelations) => {
    if (isUserWithRelations(user)) {
      return user.pictures?.find((p) => p.kind === 'profile')?.url;
    }
    return undefined;
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
        <Eye className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">No hay usuarios para mostrar</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-900/90 backdrop-blur-sm">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />

      <Table>
        {/* Header */}
        <TableHeader>
          <TableRow className="
            bg-gradient-to-r from-slate-50 to-slate-50/50
            dark:from-slate-800/80 dark:to-slate-800/40
            border-b-2 border-slate-200/60 dark:border-slate-700/60
            hover:bg-slate-50/80 dark:hover:bg-slate-800/60
          ">
            <TableHead className="
              text-slate-700 dark:text-slate-200
              font-semibold text-xs uppercase tracking-wider
              py-4
            ">
              Usuario
            </TableHead>
            <TableHead className="
              text-slate-700 dark:text-slate-200
              font-semibold text-xs uppercase tracking-wider
              py-4
            ">
              Email
            </TableHead>
            <TableHead className="
              text-slate-700 dark:text-slate-200
              font-semibold text-xs uppercase tracking-wider
              py-4
            ">
              Rol
            </TableHead>
            <TableHead className="
              text-slate-700 dark:text-slate-200
              font-semibold text-xs uppercase tracking-wider
              py-4
            ">
              Estado
            </TableHead>
            <TableHead className="
              text-slate-700 dark:text-slate-200
              font-semibold text-xs uppercase tracking-wider
              py-4
            ">
              Acceso
            </TableHead>
            <TableHead className="
              text-slate-700 dark:text-slate-200
              font-semibold text-xs uppercase tracking-wider
              py-4
            ">
              Creado
            </TableHead>
            <TableHead className="
              text-right text-slate-700 dark:text-slate-200
              font-semibold text-xs uppercase tracking-wider
              py-4
            ">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* Body */}
        <TableBody>
          {users.map((user, index) => {
            const roleName = isUserWithRelations(user) ? user.role.name : 'N/A';
            const createdDate = new Date(user.createdAt);

            return (
              <TableRow
                key={user.id}
                className={`
                  group relative
                  border-b border-slate-200/40 dark:border-slate-700/40
                  transition-all duration-300
                  hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30
                  dark:hover:from-blue-950/20 dark:hover:to-purple-950/20
                  ${!user.isActive ? 'opacity-70' : ''}
                `}
              >
                {/* Accent line on left */}
                <div className={`
                  absolute left-0 top-0 bottom-0 w-0.5
                  transition-all duration-300
                  ${user.isActive 
                    ? 'bg-gradient-to-b from-blue-400 to-blue-500 group-hover:from-blue-500 group-hover:to-purple-500' 
                    : 'bg-gradient-to-b from-slate-300 to-slate-400'
                  }
                `} />

                {/* Usuario */}
                <TableCell className="py-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-500/30 dark:to-purple-500/30 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Avatar className="
                        h-9 w-9 border-2 border-slate-200/60 dark:border-slate-700/60
                        group-hover:border-blue-300/80 dark:group-hover:border-blue-600/60
                        transition-colors duration-300
                        relative
                      ">
                        <AvatarImage 
                          src={getProfilePicture(user)} 
                          alt={`${user.givenNames} ${user.lastNames}`}
                        />
                        <AvatarFallback className="
                          text-xs font-bold
                          bg-gradient-to-br from-blue-100 to-purple-100
                          dark:from-blue-900/50 dark:to-purple-900/50
                          text-slate-700 dark:text-slate-100
                        ">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {user.givenNames} {user.lastNames}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-slate-600 dark:text-slate-300 truncate font-medium">
                      {user.email}
                    </span>
                    {user.accountVerified && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    )}
                  </div>
                </TableCell>

                {/* Rol */}
                <TableCell className="py-4">
                  <Badge className="
                    bg-blue-100/80 dark:bg-blue-900/40
                    text-blue-700 dark:text-blue-300
                    border border-blue-200/50 dark:border-blue-700/50
                    font-semibold text-xs
                    group-hover:from-blue-200 dark:group-hover:from-blue-800/60
                    transition-all duration-300
                  ">
                    {roleName}
                  </Badge>
                </TableCell>

                {/* Estado */}
                <TableCell className="py-4">
                  <Badge className={`
                    font-semibold text-xs border
                    transition-all duration-300
                    ${user.isActive
                      ? 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-700/50'
                      : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-700/50'
                    }
                  `}>
                    {user.isActive ? (
                      <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Activo</span>
                    ) : (
                      <span className="flex items-center gap-1"><Circle className="w-3 h-3" /> Inactivo</span>
                    )}
                  </Badge>
                </TableCell>

                {/* Acceso */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    {user.canAccessPlatform ? (
                      <>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                          Permitido
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Bloqueado
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>

                {/* Creado */}
                <TableCell className="py-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {formatDistanceToNow(createdDate, { addSuffix: true, locale: es })}
                  </span>
                </TableCell>

                {/* Acciones */}
                <TableCell className="py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        className="
                          h-8 w-8 p-0
                          text-slate-500 dark:text-slate-400
                          hover:text-slate-700 dark:hover:text-slate-200
                          hover:bg-slate-100/60 dark:hover:bg-slate-800/60
                          transition-all duration-300
                          group-hover:opacity-100 opacity-70
                        "
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="
                        bg-white dark:bg-slate-800
                        border border-slate-200/50 dark:border-slate-700/50
                        shadow-xl
                        rounded-lg
                      "
                    >
                      <DropdownMenuItem
                        onClick={() => onViewDetails?.(user)}
                        className="
                          text-slate-700 dark:text-slate-300
                          hover:bg-blue-50 dark:hover:bg-blue-950/30
                          focus:bg-blue-50 dark:focus:bg-blue-950/30
                          cursor-pointer transition-colors
                        "
                      >
                        <Eye className="w-4 h-4 mr-2 text-blue-500" />
                        Ver detalles
                      </DropdownMenuItem>
                      
                      {onEdit && (
                        <DropdownMenuItem
                          onClick={() => onEdit(user)}
                          className="
                            text-slate-700 dark:text-slate-300
                            hover:bg-amber-50 dark:hover:bg-amber-950/30
                            focus:bg-amber-50 dark:focus:bg-amber-950/30
                            cursor-pointer transition-colors
                          "
                        >
                          <Edit className="w-4 h-4 mr-2 text-amber-500" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      
                      {onChangePassword && (
                        <>
                          <DropdownMenuSeparator className="dark:bg-slate-700/50" />
                          <DropdownMenuItem
                            onClick={() => onChangePassword(user)}
                            className="
                              text-slate-700 dark:text-slate-300
                              hover:bg-purple-50 dark:hover:bg-purple-950/30
                              focus:bg-purple-50 dark:focus:bg-purple-950/30
                              cursor-pointer transition-colors
                            "
                          >
                            <Key className="w-4 h-4 mr-2 text-purple-500" />
                            Cambiar contraseña
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator className="dark:bg-slate-700/50" />
                          <DropdownMenuItem
                            onClick={() => onDelete(user)}
                            className="
                              text-red-600 dark:text-red-400
                              hover:bg-red-50 dark:hover:bg-red-950/30
                              focus:bg-red-50 dark:focus:bg-red-950/30
                              cursor-pointer transition-colors
                            "
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