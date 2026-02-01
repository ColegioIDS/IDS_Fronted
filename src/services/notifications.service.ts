// src/services/notifications.service.ts
import { api } from '@/config/api';
import {
  Notification,
  NotificationWithRelations,
  NotificationsQuery,
  PaginatedNotifications,
  CreateNotificationDto,
  SendNotificationDto,
  NotificationPreference,
  UpdatePreferenceDto,
  PaginatedPreferences,
  PreferencesQuery,
  NotificationSendResult,
  NotificationStats,
  NotificationTemplate,
} from '@/types/notifications.types';

export const notificationsService = {
  /**
   * Obtener notificaciones paginadas con filtros
   */
  async getNotifications(query: NotificationsQuery = {}): Promise<PaginatedNotifications> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.type) params.append('type', query.type);
    if (query.priority) params.append('priority', query.priority);
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await api.get(`/api/notifications?${params.toString()}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener notificaciones');
    }

    // ⭐ Manejar AMBAS estructuras de respuesta
    // Formato nuevo: response.data.data = items[], response.data.meta = {...}
    // Formato antiguo: response.data.data.data = items[], response.data.data.total, etc.
    
    let data: any[] = [];
    let meta: any = {
      page: query.page || 1,
      limit: query.limit || 10,
      total: 0,
      totalPages: 0,
    };

    if (response.data.meta) {
      // Nuevo formato con meta
      data = Array.isArray(response.data.data) ? response.data.data : [];
      meta = response.data.meta;
    } else if (response.data.data?.data) {
      // Formato antiguo anidado: data.data.data
      data = Array.isArray(response.data.data.data) ? response.data.data.data : [];
      meta = {
        page: response.data.data.page || query.page || 1,
        limit: response.data.data.limit || query.limit || 10,
        total: response.data.data.total || 0,
        totalPages: response.data.data.totalPages || 0,
      };
    }

    return { data, meta };
  },

  /**
   * Obtener notificación por ID
   */
  async getNotificationById(id: number): Promise<NotificationWithRelations> {
    const response = await api.get(`/api/notifications/${id}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener la notificación');
    }

    if (!response.data.data) {
      throw new Error('Notificación no encontrada');
    }

    return response.data.data;
  },

  /**
   * Crear notificación
   */
  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    const response = await api.post('/api/notifications', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear la notificación');
    }

    return response.data.data;
  },

  /**
   * Enviar notificación masiva
   */
  async sendNotification(data: SendNotificationDto): Promise<NotificationSendResult> {
    const response = await api.post('/api/notifications/send', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al enviar la notificación');
    }

    return response.data.data;
  },

  /**
   * Enviar una notificación que ya fue creada
   */
  async sendExistingNotification(
    notificationId: number,
    recipients: {
      userIds?: number[];
      roleIds?: number[];
      sendToAll: boolean;
    },
    channels?: string[],
  ): Promise<NotificationSendResult> {
    const response = await api.post(`/api/notifications/${notificationId}/send-existing`, {
      recipients,
      channels,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al enviar la notificación');
    }

    return response.data.data;
  },

  /**
   * Actualizar notificación
   */
  async updateNotification(id: number, data: Partial<CreateNotificationDto>): Promise<Notification> {
    const response = await api.patch(`/api/notifications/${id}`, data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar la notificación');
    }

    return response.data.data;
  },

  /**
   * Activar notificación
   */
  async activateNotification(id: number): Promise<Notification> {
    const response = await api.patch(`/api/notifications/${id}/activate`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al activar la notificación');
    }

    return response.data.data;
  },

  /**
   * Desactivar notificación
   */
  async deactivateNotification(id: number): Promise<Notification> {
    const response = await api.patch(`/api/notifications/${id}/deactivate`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al desactivar la notificación');
    }

    return response.data.data;
  },

  /**
   * Marcar notificación como leída
   */
  async markAsRead(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/api/notifications/${id}/read`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al marcar como leída');
    }

    return response.data.data;
  },

  /**
   * Eliminar notificación
   */
  async deleteNotification(id: number): Promise<void> {
    const response = await api.delete(`/api/notifications/${id}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar la notificación');
    }
  },

  /**
   * Marcar/desmarcar notificación como favorita
   */
  async toggleStar(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/api/notifications/${id}/star`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al marcar como favorita');
    }

    return response.data.data;
  },

  /**
   * Archivar notificación
   */
  async archive(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/api/notifications/${id}/archive`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al archivar');
    }

    return response.data.data;
  },

  /**
   * Desarchivar notificación
   */
  async unarchive(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/api/notifications/${id}/unarchive`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al desarchivar');
    }

    return response.data.data;
  },

  /**
   * Obtener notificaciones con estrella
   */
  async getStarred(query: NotificationsQuery = {}): Promise<PaginatedNotifications> {
    // Llamar a getNotifications sin parámetros específicos
    // El filtrado de starred debe hacerse en el backend o localmente
    return this.getNotifications({
      page: query.page || 1,
      limit: query.limit || 50,
    });
  },

  /**
   * Obtener notificaciones archivadas
   */
  async getArchived(query: NotificationsQuery = {}): Promise<PaginatedNotifications> {
    // Llamar a getNotifications sin parámetros específicos
    // El filtrado de archivadas debe hacerse en el backend o localmente
    return this.getNotifications({
      page: query.page || 1,
      limit: query.limit || 50,
    });
  },

  /**
   * Obtener notificaciones de basura/eliminadas
   */
  async getTrash(query: NotificationsQuery = {}): Promise<PaginatedNotifications> {
    // Llamar a getNotifications sin parámetros específicos
    // El filtrado de basura debe hacerse en el backend o localmente
    return this.getNotifications({
      page: query.page || 1,
      limit: query.limit || 50,
    });
  },

  /**
   * Obtener notificaciones enviadas (creadas por el usuario actual)
   */
  async getSent(query: NotificationsQuery = {}): Promise<PaginatedNotifications> {
    // Llamar a getNotifications sin parámetros específicos
    // El filtrado de enviadas debe hacerse en el backend o localmente
    return this.getNotifications({
      page: query.page || 1,
      limit: query.limit || 50,
    });
  },

  /**
   * ============================================
   * ESTADÍSTICAS Y RESÚMENES
   * ============================================
   */

  /**
   * Obtener resumen de categorías (conteos por categoría)
   */
  async getCategoriesSummary(): Promise<{ inbox: number; unread: number; starred: number; important: number; archived: number; total: number }> {
    const response = await api.get('/api/notifications/categories/summary');
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener resumen de categorías');
    }

    return response.data.data;
  },

  /**
   * ============================================
   * PREFERENCIAS
   * ============================================
   */

  /**
   * Obtener mis preferencias
   */
  async getMyPreferences(): Promise<NotificationPreference> {
    const response = await api.get('/api/notifications/preferences/my-preferences');
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener tus preferencias');
    }

    return response.data.data;
  },

  /**
   * Actualizar mis preferencias
   */
  async updateMyPreferences(data: UpdatePreferenceDto): Promise<NotificationPreference> {
    const response = await api.patch('/api/notifications/preferences/my-preferences', data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar tus preferencias');
    }

    return response.data.data;
  },

  /**
   * Obtener todas las preferencias (admin only)
   */
  async getAllPreferences(query: PreferencesQuery = {}): Promise<PaginatedPreferences> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.unsubscribed !== undefined) params.append('unsubscribed', query.unsubscribed.toString());

    const response = await api.get(`/api/notifications/preferences?${params.toString()}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener preferencias');
    }

    const data = Array.isArray(response.data.data) ? response.data.data : [];
    const meta = response.data.meta || {
      page: query.page || 1,
      limit: query.limit || 10,
      total: 0,
      totalPages: 0,
    };

    return { data, meta };
  },

  /**
   * Desuscribirse de notificaciones
   */
  async unsubscribe(reason?: string): Promise<void> {
    const response = await api.post('/api/notifications/preferences/unsubscribe', { reason });
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al desuscribirse');
    }
  },

  /**
   * Resuscribirse a notificaciones
   */
  async resubscribe(): Promise<NotificationPreference> {
    const response = await api.post('/api/notifications/preferences/resubscribe');
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al resuscribirse');
    }

    return response.data.data;
  },

  /**
   * Obtener todos los roles disponibles para destinatarios
   */
  async getRoles(): Promise<any> {
    const response = await api.get('/api/notifications/info/roles');
    return response.data.data || response.data;
  },

  /**
   * Obtener todos los usuarios agrupados por su roleType
   */
  async getUsersByRole(): Promise<any> {
    const response = await api.get('/api/notifications/info/users-by-role');
    return response.data.data || response.data;
  },

  /**
   * Obtener log de lectura de una notificación específica
   */
  async getReadLog(notificationId: number, page: number = 1, limit: number = 10): Promise<any> {
    const response = await api.get(`/api/notifications/${notificationId}/read-log`, {
      params: { page, limit },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener log de lectura');
    }

    return response.data.data;
  },
};
