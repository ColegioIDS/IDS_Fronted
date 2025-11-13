/**
 * =========================
 * ATTENDANCE PERMISSIONS HOOK
 * =========================
 * 
 * Hook for managing scope-based access control
 * Validates user permissions for attendance operations
 */

import { useCallback, useMemo } from 'react';
import { AttendanceScope, UserAttendancePermissions } from '@/types/attendance.types';

// ============================================================================
// PERMISSION RULES
// ============================================================================

/**
 * Permission rules for different roles
 */
const ROLE_PERMISSIONS: Record<string, UserAttendancePermissions> = {
  admin: {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canViewAll: true,
    canViewOwnOnly: false,
    scopes: ['ALL', 'GRADE', 'SECTION', 'OWN', 'DEPARTMENT'],
  },
  secretary: {
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canViewAll: true,
    canViewOwnOnly: false,
    scopes: ['ALL', 'GRADE', 'SECTION', 'DEPARTMENT'],
  },
  teacher: {
    canCreate: true,
    canUpdate: false,
    canDelete: false,
    canViewAll: false,
    canViewOwnOnly: true,
    scopes: ['OWN', 'SECTION'],
  },
  parent: {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canViewAll: false,
    canViewOwnOnly: true,
    scopes: ['OWN'],
  },
  student: {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canViewAll: false,
    canViewOwnOnly: true,
    scopes: ['OWN'],
  },
};

// ============================================================================
// PERMISSION SCOPE HELPERS
// ============================================================================

/**
 * Determine if user has access to a specific record based on scope
 */
function hasAccessToRecord(
  userScope: AttendanceScope,
  recordGradeId?: number,
  recordSectionId?: number,
  userGradeIds?: number[],
  userSectionIds?: number[]
): boolean {
  switch (userScope) {
    case 'ALL':
      return true;

    case 'DEPARTMENT':
      // Department scope - allows access to all records in department
      return true;

    case 'GRADE':
      // Grade scope - only access to records in allowed grades
      return !recordGradeId || (userGradeIds && userGradeIds.includes(recordGradeId));

    case 'SECTION':
      // Section scope - only access to records in allowed sections
      return !recordSectionId || (userSectionIds && userSectionIds.includes(recordSectionId));

    case 'OWN':
      // Own scope - only own records
      return true; // This should be validated at record level

    default:
      return false;
  }
}

// ============================================================================
// MAIN HOOK
// ============================================================================

interface UsePermissionsOptions {
  userRole: string;
  scope?: AttendanceScope;
  gradeIds?: number[];
  sectionIds?: number[];
}

/**
 * Hook to manage attendance permissions
 * @param options - Permission configuration
 * @returns Permission utilities and checks
 */
export function useAttendancePermissions({
  userRole,
  scope = 'OWN',
  gradeIds = [],
  sectionIds = [],
}: UsePermissionsOptions) {
  // Get base permissions for role
  const basePermissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.student;

  // Memoized permissions object
  const permissions = useMemo<UserAttendancePermissions>(
    () => ({
      ...basePermissions,
      restrictedGradeIds: gradeIds,
      restrictedSectionIds: sectionIds,
    }),
    [userRole, gradeIds, sectionIds]
  );

  // Check if user can perform action
  const canCreate = useCallback(() => permissions.canCreate, [permissions.canCreate]);
  const canUpdate = useCallback(() => permissions.canUpdate, [permissions.canUpdate]);
  const canDelete = useCallback(() => permissions.canDelete, [permissions.canDelete]);
  const canViewAll = useCallback(() => permissions.canViewAll, [permissions.canViewAll]);

  // Check if user can access specific record
  const canAccessRecord = useCallback(
    (recordGradeId?: number, recordSectionId?: number): boolean => {
      return hasAccessToRecord(scope, recordGradeId, recordSectionId, gradeIds, sectionIds);
    },
    [scope, gradeIds, sectionIds]
  );

  // Check if scope is allowed
  const canUseScope = useCallback(
    (checkScope: AttendanceScope): boolean => {
      return permissions.scopes.includes(checkScope);
    },
    [permissions.scopes]
  );

  // Get allowed scopes for current user
  const allowedScopes = useMemo(() => permissions.scopes, [permissions.scopes]);

  return {
    permissions,
    canCreate,
    canUpdate,
    canDelete,
    canViewAll,
    canAccessRecord,
    canUseScope,
    allowedScopes,
    currentScope: scope,
  };
}

// ============================================================================
// SPECIFIC ROLE HOOKS
// ============================================================================

/**
 * Hook for admin permissions
 */
export function useAdminPermissions() {
  return useAttendancePermissions({
    userRole: 'admin',
    scope: 'ALL',
  });
}

/**
 * Hook for secretary permissions
 */
export function useSecretaryPermissions(gradeIds?: number[], sectionIds?: number[]) {
  return useAttendancePermissions({
    userRole: 'secretary',
    scope: 'GRADE',
    gradeIds,
    sectionIds,
  });
}

/**
 * Hook for teacher permissions
 */
export function useTeacherPermissions(sectionIds?: number[]) {
  return useAttendancePermissions({
    userRole: 'teacher',
    scope: 'SECTION',
    sectionIds,
  });
}

/**
 * Hook for parent/student permissions
 */
export function useViewerPermissions() {
  return useAttendancePermissions({
    userRole: 'parent',
    scope: 'OWN',
  });
}
