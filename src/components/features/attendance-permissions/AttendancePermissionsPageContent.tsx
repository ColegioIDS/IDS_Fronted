// src/components/features/attendance-permissions/AttendancePermissionsPageContent.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  List,
  Grid,
  Plus,
  BarChart3,
  Settings,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAttendancePermissions } from '@/hooks/data/useAttendancePermissions';
import { AttendancePermissionTable } from './AttendancePermissionTable';
import { AttendancePermissionForm } from './AttendancePermissionForm';
import { AttendancePermissionMatrix } from './AttendancePermissionMatrix';
import { AttendancePermissionDashboard } from './AttendancePermissionDashboard';
import { toast } from 'sonner';

interface AttendancePermissionsPageContentProps {
  roles?: Array<{ id: number; name: string }>;
  statuses?: Array<{ id: number; code: string; name: string }>;
}

type TabType = 'list' | 'matrix' | 'dashboard';

export const AttendancePermissionsPageContent: React.FC<
  AttendancePermissionsPageContentProps
> = ({ roles: propsRoles = [], statuses: propsStatuses = [] }) => {
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>(propsRoles);
  const [statuses, setStatuses] = useState<Array<{ id: number; code: string; name: string }>>(propsStatuses);
  const [loadingData, setLoadingData] = useState(false);

  const {
    permissions,
    matrix,
    dashboardSummary,
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    getPermissions,
    getRoles,
    getAttendanceStatuses,
    createPermission,
    updatePermission,
    fetchMatrix,
    fetchDashboardSummary,
    handlePageChange,
  } = useAttendancePermissions();

  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [showForm, setShowForm] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Load roles and statuses from centralized service
  useEffect(() => {
    const loadData = async () => {
      if (propsRoles.length === 0 || propsStatuses.length === 0) {
        setLoadingData(true);
        try {
          
          // Cargar roles desde API centralizada
          try {
            const rolesData = await getRoles();
            if (rolesData && Array.isArray(rolesData) && rolesData.length > 0) {
              setRoles(rolesData);
            } else {
            }
          } catch (rolesError) {
          }

          // Cargar estados desde API centralizada
          try {
            const statusesData = await getAttendanceStatuses();
            if (statusesData && Array.isArray(statusesData) && statusesData.length > 0) {
              setStatuses(statusesData);
            } else {
            }
          } catch (statusesError) {
          }
        } catch (error) {
        } finally {
          setLoadingData(false);
        }
      }
    };

    loadData();
  }, [getRoles, getAttendanceStatuses]);

  // Load initial data
  useEffect(() => {
    getPermissions();
  }, [page, limit]);

  // Load tab data
  useEffect(() => {
    if (activeTab === 'matrix') {
      fetchMatrix();
    } else if (activeTab === 'dashboard') {
      fetchDashboardSummary();
    }
  }, [activeTab]);

  const handleCreateClick = () => {
    setSelectedPermission(null);
    setShowForm(true);
  };

  const handleEditClick = (permission: any) => {
    setSelectedPermission(permission);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true);
    try {
      if (selectedPermission) {
        await updatePermission(
          selectedPermission.roleId,
          selectedPermission.attendanceStatusId,
          data
        );
        toast.success('Permiso actualizado exitosamente');
      } else {
        await createPermission(data);
        toast.success('Permiso creado exitosamente');
      }
      setShowForm(false);
      setSelectedPermission(null);
      await getPermissions();
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido';
      
      // Detectar si es un error de duplicado y ofrecer actualizar
      if (errorMessage.includes('Ya existe un permiso')) {
        toast.info('Este permiso ya existe. Usa la vista de tabla para editarlo.', {
          action: {
            label: 'Cerrar',
            onClick: () => setShowForm(false),
          },
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Permisos de Asistencia
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Administra los permisos que tiene cada rol sobre los estados de asistencia
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Permiso
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Matriz
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
          {error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
              <CardContent className="pt-6 text-red-700 dark:text-red-300">
                {error}
              </CardContent>
            </Card>
          )}

          <AttendancePermissionTable
            permissions={permissions}
            onEdit={handleEditClick}
            loading={loading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Matrix Tab */}
        <TabsContent value="matrix" className="space-y-4">
          <AttendancePermissionMatrix
            matrix={matrix}
            loading={loading}
            onRoleTypeFilter={(roleType) => {
              if (roleType) {
                fetchMatrix(roleType);
              } else {
                fetchMatrix();
              }
            }}
          />
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <AttendancePermissionDashboard
            summary={dashboardSummary}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPermission ? 'Editar Permiso' : 'Crear Nuevo Permiso'}
            </DialogTitle>
            <DialogDescription>
              {selectedPermission
                ? 'Modifica los permisos del rol para el estado de asistencia'
                : 'Define los permisos que tendrá un rol sobre un estado de asistencia'}
            </DialogDescription>
          </DialogHeader>
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <div className="absolute inset-0 h-12 w-12 animate-ping opacity-20 rounded-full bg-blue-600"></div>
              </div>
              <p className="mt-4 text-base font-medium text-gray-700 dark:text-gray-300">
                Cargando datos...
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Por favor espera un momento
              </p>
            </div>
          ) : !loadingData && (roles.length === 0 || statuses.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-amber-100 dark:bg-amber-900/20 rounded-full blur-2xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 p-4 rounded-full">
                  <AlertCircle className="h-12 w-12 text-amber-600 dark:text-amber-500" />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Datos no disponibles
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                No se encontraron roles o estados de asistencia disponibles en este momento.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedPermission(null);
                  }}
                  className="min-w-[120px]"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={async () => {
                    setLoadingData(true);
                    try {
                      const rolesData = await getRoles();
                      const statusesData = await getAttendanceStatuses();
                      
                      if (rolesData && Array.isArray(rolesData)) {
                        setRoles(rolesData);
                      }
                      
                      if (statusesData && Array.isArray(statusesData)) {
                        setStatuses(statusesData);
                      }
                      
                      // Validar si realmente se cargaron datos
                      if (rolesData?.length > 0 && statusesData?.length > 0) {
                        toast.success('Datos cargados correctamente');
                      } else if (!rolesData?.length && !statusesData?.length) {
                        toast.warning('No se encontraron datos disponibles');
                      } else if (!rolesData?.length) {
                        toast.warning('No se encontraron roles disponibles');
                      } else {
                        toast.warning('No se encontraron estados de asistencia disponibles');
                      }
                    } catch (error) {
                      toast.error('Error al conectar con el servidor');
                    } finally {
                      setLoadingData(false);
                    }
                  }}
                  className="min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              </div>
              
              <div className="mt-6 text-xs text-gray-500 dark:text-gray-500 text-center">
                Si el problema persiste, contacta con el administrador del sistema
              </div>
            </div>
          ) : (
            <AttendancePermissionForm
              permission={selectedPermission}
              roles={roles}
              statuses={statuses}
              onSubmit={handleFormSubmit}
              loading={formLoading}
              onCancel={() => {
                setShowForm(false);
                setSelectedPermission(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
