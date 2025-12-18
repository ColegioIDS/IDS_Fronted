// src/components/features/users/UserTable.tsx
'use client';

import { User, UserWithRelations } from '@/types/users.types';
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
import { CheckCircle2, Eye, MoreHorizontal, Edit, Trash2, Key } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserTableProps {
  users: (User | UserWithRelations)[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onViewDetails?: (user: User) => void;
  onChangePassword?: (user: User) => void;
  isLoading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  canChangePassword?: boolean;
}

export function UserTable({
  users,
  onEdit,
  onDelete,
  onViewDetails,
  onChangePassword,
  isLoading,
  canEdit = true,
  canDelete = true,
  canView = true,
  canChangePassword = true,
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

  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          <Eye className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No hay usuarios para mostrar</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {users.map((user) => {
            const roleName = isUserWithRelations(user) ? user.role.name : 'N/A';
            const createdDate = new Date(user.createdAt);

            return (
              <div
                key={user.id}
                className={`
                  group p-4 rounded-lg border-2
                  transition-all duration-300
                  ${user.isActive 
                    ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg' 
                    : 'border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 opacity-60'
                  }
                `}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Usuario */}
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="
                        h-10 w-10 border-2 border-slate-200/60 dark:border-slate-700/60
                        group-hover:border-blue-300/80 dark:group-hover:border-blue-600/60
                        transition-colors duration-300
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
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {user.givenNames} {user.lastNames}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="md:col-span-3 flex items-center gap-2">
                    <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400 font-medium min-w-fit">Email:</span>
                    <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                      {user.email}
                    </span>
                    {user.accountVerified && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Rol y Estado */}
                  <div className="md:col-span-2 flex flex-wrap gap-2">
                    <Badge className="
                      bg-blue-100/80 dark:bg-blue-900/40
                      text-blue-700 dark:text-blue-300
                      border border-blue-200/50 dark:border-blue-700/50
                      font-semibold text-xs
                      transition-all duration-300
                    ">
                      {roleName}
                    </Badge>
                    <Badge className={`
                      font-semibold text-xs border
                      transition-all duration-300
                      ${user.isActive
                        ? 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-700/50'
                        : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-700/50'
                      }
                    `}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  {/* Acceso */}
                  <div className="md:col-span-1 flex items-center gap-1">
                    {user.canAccessPlatform ? (
                      <>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 hidden lg:inline">
                          Permitido
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 hidden lg:inline">
                          Bloqueado
                        </span>
                      </>
                    )}
                  </div>

                  {/* Creado */}
                  <div className="md:col-span-2 hidden md:block">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {formatDistanceToNow(createdDate, { addSuffix: true, locale: es })}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="md:col-span-1 flex justify-end">
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
                        {canView && onViewDetails && (
                          <DropdownMenuItem
                            onClick={() => onViewDetails(user)}
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
                        )}
                        
                        {canEdit && onEdit && (
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
                        
                        {canChangePassword && onChangePassword && (
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
                        
                        {canDelete && onDelete && (
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}