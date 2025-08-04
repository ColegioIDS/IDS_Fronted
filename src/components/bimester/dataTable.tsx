"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
  PaginationState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { FiChevronLeft, FiChevronRight, FiEdit, FiMoreVertical } from "react-icons/fi"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CgPlayListRemove } from "react-icons/cg"
import { Bimester } from "@/types/SchoolBimesters"
import { formatDate } from "@/utils/date"

interface BimesterDataTableProps {
  data: Bimester[];
  onEdit: (bimester: Bimester) => void;
  onDelete?: (bimester: Bimester) => void;
}

export const getBimesterColumns = (
  onEdit: (bimester: Bimester) => void,
  onDelete?: (bimester: Bimester) => void
): ColumnDef<Bimester>[] => [
  {
    accessorKey: "name",
    header: "Bimestre",
  },
  {
    accessorKey: "number",
    header: "Número",
    cell: ({ row }) => `Bimestre ${row.original.number}`,
  },
  {
    accessorKey: "startDate",
    header: "Fecha de inicio",
    cell: ({ row }) => formatDate(row.original.startDate),
  },
  {
    accessorKey: "endDate",
    header: "Fecha de fin",
    cell: ({ row }) => formatDate(row.original.endDate),
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    accessorKey: "weeksCount",
    header: "Semanas",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const bimester = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <FiMoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(bimester)}>
              <FiEdit className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            {onDelete && (
              <DropdownMenuItem 
                className="text-red-600 focus:bg-red-50"
                onClick={() => onDelete(bimester)}
              >
                <CgPlayListRemove className="mr-2 h-4 w-4" /> Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function BimesterDataTable({ data, onEdit, onDelete }: BimesterDataTableProps) {
  const columns = getBimesterColumns(onEdit, onDelete);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Filas por página</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <FiChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <FiChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No hay bimestres registrados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {pagination.pageIndex * pagination.pageSize + 1}-
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.length)} de {data.length} bimestres
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Primera
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <FiChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <FiChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            Última
          </Button>
        </div>
      </div>
    </div>
  );
}