// src/types/roles.ts

import { Permission } from './permissions';

export interface Role {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: number | null;
  modifiedById?: number | null;
}

export interface RoleWithRelations extends Role {
  permissions: Permission[];
  userCount: number;
  createdBy?: {
    id: number;
    fullName: string;
  } | null;
  modifiedBy?: {
    id: number;
    fullName: string;
  } | null;
}

export interface RoleFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
  isSystem?: boolean;
}

// ✨ NUEVO: Type para permiso con scope
export interface RolePermissionWithScope {
  permissionId: number;
  scope: 'all' | 'own' | 'grade'; // ✨ SIN undefined
}

// ✨ ACTUALIZAR: RoleFormValues ahora usa el nuevo formato
export interface RoleFormValues {
  name: string;
   description?: string | null;
  permissions?: RolePermissionWithScope[]; 
  isActive: boolean;
   createdById?: number | null;
  modifiedById?: number | null;  
}

export interface BulkCreateRolesPayload {
  roles: RoleFormValues[];
}

export interface BulkUpdateRolesPayload {
  updates: Array<{
    id: number;
    data: Partial<RoleFormValues>;
  }>;
}

export interface BulkDeleteRolesPayload {
  ids: number[];
}

export interface BulkOperationResponse {
  success: boolean;
  data: RoleWithRelations[] | { count: number };
  message: string;
}