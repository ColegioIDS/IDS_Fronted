// src/types/roles.types.ts

// ✅ Role base
export interface Role {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: number | null;
  modifiedById: number | null;
}

// ✅ Role con relaciones
export interface RoleWithRelations extends Role {
  permissions: RolePermission[];
  _count: {
    users: number;
    permissions: number;
  };
  createdBy?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  modifiedBy?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
}

// ✅ Permiso de rol
export interface RolePermission {
  permissionId: number;
  scope: 'all' | 'own' | 'grade' | 'section';
  metadata?: Record<string, any>;
  createdAt: string;
  permission: {
    id: number;
    module: string;
    action: string;
    description: string | null;
    isActive: boolean;
  };
}

// ✅ Stats del rol
export interface RoleStats {
  id: number;
  name: string;
  totalUsers: number;
  totalPermissions: number;
  permissionsByModule: Record<string, number>;
  isActive: boolean;
  isSystem: boolean;
}

// ✅ Query params
export interface RolesQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isSystem?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// ✅ Paginated response
export interface PaginatedRoles {
  data: Role[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ Create/Update DTOs
export interface CreateRoleDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// ✅ Permission assignment
export interface AssignPermissionDto {
  permissionId: number;
  scope: 'all' | 'own' | 'grade' | 'section';
  metadata?: Record<string, any>;
}

export interface AssignMultiplePermissionsDto {
  permissions: AssignPermissionDto[];
}

export interface RemoveMultiplePermissionsDto {
  permissionIds: number[];
}