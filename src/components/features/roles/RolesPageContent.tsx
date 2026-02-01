// src/components/features/roles/RolesPageContent.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRoles } from '@/hooks/data/roles';
import { useAuth } from '@/context/AuthContext';
import { RoleStats } from './RoleStats';
import { RoleFilters } from './RoleFilters';
import { RolesGrid } from './RolesGrid';
import { RoleForm } from './RoleForm';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { Button } from '@/components/ui/button';
import { RefreshCw, List, Plus } from 'lucide-react';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

export function RolesPageContent() {
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [editingRoleId, setEditingRoleId] = useState<number | undefined>(undefined);
  const { hasPermission } = useAuth();

  const {
    data,
    isLoading,
    error,
    query,
    updateQuery,
    refresh,
  } = useRoles({
    page: 1,
    limit: 12,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const handleReset = () => {
    updateQuery({
      page: 1,
      limit: 12,
      search: undefined,
      isActive: undefined,
      isSystem: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const handlePageChange = (page: number) => {
    updateQuery({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNew = () => {
    setEditingRoleId(undefined);
    setActiveTab('form');
  };

  const handleEdit = (roleId: number) => {
    setEditingRoleId(roleId);
    setActiveTab('form');
  };

  const handleFormSuccess = () => {
    refresh();
    setActiveTab('list');
    setEditingRoleId(undefined);
  };

  const handleFormCancel = () => {
    setActiveTab('list');
    setEditingRoleId(undefined);
  };

  const hasActiveFilters = !!(
    query.search || 
    query.isActive !== undefined || 
    query.isSystem !== undefined
  );

  // Calcular stats
  const roles = data?.data || [];
  const totalRoles = data?.meta.total || 0;
  const activeRoles = roles.filter(r => r.isActive).length;
  const inactiveRoles = roles.filter(r => !r.isActive).length;
  const systemRoles = roles.filter(r => r.isSystem).length;

  return (
    <ProtectedPage {...MODULES_PERMISSIONS.ROLE.READ}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Roles
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra los roles y permisos del sistema
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={refresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <RoleStats
          total={totalRoles}
          active={activeRoles}
          inactive={inactiveRoles}
          system={systemRoles}
        />

        {/* Tabs */}
<Tabs
  value={activeTab}
  onValueChange={(value) => {
    setActiveTab(value as any);
    // Si cambias a la tab "list", resetear el modo edición
    if (value === 'list') {
      setEditingRoleId(undefined);
    }
  }}
  className="flex flex-col min-h-0"
>
          
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger 
              value="list"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <List className="w-4 h-4 mr-2" />
              Lista de Roles
            </TabsTrigger>
            {(hasPermission(MODULES_PERMISSIONS.ROLE.CREATE.module, MODULES_PERMISSIONS.ROLE.CREATE.action) || editingRoleId) && (
              <TabsTrigger 
                value="form"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {editingRoleId ? 'Editar Rol' : 'Crear Rol'}
              </TabsTrigger>
            )}
          </TabsList>

          {/* TAB: LISTA */}
          <TabsContent value="list" className="space-y-6 mt-6">
            {/* Botón crear en la lista */}
            {hasPermission(MODULES_PERMISSIONS.ROLE.CREATE.module, MODULES_PERMISSIONS.ROLE.CREATE.action) && (
              <div className="flex justify-end">
                <Button
                  onClick={handleCreateNew}
                  className="bg-purple-600 hover:bg-purple-700 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear Nuevo Rol
                </Button>
              </div>
            )}

            {/* Filtros */}
            <RoleFilters
              query={query}
              onQueryChange={updateQuery}
              onReset={handleReset}
              totalResults={data?.meta.total || 0}
            />

            {/* Grid */}
            <RolesGrid
              roles={roles as any}
              isLoading={isLoading}
              error={error}
              currentPage={data?.meta.page || 1}
              totalPages={data?.meta.totalPages || 1}
              totalResults={data?.meta.total || 0}
              onPageChange={handlePageChange}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleReset}
              onUpdate={refresh}
              onEdit={handleEdit}
            />
          </TabsContent>

          {/* TAB: FORMULARIO */}
          <TabsContent value="form" >
            <RoleForm
              roleId={editingRoleId}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedPage>
  );
}