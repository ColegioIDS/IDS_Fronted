import { Modal } from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/tableCustom'; // Importación corregida
import Badge from "@/components/ui/badge/Badge";
import { Button } from '@/components/ui/button';
import type { RoleTableRow as Role } from '@/types/role';
import { Permission } from '@/types/permission';

interface PermissionsModalProps {
  role?: Role | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PermissionsModal({ role, isOpen, onClose }: PermissionsModalProps) {
  if (!role) return null;


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl p-6"
      showCloseButton
    >
      {/* Cambié selectedRole por role que es el prop que recibe el componente */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Permisos del Rol: {role.name}</h2>

      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
          {role.description ? (
            <span className="italic">{role.description}</span>
          ) : (
            <span className="italic text-gray-400 dark:text-gray-500">
              Sin descripción disponible
            </span>
          )}
        </p>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Módulo
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Acción
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Descripción
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Activo
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Sistema
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {role.permissions?.map((perm) => (

                <TableRow key={perm.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {perm.module}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {perm.action}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {perm.description || (
                      <span className="italic text-gray-400 dark:text-gray-500">Sin descripción</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <Badge size="sm" color={perm.isActive ? "success" : "error"}>
                      {perm.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start">
                    <Badge size="sm" color={perm.isSystem ? "success" : "error"}>
                      {perm.isSystem ? "Sí" : "No"}
                    </Badge>
                  </TableCell>


                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          className="px-4 py-2"
        >
          Cerrar
        </Button>
      </div>
    </Modal>
  );
}