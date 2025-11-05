// src/components/features/users/UserCard.tsx
'use client';

import { User, UserWithRelations } from '@/types/users.types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Mail,
  Phone,
  Shield,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface UserCardProps {
  user: User | UserWithRelations;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onViewDetails?: (user: User) => void;
  isLoading?: boolean;
}

export function UserCard({
  user,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading,
}: UserCardProps) {
  const isUserWithRelations = (u: any): u is UserWithRelations => 'role' in u;
  const roleName = isUserWithRelations(user) && user.role ? user.role.name : 'N/A';
  const pictures = isUserWithRelations(user) ? user.pictures || [] : [];
  const profilePicture = pictures?.find((p) => p.kind === 'profile');

  const getInitials = () => {
    const given = user.givenNames?.split(' ')[0]?.[0] || '';
    const last = user.lastNames?.split(' ')[0]?.[0] || '';
    return `${given}${last}`.toUpperCase();
  };

  const getStatusStyles = () => {
    if (!user.isActive) {
      return {
        statusBg: 'bg-slate-50/30 dark:bg-slate-800/30',
        statusText: 'text-slate-500 dark:text-slate-400',
        badge: 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300',
        dot: 'bg-slate-400 dark:bg-slate-500',
        accentLine: 'bg-slate-300/40 dark:bg-slate-600/40',
      };
    }
    return {
      statusBg: 'bg-white dark:bg-slate-900/90',
      statusText: 'text-slate-900 dark:text-white',
      badge: 'bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-400 dark:bg-emerald-500',
      accentLine: 'bg-blue-400/60 dark:bg-blue-500/40',
    };
  };

  const statusStyles = getStatusStyles();

  return (
    <Card
      className={`
        group relative overflow-hidden
        border border-slate-200/50 dark:border-slate-700/50
        shadow-md hover:shadow-2xl
        transition-all duration-500 ease-out
        ${statusStyles.statusBg}
        hover:border-slate-300/80 dark:hover:border-slate-600/80
        cursor-pointer
      `}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent dark:from-blue-500/10 dark:via-purple-500/10" />
      </div>

      {/* Accent line - animated on hover */}
      <div className={`
        absolute top-0 left-0 right-0 h-1 
        bg-gradient-to-r from-transparent via-${statusStyles.accentLine} to-transparent
        transform origin-left scale-x-0 group-hover:scale-x-100
        transition-transform duration-500 ease-out
      `} />

      {/* Left accent bar */}
      <div className={`
        absolute left-0 top-0 bottom-0 w-1
        ${statusStyles.accentLine}
      `} />

      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar con ring effect */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-500/30 dark:to-purple-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Avatar className="h-12 w-12 border-2 border-slate-200/50 dark:border-slate-700/50 relative">
                <AvatarImage
                  src={profilePicture?.url}
                  alt={`${user.givenNames} ${user.lastNames}`}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-slate-700 dark:text-slate-100 font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {user.givenNames} {user.lastNames}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                @{user.username}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Shield className="w-3 h-3 text-blue-500/60 dark:text-blue-400/60" />
                <span className="text-xs font-medium text-blue-600/80 dark:text-blue-300/80">
                  {roleName}
                </span>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <Badge className={`
            ${statusStyles.badge}
            text-xs font-semibold whitespace-nowrap
            border border-slate-200/30 dark:border-slate-600/30
          `}>
            {user.isActive ? '✓ Activo' : '○ Inactivo'}
          </Badge>
        </div>
      </CardHeader>

      {/* Content section */}
      <CardContent className="relative z-10 pt-2">
        {/* Separator con gradiente */}
        <div className="mb-3 h-px bg-gradient-to-r from-slate-200/30 via-slate-200/50 to-slate-200/30 dark:from-slate-700/30 dark:via-slate-700/50 dark:to-slate-700/30" />

        {/* Email */}
        <div className="flex items-center gap-2.5 mb-2 group/item">
          <div className="w-5 h-5 rounded-lg bg-blue-100/60 dark:bg-blue-900/40 flex items-center justify-center group-hover/item:bg-blue-200/80 dark:group-hover/item:bg-blue-900/60 transition-colors duration-300">
            <Mail className="w-3 h-3 text-blue-600 dark:text-blue-300" />
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-1.5">
            <span className="text-sm text-slate-600 dark:text-slate-300 truncate font-medium">
              {user.email}
            </span>
            {user.accountVerified && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Phone */}
        {user.phone && (
          <div className="flex items-center gap-2.5 mb-2 group/item">
            <div className="w-5 h-5 rounded-lg bg-purple-100/60 dark:bg-purple-900/40 flex items-center justify-center group-hover/item:bg-purple-200/80 dark:group-hover/item:bg-purple-900/60 transition-colors duration-300">
              <Phone className="w-3 h-3 text-purple-600 dark:text-purple-300" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {user.phone}
            </span>
          </div>
        )}

        {/* Access Status */}
        <div className="flex items-center gap-2 mb-2 text-sm">
          <div className={`w-2.5 h-2.5 rounded-full ${statusStyles.dot} animate-pulse`} />
          <span className={`${statusStyles.statusText} text-xs font-medium`}>
            {user.canAccessPlatform ? 'Acceso permitido' : 'Acceso restringido'}
          </span>
        </div>

        {/* DPI */}
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 pl-0 font-mono tracking-wider">
          ID: {user.dpi}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-200/30 dark:border-slate-700/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails?.(user)}
            disabled={isLoading}
            className="flex-1 h-9 text-xs font-semibold 
              bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950/40 dark:to-blue-950/20
              text-blue-700 dark:text-blue-300
              hover:from-blue-100 hover:to-blue-100/60 dark:hover:from-blue-900/60 dark:hover:to-blue-900/30
              border border-blue-200/30 dark:border-blue-800/30
              hover:border-blue-300/60 dark:hover:border-blue-700/60
              transition-all duration-300
              group/btn
            "
          >
            <Eye className="w-3.5 h-3.5 mr-1 group-hover/btn:scale-110 transition-transform" />
            Ver
          </Button>
          
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(user)}
              disabled={isLoading}
              className="flex-1 h-9 text-xs font-semibold
                bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-950/40 dark:to-amber-950/20
                text-amber-700 dark:text-amber-300
                hover:from-amber-100 hover:to-amber-100/60 dark:hover:from-amber-900/60 dark:hover:to-amber-900/30
                border border-amber-200/30 dark:border-amber-800/30
                hover:border-amber-300/60 dark:hover:border-amber-700/60
                transition-all duration-300
                group/btn
              "
            >
              <Edit className="w-3.5 h-3.5 mr-1 group-hover/btn:scale-110 transition-transform" />
              Editar
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(user)}
              disabled={isLoading}
              className="flex-1 h-9 text-xs font-semibold
                bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/40 dark:to-red-950/20
                text-red-700 dark:text-red-300
                hover:from-red-100 hover:to-red-100/60 dark:hover:from-red-900/60 dark:hover:to-red-900/30
                border border-red-200/30 dark:border-red-800/30
                hover:border-red-300/60 dark:hover:border-red-700/60
                transition-all duration-300
                group/btn
              "
            >
              <Trash2 className="w-3.5 h-3.5 mr-1 group-hover/btn:scale-110 transition-transform" />
              Eliminar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}