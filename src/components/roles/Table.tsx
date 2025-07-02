import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useState } from "react";
import { PermissionsModal } from "@/components/ui/modal/Modal";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Pagination from "@/components/tables/Pagination";
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { FaSearch, FaTimes } from 'react-icons/fa';

import { Permission, CreatedBy, RoleTableRow as Role, SortConfig } from "@/types/role";

import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";




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

const labelMap = {
  all: 'Todas las acciones',
  active: 'Activos',
  inactive: 'Inactivos',
};


export default function RolesTable() {

  // 1. Estados React
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterCreator, setFilterCreator] = useState<string>(''); // fullName
  const [filterDateRange, setFilterDateRange] = useState<[string, string] | null>(null); // ISO strings
  const [filterUserCount, setFilterUserCount] = useState<[number, number]>([0, 100]); // ajustar según datos reales


  const filteredData = rolesData.data.filter((role) => {
    // 1. Texto libre
    const matchesText = [role.name, role.description]
      .some(field => field.toLowerCase().includes(filterText.toLowerCase()));

    // 2. Estado
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && role.isActive) ||
      (filterStatus === 'inactive' && !role.isActive);

    // 3. Creador
    const matchesCreator =
      !filterCreator || role.createdBy?.fullName?.toLowerCase().includes(filterCreator.toLowerCase());

    // 4. Fecha de creación
    const matchesDate = !filterDateRange || (
      new Date(role.createdAt) >= new Date(filterDateRange[0]) &&
      new Date(role.createdAt) <= new Date(filterDateRange[1])
    );

    // 5. Rango de usuarios
    const matchesUserCount =
      role.userCount >= filterUserCount[0] && role.userCount <= filterUserCount[1];

    return matchesText && matchesStatus && matchesCreator && matchesDate && matchesUserCount;
  });


  // 2. Datos derivados
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // 3. Ordenamiento
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;
    const aValue = a[key as keyof Role];
    const bValue = b[key as keyof Role];
    const sortOrder = direction === 'asc' ? 1 : -1;

    switch (key) {
      case 'name':
      case 'description':
        return (aValue as string).localeCompare(bValue as string) * sortOrder;

      case 'userCount':
        return ((aValue as number) - (bValue as number)) * sortOrder;

      case 'isActive':
        return (Number(aValue) - Number(bValue)) * sortOrder;

      case 'permissions':
        return (a.permissions.length - b.permissions.length) * sortOrder;

      case 'createdBy':
        const aName = a.createdBy?.fullName || '';
        const bName = b.createdBy?.fullName || '';
        return aName.localeCompare(bName) * sortOrder;

      default:
        return 0;
    }
  });





  // 4. Paginación
  const paginatedData = sortedData.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  // 5. Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSort = (key: keyof Role) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };



  const openPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
  };







  return (

    <div className="space-y-6">

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filtros y Agrupación
          </h2>

          <div className="flex flex-wrap gap-4 mb-4 items-end">
            {/* Filtro texto */}


            <Input
              icon={<FaSearch />}
              placeholder="Buscar Roles..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-10"
            />

            {/* Filtro estado */}


            <Select
              value={filterStatus}
              onChange={(value) => setFilterStatus(value as 'all' | 'active' | 'inactive')}
              options={[
                { value: 'all', label: 'Todas las acciones' },
                { value: 'active', label: 'Activos' },
                { value: 'inactive', label: 'Inactivos' },
              ]}
            />

             {/* Filtro creador */}
               <Input
              icon={<FaSearch />}
              placeholder="Buscar por creador..."
              value={filterCreator}
              onChange={(e) => setFilterCreator(e.target.value)}
              className="pl-10"
            />



             
              





          </div>



        </div>
      </div>


      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header (igual que antes) */}

            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow className="h-[80px]">

                {[
                  { key: "name", label: "Nombre" },
                  { key: "description", label: "Descripción" },
                  { key: "userCount", label: "Usuarios" },
                  { key: "createdBy", label: "Creado por" },
                  { key: "isActive", label: "Estado" },
                  { key: "permissions", label: "Permisos" },
                  { key: "acciones", label: "Acciones", sortable: false },
                ].map(({ key, label, sortable = true }) => (
                  <TableCell
                    isHeader
                    key={key}
                    onClick={() => sortable && handleSort(key as keyof Role)}
                    className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 ${sortable ? "cursor-pointer select-none" : ""
                      }`}
                  >
                    <div className="flex items-center gap-1">

                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {label}
                      </span>


                      {sortable && (
                        <>
                          {sortConfig?.key === key ? (
                            sortConfig.direction === "asc" ? (
                              <FaChevronUp className="inline-block text-xs" />
                            ) : (
                              <FaChevronDown className="inline-block text-xs" />
                            )
                          ) : (
                            <FaChevronDown className="inline-block text-xs opacity-20" /> // ícono tenue
                          )}
                        </>
                      )}



                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>


            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">

              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <img
                        src="/images/icons/no-data.svg"
                        alt="No data"
                        className="w-40 h-40 mb-4 opacity-60"
                      />
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                        No hay roles disponibles
                      </p>
                      <Button variant="primary" onClick={() => console.log("Agregar nuevo rol")}>
                        + Agregar nuevo rol
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (

                paginatedData.map((role) => (

                  <TableRow key={role.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.05]">
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



                ))
              )}





            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-white/[0.05]">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} roles
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Modal (igual que antes) */}
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

    </div>
  );
}