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
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Users, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { Grade } from "@/types/grades"



interface GradeDataTableProps {
  data: Grade[]
  onEdit?: (grade: Grade) => void
  onDelete?: (grade: Grade) => void
  onView?: (grade: Grade) => void
}

export const getGradeColumns = (
  onEdit?: (grade: Grade) => void,
  onDelete?: (grade: Grade) => void,
  onView?: (grade: Grade) => void
): ColumnDef<Grade>[] => [
  {
    accessorKey: "name",
    header: "Grado",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
          <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <p className="font-semibold text-gray-900 dark:text-gray-100">{row.original.name}</p>
      </div>
    ),
  },
  {
    accessorKey: "level",
    header: "Nivel",
    cell: ({ row }) => (
      <Badge 
        variant="outline" 
        className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
      >
        Nivel {row.original.level}
      </Badge>
    ),
  },
  {
    accessorKey: "schoolCycleName",
    header: "Ciclo Escolar",
    cell: ({ row }) => (
      <span className="text-gray-600 dark:text-gray-400 font-medium">
        0
      </span>
    ),
  },
  {
    accessorKey: "sectionsCount",
    header: "Secciones",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        <span className="font-medium text-gray-900 dark:text-gray-100">
          0
        </span>
      </div>
    ),
  },
  {
    accessorKey: "studentsCount",
    header: "Estudiantes",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-green-500 dark:text-green-400" />
        <span className="font-medium text-gray-900 dark:text-gray-100">
         0
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const grade = row.original
      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onView && (
                <DropdownMenuItem onClick={() => onView(grade)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalles
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(grade)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-900/30"
                  onClick={() => onDelete(grade)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

export function GradeDataTable({ data, onEdit, onDelete, onView }: GradeDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns: getGradeColumns(onEdit, onDelete, onView),
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
  })

  return (
    <div className="rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
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
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
            className="hidden md:flex"
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
            className="hidden md:flex"
          >
            Última
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow 
              key={headerGroup.id} 
              className="bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 border-b border-gray-200/50 dark:border-gray-700/50"
            >
              {headerGroup.headers.map((header) => (
                <TableHead 
                  key={header.id} 
                  className="font-semibold text-gray-700 dark:text-gray-300 py-4"
                >
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-white/50 dark:hover:bg-gray-800/50 border-b border-gray-100/50 dark:border-gray-700/50 transition-colors"
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={getGradeColumns().length} className="h-24 text-center">
                No se encontraron grados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          {table.getFilteredRowModel().rows.length === 0
            ? 0
            : pagination.pageIndex * pagination.pageSize + 1}{" "}
          -{" "}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          de {table.getFilteredRowModel().rows.length} grados
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
            className="hidden md:flex"
          >
            <FiChevronsLeft className="h-4 w-4 mr-1" />
            Primera
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <FiChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
            <FiChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
            className="hidden md:flex"
          >
            Última
            <FiChevronsRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}