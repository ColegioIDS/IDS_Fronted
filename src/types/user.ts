// src/types/user.ts
export type Gender = 'Masculino' | 'Femenino' | 'Otro';

export type RelationshipType = 'mother' | 'father' | 'legal_guardian' | 'tutor' | 'other';

export interface Address {
  street: string;
  zone: string;
  municipality: string;
  department: string;
}

export interface PictureInput {
  publicId: string; // ID de Cloudinary
  kind: string; // ejemplo: 'profile'
  url: string; // URL pública de Cloudinary
  description?: string; // opcional
}

export interface ParentDetails {
  occupation?: string;
  workplace?: string;
}

export interface TeacherDetails {
  hiredDate: string;
  isHomeroomTeacher?: boolean;
  academicDegree?: string;
}

export interface ChildLink {
  studentId: number;
  relationshipType: RelationshipType;
  isPrimaryContact?: boolean;
  hasLegalCustody?: boolean;
  canAccessInfo?: boolean;
}

// ============================================
// PERMISOS Y ROLES
// ============================================

export interface Permission {
  id: number;
  module: string;
  action: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  allowedScopes: string[];
  requiredPermissions: number[];
}

export interface RolePermission {
  permissionId: number;
  scope: 'all' | 'own' | 'grade';
  metadata?: Record<string, any>;
  permission?: Permission; // ✅ Para relación completa
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
  isSystem: boolean;
  permissions?: RolePermission[]; // ✅ AGREGADO - Relación con permisos
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// USUARIO
// ============================================

export interface User {
  id: number;
  username: string;
  email?: string;
  dpi?: string;
  nit?: string;
  givenNames: string;
  lastNames: string;
  phone?: string;
  birthDate?: string;
  gender: string;
  canAccessPlatform: boolean;
  isActive: boolean;
  accountVerified: boolean;
  roleId?: number | null;
  role?: Role; // ✅ Ahora incluye permissions
  address?: Address;
  teacherDetails?: TeacherDetails;
  parentDetails?: ParentDetails;
  pictures?: PictureInput[];
  children?: ChildLink[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  password: string;
}