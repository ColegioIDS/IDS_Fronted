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
}

const priorityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  NORMAL: 'bg-gray-100 text-gray-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const typeColors = {
  GRADE_PUBLISHED: 'bg-green-100 text-green-800',
  ATTENDANCE_ALERT: 'bg-yellow-100 text-yellow-800',
  ASSIGNMENT_DUE: 'bg-purple-100 text-purple-800',
  SYSTEM_ALERT: 'bg-red-100 text-red-800',
  CUSTOM: 'bg-indigo-100 text-indigo-800',
};

export function NotificationCard({
  notification,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
}: NotificationCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{notification.title || 'Sin título'}</CardTitle>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge className={priorityColors[notification.priority] + ' border-0'}>
                {notification.priority}
              </Badge>
              <Badge className={typeColors[notification.type] + ' border-0'}>
                {notification.type}
              </Badge>
              {notification.isActive ? (
                <Badge className="bg-green-100 text-green-800 border-0">Activa</Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800 border-0">Inactiva</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notification.message && (
            <p className="text-sm text-gray-600 line-clamp-3">{notification.message}</p>
          )}
          
          <div className="text-xs text-gray-500 space-y-1">
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
              <div className="pt-2 border-t mt-2">
                <p className="text-gray-600 font-medium">
                  {notification.createdBy.givenNames} {notification.createdBy.lastNames}
                </p>
                {notification.createdBy.role && (
                  <Badge className="bg-indigo-100 text-indigo-800 border-0 text-xs mt-1">
                    {notification.createdBy.role.name}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap pt-2 border-t">
            {onView && (
              <Button size="sm" variant="outline" onClick={() => onView(notification.id)}>
                <Eye className="w-4 h-4 mr-1" /> Ver
              </Button>
            )}
            {onEdit && (
              <Button size="sm" variant="outline" onClick={() => onEdit(notification.id)}>
                <Edit className="w-4 h-4 mr-1" /> Editar
              </Button>
            )}
            {notification.isActive && onDeactivate && (
              <Button size="sm" variant="outline" onClick={() => onDeactivate(notification.id)}>
                <X className="w-4 h-4 mr-1" /> Desactivar
              </Button>
            )}
            {!notification.isActive && onActivate && (
              <Button size="sm" variant="outline" onClick={() => onActivate(notification.id)}>
                <Check className="w-4 h-4 mr-1" /> Activar
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => onDelete(notification.id)}>
                <Trash2 className="w-4 h-4 mr-1" /> Eliminar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
