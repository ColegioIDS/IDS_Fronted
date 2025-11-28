import { UpdateUserProfileDto } from '@/schemas/user-profile.schema';
import { UserProfile } from '@/components/features/user-profile';
import { api } from '@/config/api';

/**
 * Servicio para gestionar el perfil del usuario
 */
export const userProfileService = {
  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/api/user-profile');
    

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener el perfil');
    }

    return response.data.data;
  },

  /**
   * Actualiza el perfil del usuario autenticado
   */
  async updateProfile(updateData: UpdateUserProfileDto): Promise<UserProfile> {
    const response = await api.patch('/api/user-profile', updateData);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar el perfil');
    }

    return response.data.data;
  },
};
