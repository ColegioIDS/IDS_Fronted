// src/types/notifications.types.ts

export type NotificationType = 
  | 'GRADE_PUBLISHED' 
  | 'ATTENDANCE_ALERT' 
  | 'ASSIGNMENT_DUE' 
  | 'SYSTEM_ALERT' 
  | 'CUSTOM';

export type DeliveryChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'ARCHIVED' | 'FAILED' | 'CANCELLED';

export type DigestFrequency = 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'NEVER';

// ✅ Notificación base
export interface Notification {
  id: number;
  createdById: number;
  title?: string | null;
  message?: string | null;
  type: NotificationType;
  priority: NotificationPriority;
  sendToAll: boolean;
  targetRoleId?: number | null;
  templateId?: number | null;
  templateVariables?: any | null;
  metadata?: any | null;
  scheduleFor?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  status?: 'SENT' | 'DELIVERED' | 'READ' | 'ARCHIVED'; // ✅ Estado del recipient para el usuario actual
  isStarred?: boolean; // ✅ Si está marcado con estrella
  isArchived?: boolean; // ✅ Si está archivado
  createdBy?: {
    id: number;
    givenNames: string;
    lastNames: string;
    email: string;
    role?: {
      name: string;
      roleType: string;
    };
  };
}

// ✅ Notificación con relaciones
export interface NotificationWithRelations extends Notification {
  recipients: NotificationRecipient[];
  deliveryLogs: NotificationDeliveryLog[];
  createdBy?: {
    id: number;
    givenNames: string;
    lastNames: string;
    email: string;
    role?: {
      name: string;
      roleType: string;
    };
  };
}

// ✅ Destinatario de notificación
export interface NotificationRecipient {
  id: number;
  notificationId: number;
  userId: number;
  status: NotificationStatus;
  readAt?: string | null;
  archivedAt?: string | null;
  sentAt?: string | null;
  isStarred?: boolean;
  isArchived?: boolean;
  user?: {
    id: number;
    givenNames: string;
    lastNames: string;
    email: string;
  };
}

// ✅ Log de entrega
export interface NotificationDeliveryLog {
  id: number;
  notificationId: number;
  userId: number;
  channel: DeliveryChannel;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED';
  errorCode?: string | null;
  errorMessage?: string | null;
  attemptNumber: number;
  sentAt?: string | null;
  deliveredAt?: string | null;
  failedAt?: string | null;
  createdAt: string;
}

// ✅ Preferencia de notificación
export interface NotificationPreference {
  id: number;
  userId: number;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  enableAlerts: boolean;
  enableReminders: boolean;
  enableGrades: boolean;
  enableAssignment: boolean;
  enableAttendance: boolean;
  enableInfo: boolean;
  enableCustom: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  digestFrequency: DigestFrequency;
  unsubscribedAt?: string | null;
  unsubscribeReason?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    givenNames: string;
    lastNames: string;
    email: string;
    fullName?: string;
    role?: {
      id: number;
      name: string;
      roleType: string;
    };
  };
}

// ✅ Template de notificación
export interface NotificationTemplate {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  titleTemplate?: string | null;
  messageTemplate?: string | null;
  type: NotificationType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ✅ Queries y filters
export interface NotificationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'priority' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface PreferencesQuery {
  page?: number;
  limit?: number;
  unsubscribed?: boolean;
}

// ✅ Respuestas paginadas
export interface PaginatedNotifications {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedPreferences {
  data: NotificationPreference[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ DTOs para creación/actualización
export interface CreateNotificationDto {
  title?: string;
  message?: string;
  templateId?: number;
  templateVariables?: Record<string, any>;
  type?: NotificationType;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
  scheduleFor?: string;
  expiresAt?: string;
}

export interface SendNotificationDto {
  title?: string;
  message?: string;
  templateId?: number;
  templateVariables?: Record<string, any>;
  type?: NotificationType;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  scheduleFor?: string;
  expiresAt?: string;
  recipients: {
    userIds?: number[];
    roleIds?: number[];
    sendToAll: boolean;
  };
  channels?: DeliveryChannel[];
}

export interface UpdatePreferenceDto {
  enableAlerts?: boolean;
  enableReminders?: boolean;
  enableGrades?: boolean;
  enableAssignment?: boolean;
  enableAttendance?: boolean;
  enableInfo?: boolean;
  enableCustom?: boolean;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
  whatsappEnabled?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  digestFrequency?: DigestFrequency;
}

// ✅ Resultado de envío
export interface NotificationSendResult {
  notificationId: number;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  channels: DeliveryChannel[];
  scheduledFor?: string;
  timestamp: string;
}

// ✅ Estadísticas
export interface NotificationStats {
  totalRecipients: number;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  failureRate: number;
  averageTimeToRead?: number;
  timestamp: string;
}
