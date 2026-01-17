// src/hooks/data/notifications/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { notificationsService } from '@/services/notifications.service';
import { Notification, NotificationsQuery, PaginatedNotifications } from '@/types/notifications.types';

export function useNotifications(initialQuery: NotificationsQuery = {}) {
  const [data, setData] = useState<PaginatedNotifications | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<NotificationsQuery>(initialQuery);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await notificationsService.getNotifications(query);
        
        if (isMounted) {
          setData(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error al cargar notificaciones');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [
    query.page,
    query.limit,
    query.search,
    query.type,
    query.priority,
    query.isActive,
    query.sortBy,
    query.sortOrder,
    refreshKey,
  ]);

  const updateQuery = useCallback((newQuery: Partial<NotificationsQuery>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return { data, isLoading, error, query, updateQuery, refresh };
}
