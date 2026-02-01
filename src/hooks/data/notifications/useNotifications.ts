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

  /**
   * Marcar/desmarcar notificación como favorita (star)
   * Actualiza el estado local inmediatamente, luego sincroniza con el backend
   */
  const toggleStar = useCallback(async (notificationId: number) => {
    try {
      // Optimistic update: actualizar inmediatamente en el estado local
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((n) =>
            n.id === notificationId ? { ...n, isStarred: !n.isStarred } : n
          ),
        };
      });

      // Llamar al backend
      await notificationsService.toggleStar(notificationId);
    } catch (err: any) {
      // Si hay error, revertir el cambio local
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((n) =>
            n.id === notificationId ? { ...n, isStarred: !n.isStarred } : n
          ),
        };
      });
      throw err;
    }
  }, []);

  /**
   * Archivar notificación
   * Actualiza el estado local inmediatamente, luego sincroniza con el backend
   */
  const archive = useCallback(async (notificationId: number) => {
    try {
      // Optimistic update
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((n) =>
            n.id === notificationId ? { ...n, isArchived: true } : n
          ),
        };
      });

      // Llamar al backend
      await notificationsService.archive(notificationId);
    } catch (err: any) {
      // Si hay error, revertir el cambio local
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((n) =>
            n.id === notificationId ? { ...n, isArchived: false } : n
          ),
        };
      });
      throw err;
    }
  }, []);

  /**
   * Desarchivar notificación
   * Actualiza el estado local inmediatamente, luego sincroniza con el backend
   */
  const unarchive = useCallback(async (notificationId: number) => {
    try {
      // Optimistic update
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((n) =>
            n.id === notificationId ? { ...n, isArchived: false } : n
          ),
        };
      });

      // Llamar al backend
      await notificationsService.unarchive(notificationId);
    } catch (err: any) {
      // Si hay error, revertir el cambio local
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((n) =>
            n.id === notificationId ? { ...n, isArchived: true } : n
          ),
        };
      });
      throw err;
    }
  }, []);

  return { data, isLoading, error, query, updateQuery, refresh, toggleStar, archive, unarchive };
}
