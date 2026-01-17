// src/hooks/data/notifications/useSendNotification.ts
import { useState, useCallback } from 'react';
import { notificationsService } from '@/services/notifications.service';
import { SendNotificationDto, NotificationSendResult } from '@/types/notifications.types';

export function useSendNotification() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NotificationSendResult | null>(null);

  const send = useCallback(async (data: SendNotificationDto) => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      const sendResult = await notificationsService.sendNotification(data);
      setResult(sendResult);
      return sendResult;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al enviar la notificación';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return { isLoading, error, result, send, reset };
}
