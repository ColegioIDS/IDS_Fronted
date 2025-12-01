// src/services/signatures.service.ts
import { api } from '@/config/api';
import {
  Signature,
  CreateSignatureRequest,
  UpdateSignatureRequest,
  PaginatedSignaturesResponse,
  SignaturesByTypeResponse,
  SignaturesForCartaResponse,
  SignatureFilters,
  DeleteSignatureResponse,
  SetDefaultSignatureResponse,
} from '@/types/signatures.types';

/**
 * Servicio para gestionar firmas digitales
 */
class SignaturesService {
  private basePath = '/api/signatures';

  /**
   * Crear una nueva firma
   */
  async createSignature(data: CreateSignatureRequest): Promise<Signature> {
    const response = await api.post<Signature>(
      this.basePath,
      data
    );
    return response.data;
  }

  /**
   * Obtener todas las firmas con filtros opcionales
   */
  async getAllSignatures(filters?: SignatureFilters): Promise<PaginatedSignaturesResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.type) params.append('type', filters.type);
      if (filters.userId) params.append('userId', String(filters.userId));
      if (filters.schoolCycleId) params.append('schoolCycleId', String(filters.schoolCycleId));
      if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
      if (filters.isDefault !== undefined) params.append('isDefault', String(filters.isDefault));
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
    }

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    const response = await api.get<PaginatedSignaturesResponse>(url);
    return response.data;
  }

  /**
   * Obtener firma por ID
   */
  async getSignatureById(id: number): Promise<Signature> {
    const response = await api.get<Signature>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }

  /**
   * Obtener firmas por tipo
   */
  async getSignaturesByType(
    type: string,
    schoolCycleId?: number,
    isDefault?: boolean
  ): Promise<SignaturesByTypeResponse> {
    const params = new URLSearchParams();

    if (schoolCycleId) params.append('schoolCycleId', String(schoolCycleId));
    if (isDefault !== undefined) params.append('isDefault', String(isDefault));

    const queryString = params.toString();
    const url = queryString
      ? `${this.basePath}/by-type/${type}?${queryString}`
      : `${this.basePath}/by-type/${type}`;

    const response = await api.get<SignaturesByTypeResponse>(url);
    return response.data;
  }

  /**
   * Obtener firmas para carta de notas
   */
  async getSignaturesForCarta(schoolCycleId?: number): Promise<SignaturesForCartaResponse> {
    const params = new URLSearchParams();

    if (schoolCycleId) params.append('schoolCycleId', String(schoolCycleId));

    const queryString = params.toString();
    const url = queryString
      ? `${this.basePath}/carta/all?${queryString}`
      : `${this.basePath}/carta/all`;

    const response = await api.get<SignaturesForCartaResponse>(url);
    return response.data;
  }

  /**
   * Actualizar firma
   */
  async updateSignature(
    id: number,
    data: UpdateSignatureRequest
  ): Promise<Signature> {
    const response = await api.put<Signature>(
      `${this.basePath}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Marcar firma como defecto
   */
  async setDefaultSignature(id: number): Promise<SetDefaultSignatureResponse> {
    const response = await api.post<SetDefaultSignatureResponse>(
      `${this.basePath}/${id}/set-default`,
      {}
    );
    return response.data;
  }

  /**
   * Eliminar firma
   */
  async deleteSignature(id: number): Promise<DeleteSignatureResponse> {
    const response = await api.delete<DeleteSignatureResponse>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }

  /**
   * Obtener firmas activas para un usuario
   */
  async getUserActiveSignatures(userId: number): Promise<Signature[]> {
    const response = await api.get<PaginatedSignaturesResponse>(
      `${this.basePath}?userId=${userId}&isActive=true`
    );
    return response.data.data;
  }

  /**
   * Obtener firma por defecto de un tipo
   */
  async getDefaultSignatureByType(type: string, schoolCycleId?: number): Promise<Signature | null> {
    try {
      const response = await this.getSignaturesByType(type, schoolCycleId, true);
      return response.data.length > 0 ? response.data[0] : null;
    } catch {
      return null;
    }
  }

  /**
   * Obtener usuarios disponibles (excepto tutores)
   */
  async getAvailableUsers(): Promise<any> {
    const response = await api.get(`${this.basePath}/users/available`);
    // La API retorna: { data: [...], total: ... } o { success: true, data: {...} }
    // Normalizamos para que siempre retorne { data: [...] }
    if (response.data?.data) {
      return { data: response.data.data };
    }
    if (Array.isArray(response.data)) {
      return { data: response.data };
    }
    return response.data;
  }
}

export const signaturesService = new SignaturesService();
