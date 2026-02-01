/**
 * src/app/(admin)/(management)/notifications/components/NotificationsList.tsx
 * 
 * Lista central de notificaciones con estilo Gmail/Slack
 * Muestra avatar, remitente, asunto, preview y timestamp
 */

'use client';

import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Notification, NotificationRecipient } from '@/types/notifications.types';

interface NotificationsListProps {
  notifications: Notification[];
  selectedId?: number;
  onSelect: (notification: Notification) => void;
  onToggleStar: (notificationId: number) => Promise<void>;
  isLoading?: boolean;
}

const getAvatarColor = (type: string): string => {
  const colors: Record<string, string> = {
    GRADE: '#007bff',
    EXAM: '#ff9800',
    COURSE: '#4caf50',
    SYSTEM: '#4caf50',
    SCHEDULE: '#f44336',
    ASSIGNMENT: '#9c27b0',
    DOCUMENT: '#2196f3',
  };
  return colors[type] || '#999';
};

const getAvatarLabel = (notification: Notification): string => {
  const typeMap: Record<string, string> = {
    GRADE: 'G',
    EXAM: 'E',
    COURSE: 'C',
    SYSTEM: 'S',
    SCHEDULE: 'H',
    ASSIGNMENT: 'T',
    DOCUMENT: 'D',
  };
  return typeMap[notification.type] || 'N';
};

export function NotificationsList({
  notifications,
  selectedId,
  onSelect,
  onToggleStar,
  isLoading,
}: NotificationsListProps) {
  const [starred, setStarred] = useState<Set<number>>(new Set());
  const [loadingStar, setLoadingStar] = useState<number | null>(null);

  const handleToggleStar = async (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    setLoadingStar(notificationId);
    try {
      await onToggleStar(notificationId);
      setStarred((prev) => {
        const newStarred = new Set(prev);
        if (newStarred.has(notificationId)) {
          newStarred.delete(notificationId);
        } else {
          newStarred.add(notificationId);
        }
        return newStarred;
      });
    } catch (error) {
      console.error('Error toggling star:', error);
    } finally {
      setLoadingStar(null);
    }
  };

  const getUnreadStatus = (notification: Notification): boolean => {
    // Asumiendo que los recipients están disponibles en la notificación
    // Revisar si existe un recipient para el usuario actual que esté UNREAD
    return false; // Por ahora false, se actualizará cuando se implemente el estado global
  };

  const formatTimeAgo = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, {
        addSuffix: false,
        locale: es,
      });
    } catch {
      return 'Hace poco';
    }
  };

  const getPreviewText = (notification: Notification): string => {
    const message = notification.message || '';
    return message.length > 60 ? message.substring(0, 60) + '...' : message;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">Cargando notificaciones...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
        <p className="text-lg font-medium">No hay notificaciones</p>
        <p className="text-sm">Tu bandeja de entrada está vacía</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto border-r border-gray-200">
      {notifications.map((notification) => {
        const isSelected = selectedId === notification.id;
        const isUnread = getUnreadStatus(notification);
        const isStar = starred.has(notification.id);

        return (
          <div
            key={notification.id}
            onClick={() => onSelect(notification)}
            className={`
              px-4 py-3 border-b border-gray-100 cursor-pointer transition-all
              ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}
              ${isUnread ? 'bg-blue-50 font-medium' : ''}
              flex gap-3 items-start
            `}
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: getAvatarColor(notification.type) }}
            >
              {getAvatarLabel(notification)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header: From and Time */}
              <div className="flex justify-between items-baseline gap-2 mb-1">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {notification.createdBy ? `${notification.createdBy.givenNames} ${notification.createdBy.lastNames}` : 'Sistema'}
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatTimeAgo(notification.createdAt)}
                </span>
              </div>

              {/* Subject */}
              <div className="text-sm text-gray-800 font-medium mb-1 truncate">
                {notification.title || 'Sin título'}
              </div>

              {/* Preview */}
              <div className="text-xs text-gray-600 truncate">
                {getPreviewText(notification)}
              </div>
            </div>

            {/* Star Button */}
            <button
              onClick={(e) => handleToggleStar(e, notification.id)}
              disabled={loadingStar === notification.id}
              className={`
                text-lg flex-shrink-0 transition-all
                ${isStar ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}
                ${loadingStar === notification.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {isStar ? '★' : '☆'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
