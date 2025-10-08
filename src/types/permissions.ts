// src/types/permissions.ts

export interface Permission {
  id: number;
  module: string;
  action: string;
  description?: string | null;
  isActive: boolean;
  isSystem: boolean;
  allowedScopes: string[];
  createdAt: string;
  updatedAt: string;
    assignedScope?: 'all' | 'own' | 'grade'; // ✨ AGREGAR (opcional)
     requiredPermissions: number[];

}

export interface PermissionWithRelations extends Permission {
  usedInRoles: Array<{
    id: number;
    name: string;
  }>;
  rolesCount: number;
}

export interface PermissionFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'module' | 'action' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
  isSystem?: boolean;
}

export interface PermissionDetail extends Permission {
  usedInRoles: Array<{
    id: number;
    name: string;
    description?: string | null;
  }>;
  rolesCount: number;
}

export interface UserPermission {
  module: string;
  action: string;
  scope: string; // 'all' | 'own' | 'grade'
}


export interface UserPermissionsResponse {
  permissions: UserPermission[];
  role: {
    id: number;
    name: string;
  } | null;
}