// src/components/features/notifications/NotificationsGrid.tsx
'use client';

import { Notification } from '@/types/notifications.types';
import { NotificationCard } from './NotificationCard';
import { Pagination } from '@/components/shared/pagination/Pagination';

interface NotificationsGridProps {
  notifications: Notification[];
  isLoading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onActivate?: (id: number) => void;
  onDeactivate?: (id: number) => void;
}

export function NotificationsGrid({
  notifications,
  isLoading,
  total,
  page,
  limit,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
}: NotificationsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontraron notificaciones</p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          disabled={isLoading}
        />
      )}
    </div>
  );
}
