// En types/api.ts (o arriba en tu archivo actual)
export  interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  details?: string[]; // Detalles opcionales para errores
}