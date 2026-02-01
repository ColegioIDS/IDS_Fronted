'use client';

import { usePermissions } from '@/hooks/data/usePermissions';
import { PermissionStats } from './PermissionStats';
import { PermissionFilters } from './PermissionFilters';
import { PermissionsGrid } from './PermissionsGrid';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { PERMISSION_PERMISSIONS } from '@/constants/modules-permissions/permission/permission.permissions';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PermissionsPageContent() {
  const {
    data,
    groupedData,
    modules,
    isLoading,
    error,
    query,
    updateQuery,
    refresh,
  } = usePermissions({
    page: 1,
    limit: 20,
    sortBy: 'module',
    sortOrder: 'asc',
  });

  const handleReset = () => {
    updateQuery({
      page: 1,
      limit: 20,
      search: undefined,
      module: undefined,
      isActive: undefined,
      isSystem: undefined,
      sortBy: 'module',
      sortOrder: 'asc',
    });
  };

  const handlePageChange = (page: number) => {
    updateQuery({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = !!(
    query.search ||
    query.module ||
    query.isActive !== undefined ||
    query.isSystem !== undefined
  );

  const totalPermissions = groupedData.reduce(
    (sum, mod) => sum + mod.totalPermissions,
    0
  );
  const activePermissions = groupedData.reduce(
    (sum, mod) => sum + mod.activePermissions,
    0
  );
  const inactivePermissions = totalPermissions - activePermissions;
  const totalModules = modules.length;

  return (
    <ProtectedPage {...PERMISSION_PERMISSIONS.READ}>
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Gestión de Permisos
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Visualiza y filtra todos los permisos del sistema
            </p>
          </div>
          <Button
            onClick={refresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="gap-2 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </header>

        <section aria-label="Estadísticas">
          <PermissionStats
            total={totalPermissions}
            active={activePermissions}
            inactive={inactivePermissions}
            modules={totalModules}
          />
        </section>

        <section aria-label="Filtros">
          <PermissionFilters
            modules={modules}
            query={query}
            onQueryChange={updateQuery}
            onReset={handleReset}
            totalResults={data?.meta.total || 0}
          />
        </section>

        <section aria-label="Listado de permisos">
          <PermissionsGrid
            modules={groupedData}
            isLoading={isLoading}
            error={error}
            currentPage={data?.meta.page || 1}
            totalPages={data?.meta.totalPages || 1}
            totalResults={data?.meta.total || 0}
            onPageChange={handlePageChange}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleReset}
          />
        </section>
      </div>
    </ProtectedPage>
  );
}
