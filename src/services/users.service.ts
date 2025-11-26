// src/services/users.service.ts
import { api } from '@/config/api';
import {
  User,
  UserWithRelations,
  UsersQuery,
  PaginatedUsers,
  UserStats,
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  UploadPictureDto,
  Picture,
  PictureUploadResponse,
  GrantAccessResponse,
  RevokeAccessResponse,
  VerifyEmailResponse,
} from '@/types/users.types';

export const usersService = {
  /**
   * Obtener usuarios paginados con filtros
   */
  async getUsers(query: UsersQuery = {}): Promise<PaginatedUsers> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.canAccessPlatform !== undefined)
      params.append('canAccessPlatform', query.canAccessPlatform.toString());
    if (query.roleId) params.append('roleId', query.roleId.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await api.get(`/api/users?${params.toString()}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener usuarios');
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
   * Obtener usuario por ID
   */
  async getUserById(id: number): Promise<UserWithRelations> {
    const response = await api.get(`/api/users/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener el usuario');
    }

    if (!response.data.data) {
      throw new Error('Usuario no encontrado');
    }

    return response.data.data;
  },

  /**
   * Obtener usuario por email
   */
  async getUserByEmail(email: string): Promise<UserWithRelations> {
    const response = await api.get(`/api/users/email/${email}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener el usuario');
    }

    if (!response.data.data) {
      throw new Error('Usuario no encontrado');
    }

    return response.data.data;
  },

  /**
   * Obtener usuario por DPI
   */
  async getUserByDpi(dpi: string): Promise<UserWithRelations> {
    const response = await api.get(`/api/users/dpi/${dpi}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener el usuario');
    }

    if (!response.data.data) {
      throw new Error('Usuario no encontrado');
    }

    return response.data.data;
  },

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats(): Promise<UserStats> {
    const response = await api.get('/api/users/stats', {
      params: {
        page: '1',
        limit: '10',
      },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estadísticas');
    }

    return response.data.data;
  },

  /**
   * Crear usuario
   */
  async createUser(data: CreateUserDto): Promise<User> {
    const response = await api.post('/api/users', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear el usuario');
    }

    return response.data.data;
  },

  /**
   * Actualizar usuario
   */
  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    const response = await api.patch(`/api/users/${id}`, data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar el usuario');
    }

    return response.data.data;
  },

  /**
   * Eliminar usuario (soft delete)
   */
  async deleteUser(id: number): Promise<void> {
    const response = await api.delete(`/api/users/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar el usuario');
    }
  },

  /**
   * Restaurar usuario
   */
  async restoreUser(id: number): Promise<User> {
    const response = await api.patch(`/api/users/${id}/restore`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al restaurar el usuario');
    }

    return response.data.data;
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(id: number, data: ChangePasswordDto): Promise<void> {
    const response = await api.patch(`/api/users/${id}/change-password`, data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al cambiar la contraseña');
    }
  },

  /**
   * Otorgar acceso a plataforma
   */
  async grantAccess(id: number): Promise<GrantAccessResponse> {
    const response = await api.patch(`/api/users/${id}/grant-access`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al otorgar acceso');
    }

    return response.data.data;
  },

  /**
   * Revocar acceso a plataforma
   */
  async revokeAccess(id: number): Promise<RevokeAccessResponse> {
    const response = await api.patch(`/api/users/${id}/revoke-access`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al revocar acceso');
    }

    return response.data.data;
  },

  /**
   * Verificar email
   */
  async verifyEmail(id: number): Promise<VerifyEmailResponse> {
    const response = await api.patch(`/api/users/${id}/verify-email`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al verificar email');
    }

    return response.data.data;
  },

  /**
   * Obtener fotos del usuario
   */
  async getUserPictures(id: number): Promise<Picture[]> {
    const response = await api.get(`/api/users/${id}/pictures`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener fotos');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener foto de perfil
   */
  async getProfilePicture(id: number): Promise<Picture> {
    const response = await api.get(`/api/users/${id}/pictures/profile`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener foto de perfil');
    }

    if (!response.data.data) {
      throw new Error('Foto de perfil no encontrada');
    }

    return response.data.data;
  },

  /**
   * Obtener foto específica
   */
  async getUserPicture(userId: number, pictureId: number): Promise<Picture> {
    const response = await api.get(`/api/users/${userId}/pictures/${pictureId}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener foto');
    }

    if (!response.data.data) {
      throw new Error('Foto no encontrada');
    }

    return response.data.data;
  },

  /**
   * Subir foto de usuario
   * Retorna la foto creada
   */
  async uploadPicture(
    userId: number,
    url: string,
    publicId: string,
    kind: string,
    description?: string
  ): Promise<PictureUploadResponse> {
    const payload = {
      url,
      publicId,
      kind,
      ...(description && { description }),
    };

    const response = await api.post(`/api/users/${userId}/pictures`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al registrar foto');
    }

    return response.data.data;
  },

  /**
   * Eliminar foto del usuario
   */
  async removePicture(userId: number, pictureId: number): Promise<void> {
    const response = await api.delete(`/api/users/${userId}/pictures/${pictureId}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar foto');
    }
  },
};
