// src/types/verify-email.types.ts

/**
 * 📧 Tipos para el módulo Verify-Email
 * Gestión de verificación de emails de usuarios
 */

// ✅ Estado de verificación de un usuario
export interface EmailVerificationStatus {
  accountVerified: boolean;
  email: string;
  message: string;
}

// ✅ Usuario sin verificar (listado admin)
export interface UnverifiedUser {
  id: number;
  email: string;
  givenNames: string;
  lastNames: string;
  accountVerified: boolean;
  createdAt: string;
  verifiedAt?: string | null;
}

// ✅ Estadísticas de verificación
export interface VerificationStats {
  total: number;
  verified: number;
  pending: number;
  verificationRate: number;
  averageDaysToVerify: number;
}

// ✅ Query params para listar usuarios sin verificar
export interface VerifyEmailQuery {
  page?: number;
  limit?: number;
  search?: string;
  isVerified?: boolean;
  sortBy?: 'email' | 'createdAt' | 'verifiedAt';
  sortOrder?: 'asc' | 'desc';
}

// ✅ Respuesta paginada de usuarios sin verificar
export interface PaginatedUnverifiedUsers {
  data: UnverifiedUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ Respuesta de verificación
export interface VerifyEmailResponse {
  message: string;
  email?: string;
}

// ✅ Request para verificar email con token
export interface VerifyEmailRequest {
  token: string;
}

// ✅ Respuesta de solicitud/reenvío
export interface RequestVerificationResponse {
  message: string;
}
