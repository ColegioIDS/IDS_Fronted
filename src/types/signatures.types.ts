// Enum para tipos de firma
export enum SignatureType {
  TEACHER = "TEACHER",
  DIRECTOR = "DIRECTOR",
  COORDINATOR = "COORDINATOR",
  PRINCIPAL = "PRINCIPAL",
  CUSTOM = "CUSTOM",
}

// Interfaz de usuario (relación)
export interface SignatureUser {
  id: number;
  givenNames: string;
  lastNames: string;
  email: string;
}

// Interfaz de ciclo escolar (relación)
export interface SignatureSchoolCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

// Interfaz principal de firma
export interface Signature {
  id: number;
  type: SignatureType;
  userId: number;
  user?: SignatureUser;
  schoolCycleId: number | null;
  schoolCycle?: SignatureSchoolCycle | null;
  signatureName: string;
  title: string;
  signatureUrl: string;
  publicId: string;
  isActive: boolean;
  isDefault: boolean;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

// Request para crear firma
export interface CreateSignatureRequest {
  type: SignatureType;
  userId: number;
  schoolCycleId?: number | null;
  signatureName: string;
  title: string;
  signatureUrl: string;
  publicId: string;
  isDefault?: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
}

// Request para actualizar firma
export interface UpdateSignatureRequest {
  signatureName?: string;
  title?: string;
  signatureUrl?: string;
  publicId?: string;
  isActive?: boolean;
  isDefault?: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
}

// Respuesta paginada
export interface PaginatedSignaturesResponse {
  data: Signature[];
  total: number;
  page: number;
  limit: number;
}

// Respuesta para obtener firmas por tipo
export interface SignaturesByTypeResponse {
  data: Signature[];
  total: number;
  type: SignatureType;
}

// Respuesta para cartas de notas
export interface SignaturesForCartaResponse {
  teacher: Signature | null;
  director: Signature | null;
  schoolCycleId: number | null;
  generatedAt: string;
}

// Query filters
export interface SignatureFilters {
  type?: SignatureType;
  userId?: number;
  schoolCycleId?: number;
  isActive?: boolean;
  isDefault?: boolean;
  page?: number;
  limit?: number;
}

// Response genérico para delete
export interface DeleteSignatureResponse {
  id: number;
  type: SignatureType;
  userId: number;
  message: string;
  deletedImagePublicId?: string;
}

// Response para set default
export interface SetDefaultSignatureResponse {
  id: number;
  type: SignatureType;
  userId: number;
  schoolCycleId: number | null;
  signatureName: string;
  title: string;
  isDefault: boolean;
  message: string;
  updatedAt: string;
}
