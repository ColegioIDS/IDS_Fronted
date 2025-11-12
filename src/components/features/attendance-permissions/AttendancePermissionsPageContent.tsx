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
          const rolesData = await getRoles();
          if (rolesData && Array.isArray(rolesData)) {
            setRoles(rolesData);
          }

          // Cargar estados desde API centralizada
          const statusesData = await getAttendanceStatuses();
          if (statusesData && Array.isArray(statusesData)) {
            setStatuses(statusesData);
          }
        } catch (error) {
          console.error('Error loading roles and statuses:', error);
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
      } else {
        await createPermission(data);
      }
      setShowForm(false);
      setSelectedPermission(null);
      await getPermissions();
    } catch (error) {
      console.error('Error submitting form:', error);
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
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando datos...</span>
            </div>
          ) : roles.length === 0 || statuses.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No hay roles o estados disponibles. Por favor, intenta de nuevo más tarde.
              </p>
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
