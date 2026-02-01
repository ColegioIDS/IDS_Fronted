/**
 * src/app/(admin)/(management)/notifications/components/NotificationDetailPane.tsx
 * 
 * Panel derecho que muestra detalles completos de una notificación seleccionada
 */

'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Notification } from '@/types/notifications.types';
import { Dialog } from '@/components/ui/dialog';

interface NotificationDetailPaneProps {
  notification: Notification | null;
  canEdit?: boolean;
  canDelete?: boolean;
  onMarkAsRead?: (notificationId: number) => Promise<void>;
  onArchive?: (notificationId: number) => Promise<void>;
  onDelete?: (notificationId: number) => Promise<void>;
}

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-800',
    HIGH: 'bg-red-100 text-red-700',
    NORMAL: 'bg-yellow-100 text-yellow-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    LOW: 'bg-green-100 text-green-700',
  };
  return colors[priority] || colors['NORMAL'];
};

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    GRADE: 'Grado',
    EXAM: 'Evaluación',
    COURSE: 'Curso',
    SYSTEM: 'Sistema',
    SCHEDULE: 'Horario',
    ASSIGNMENT: 'Tarea',
    DOCUMENT: 'Documento',
  };
  return labels[type] || type;
};

export function NotificationDetailPane({
  notification,
  canEdit,
  canDelete,
  onMarkAsRead,
  onArchive,
  onDelete,
}: NotificationDetailPaneProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!notification) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-white">
        <p className="text-lg font-medium">Selecciona una notificación</p>
        <p className="text-sm">para ver los detalles</p>
      </div>
    );
  }

  const handleMarkAsRead = async () => {
    if (!onMarkAsRead) return;
    setIsLoading(true);
    try {
      await onMarkAsRead(notification.id);
    } catch (error) {
      console.error('Error marking as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!onArchive) return;
    setIsLoading(true);
    try {
      await onArchive(notification.id);
    } catch (error) {
      console.error('Error archiving:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsLoading(true);
    try {
      await onDelete(notification.id);
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, {
        addSuffix: true,
        locale: es,
      });
    } catch {
      return 'Fecha desconocida';
    }
  };

  return (
    <div className="w-full h-full bg-white overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {notification.title || 'Sin título'}
            </h1>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${getPriorityColor(notification.priority)}`}>
                {notification.priority === 'HIGH' ? '🔴 ' : notification.priority === 'NORMAL' ? '🟡 ' : '🟢 '} 
                {notification.priority}
              </span>
              <span className="inline-block px-3 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                {getTypeLabel(notification.type)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              De: <span className="font-medium">{notification.createdBy ? `${notification.createdBy.givenNames} ${notification.createdBy.lastNames}` : 'Sistema'}</span> • {formatDate(notification.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {notification.message || 'Sin contenido'}
          </p>
        </div>

        {/* Metadata */}
        {notification.metadata && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Información adicional</h3>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(notification.metadata, null, 2)}
            </pre>
          </div>
        )}

        {/* Schedule Info */}
        {notification.scheduleFor && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Programado para:</strong> {formatDate(notification.scheduleFor)}
            </p>
          </div>
        )}

        {/* Expires Info */}
        {notification.expiresAt && (
          <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-900">
              <strong>Expira:</strong> {formatDate(notification.expiresAt)}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 flex gap-3">
        <button
          onClick={handleMarkAsRead}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {isLoading ? 'Procesando...' : 'Marcar como leído'}
        </button>

        <button
          onClick={handleArchive}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition"
        >
          {isLoading ? 'Procesando...' : 'Archivar'}
        </button>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition"
          >
            {isLoading ? 'Procesando...' : 'Eliminar'}
          </button>
        )}
      </div>
    </div>
  );
}
