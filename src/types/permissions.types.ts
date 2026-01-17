// src/types/permissions.types.ts

// ✅ Permission base
export interface Permission {
  id: number;
  module: string;
  action: string;
  description: string | null;
  allowedScopes: string[];
  requiredPermissions: number[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// ✅ Permission agrupado por módulo
export interface PermissionModule {
  module: string;
  permissions: Permission[];
  totalPermissions: number;
  activePermissions: number;
  rolesCount: number;
  usedInRoles: Array<{ id: number; name: string }>;
}

// ✅ Permission con relaciones
export interface PermissionWithRelations extends Permission {
  roles: Array<{
    roleId: number;
    scope: string;
    role: {
      id: number;
      name: string;
    };
  }>;
  rolesCount: number;
  usedInRoles: Array<{ id: number; name: string }>;
}

// ✅ Query params
export interface PermissionsQuery {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  isActive?: boolean;
  isSystem?: boolean;
  sortBy?: 'module' | 'action' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ✅ Paginated response
export interface PaginatedPermissions {
  data: Permission[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ Stats response
export interface PermissionStats {
  [module: string]: number;
}

// ✅ User permission
export interface UserPermission {
  module: string;
  action: string;
  scope: 'all' | 'own' | 'grade';
}

export interface UserPermissionsResponse {
  permissions: UserPermission[];
  role: {
    id: number;
    name: string;
    roleType?: 'ADMIN' | 'TEACHER' | 'COORDINATOR' | 'STUDENT' | string;
  } | null;
}