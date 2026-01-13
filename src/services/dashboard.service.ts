// src/services/dashboard.service.ts
import { api } from '@/config/api';
import { DashboardTeacherStats } from '@/types/dashboard.types';

export const dashboardService = {
  /**
   * Obtener estadísticas del dashboard (cards principales)
   * GET /api/dashboard/stats
   */
  async getStats(): Promise<DashboardTeacherStats> {
    try {
      const response = await api.get('/api/dashboard/stats');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener estadísticas');
      }

      if (!response.data.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en dashboardService.getStats:', error);
      throw error;
    }
  },
};
