import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useState } from "react";
import { PermissionsModal } from "@/components/ui/modal/Modal"; // Asegúrate de tener este componente
import Button from "@/components/ui/button/Button"; // Asegúrate de tener este componente

import { Modal } from "@/components/ui/modal";

interface Permission {
  id: number;
  module: string;
  action: string;
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreatedBy {
  id: number;
  fullName: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: number | null;
  modifiedById: number | null;
  userCount: number;
  permissions: Permission[];
  createdBy: CreatedBy | null;
  modifiedBy: CreatedBy | null;
}

// Datos de ejemplo basados en tu JSON
const rolesData = {
 "data": [
    {
      "id": 1,
      "name": "Support2",
      "description": "Soporte técnico nivel 1",
      "isActive": true,
      "createdAt": "2025-06-24T18:12:09.232Z",
      "updatedAt": "2025-06-24T22:23:04.413Z",
      "createdById": null,
      "modifiedById": null,
      "userCount": 1,
      "permissions": [
        {
          "id": 1,
          "module": "support",
          "action": "view_tickets",
          "description": "Ver tickets de soporte",
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-24T18:13:44.614Z",
          "updatedAt": "2025-06-24T18:13:44.614Z"
        },
        {
          "id": 2,
          "module": "support",
          "action": "edit_tickets",
          "description": "Editar tickets de soporte",
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-24T18:14:00.000Z",
          "updatedAt": "2025-06-24T18:14:00.000Z"
        }
      ],
      "createdBy": null,
      "modifiedBy": null
    },
    {
      "id": 2,
      "name": "Admin",
      "description": "Administrador del sistema",
      "isActive": true,
      "createdAt": "2025-06-25T09:00:00.000Z",
      "updatedAt": "2025-06-25T09:00:00.000Z",
      "createdById": 1,
      "modifiedById": null,
      "userCount": 2,
      "permissions": [
        {
          "id": 3,
          "module": "admin",
          "action": "manage_users",
          "description": "Gestionar usuarios",
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-25T09:01:00.000Z",
          "updatedAt": "2025-06-25T09:01:00.000Z"
        },
        {
          "id": 4,
          "module": "admin",
          "action": "manage_roles",
          "description": "Gestionar roles",
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-25T09:02:00.000Z",
          "updatedAt": "2025-06-25T09:02:00.000Z"
        },
        {
          "id": 5,
          "module": "reports",
          "action": "view_reports",
          "description": "Ver reportes del sistema",
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-25T09:03:00.000Z",
          "updatedAt": "2025-06-25T09:03:00.000Z"
        }
      ],
      "createdBy": {
        "id": 1,
        "fullName": "Ana Maria Gomez Lopez"
      },
      "modifiedBy": null
    },
    {
      "id": 3,
      "name": "Support22",
      "description": "Soporte técnico nivel 2",
      "isActive": true,
      "createdAt": "2025-06-24T18:14:02.496Z",
      "updatedAt": "2025-06-24T18:14:02.496Z",
      "createdById": 5,
      "modifiedById": 1,
      "userCount": 0,
      "permissions": [
        {
          "id": 1,
          "module": "support",
          "action": "view_tickets",
          "description": "Ver tickets de soporte",
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-24T18:13:44.614Z",
          "updatedAt": "2025-06-24T18:13:44.614Z"
        },
        {
          "id": 6,
          "module": "support",
          "action": "resolve_tickets",
          "description": "Resolver tickets de soporte",
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-24T18:15:00.000Z",
          "updatedAt": "2025-06-24T18:15:00.000Z"
        }
      ],
      "createdBy": {
        "id": 5,
        "fullName": "Juan Carlos Perez Sanchez"
      },
      "modifiedBy": {
        "id": 1,
        "fullName": "Ana Maria Gomez Lopez"
      }
    },
    {
      "id": 4,
      "name": "Guest",
      "description": "Acceso limitado para invitados",
      "isActive": true,
      "createdAt": "2025-06-26T10:00:00.000Z",
      "updatedAt": "2025-06-26T10:00:00.000Z",
      "createdById": 2,
      "modifiedById": null,
      "userCount": 5,
      "permissions": [
        {
          "id": 7,
          "module": "content",
          "action": "view_public",
          "description": "Ver contenido público",
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-26T10:01:00.000Z",
          "updatedAt": "2025-06-26T10:01:00.000Z"
        }
      ],
      "createdBy": {
        "id": 2,
        "fullName": "Maria Fernanda Diaz Torres"
      },
      "modifiedBy": null
    },
    {
      "id": 5,
      "name": "Manager",
      "description": "Gestor de equipos",
      "isActive": false,
      "createdAt": "2025-06-27T12:00:00.000Z",
      "updatedAt": "2025-06-27T12:00:00.000Z",
      "createdById": 3,
      "modifiedById": 3,
      "userCount": 3,
      "permissions": [
        {
          "id": 8,
          "module": "team",
          "action": "manage_team",
          "description": "Gestionar equipos",
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-27T12:01:00.000Z",
          "updatedAt": "2025-06-27T12:01:00.000Z"
        },
        {
          "id": 9,
          "module": "reports",
          "action": "generate_reports",
          "description": "Generar reportes",
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-27T12:02:00.000Z",
          "updatedAt": "2025-06-27T12:02:00.000Z"
        }
      ],
      "createdBy": {
        "id": 3,
        "fullName": "Luis Alberto Martinez Ruiz"
      },
      "modifiedBy": {
        "id": 3,
        "fullName": "Luis Alberto Martinez Ruiz"
      }
    }
  ]
};

export default function RolesTable() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Nombre
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
                Usuarios
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Creado por
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Estado
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Permisos
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {rolesData.data.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {role.name}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {role.description}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge size="sm" color="info">
                    {role.userCount} usuarios
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {role.createdBy ? role.createdBy.fullName : "--"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={role.isActive ? "success" : "error"}
                  >
                    {role.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge size="sm" color="info">
                    {role.permissions.length} permisos
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openPermissionsModal(role)}
                  >
                    Ver permisos
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>


      

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        className="max-w-4xl p-6"
        showCloseButton={true}
        isFullscreen={false}
        disableBackdropClose={false}
      >
        {selectedRole && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Permisos del Rol: {selectedRole.name}</h2>

            <div className=" p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">{selectedRole.description}</p>

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
                    {selectedRole.permissions.map((perm) => (
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
                          {perm.isSystem ? (
                            <Badge size="sm" color="info">
                              Sí
                            </Badge>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">—</span>
                          )}
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
                onClick={closeModal}
                className="px-4 py-2"
              >
                Cerrar
              </Button>
            </div>
          </>
        )}
      </Modal>





    </div>
  );
}