// src/schemas/notification.schema.ts
import { z } from 'zod';

export const createNotificationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  message: z.string().min(1).max(5000).optional(),
  templateId: z.number().int().positive().optional(),
  templateVariables: z.record(z.any()).optional(),
  type: z.enum(['GRADE_PUBLISHED', 'ATTENDANCE_ALERT', 'ASSIGNMENT_DUE', 'SYSTEM_ALERT', 'CUSTOM']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).default('NORMAL'),
  metadata: z.record(z.any()).optional(),
  scheduleFor: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
}).refine(
  (data) => data.title || data.message || data.templateId,
  { message: 'Debes proporcionar title, message o templateId' }
);

export const sendNotificationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  message: z.string().min(1).max(5000).optional(),
  templateId: z.number().int().positive().optional(),
  templateVariables: z.record(z.any()).optional(),
  type: z.enum(['GRADE_PUBLISHED', 'ATTENDANCE_ALERT', 'ASSIGNMENT_DUE', 'SYSTEM_ALERT', 'CUSTOM']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']),
  metadata: z.record(z.any()).optional(),
  scheduleFor: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  recipients: z.object({
    userIds: z.array(z.number().int().positive()).optional(),
    roleIds: z.array(z.number().int().positive()).optional(),
    sendToAll: z.boolean(),
  }).refine(
    (data) => data.userIds?.length || data.roleIds?.length || data.sendToAll,
    { message: 'Debes especificar userIds, roleIds o sendToAll=true' }
  ),
  channels: z.array(z.enum(['IN_APP', 'EMAIL', 'SMS', 'PUSH', 'WHATSAPP'])).optional(),
}).refine(
  (data) => data.title || data.message || data.templateId,
  { message: 'Debes proporcionar title, message o templateId' }
);

export const updatePreferenceSchema = z.object({
  enableAlerts: z.boolean().optional(),
  enableReminders: z.boolean().optional(),
  enableGrades: z.boolean().optional(),
  enableAssignment: z.boolean().optional(),
  enableAttendance: z.boolean().optional(),
  enableInfo: z.boolean().optional(),
  enableCustom: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  digestFrequency: z.enum(['IMMEDIATE', 'DAILY', 'WEEKLY', 'NEVER']).optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type UpdatePreferenceInput = z.infer<typeof updatePreferenceSchema>;
