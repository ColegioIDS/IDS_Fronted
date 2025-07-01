import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "../ui/badge/Badge";
import { usePermissionContext } from '@/context/PermissionContext';
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Pagination from "@/components/tables/Pagination";
import { Permission } from "@/types/permission";
import React from "react";
import { useState, useEffect } from 'react';
import { FaFilter, FaTimes, FaChevronUp, FaChevronDown, FaCog } from 'react-icons/fa';
import { FaSearch } from "react-icons/fa";


export default function EnhancedPermissionsTable() {
  const { permissions, isLoading, error, refetch } = usePermissionContext();
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([]);
  const [filters, setFilters] = useState({
    module: 'all',
    action: 'all',
    status: 'all',
    system: 'all',
    search: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'module', direction: 'asc' });
  const [groupBy, setGroupBy] = useState('none'); // 'none', 'module', 'status', 'system'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Inicializar datos filtrados
  useEffect(() => {
    if (permissions) {
      setFilteredPermissions(permissions);
    }
  }, [permissions]);

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    if (!permissions) return;

    let result = [...permissions];

    // Aplicar filtros
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(perm =>
      (perm.module ?? "").toLowerCase().includes(searchTerm) ||
        (perm.action ?? "").toLowerCase().includes(searchTerm) ||
        (perm.description ?? "").toLowerCase().includes(searchTerm)

     


      );
    }

    if (filters.module !== 'all') {
      result = result.filter(perm => perm.module === filters.module);
    }

    if (filters.action !== 'all') {
      result = result.filter(perm => perm.action === filters.action);
    }

    if (filters.status !== 'all') {
      result = result.filter(perm =>
        filters.status === 'active' ? perm.isActive : !perm.isActive
      );
    }

    if (filters.system !== 'all') {
      result = result.filter(perm =>
        filters.system === 'system' ? perm.isSystem : !perm.isSystem
      );
    }

    // Aplicar ordenamiento
    const key = sortConfig.key as keyof Permission;
    result.sort((a, b) => {
      if (a[key]! < b[key]!) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[key]! > b[key]!) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredPermissions(result);
    setCurrentPage(1); // Resetear a la primera página al cambiar filtros
  }, [permissions, filters, sortConfig]);

  type SortKey = 'module' | 'action' | 'description' | 'isActive' | 'isSystem';

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Manejar agrupación
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Obtener módulos únicos para filtros
  const uniqueModules = [...new Set(permissions?.map(perm => perm.module) || [])];
  const uniqueActions = [...new Set(permissions?.map(perm => perm.action) || [])];

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPermissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);

  // Agrupar datos si es necesario
  const groupedData = (): Record<string, Permission[]> => {
    if (groupBy === 'none') return { 'todos': currentItems };

    return currentItems.reduce((acc: Record<string, Permission[]>, item) => {
      const key = groupBy === 'module'
        ? item.module
        : groupBy === 'status'
          ? item.isActive ? 'Activo' : 'Inactivo'
          : item.isSystem ? 'Sistema' : 'Personalizado';

      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  };

  const dataToRender = groupedData();

  if (isLoading) return <p>Cargando permisos...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-6 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
        {/* Línea superior: búsqueda y agrupación */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">


  <Select
            value={groupBy}
            onChange={(value) => setGroupBy(value)}
            options={[
              { value: 'none', label: 'Sin agrupación' },
              { value: 'module', label: 'Agrupar por módulo' },
              { value: 'status', label: 'Agrupar por estado' },
              { value: 'system', label: 'Agrupar por tipo' },
            ]}
          />



              <Select
            value={filters.module}
            onChange={(value) => setFilters({ ...filters, module: value })}
            options={[
              { value: 'all', label: 'Todos los módulos' },
              ...uniqueModules.map((module) => ({ value: module, label: module })),
            ]}
          />
         

            <Input
            icon={<FaSearch />}
            placeholder="Buscar permisos..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
             className="pl-10" 
          />
         


        
         
        </div>

        {/* Línea inferior: filtros de contenido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <Select
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'active', label: 'Activo' },
              { value: 'inactive', label: 'Inactivo' },
            ]}
          />
          <Select
            value={filters.system}
            onChange={(value) => setFilters({ ...filters, system: value })}
            options={[
              { value: 'all', label: 'Todos los tipos' },
              { value: 'system', label: 'Sistema' },
              { value: 'custom', label: 'Personalizado' },
            ]}
          />

        
        
 
          <Select
            value={filters.action}
            onChange={(value) => setFilters({ ...filters, action: value })}
            options={[
              { value: 'all', label: 'Todas las acciones' },
              ...uniqueActions.map((action) => ({ value: action, label: action })),
            ]}
          />


           <div className="flex items-end">
            <Button
              variant="outline"
              className=" px-3"
              onClick={() => {
                setFilters({
                  module: 'all',
                  action: 'all',
                  status: 'all',
                  system: 'all',
                  search: '',
                });
                setGroupBy('none');
              }}
            >
              <FaTimes className="mr-2 " />
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {groupBy !== 'none' && (
                  <TableCell isHeader className="w-10">&nbsp;</TableCell>
                )}

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                  onClick={() => requestSort('module')}
                >
                  <div className="flex items-center gap-1">
                    Módulo
                    {sortConfig.key === 'module' && (
                      sortConfig.direction === 'asc' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />
                    )}
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                  onClick={() => requestSort('action')}
                >
                  <div className="flex items-center gap-1">
                    Acción
                    {sortConfig.key === 'action' && (
                      sortConfig.direction === 'asc' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />
                    )}
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Descripción
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                  onClick={() => requestSort('isActive')}
                >
                  <div className="flex items-center gap-1">
                    Estado
                    {sortConfig.key === 'isActive' && (
                      sortConfig.direction === 'asc' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />
                    )}
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                  onClick={() => requestSort('isSystem')}
                >
                  <div className="flex items-center gap-1">
                    Tipo
                    {sortConfig.key === 'isSystem' && (
                      sortConfig.direction === 'asc' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {Object.entries(dataToRender).map(([groupKey, items]) => (
                <React.Fragment key={`group-${groupKey}`}>
                  {groupBy !== 'none' && (
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableCell colSpan={6} className="px-5 py-2">
                        <div
                          className="flex items-center gap-2 font-medium cursor-pointer text-gray-800 dark:text-white/90"
                          onClick={() => toggleGroup(groupKey)}
                        >
                          {expandedGroups[groupKey] ? (
                            <FaChevronUp className="text-gray-800 dark:text-white/90" />
                          ) : (
                            <FaChevronDown className="text-gray-800 dark:text-white/90" />
                          )}
                          {groupKey} ({items.length})
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {(groupBy === 'none' || expandedGroups[groupKey]) &&
                    items.map((permission, index) => (
                      <TableRow key={`perm-${permission.id || `index-${index}`}`}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                          {permission.module}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {permission.action}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {permission.description}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <Badge
                            size="sm"
                          
                            variant="solid"
                            color={permission.isActive ? "success" : "error"}
                          >
                            {permission.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <Badge
                            size="sm"
                             variant="solid"
                            color={permission.isSystem ? "info" : "warning"}
                          >
                            {permission.isSystem ? "Sistema" : "Personalizado"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginación y resumen */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPermissions.length)} de {filteredPermissions.length} permisos
        </div>

        <div className="flex items-center gap-4">


          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}