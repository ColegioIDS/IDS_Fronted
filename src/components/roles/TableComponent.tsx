// src/components/roles/TableComponent.tsx
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { Button } from '@/components/ui/button';
import { FaChevronUp, FaChevronDown, FaRegEdit, FaTrashAlt } from 'react-icons/fa';
import { TABLE_COLUMNS } from '@/constants/rolesTable';
import type { RoleTableRow } from '@/types/role';
import { on } from 'events';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface TableColumn {
  key: keyof RoleTableRow | 'actions'; // Añade 'actions' como key válida
  label: string;
  sortable?: boolean;
  isActionColumn?: boolean; // Añade esta propiedad
}

interface TableComponentProps {
  columns: TableColumn[]; // Usa la nueva interfaz TableColumn
  data: any[];
  sortConfig?: SortConfig | null;
  onSort: (key: keyof RoleTableRow) => void;
  onRowClick?: (row: any) => void;
  onDelete?: (row: RoleTableRow) => void;
  onEdit?: (row: RoleTableRow) => void;

}

export default function TableComponent({
  columns,
  data,
  sortConfig,
  onSort,
  onRowClick,
  onDelete, // ✅ nueva prop
  onEdit, // ✅ nueva prop
}: TableComponentProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow className="h-[80px]">
              {columns.map(({ key, label, sortable = true }) => (
                <TableCell
                  isHeader
                  key={key}
                  onClick={() => sortable && onSort(key)}
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
                          <FaChevronDown className="inline-block text-xs opacity-20" />
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.05]">
                {columns.map(({ key, isActionColumn }) => (
                  <TableCell
                    key={`${row.id}-${key}`}
                    className={`px-4 py-3 text-start text-theme-sm ${key === 'name' ? 'px-5 sm:px-6' : ''
                      }`}
                  >
                    {isActionColumn ? (



                      <div className="flex space-x-2">
                        {/* Botón Ver Permisos (existente) */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Ver permisos:", row.id);
                            onRowClick?.(row);
                          }}
                        >
                          Ver
                        </Button>

                        {/* Nuevo Botón Editar */}


                        <Button variant="ghost" size="icon" className="size-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(row);
                            console.log("Editar:", row.id);
                            // Aquí puedes llamar a una función onEdit(row) si la necesitas
                          }}
                        >
                          <FaRegEdit />

                        </Button>


                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                           onDelete?.(row);
                            console.log("Eliminar:", row.id);
                          }}
                          className="size-8"
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>




                    ) : key === 'name' ? (
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {row[key]}
                      </span>
                    ) : key === 'isActive' ? (
                      <Badge size="sm" color={row[key] ? "success" : "error"}>
                        {row[key] ? "Activo" : "Inactivo"}
                      </Badge>
                    ) : key === 'userCount' ? (
                      <Badge size="sm" color="info">
                        {row[key]} usuarios
                      </Badge>
                    ) : key === 'permissionCount' ? (
                      <Badge size="sm" color="info">
                        {row[key]} permisos
                      </Badge>
                    ) : key === 'createdBy' ? (
                      <span className="text-gray-500 dark:text-gray-400">
                        {row[key] || "--"}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        {row[key]}
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </div>
    </div>
  );
}