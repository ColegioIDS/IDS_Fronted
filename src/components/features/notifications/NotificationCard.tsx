// src/components/features/notifications/NotificationCard.tsx
'use client';

import { Notification } from '@/types/notifications.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Edit, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationCardProps {
  notification: Notification;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onActivate?: (id: number) => void;
  onDeactivate?: (id: number) => void;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canActivate?: boolean;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  NORMAL: 'bg-muted text-muted-foreground',
  HIGH: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
};

const typeColors: Record<string, string> = {
  GRADE_PUBLISHED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  ATTENDANCE_ALERT: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  ASSIGNMENT_DUE: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300',
  SYSTEM_ALERT: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  CUSTOM: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300',
};

export function NotificationCard({
  notification,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  canView = true,
  canEdit = true,
  canDelete = true,
  canActivate = true,
}: NotificationCardProps) {
  const priorityClass = priorityColors[notification.priority] ?? priorityColors.NORMAL;
  const typeClass = typeColors[notification.type] ?? typeColors.CUSTOM;

  return (
    <Card className="overflow-hidden border shadow-sm transition-shadow hover:shadow-md dark:border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 text-foreground">{notification.title || 'Sin título'}</CardTitle>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="secondary" className={`border-0 text-xs font-medium ${priorityClass}`}>
                {notification.priority}
              </Badge>
              <Badge variant="secondary" className={`border-0 text-xs font-medium ${typeClass}`}>
                {notification.type}
              </Badge>
              {notification.isActive ? (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-0">Activa</Badge>
              ) : (
                <Badge variant="secondary" className="border-0">Inactiva</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notification.message && (
            <p className="text-sm text-muted-foreground line-clamp-3">{notification.message}</p>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Destinatarios: {notification.sendToAll ? 'Todos' : 'Seleccionados'}</p>
            <p>
              Creada: {format(new Date(notification.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
            </p>
            {notification.scheduleFor && (
              <p>
                Programada: {format(new Date(notification.scheduleFor), 'dd MMM yyyy HH:mm', { locale: es })}
              </p>
            )}
            {notification.createdBy && (
              <div className="pt-2 border-t border-border mt-2">
                <p className="text-foreground/90 font-medium">
                  {notification.createdBy.givenNames} {notification.createdBy.lastNames}
                </p>
                {notification.createdBy.role && (
                  <Badge variant="secondary" className="border-0 text-xs mt-1 bg-primary/10 text-primary">
                    {notification.createdBy.role.name}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
            {onView && canView && (
              <Button size="sm" variant="outline" onClick={() => onView(notification.id)}>
                <Eye className="w-4 h-4 mr-1" /> Ver
              </Button>
            )}
            {onEdit && canEdit && (
              <Button size="sm" variant="outline" onClick={() => onEdit(notification.id)}>
                <Edit className="w-4 h-4 mr-1" /> Editar
              </Button>
            )}
            {notification.isActive && onDeactivate && canActivate && (
              <Button size="sm" variant="outline" onClick={() => onDeactivate(notification.id)}>
                <X className="w-4 h-4 mr-1" /> Desactivar
              </Button>
            )}
            {!notification.isActive && onActivate && canActivate && (
              <Button size="sm" variant="outline" onClick={() => onActivate(notification.id)}>
                <Check className="w-4 h-4 mr-1" /> Activar
              </Button>
            )}
            {onDelete && canDelete && (
              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(notification.id)}>
                <Trash2 className="w-4 h-4 mr-1" /> Eliminar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
