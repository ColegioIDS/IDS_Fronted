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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi"
import { Edit, Trash2, MoreHorizontal, Eye, Users, User, Search, Filter } from 'lucide-react'
import {Section} from "@/types/sections"
import { Grade } from "@/types/grades"




interface SectionsDataTableProps {
  data: Section[]
  grades: Grade[]
  isLoading?: boolean
  error?: string
  onEdit?: (section: Section) => void
  onDelete?: (section: Section) => void
  onView?: (section: Section) => void
}

export const getSectionColumns = (
  onEdit?: (section: Section) => void,
  onDelete?: (section: Section) => void,
  onView?: (section: Section) => void
): ColumnDef<Section>[] => [
  {
    accessorKey: "name",
    header: "Sección",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-pink-100 dark:bg-pink-900/50 rounded-lg">
          <Users className="h-4 w-4 text-pink-600 dark:text-pink-400" />
        </div>
        <p className="font-semibold text-gray-900 dark:text-gray-100">{row.original.name}</p>
      </div>
    ),
  },
  {
    accessorKey: "grade.name",
    header: "Grado",
    cell: ({ row }) => (
      <Badge 
        variant="outline" 
        className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      >
        {row.original.grade.name} - {row.original.grade.level}
      </Badge>
    ),
    sortingFn: (rowA, rowB) => {
      const gradeOrder = (gradeName: string) => {
        const gradeMap: { [key: string]: number } = {
          "Pre-Kinder": 0,
          "Kinder": 1,
          "1er Grado": 2,
          "2do Grado": 3,
          "3er Grado": 4,
          "4to Grado": 5,
          "5to Grado": 6,
          "6to Grado": 7,
          "7mo Grado": 8,
          "8vo Grado": 9,
          "9no Grado": 10,
          "10mo Grado": 11,
          "11vo Grado": 12,
        }
        return gradeMap[gradeName] !== undefined ? gradeMap[gradeName] : 99
      }
      return gradeOrder(rowA.original.grade.name) - gradeOrder(rowB.original.grade.name)
    },
  },
  {
    accessorKey: "capacity",
    header: "Capacidad",
    cell: ({ row }) => {
      const studentsCount =  0
      const occupancyPercentage = (studentsCount / row.original.capacity) * 100
      const progressColor = occupancyPercentage > 90 
        ? "bg-red-500" 
        : occupancyPercentage > 70 
          ? "bg-orange-500" 
          : "bg-green-500"

      return (
        <div className="space-y-2 min-w-32">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Estudiantes</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {studentsCount}/{row.original.capacity}
            </span>
          </div>
          <Progress 
            value={occupancyPercentage} 
            className="h-2" 
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {occupancyPercentage.toFixed(0)}% ocupado
          </p>
        </div>
      )
    },
    sortingFn: (rowA, rowB) => {
      const percentageA = (( 0) / rowA.original.capacity) * 100
      const percentageB = (( 0) / rowB.original.capacity) * 100
      return percentageA - percentageB
    },
  },
  {
    accessorKey: "teacher",
    header: "Profesor",
    cell: ({ row }) => {
      const teacherName = row.original.teacher 
        ? `${row.original.teacher.givenNames} ${row.original.teacher.lastNames}`
        :  "Sin asignar"

      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span className={`font-medium ${teacherName === "Sin asignar" ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"}`}>
            {teacherName}
          </span>
        </div>
      )
    },
    sortingFn: (rowA, rowB) => {
      const teacherA = rowA.original.teacher 
        ? `${rowA.original.teacher.givenNames} ${rowA.original.teacher.lastNames}`
        : rowA.original.name || "Sin asignar"
      const teacherB = rowB.original.teacher 
        ? `${rowB.original.teacher.givenNames} ${rowB.original.teacher.lastNames}`
        : "Sin asignar"
      return teacherA.localeCompare(teacherB)
    },
  },
  {
    accessorKey: "grade.isActive",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.grade.isActive ? 'default' : 'secondary'}>
        {row.original.grade.isActive ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const section = row.original
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
                <DropdownMenuItem onClick={() => onView(section)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalles
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(section)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-900/30"
                  onClick={() => onDelete(section)}
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

export function SectionsDataTable({ 
  data, 
  grades,
  isLoading = false,
  error,
  onEdit, 
  onDelete, 
  onView 
}: SectionsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns: getSectionColumns(onEdit, onDelete, onView),
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

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
        <div className="p-8 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-600 dark:text-red-400">
            {error}
          </div>
        </div>
      </div>
    )
  }

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
              <TableCell colSpan={getSectionColumns().length} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 space-y-2">
                  <Users className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm">No se encontraron secciones</p>
                </div>
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
          de {table.getFilteredRowModel().rows.length} secciones
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