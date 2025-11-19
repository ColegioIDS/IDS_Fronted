import { UpdateUserProfileDto } from '@/schemas/user-profile.schema';
import { UserProfile } from '@/components/features/user-profile';

const API_BASE = '/api';

/**
 * Servicio para gestionar el perfil del usuario
 */
export const userProfileService = {
  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE}/user-profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener el perfil');
    }

    return response.json();
  },

  /**
   * Actualiza el perfil del usuario autenticado
   */
  async updateProfile(updateData: UpdateUserProfileDto): Promise<UserProfile> {
    const response = await fetch(`${API_BASE}/user-profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar el perfil');
    }

    return response.json();
  },
};
