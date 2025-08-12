// En types/api.ts (o arriba en tu archivo actual)
export  interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  details?: string[]; // Detalles opcionales para errores
}


export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}