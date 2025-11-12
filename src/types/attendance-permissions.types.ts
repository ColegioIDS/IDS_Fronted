// src/types/attendance-permissions.types.ts

// ✅ Permission base
export interface AttendancePermission {
  id?: number;
  roleId: number;
  attendanceStatusId: number;
  canView: boolean;
  canCreate: boolean;
  canModify: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canAddJustification: boolean;
  requiresNotes: boolean;
  minNotesLength?: number | null;
  maxNotesLength?: number | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Permission con relaciones
export interface AttendancePermissionWithRelations extends AttendancePermission {
  role: {
    id: number;
    name: string;
    roleType?: string;
  };
  attendanceStatus: {
    id: number;
    code: string;
    name: string;
    colorCode?: string;
  };
}

// ✅ Matrix cell
export interface PermissionMatrixCell {
  status: {
    id: number;
    code: string;
    name: string;
  };
  permission: AttendancePermission | null;
}

// ✅ Matrix row
export interface PermissionMatrixRow {
  role: {
    id: number;
    name: string;
    roleType?: string;
  };
  statuses: PermissionMatrixCell[];
}

// ✅ Matrix response
export interface PermissionMatrix {
  roles: any[];
  statuses: any[];
  matrix: PermissionMatrixRow[];
  summary: {
    totalRoles: number;
    totalStatuses: number;
    totalCells: number;
    configuredCells: number;
    unconfiguredCells: number;
  };
}

// ✅ Dashboard summary
export interface PermissionsDashboardSummary {
  summary: {
    totalRoles: number;
    totalStatuses: number;
    totalPermissions: number;
    possibleCombinations: number;
    configurationPercentage: string;
  };
  gaps: {
    rolesWithoutPermissions: {
      count: number;
      data: any[];
    };
    statusesWithoutPermissions: {
      count: number;
      data: any[];
    };
  };
  breakdown: {
    averagePermissionsPerRole: string;
    roles: Array<{
      roleId: number;
      permissionCount: number;
    }>;
  };
}

// ✅ Role summary
export interface RolePermissionsSummary {
  roleId: number;
  roleName: string;
  totalStatuses: number;
  canViewCount: number;
  canCreateCount: number;
  canModifyCount: number;
  canDeleteCount: number;
  canApproveCount: number;
  canAddJustificationCount: number;
  permissions: AttendancePermission[];
}

// ✅ Template
export interface PermissionTemplate {
  roleType: string;
  description: string;
  template: {
    canView: boolean;
    canCreate: boolean;
    canModify: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canAddJustification: boolean;
    requiresNotes: boolean;
    minNotesLength?: number | null;
    maxNotesLength?: number | null;
  };
  note?: string;
}

// ✅ Query params
export interface AttendancePermissionsQuery {
  page?: number;
  limit?: number;
  roleId?: number;
  attendanceStatusId?: number;
  canApprove?: boolean;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// ✅ Paginated response
export interface PaginatedAttendancePermissions {
  data: AttendancePermissionWithRelations[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ Create/Update DTOs
export interface CreateAttendancePermissionDto {
  roleId: number;
  attendanceStatusId: number;
  canView: boolean;
  canCreate: boolean;
  canModify: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canAddJustification: boolean;
  requiresNotes: boolean;
  minNotesLength?: number | null;
  maxNotesLength?: number | null;
  notes?: string | null;
}

export interface UpdateAttendancePermissionDto {
  canView?: boolean;
  canCreate?: boolean;
  canModify?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
  canAddJustification?: boolean;
  requiresNotes?: boolean;
  minNotesLength?: number | null;
  maxNotesLength?: number | null;
  notes?: string | null;
}

// ✅ Bulk operations
export interface BulkCreatePermissionsDto {
  permissions: CreateAttendancePermissionDto[];
}

export interface BulkUpdatePermissionsDto {
  updates: Array<{
    attendanceStatusId: number;
    data: UpdateAttendancePermissionDto;
  }>;
}

// ✅ Bulk response
export interface BulkOperationResult {
  inserted?: number;
  updated?: number;
  deleted?: number;
  failed?: number;
  results: Array<{
    success: boolean;
    data?: any;
    error?: string;
  }>;
}

// ✅ Teacher roles response
export interface TeacherRolesResponse {
  data: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ Roles by type response
export interface RolesByTypeResponse {
  roleType: string;
  data: Array<{
    id: number;
    name: string;
    roleType: string;
    attendancePermissions: AttendancePermission[];
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
