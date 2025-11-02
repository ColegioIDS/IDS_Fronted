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
  Lock,
  CheckCircle2,
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
  const roleName = isUserWithRelations(user) ? user.role.name : 'N/A';
  const pictures = isUserWithRelations(user) ? user.pictures || [] : [];
  const profilePicture = pictures?.find((p) => p.kind === 'profile');

  // Get initials for avatar
  const getInitials = () => {
    const given = user.givenNames?.split(' ')[0]?.[0] || '';
    const last = user.lastNames?.split(' ')[0]?.[0] || '';
    return `${given}${last}`.toUpperCase();
  };

  // Get status badge styles
  const getStatusColor = () => {
    if (!user.isActive) {
      return {
        bg: 'bg-slate-50 dark:bg-slate-800/50',
        badge: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
        label: 'Inactivo',
      };
    }
    return {
      bg: 'bg-white dark:bg-slate-900',
      badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      label: 'Activo',
    };
  };

  const statusColor = getStatusColor();

  return (
    <Card
      className={`${statusColor.bg} border transition-all hover:shadow-md dark:border-slate-800 ${
        !user.isActive ? 'opacity-75' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 border-2 border-slate-200 dark:border-slate-700">
              <AvatarImage src={profilePicture?.url} alt={`${user.givenNames} ${user.lastNames}`} />
              <AvatarFallback className="dark:bg-slate-700 dark:text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {user.givenNames} {user.lastNames}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                @{user.username}
              </p>
            </div>
          </div>
          <Badge className={statusColor.badge} variant="secondary">
            {statusColor.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Role */}
        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-slate-700 dark:text-slate-300">{roleName}</span>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 text-sm min-w-0">
          <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="text-slate-600 dark:text-slate-400 truncate">{user.email}</span>
          {user.accountVerified && (
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          )}
        </div>

        {/* Phone */}
        {user.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="text-slate-600 dark:text-slate-400">{user.phone}</span>
          </div>
        )}

        {/* Access Status */}
        <div className="flex items-center gap-2 text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
          {user.canAccessPlatform ? (
            <>
              <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-slate-600 dark:text-slate-400">Con acceso</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span className="text-slate-600 dark:text-slate-400">Sin acceso</span>
            </>
          )}
        </div>

        {/* DPI */}
        <div className="text-xs text-slate-500 dark:text-slate-400">
          DPI: {user.dpi}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(user)}
            disabled={isLoading}
            className="flex-1 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(user)}
              disabled={isLoading}
              className="flex-1 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(user)}
              disabled={isLoading}
              className="flex-1 dark:border-red-600/50 dark:text-red-400 dark:hover:bg-red-950/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
