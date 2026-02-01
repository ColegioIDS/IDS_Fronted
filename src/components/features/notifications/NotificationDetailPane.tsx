/**
 * src/components/features/notifications/NotificationDetailPane.tsx
 * 
 * Panel derecho que muestra detalles completos de una notificación seleccionada
 */

'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Notification } from '@/types/notifications.types';
import { Dialog } from '@/components/ui/dialog';
import { CheckCircle, Archive, Trash2, AlertCircle } from 'lucide-react';

interface NotificationDetailPaneProps {
  notification: Notification | null;
  canEdit?: boolean;
  canDelete?: boolean;
  onMarkAsRead?: (notificationId: number, showToast?: boolean) => Promise<void>;
  onArchive?: (notificationId: number) => Promise<void>;
  onUnarchive?: (notificationId: number) => Promise<void>;
  onDelete?: (notificationId: number) => Promise<void>;
}

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    HIGH: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    NORMAL: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    MEDIUM: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    LOW: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
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
  onUnarchive,
  onDelete,
}: NotificationDetailPaneProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!notification) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        <AlertCircle size={48} className="mb-4 text-gray-400 dark:text-slate-500" />
        <p className="text-lg font-medium">Selecciona una notificación</p>
        <p className="text-sm">para ver los detalles</p>
      </div>
    );
  }

  const handleMarkAsRead = async () => {
    if (!onMarkAsRead) return;
    setIsLoading(true);
    try {
      await onMarkAsRead(notification.id, true);
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
    <div className="w-full h-full bg-white dark:bg-slate-900 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {notification.title || 'Sin título'}
            </h1>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${getPriorityColor(notification.priority)}`}>
                <AlertCircle className="inline-block mr-1" size={14} />
                {notification.priority === 'HIGH' ? 'ALTA' : notification.priority === 'NORMAL' ? 'NORMAL' : 'BAJA'}
              </span>
              <span className="inline-block px-3 py-1 rounded text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                {getTypeLabel(notification.type)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              De: <span className="font-medium text-gray-900 dark:text-white">{notification.createdBy ? `${notification.createdBy.givenNames} ${notification.createdBy.lastNames}`.trim() : 'Sistema'}</span> • {formatDate(notification.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {notification.message || 'Sin contenido'}
          </p>
        </div>

        {/* Metadata */}
        {notification.metadata && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Información adicional</h3>
            <pre className="text-xs text-gray-600 dark:text-slate-300 overflow-auto">
              {JSON.stringify(notification.metadata, null, 2)}
            </pre>
          </div>
        )}

        {/* Schedule Info */}
        {notification.scheduleFor && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>Programado para:</strong> {formatDate(notification.scheduleFor)}
            </p>
          </div>
        )}

        {/* Expires Info */}
        {notification.expiresAt && (
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-900 dark:text-orange-300">
              <strong>Expira:</strong> {formatDate(notification.expiresAt)}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 dark:border-slate-800 flex gap-3">
        {notification.status !== 'READ' && (
          <button
            onClick={handleMarkAsRead}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            {isLoading ? 'Procesando...' : 'Marcar como leído'}
          </button>
        )}

        {notification.status === 'READ' && (
          <div className="flex-1 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-300 rounded-lg font-medium flex items-center justify-center gap-2 border border-green-200 dark:border-green-800">
            <CheckCircle size={18} />
            Leído
          </div>
        )}

        <button
          onClick={notification.isArchived ? () => onUnarchive?.(notification.id) : handleArchive}
          disabled={isLoading}
          className={`flex-1 px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition flex items-center justify-center gap-2 ${
            notification.isArchived
              ? 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
              : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600'
          }`}
        >
          <Archive size={18} />
          {isLoading ? 'Procesando...' : notification.isArchived ? 'Desarchiver' : 'Archivar'}
        </button>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            {isLoading ? 'Procesando...' : 'Eliminar'}
          </button>
        )}
      </div>
    </div>
  );
}
