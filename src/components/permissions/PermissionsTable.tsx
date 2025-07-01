// components/EnhancedPermissionsTable.tsx
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "../ui/badge/Badge";
import { usePermissionContext } from '@/context/PermissionContext';
import Pagination from "@/components/tables/Pagination";
import { Permission } from "@/types/permission";
import React, { useState, useMemo } from 'react';
import { FaChevronUp, FaChevronDown, FaCog } from 'react-icons/fa';
import { usePermissionFilters } from '@/hooks/usePermissionFilters';
import { PermissionFilters } from './PermissionFilters';
import Select from "@/components/form/Select";

type GroupByOption = 'none' | 'module' | 'status' | 'system';

export default function EnhancedPermissionsTable() {
  const { permissions, isLoading, error } = usePermissionContext();
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const {
    filters,
    setFilters,
    sortConfig,
    requestSort,
    filteredPermissions,
    uniqueValues,
    resetFilters
  } = usePermissionFilters(permissions);

  // Paginación
  const { paginatedData, totalItems, indexOfFirstItem, indexOfLastItem } = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return {
      paginatedData: filteredPermissions.slice(indexOfFirstItem, indexOfLastItem),
      totalItems: filteredPermissions.length,
      indexOfFirstItem,
      indexOfLastItem
    };
  }, [filteredPermissions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);

  // Agrupación
  const groupedData = useMemo(() => {
    if (groupBy === 'none') return { 'todos': paginatedData };

    return paginatedData.reduce((acc: Record<string, Permission[]>, item) => {
      const key = groupBy === 'module'
        ? item.module
        : groupBy === 'status'
          ? item.isActive ? 'Activo' : 'Inactivo'
          : item.isSystem ? 'Sistema' : 'Personalizado';

      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [paginatedData, groupBy]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const handleGroupByChange = (value: string) => {
    setGroupBy(value as GroupByOption);
    setExpandedGroups({});
  };

  if (isLoading) return <div className="p-4 text-center">Cargando permisos...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6">

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filtros y Agrupación
          </h2>

          <PermissionFilters
            setFilters={setFilters}
            filters={filters}
            uniqueValues={uniqueValues}
            resetFilters={resetFilters}
            groupBy={groupBy}
            onGroupByChange={handleGroupByChange}
          />

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
              {Object.entries(groupedData).map(([groupKey, items]) => (
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
                    items.map((permission) => (
                      <TableRow key={`perm-${permission.id}`}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                          {permission.module}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {permission.action}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {permission.description || '-'}
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

      {/* Paginación */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
      />
    </div>
  );
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  indexOfFirstItem,
  indexOfLastItem
}: PaginationControlsProps) => (
  <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
    <div className="text-sm text-gray-600 dark:text-gray-400">
      Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} de {totalItems} permisos
    </div>
    <div className="flex items-center gap-4">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  </div>
);