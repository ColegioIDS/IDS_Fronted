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
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canActivate?: boolean;
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
  canView = true,
  canEdit = true,
  canDelete = true,
  canActivate = true,
}: NotificationsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-muted/50 animate-pulse border" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-16 px-4">
        <p className="text-muted-foreground text-center">No se encontraron notificaciones</p>
        <p className="text-sm text-muted-foreground mt-1">Crea una o ajusta los filtros</p>
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
            canView={canView}
            canEdit={canEdit}
            canDelete={canDelete}
            canActivate={canActivate}
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
