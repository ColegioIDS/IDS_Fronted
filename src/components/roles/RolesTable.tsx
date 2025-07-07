// src/components/roles/RolesTable.tsx
import { useState } from "react";
import Filters from "./Filters";
import TableComponent from "./TableComponent";
import PermissionsModal from "./PermissionsModal";
import Pagination from "@/components/tables/Pagination";
import { useRolesTable } from "@/hooks/useRolesTable";
import { TABLE_COLUMNS } from "@/constants/rolesTable";
import type { RoleTableRow } from "@/types/role";
import { useRoles } from "@/hooks/useRoles";
import { toast } from "react-toastify";
import { useModal } from "@/hooks/useModal";
import { ModalWarningConfirm } from "@/components/ui/modal/ModalWarningConfirm";
import FormularioRolModal from './ModalFormulario';

interface RolesTableProps {
  initialData: RoleTableRow[];
}

export default function RolesTable() {
  const { roles, deleteRole } = useRoles(); // ✅

  const warningModal = useModal();
  const [roleToDelete, setRoleToDelete] = useState<RoleTableRow | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<RoleTableRow | null>(null);

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
  } = useRolesTable(roles);



  const handleDelete = (row: RoleTableRow) => {
    setRoleToDelete(row);
    warningModal.openModal();
  };

  const handleEdit = (row: RoleTableRow) => {
    setRoleToEdit(row);
    setIsFormModalOpen(true);
  };


  const confirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(String(roleToDelete.id));
      toast.success("Rol eliminado correctamente");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      warningModal.closeModal();
      setRoleToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <Filters {...filterProps} />

      <TableComponent
        columns={TABLE_COLUMNS}
        data={paginatedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        onRowClick={openPermissionsModal}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-white/[0.05]">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {(currentPage - 1) * filterProps.itemsPerPage + 1} a{" "}
          {Math.min(currentPage * filterProps.itemsPerPage, totalItems)} de {totalItems} roles
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>

      <PermissionsModal role={selectedRole} isOpen={isModalOpen} onClose={closeModal} />

      <ModalWarningConfirm
        isOpen={warningModal.isOpen}
        onClose={() => {
          warningModal.closeModal();
          setRoleToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="¿Confirmar eliminación?"
        description={
          <>
            ¿Estás seguro de que deseas eliminar el rol{" "}
            <strong>{roleToDelete?.name}</strong>? Esta acción no se puede deshacer.
          </>
        }
      />

      <FormularioRolModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setRoleToEdit(null);
        }}
        defaultValues={
          roleToEdit
            ? {
              name: roleToEdit.name,
              description: roleToEdit.description || "",
              isActive: roleToEdit.isActive,
            }
            : undefined
        }
        roleId={roleToEdit ? String(roleToEdit.id) : null} 
      />





    </div>
  );
}
