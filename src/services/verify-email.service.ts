// src/services/verify-email.service.ts
import { api, publicApi } from '@/config/api';
import {
  EmailVerificationStatus,
  PaginatedUnverifiedUsers,
  VerificationStats,
  VerifyEmailQuery,
  VerifyEmailRequest,
  VerifyEmailResponse,
  RequestVerificationResponse,
} from '@/types/verify-email.types';

export const verifyEmailService = {
  /**
   * 📧 POST /verify-email/request
   * Solicitar verificación de email para el usuario autenticado
   */
  async requestVerification(): Promise<RequestVerificationResponse> {
    const response = await api.post('/api/verify-email/request', {});

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al solicitar verificación');
    }

    return response.data.data;
  },

  /**
   * 📧 POST /verify-email/resend
   * Reenviar email de verificación
   */
  async resendVerification(): Promise<RequestVerificationResponse> {
    const response = await api.post('/api/verify-email/resend', {});

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al reenviar verificación');
    }

    return response.data.data;
  },

  /**
   * 📧 GET /verify-email/status
   * Obtener estado de verificación del usuario autenticado
   */
  async getVerificationStatus(): Promise<EmailVerificationStatus> {
    const response = await api.get('/api/verify-email/status');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener estado');
    }

    return response.data.data;
  },

  /**
   * 📧 GET /verify-email/verify?token=...
   * Verificar email con token (NO requiere autenticación)
   * 
   * ⚠️ IMPORTANTE: Usa publicApi (sin cookies/JWT)
   * porque esta ruta es pública
   * 
   * Cambio del backend: Ahora es GET con query parameter
   */
  async verifyEmailWithToken(token: string): Promise<VerifyEmailResponse> {
    const response = await publicApi.get('/api/verify-email/verify', { 
      params: { token } 
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al verificar email');
    }

    return response.data.data;
  },

  /**
   * 📧 GET /verify-email
   * Listar usuarios sin verificar (Admin)
   * Requiere permiso: verify-email:read
   */
  async getUnverifiedUsers(
    query: VerifyEmailQuery = {}
  ): Promise<PaginatedUnverifiedUsers> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.isVerified !== undefined)
      params.append('isVerified', query.isVerified.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await api.get(`/api/verify-email?${params.toString()}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener usuarios');
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
   * 📧 GET /verify-email/stats
   * Obtener estadísticas de verificación (Admin)
   * Requiere permiso: verify-email:read
   */
  async getVerificationStats(): Promise<VerificationStats> {
    const response = await api.get('/api/verify-email/stats');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener estadísticas');
    }

    return response.data.data;
  },
};
