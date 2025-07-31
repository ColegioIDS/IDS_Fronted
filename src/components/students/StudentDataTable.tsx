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
  PaginationState
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
import { FiChevronLeft, FiChevronRight, FiEye, FiEdit } from "react-icons/fi"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CgPlayListRemove } from "react-icons/cg"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/utils/getInitials"
import { Student } from "@/types/student"
import { FiMoreVertical } from "react-icons/fi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: "Estudiante",
    cell: ({ row }) => {
      const student = row.original
      return (
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                student.pictures?.find(p => p.kind === 'profile')?.url ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${student.givenNames} ${student.lastNames}`
              }
            />
            <AvatarFallback>
              {getInitials(student.givenNames, student.lastNames)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{`${student.givenNames} ${student.lastNames}`}</div>
            <div className="text-sm text-muted-foreground">
              {student.enrollmentStatus === 'active' ? (
                <Badge variant="outline" className="text-green-600 border-green-600 bg-green-100/30">
                  Activo
                </Badge>
              ) : (
                <Badge variant="destructive">
                  {student.enrollmentStatus}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "birthDate",
    header: "Fecha Nacimiento",
    cell: ({ row }) => {
      const date = row.original.birthDate
      return date ? new Date(date).toLocaleDateString() : 'N/A'
    }
  },
  {
    accessorKey: "gender",
    header: "Género",
  },
  {
    accessorKey: "siblings",
    header: "Hermanos",
    cell: ({ row }) => {
      const student = row.original
      return (
        <div className="flex items-center gap-3">
          <span>{student.siblingsCount}</span>
          <span className="text-blue-500">{student.brothersCount}</span>
          <span className="text-pink-500">{student.sistersCount}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "grade",
    header: "Último grado",
    cell: ({ row }) => row.original.academicRecords?.[0]?.gradeCompleted ?? 'Sin registros'
  },
  {
    accessorKey: "favoriteSubject",
    header: "Materia favorita",
    cell: ({ row }) => row.original.favoriteSubject ?? 'No indicado'
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <FiMoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {student.enrollmentStatus === 'active' ? (
              <>
                <DropdownMenuItem onClick={() => console.log("Ver", student.id)}>
                  <FiEye className="mr-2 h-4 w-4" />
                  <span>Ver detalles</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Editar", student.id)}>
                  <FiEdit className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem

                  className="text-red-600 focus:bg-red-50"
                >
                  <CgPlayListRemove className="mr-2 h-4 w-4" />
                  <span>Desactivar cuenta</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                // onClick={() => openStatusModal(student.id}
                className="text-green-600 focus:bg-green-50"
              >
                <CgPlayListRemove className="mr-2 h-4 w-4" />
                <span>Activar cuenta</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface StudentDataTableProps {
  data: Student[]
}

export function StudentDataTable({ data }: StudentDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,  // Tamaño de página por defecto
  })

  const table = useReactTable({
    data,
    columns,
    // Estados
    state: {
      sorting,
      columnFilters,
      pagination,  // Agrega el estado de paginación
    },
    // Handlers
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,  // Agrega el handler de paginación
    // Modelos
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Opciones de debug (opcional)
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  })


  return (
    <div className="rounded-md ">
      {/* Controles de paginación SUPERIORES (opcional) */}
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
              {[10, 20, 30, 40, 50].map((pageSize) => (
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
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
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
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={!row.original.enrollmentStatus ? "opacity-60" : ""}
              >
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
                No hay resultados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Controles de paginación INFERIORES */}
      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            data.length
          )}{" "}
          de {data.length} estudiantes
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
  )
}