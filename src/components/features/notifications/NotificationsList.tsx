/**
 * src/components/features/notifications/NotificationsList.tsx
 * 
 * Lista central de notificaciones con estilo Gmail/Slack
 * Muestra avatar, remitente, asunto, preview y timestamp
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Notification, NotificationRecipient } from '@/types/notifications.types';
import { Star } from 'lucide-react';

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

  // Sync starred state with API data whenever notifications change
  useEffect(() => {
    const starredIds = new Set<number>();
    notifications.forEach((notification) => {
      if (notification.isStarred === true) {
        starredIds.add(notification.id);
      }
    });
    setStarred(starredIds);
  }, [notifications]);

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
    // Una notificación está no leída si su status no es READ
    return notification.status !== 'READ' && notification.status !== 'ARCHIVED';
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
    <div className="w-full h-full overflow-y-auto border-r border-gray-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
      {notifications.map((notification) => {
        const isSelected = selectedId === notification.id;
        const isUnread = getUnreadStatus(notification);
        // Use API data as source of truth, fallback to local state for optimistic updates
        const isStar = notification.isStarred === true || starred.has(notification.id);

        return (
          <div
            key={notification.id}
            onClick={() => onSelect(notification)}
            className={`
              px-4 py-3 border-b border-gray-100 dark:border-slate-800 cursor-pointer transition-all
              ${isSelected 
                ? 'bg-blue-600 dark:bg-blue-700 border-l-4 border-l-blue-700 text-white shadow-md' 
                : isUnread 
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-300' 
                  : 'hover:bg-gray-50 dark:hover:bg-slate-800'
              }
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
                <div className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : isUnread ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-700 dark:text-slate-300'}`}>
                  {notification.createdBy ? `${notification.createdBy.givenNames} ${notification.createdBy.lastNames}`.trim() : 'Sistema'}
                </div>
                <span className={`text-xs flex-shrink-0 ${isSelected ? 'text-blue-100' : isUnread ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-slate-400'}`}>
                  {formatTimeAgo(notification.createdAt)}
                </span>
              </div>

              {/* Subject */}
              <div className={`text-sm mb-1 truncate ${isSelected ? 'text-white' : isUnread ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-700 dark:text-slate-300 font-medium'}`}>
                {notification.title || 'Sin título'}
              </div>

              {/* Preview */}
              <div className={`text-xs truncate ${isSelected ? 'text-blue-100' : isUnread ? 'text-gray-700 dark:text-slate-400' : 'text-gray-600 dark:text-slate-400'}`}>
                {getPreviewText(notification)}
              </div>
            </div>

            {/* Unread indicator + Star Button */}
            <div className="flex gap-2 items-start flex-shrink-0">
              {isUnread && !isSelected && (
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              )}
              <button
                onClick={(e) => handleToggleStar(e, notification.id)}
                disabled={loadingStar === notification.id}
                className={`
                  flex-shrink-0 transition-all p-1.5
                  ${isSelected 
                    ? 'text-blue-100 hover:text-white' 
                    : isStar 
                      ? 'text-yellow-500' 
                      : 'text-gray-400 dark:text-slate-500 hover:text-yellow-400'
                  }
                  ${loadingStar === notification.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Star size={18} fill={isStar ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
