// src/components/roles/RolesList.tsx
'use client';

import { useState } from 'react';
import { useRoles, useDeleteRole, useDeleteRolesBulk } from '@/hooks/useRoles';
import { RoleFilters } from '@/types/roles';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Shield,
  Loader2,
  Users,
  LayoutGrid,
  List,
  Filter,
  X
} from 'lucide-react';
import RoleCardImproved from './RoleCardImproved';
import RolesTable from './RolesTable';

interface RolesListProps {
  onEdit: (id: number) => void;
  onCreateNew: () => void;
}

export default function RolesList({ onEdit, onCreateNew }: RolesListProps) {
  const [filters, setFilters] = useState<RoleFilters>({
    page: 1,
    limit: 9,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  const { data, isLoading, error, refetch } = useRoles(filters);
  const deleteRole = useDeleteRole();
  const deleteBulk = useDeleteRolesBulk();

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
    setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value === 'all' ? undefined : value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      await deleteRole.mutateAsync(id);
      refetch();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} roles?`)) {
      await deleteBulk.mutateAsync({ ids: selectedIds });
      setSelectedIds([]);
      refetch();
    }
  };

  const handleSelectRole = (id: number, selected: boolean) => {
    setSelectedIds((prev) =>
      selected ? [...prev, id] : prev.filter((roleId) => roleId !== id)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && data?.data) {
      const nonSystemIds = data.data.filter((role) => !role.isSystem).map((role) => role.id);
      setSelectedIds(nonSystemIds);
    } else {
      setSelectedIds([]);
    }
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 9,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = filters.search || filters.isActive !== undefined || filters.isSystem !== undefined;

  const stats = {
    total: data?.meta?.total || 0,
    active: data?.data?.filter((r) => r.isActive).length || 0,
    system: data?.data?.filter((r) => r.isSystem).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}



      {/* Stats mejoradas con más información */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Roles */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 rounded-xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/50 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 dark:bg-purple-400/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-400/5 rounded-full -ml-16 -mb-16" />

          <div className="relative space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="bg-purple-100 dark:bg-purple-900/40 rounded-xl p-3 ring-4 ring-purple-50 dark:ring-purple-900/20">
                <Shield className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-0">
                Total
              </Badge>
            </div>

            {/* Número principal */}
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                Total de Roles
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {stats.total}
              </p>
            </div>

            {/* Información adicional */}
            <div className="pt-3 border-t border-purple-100 dark:border-purple-800/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Personalizados
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.total - stats.system}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Con usuarios
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {data?.data?.filter(r => r.userCount > 0).length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Activos */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 rounded-xl p-6 shadow-lg border border-green-100 dark:border-green-800/50 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 dark:bg-green-400/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/5 dark:bg-green-400/5 rounded-full -ml-16 -mb-16" />

          <div className="relative space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="bg-green-100 dark:bg-green-900/40 rounded-xl p-3 ring-4 ring-green-50 dark:ring-green-900/20">
                <Shield className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0">
                Activos
              </Badge>
            </div>

            {/* Número principal */}
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                Roles Activos
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {stats.active}
              </p>
            </div>

            {/* Información adicional */}
            <div className="pt-3 border-t border-green-100 dark:border-green-800/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Porcentaje
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Inactivos
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.total - stats.active}
                </span>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="pt-2">
              <div className="h-2 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 transition-all duration-500"
                  style={{ width: `${stats.total > 0 ? (stats.active / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Sistema */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 rounded-xl p-6 shadow-lg border border-blue-100 dark:border-blue-800/50 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 dark:bg-blue-400/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-400/5 rounded-full -ml-16 -mb-16" />

          <div className="relative space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="bg-blue-100 dark:bg-blue-900/40 rounded-xl p-3 ring-4 ring-blue-50 dark:ring-blue-900/20">
                <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0">
                Sistema
              </Badge>
            </div>

            {/* Número principal */}
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                Roles del Sistema
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {stats.system}
              </p>
            </div>

            {/* Información adicional */}
            <div className="pt-3 border-t border-blue-100 dark:border-blue-800/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Total usuarios
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {data?.data?.reduce((sum, role) => sum + (role.userCount || 0), 0) || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Permisos totales
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {data?.data?.reduce((sum, role) => sum + (role.permissions?.length || 0), 0) || 0}
                </span>
              </div>
            </div>

            {/* Mini gráfico */}
            <div className="pt-2 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-all duration-300 ${i < Math.min(5, stats.system)
                      ? 'bg-gradient-to-t from-blue-500 to-blue-400 dark:from-blue-400 dark:to-blue-300'
                      : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}
                  style={{ height: `${20 + i * 8}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controles principales */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 space-y-4">
        {/* Botones de acción y vista */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-2">
            <Button onClick={onCreateNew} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Rol
            </Button>

            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={deleteBulk.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar ({selectedIds.length})
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-200 dark:border-gray-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>

            <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className={viewMode === 'cards' ? 'bg-purple-600' : ''}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={viewMode === 'table' ? 'bg-purple-600' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o descripción..."
                  className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  value={filters.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              {/* Estado */}
              <Select
                value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
                onValueChange={(value) => handleFilterChange('isActive', value)}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>

              {/* Tipo */}
              <Select
                value={filters.isSystem === undefined ? 'all' : filters.isSystem ? 'system' : 'custom'}
                onValueChange={(value) => handleFilterChange('isSystem', value)}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="custom">Personalizados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[200px] bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
                    <SelectItem value="createdAt-desc">Más reciente</SelectItem>
                    <SelectItem value="createdAt-asc">Más antiguo</SelectItem>
                    <SelectItem value="updatedAt-desc">Últ. modificado</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              {data?.data && data.data.length > 0 && viewMode === 'cards' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(selectedIds.length === 0)}
                  className="border-gray-200 dark:border-gray-700"
                >
                  {selectedIds.length === 0 ? 'Seleccionar todo' : 'Deseleccionar todo'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400">Error al cargar roles: {error.message}</p>
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No se encontraron roles</p>
          <Button onClick={onCreateNew} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Crear primer rol
          </Button>
        </div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.map((role) => (
                <RoleCardImproved
                  key={role.id}
                  role={role}
                  selected={selectedIds.includes(role.id)}
                  onSelect={handleSelectRole}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <RolesTable
              roles={data.data}
              selectedIds={selectedIds}
              onSelectRole={handleSelectRole}
              onSelectAll={handleSelectAll}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          )}

          {/* Paginación */}
          {data.meta.totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {((data.meta.page - 1) * data.meta.limit) + 1} a{' '}
                  {Math.min(data.meta.page * data.meta.limit, data.meta.total)} de{' '}
                  {data.meta.total} roles
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(data.meta.page - 1)}
                    disabled={!data.meta.hasPreviousPage}
                    className="border-gray-200 dark:border-gray-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        const currentPage = data.meta.page;
                        return (
                          page === 1 ||
                          page === data.meta.totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <Button
                            variant={page === data.meta.page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={
                              page === data.meta.page
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
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
                    onClick={() => handlePageChange(data.meta.page + 1)}
                    disabled={!data.meta.hasNextPage}
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
  );
}