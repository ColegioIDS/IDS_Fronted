import { api } from '@/config/api';

export interface Department {
  id: number;
  name: string;
  code?: string;
}

export interface Municipality {
  id: number;
  name: string;
  code?: string;
  department?: Department;
  departmentId?: number;
}

/**
 * Servicio para gestionar ubicaciones (Departamentos y Municipios)
 */
export const locationsService = {
  /**
   * Obtiene todos los departamentos
   */
  async getAllDepartments(): Promise<Department[]> {
    const response = await api.get('/api/locations/departments');
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener departamentos');
    }

    return response.data.data || [];
  },

  /**
   * Obtiene un departamento específico con sus municipios
   */
  async getDepartmentById(id: number): Promise<Department & { municipalities?: Municipality[] }> {
    const response = await api.get(`/api/locations/departments/${id}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener el departamento');
    }

    return response.data.data;
  },

  /**
   * Obtiene todos los municipios (opcionalmente filtrados por departamento)
   */
  async getMunicipalities(departmentId?: number): Promise<Municipality[]> {
    const params = departmentId ? { departmentId } : {};
    const response = await api.get('/api/locations/municipalities', { params });
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener municipios');
    }

    return response.data.data || [];
  },

  /**
   * Obtiene un municipio específico con su departamento
   */
  async getMunicipalityById(id: number): Promise<Municipality> {
    const response = await api.get(`/api/locations/municipalities/${id}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener el municipio');
    }

    return response.data.data;
  },
};
