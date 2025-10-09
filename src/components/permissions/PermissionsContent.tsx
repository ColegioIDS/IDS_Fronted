// src/components/permissions/PermissionsContent.tsx
'use client';

import { useState, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionFilters, PermissionWithRelations } from '@/types/permissions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, Shield, Loader2 } from 'lucide-react';
import PermissionModuleCard from './PermissionModuleCard';
import ProtectedContent from '@/components/common/ProtectedContent'; // ✅ Importar

export default function PermissionsContent() {
  const [filters, setFilters] = useState<PermissionFilters>({
    page: 1,
    limit: 100,
    sortBy: 'module',
    sortOrder: 'asc',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { data, isLoading, error } = usePermissions(filters);

  const groupedPermissions = useMemo(() => {
    if (!data?.data) return [];

    const groups = data.data.reduce((acc, permission) => {
      const module = permission.module;
      if (!acc[module]) {
        acc[module] = {
          module,
          permissions: [],
          totalActive: 0,
          totalInactive: 0,
          usedInRolesCount: 0,
        };
      }

      acc[module].permissions.push(permission);
      if (permission.isActive) {
        acc[module].totalActive++;
      } else {
        acc[module].totalInactive++;
      }
      acc[module].usedInRolesCount += permission.rolesCount;

      return acc;
    }, {} as Record<string, {
      module: string;
      permissions: PermissionWithRelations[];
      totalActive: number;
      totalInactive: number;
      usedInRolesCount: number;
    }>);

    return Object.values(groups);
  }, [data]);

  const filteredGroups = useMemo(() => {
    if (!filters.search) return groupedPermissions;

    return groupedPermissions.filter(group =>
      group.module.toLowerCase().includes(filters.search!.toLowerCase()) ||
      group.permissions.some(p =>
        p.action.toLowerCase().includes(filters.search!.toLowerCase()) ||
        p.description?.toLowerCase().includes(filters.search!.toLowerCase())
      )
    );
  }, [groupedPermissions, filters.search]);

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
  };

  const handleFilterActiveChange = (value: string) => {
    const isActive = value === 'all' ? undefined : value === 'active';
    setFilters((prev) => ({ ...prev, isActive }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = {
    total: data?.data?.length || 0,
    active: data?.data?.filter(p => p.isActive).length || 0,
    modules: groupedPermissions.length,
  };

  // ✅ ENVOLVER TODO EL CONTENIDO CON ProtectedContent
  return (
    <ProtectedContent requiredPermission={{ module: 'permission', action: 'read' }}>
      <div className="space-y-6">
        {/* Header con stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-400/5 rounded-full -mr-16 -mt-16" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Permisos</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 dark:bg-green-400/5 rounded-full -mr-16 -mt-16" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Activos</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.active}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-400/5 rounded-full -mr-16 -mt-16" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Módulos</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.modules}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por módulo o acción..."
                className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <Select onValueChange={handleSortChange} defaultValue="module-asc">
              <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Ordenar por..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                <SelectItem value="module-asc">Módulo (A-Z)</SelectItem>
                <SelectItem value="module-desc">Módulo (Z-A)</SelectItem>
                <SelectItem value="action-asc">Acción (A-Z)</SelectItem>
                <SelectItem value="action-desc">Acción (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={handleFilterActiveChange} defaultValue="all">
              <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Estado..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista agrupada */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400">
              Error al cargar permisos: {error.message}
            </p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No se encontraron módulos
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedGroups.map((group) => (
                <PermissionModuleCard key={group.module} group={group} />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a{' '}
                    {Math.min(currentPage * itemsPerPage, filteredGroups.length)}                    {filteredGroups.length} módulos
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border-gray-200 dark:border-gray-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          );
                        })
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <Button
                              variant={page === currentPage ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className={
                                page === currentPage
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'border-gray-200 dark:border-gray-700'
                              }
                            >
                              {page}
                            </Button>
                          </div>
                        ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border-gray-200 dark:border-gray-700"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedContent>
  );
}