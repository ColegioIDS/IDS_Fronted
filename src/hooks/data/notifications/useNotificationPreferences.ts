// src/hooks/data/notifications/useNotificationPreferences.ts
import { useState, useEffect, useCallback } from 'react';
import { notificationsService } from '@/services/notifications.service';
import { NotificationPreference, UpdatePreferenceDto } from '@/types/notifications.types';

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await notificationsService.getMyPreferences();
      setPreferences(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar preferencias');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const updatePreferences = useCallback(async (data: UpdatePreferenceDto) => {
    try {
      setIsUpdating(true);
      setError(null);
      const result = await notificationsService.updateMyPreferences(data);
      setPreferences(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al actualizar preferencias';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const unsubscribe = useCallback(async (reason?: string) => {
    try {
      setIsUpdating(true);
      setError(null);
      await notificationsService.unsubscribe(reason);
      await loadPreferences();
    } catch (err: any) {
      const errorMsg = err.message || 'Error al desuscribirse';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  }, [loadPreferences]);

  const resubscribe = useCallback(async () => {
    try {
      setIsUpdating(true);
      setError(null);
      const result = await notificationsService.resubscribe();
      setPreferences(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al resuscribirse';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    preferences,
    isLoading,
    error,
    isUpdating,
    updatePreferences,
    unsubscribe,
    resubscribe,
    refresh: loadPreferences,
  };
}
