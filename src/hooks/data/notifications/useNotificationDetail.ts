// src/hooks/data/notifications/useNotificationDetail.ts
import { useState, useEffect, useCallback } from 'react';
import { notificationsService } from '@/services/notifications.service';
import { NotificationWithRelations } from '@/types/notifications.types';

export function useNotificationDetail(notificationId: number | null) {
  const [data, setData] = useState<NotificationWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!notificationId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadNotification = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await notificationsService.getNotificationById(notificationId);
        
        if (isMounted) {
          setData(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error al cargar la notificación');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNotification();

    return () => {
      isMounted = false;
    };
  }, [notificationId, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return { data, isLoading, error, refresh };
}
