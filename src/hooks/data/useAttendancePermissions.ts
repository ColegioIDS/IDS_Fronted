// src/hooks/data/useAttendancePermissions.ts
'use client';

import { useState, useCallback, useMemo } from 'react';
import { attendancePermissionsService } from '@/services/attendance-permissions.service';
import {
  AttendancePermission,
  AttendancePermissionWithRelations,
  AttendancePermissionsQuery,
  PaginatedAttendancePermissions,
  PermissionMatrix,
  PermissionsDashboardSummary,
  RolePermissionsSummary,
  PermissionTemplate,
  CreateAttendancePermissionDto,
  UpdateAttendancePermissionDto,
  BulkOperationResult,
} from '@/types/attendance-permissions.types';
import { toast } from 'sonner';

interface UseAttendancePermissionsOptions {
  autoFetch?: boolean;
  initialPage?: number;
  initialLimit?: number;
}

export const useAttendancePermissions = (
  options: UseAttendancePermissionsOptions = {}
) => {
  const { autoFetch = false, initialPage = 1, initialLimit = 10 } = options;

  // States
  const [permissions, setPermissions] =
    useState<AttendancePermissionWithRelations[]>([]);
  const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);
  const [dashboardSummary, setDashboardSummary] =
    useState<PermissionsDashboardSummary | null>(null);
  const [roleSummary, setRoleSummary] =
    useState<RolePermissionsSummary | null>(null);
  const [template, setTemplate] = useState<PermissionTemplate | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Computed
  const totalPages_computed = useMemo(
    () => Math.ceil(total / limit),
    [total, limit]
  );

  // ==================== CRUD Operations ====================

  /**
   * Obtener permisos paginados
   */
  const getPermissions = useCallback(
    async (query: AttendancePermissionsQuery = {}) => {
      setLoading(true);
      setError(null);

      try {
        const result = await attendancePermissionsService.getPermissions({
          page,
          limit,
          ...query,
        });

        setPermissions(result.data);
        setTotal(result.meta.total);
        setTotalPages(result.meta.totalPages);
        setPage(result.meta.page);

        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [page, limit]
  );

  /**
   * Obtener un permiso específico
   */
  const getPermissionById = useCallback(
    async (roleId: number, attendanceStatusId: number) => {
      setLoading(true);
      setError(null);

      try {
        const result = await attendancePermissionsService.getPermissionById(
          roleId,
          attendanceStatusId
        );
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Crear un nuevo permiso
   */
  const createPermission = useCallback(
    async (data: CreateAttendancePermissionDto) => {
      setLoading(true);
      setError(null);

      try {
        const result = await attendancePermissionsService.createPermission(
          data
        );
        toast.success('Permiso creado exitosamente');
        await getPermissions();
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        
        // Mostrar mensaje de error pero no lanzar si es un error esperado
        if (message.includes('Ya existe')) {
          toast.info(message);
        } else {
          toast.error(message);
        }
        
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getPermissions]
  );

  /**
   * Actualizar un permiso
   */
  const updatePermission = useCallback(
    async (
      roleId: number,
      attendanceStatusId: number,
      data: UpdateAttendancePermissionDto
    ) => {
      setLoading(true);
      setError(null);

      try {
        const result = await attendancePermissionsService.updatePermission(
          roleId,
          attendanceStatusId,
          data
        );
        toast.success('Permiso actualizado exitosamente');
        await getPermissions();
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getPermissions]
  );

  /**
   * Eliminar un permiso
   */
  const deletePermission = useCallback(
    async (roleId: number, attendanceStatusId: number) => {
      setLoading(true);
      setError(null);

      try {
        await attendancePermissionsService.deletePermission(
          roleId,
          attendanceStatusId
        );
        toast.success('Permiso eliminado exitosamente');
        await getPermissions();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getPermissions]
  );

  // ==================== Search/Filter Operations ====================

  /**
   * Obtener permisos por rol
   */
  const getPermissionsByRole = useCallback(
    async (roleId: number) => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await attendancePermissionsService.getPermissionsByRole(roleId);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Obtener permisos por estado
   */
  const getPermissionsByStatus = useCallback(
    async (attendanceStatusId: number) => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await attendancePermissionsService.getPermissionsByStatus(
            attendanceStatusId
          );
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Obtener roles tipo TEACHER
   */
  const getTeacherRoles = useCallback(async (p = 1, l = 10) => {
    setLoading(true);
    setError(null);

    try {
      const result = await attendancePermissionsService.getTeacherRoles(p, l);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener lista de maestros paginada
   */
  const getTeachersList = useCallback(
    async (query = { page: 1, limit: 10, search: '', roleType: '' }) => {
      setLoading(true);
      setError(null);

      try {
        const result = await attendancePermissionsService.getTeacherRoles(query.page, query.limit, query.search);
        setPermissions(result.data || []);
        setTotal(result.meta?.total || 0);
        setPage(result.meta?.page || 1);
        setLimit(result.meta?.limit || 10);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Obtener roles por tipo
   */
  const getRolesByType = useCallback(
    async (roleType: string, p = 1, l = 10) => {
      setLoading(true);
      setError(null);

      try {
        const result = await attendancePermissionsService.getRolesByType(
          roleType,
          p,
          l
        );
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Obtener lista de roles
   */
  const getRoles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await attendancePermissionsService.getRoles();
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener lista de estados de asistencia
   */
  const getAttendanceStatuses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await attendancePermissionsService.getAttendanceStatuses();
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== Admin Operations ====================

  /**
   * Obtener matriz de permisos
   */
  const fetchMatrix = useCallback(async (roleType?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await attendancePermissionsService.getPermissionsMatrix(
        roleType
      );
      setMatrix(result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener resumen del dashboard
   */
  const fetchDashboardSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await attendancePermissionsService.getDashboardSummary();
      setDashboardSummary(result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener resumen de un rol
   */
  const fetchRoleSummary = useCallback(async (roleId: number) => {
    setLoading(true);
    setError(null);

    try {
      const result =
        await attendancePermissionsService.getRolePermissionsSummary(roleId);
      setRoleSummary(result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener plantilla
   */
  const fetchTemplate = useCallback(async (roleType: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await attendancePermissionsService.getTemplate(roleType);
      setTemplate(result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== Bulk Operations ====================

  /**
   * Crear múltiples permisos
   */
  const createPermissionsBulk = useCallback(
    async (permissionsList: CreateAttendancePermissionDto[]) => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await attendancePermissionsService.createPermissionsBulk(
            permissionsList
          );
        toast.success(
          `${result.inserted || 0} permisos creados exitosamente`
        );
        await getPermissions();
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getPermissions]
  );

  /**
   * Actualizar múltiples permisos de un rol
   */
  const updatePermissionsBatch = useCallback(
    async (
      roleId: number,
      updates: Array<{
        attendanceStatusId: number;
        data: UpdateAttendancePermissionDto;
      }>
    ) => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await attendancePermissionsService.updatePermissionsBatch(
            roleId,
            updates
          );
        toast.success(
          `${result.updated || 0} permisos actualizados exitosamente`
        );
        await getPermissions();
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getPermissions]
  );

  /**
   * Eliminar todos los permisos de un rol
   */
  const deleteRolePermissions = useCallback(
    async (roleId: number) => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await attendancePermissionsService.deleteRolePermissions(roleId);
        toast.success(
          `${result.deletedCount || 0} permisos eliminados exitosamente`
        );
        await getPermissions();
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getPermissions]
  );

  // ==================== Pagination ====================

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  /**
   * Obtener estados activos de asistencia
   */
  const getActiveAttendanceStatuses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await attendancePermissionsService.getActiveAttendanceStatuses();
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener estado específico por ID
   */
  const getAttendanceStatusById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await attendancePermissionsService.getAttendanceStatusById(id);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener lista de estados con filtros y paginación
   */
  const getAttendanceStatusesList = useCallback(
    async (query: any = {}) => {
      setLoading(true);
      setError(null);
      try {
        const result = await attendancePermissionsService.getAttendanceStatusesList(query);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    // Data
    permissions,
    matrix,
    dashboardSummary,
    roleSummary,
    template,
    loading,
    error,
    page,
    limit,
    total,
    totalPages: totalPages_computed,

    // CRUD
    getPermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    deletePermission,

    // Search/Filter
    getPermissionsByRole,
    getPermissionsByStatus,
    getTeacherRoles,
    getTeachersList,
    getRolesByType,
    getRoles,
    getAttendanceStatuses,
    getActiveAttendanceStatuses,
    getAttendanceStatusById,
    getAttendanceStatusesList,

    // Admin
    fetchMatrix,
    fetchDashboardSummary,
    fetchRoleSummary,
    fetchTemplate,

    // Bulk
    createPermissionsBulk,
    updatePermissionsBatch,
    deleteRolePermissions,

    // Pagination
    handlePageChange,
    handleLimitChange,
  };
};
