// src/services/config-status-mapping.service.ts
import { api } from '@/config/api';

export interface CreateConfigStatusMappingDto {
  configId: number;
  statusId: number;
  mappingType: 'negative' | 'notesRequired'; // ⭐ REQUIRED - Define the type of mapping
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateConfigStatusMappingDto {
  configId?: number;
  statusId?: number;
  mappingType?: 'negative' | 'notesRequired';
  displayOrder?: number;
  isActive?: boolean;
}

export interface ConfigStatusMappingResponseDto {
  id: number;
  configId: number;
  statusId: number;
  mappingType: 'negative' | 'notesRequired'; // ⭐ Mapping type returned from backend
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ConfigStatusMappingService {
  private baseUrl = '/api/config-status-mappings';

  /**
   * List all config-status mappings with pagination
   */
  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<ConfigStatusMappingResponseDto>> {
    const response = await api.get(this.baseUrl, {
      params: { page, limit },
    });

    if (response.status !== 200) {
      throw new Error(`Error fetching config-status mappings: ${response.statusText}`);
    }

    // Handle wrapper format: { success, message, data: { data: [...], ...pagination } }
    const wrappedData = response.data.data || response.data;
    
    if (wrappedData && typeof wrappedData === 'object' && 'data' in wrappedData) {
      return {
        data: wrappedData.data || [],
        total: wrappedData.total || 0,
        page: wrappedData.page || page,
        limit: wrappedData.limit || limit,
        totalPages: wrappedData.totalPages || 0,
      };
    }

    // Fallback if it's just an array
    if (Array.isArray(wrappedData)) {
      return {
        data: wrappedData,
        total: wrappedData.length,
        page,
        limit,
        totalPages: Math.ceil(wrappedData.length / limit),
      };
    }

    throw new Error('Unexpected API response format');
  }

  /**
   * Get a config-status mapping by ID
   */
  async findById(id: number): Promise<ConfigStatusMappingResponseDto> {
    const response = await api.get(`${this.baseUrl}/${id}`);

    if (response.status !== 200) {
      throw new Error(`Error fetching config-status mapping: ${response.statusText}`);
    }

    return response.data;
  }

  /**
   * Get mappings for a specific config
   */
  async findByConfigId(
    configId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<ConfigStatusMappingResponseDto>> {
    const response = await api.get(`${this.baseUrl}/config/${configId}`, {
      params: { page, limit },
    });

    if (response.status !== 200) {
      throw new Error(`Error fetching config-status mappings for config ${configId}: ${response.statusText}`);
    }

    const wrappedData = response.data.data || response.data;

    if (wrappedData && typeof wrappedData === 'object' && 'data' in wrappedData) {
      return {
        data: wrappedData.data || [],
        total: wrappedData.total || 0,
        page: wrappedData.page || page,
        limit: wrappedData.limit || limit,
        totalPages: wrappedData.totalPages || 0,
      };
    }

    if (Array.isArray(wrappedData)) {
      return {
        data: wrappedData,
        total: wrappedData.length,
        page,
        limit,
        totalPages: Math.ceil(wrappedData.length / limit),
      };
    }

    throw new Error('Unexpected API response format');
  }

  /**
   * Get mappings for a specific status
   */
  async findByStatusId(
    statusId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<ConfigStatusMappingResponseDto>> {
    const response = await api.get(`${this.baseUrl}/status/${statusId}`, {
      params: { page, limit },
    });

    if (response.status !== 200) {
      throw new Error(`Error fetching config-status mappings for status ${statusId}: ${response.statusText}`);
    }

    const wrappedData = response.data.data || response.data;

    if (wrappedData && typeof wrappedData === 'object' && 'data' in wrappedData) {
      return {
        data: wrappedData.data || [],
        total: wrappedData.total || 0,
        page: wrappedData.page || page,
        limit: wrappedData.limit || limit,
        totalPages: wrappedData.totalPages || 0,
      };
    }

    if (Array.isArray(wrappedData)) {
      return {
        data: wrappedData,
        total: wrappedData.length,
        page,
        limit,
        totalPages: Math.ceil(wrappedData.length / limit),
      };
    }

    throw new Error('Unexpected API response format');
  }

  /**
   * Create a new config-status mapping
   */
  async create(dto: CreateConfigStatusMappingDto): Promise<ConfigStatusMappingResponseDto> {
    const response = await api.post(this.baseUrl, dto);

    if (response.status !== 201) {
      throw new Error(`Error creating config-status mapping: ${response.statusText}`);
    }

    return response.data;
  }

  /**
   * Update a config-status mapping
   */
  async update(
    id: number,
    dto: UpdateConfigStatusMappingDto,
  ): Promise<ConfigStatusMappingResponseDto> {
    const response = await api.patch(`${this.baseUrl}/${id}`, dto);

    if (response.status !== 200) {
      throw new Error(`Error updating config-status mapping: ${response.statusText}`);
    }

    return response.data;
  }

  /**
   * Delete a config-status mapping
   */
  async delete(id: number): Promise<void> {
    const response = await api.delete(`${this.baseUrl}/${id}`);

    if (response.status !== 204) {
      throw new Error(`Error deleting config-status mapping: ${response.statusText}`);
    }
  }

  /**
   * Get setup config - Returns { config, statusMappings, summary }
   * GET /api/config-status-mappings/current/complete
   */
  async getSetupConfig(): Promise<any> {
    const response = await api.get(`${this.baseUrl}/current/complete`);

    if (response.status !== 200) {
      throw new Error(`Error fetching setup config: ${response.statusText}`);
    }

    // Handle wrapper format: { success, message, data: { config, statusMappings, summary } }
    const unwrappedData = response.data.data || response.data;
    
    console.log('getSetupConfig raw response:', response.data);
    console.log('getSetupConfig unwrapped data:', unwrappedData);
    
    return unwrappedData;
  }

  /**
   * Get setup statuses - Returns AttendanceStatus[]
   */
  async getSetupStatuses(): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/setup/statuses`);

    if (response.status !== 200) {
      throw new Error(`Error fetching setup statuses: ${response.statusText}`);
    }

    // Handle wrapper format
    const wrappedData = response.data.data || response.data;
    
    if (Array.isArray(wrappedData)) {
      return wrappedData;
    }

    if (wrappedData && Array.isArray(wrappedData.data)) {
      return wrappedData.data;
    }

    return [];
  }
}

export const configStatusMappingService = new ConfigStatusMappingService();
