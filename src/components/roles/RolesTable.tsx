// src/components/roles/RolesTable.tsx
import { useState } from 'react';
import Filters from './Filters';
import TableComponent from './TableComponent';
import PermissionsModal from './PermissionsModal';
import Pagination from "@/components/tables/Pagination";
import { useRolesTable } from '@/hooks/useRolesTable';
import { TABLE_COLUMNS } from '@/constants/rolesTable';
import type { RoleTableRow } from '@/types/role';

interface RolesTableProps {
  initialData: RoleTableRow[]; // Cambiado de Role[] a RoleTableRow[]
}

export default function RolesTable({ initialData }: RolesTableProps) {
  const {
    sortConfig,
    paginatedData,
    totalItems,
    currentPage,
    totalPages,
    selectedRole,
    isModalOpen,
    handleSort,
    handlePageChange,
    openPermissionsModal,
    closeModal,
    filterProps,
  } = useRolesTable(initialData);

  // Debug: Verifica los datos que llegan al componente
 

  if (!paginatedData.length) {
    return (
      <div className="space-y-6">
        <Filters {...filterProps} />
        <div className="text-center py-8">
          <p>No hay datos para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Filters {...filterProps} />

      <TableComponent
        columns={TABLE_COLUMNS}
        data={paginatedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        onRowClick={openPermissionsModal}
      />

      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-white/[0.05]">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {(currentPage - 1) * filterProps.itemsPerPage + 1} a{' '}
          {Math.min(currentPage * filterProps.itemsPerPage, totalItems)} de {totalItems} roles
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <PermissionsModal
        role={selectedRole}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}