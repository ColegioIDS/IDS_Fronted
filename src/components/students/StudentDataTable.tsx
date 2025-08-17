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
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiEye, 
  FiEdit,
  FiMoreVertical,
  FiChevronsLeft,
  FiChevronsRight,
  FiUser,
  FiCalendar,
  FiUsers,
  FiBook,
  FiStar,
  FiActivity
} from "react-icons/fi"
import { 
  HiOutlineAcademicCap,
  HiOutlineSparkles
} from "react-icons/hi"
import { FaMale, FaFemale } from "react-icons/fa"
import { CgPlayListRemove } from "react-icons/cg"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/utils/getInitials"
import { Student } from "@/types/student"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: () => (
      <div className="flex items-center gap-2">
        <FiUser className="h-4 w-4 text-primary" />
        <span>Estudiante</span>
      </div>
    ),
    cell: ({ row }) => {
      const student = row.original
      const activeEnrollment = student.enrollments?.find(e => e.status === 'active')
      const isActive = activeEnrollment?.status === 'active'
      
      // Función para obtener color basado en el nombre
      const getGradientFromName = (name: string) => {
        const gradients = [
          'from-violet-400 to-purple-600',
          'from-blue-400 to-cyan-600',
          'from-emerald-400 to-teal-600',
          'from-orange-400 to-red-600',
          'from-pink-400 to-rose-600',
        ]
        return gradients[name.charCodeAt(0) % gradients.length]
      }
      
      const gradient = getGradientFromName(student.givenNames)
      const profileImage = student.pictures?.find(p => p.kind === 'profile')?.url
      
      return (
        <div className="flex items-center gap-3 py-2">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800 shadow-lg">
              {profileImage ? (
                <AvatarImage
                  src={profileImage}
                  alt={`${student.givenNames} ${student.lastNames}`}
                  className="object-cover"
                />
              ) : (
                <div className={cn(
                  "w-full h-full flex items-center justify-center text-white font-semibold bg-gradient-to-br",
                  gradient
                )}>
                  {getInitials(student.givenNames, student.lastNames)}
                </div>
              )}
            </Avatar>
            <span className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-900",
              isActive ? "bg-green-500" : "bg-gray-400"
            )} />
          </div>
          <div className="flex flex-col">
            <div className="font-semibold text-gray-900 dark:text-white">
              {`${student.givenNames} ${student.lastNames}`}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {isActive ? (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 text-xs">
                  <FiActivity className="w-3 h-3 mr-1" />
                  Activo
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Inactivo
                </Badge>
              )}
              {student.codeSIRE && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ID: {student.codeSIRE}
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "birthDate",
    header: () => (
      <div className="flex items-center gap-2">
        <FiCalendar className="h-4 w-4 text-orange-500" />
        <span>Edad</span>
      </div>
    ),
    cell: ({ row }) => {
      const date = row.original.birthDate
      if (!date) return <span className="text-gray-400">N/A</span>
      
      const birthDate = new Date(date)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">{age} años</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {birthDate.toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: "gender",
    header: () => (
      <div className="flex items-center gap-2">
        <FiUser className="h-4 w-4 text-purple-500" />
        <span>Género</span>
      </div>
    ),
    cell: ({ row }) => {
      const gender = row.original.gender
      return (
        <div className="flex items-center gap-2">
          {gender === 'Masculino' ? (
            <>
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FaMale className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm">Masculino</span>
            </>
          ) : gender === 'Femenino' ? (
            <>
              <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                <FaFemale className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              </div>
              <span className="text-sm">Femenino</span>
            </>
          ) : (
            <span className="text-gray-400">No especificado</span>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "enrollment",
    header: () => (
      <div className="flex items-center gap-2">
        <HiOutlineAcademicCap className="h-4 w-4 text-indigo-500" />
        <span>Grado Actual</span>
      </div>
    ),
    cell: ({ row }) => {
      const student = row.original
      const activeEnrollment = student.enrollments?.find(e => e.status === 'active')
      
      if (!activeEnrollment) {
        return <span className="text-gray-400 text-sm">Sin asignar</span>
      }
      
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-indigo-200 dark:border-indigo-800">
            <HiOutlineAcademicCap className="w-3 h-3 mr-1" />
            Grado {activeEnrollment.gradeId}
            {activeEnrollment.sectionId && ` • Sección ${activeEnrollment.sectionId}`}
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: "siblings",
    header: () => (
      <div className="flex items-center gap-2">
        <FiUsers className="h-4 w-4 text-cyan-500" />
        <span>Hermanos</span>
      </div>
    ),
    cell: ({ row }) => {
      const student = row.original
      const total = student.siblingsCount || 0
      const brothers = student.brothersCount || 0
      const sisters = student.sistersCount || 0
      
      if (total === 0) {
        return <span className="text-gray-400 text-sm">Hijo único</span>
      }
      
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800">
            <FiUsers className="w-3 h-3 mr-1" />
            {total}
          </Badge>
          {brothers > 0 && (
            <Tooltip>
              <TooltipTrigger>
                <span className="flex items-center gap-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                  <FaMale className="text-blue-600 dark:text-blue-400" /> {brothers}
                </span>
              </TooltipTrigger>
              <TooltipContent>{brothers} hermano{brothers > 1 ? 's' : ''}</TooltipContent>
            </Tooltip>
          )}
          {sisters > 0 && (
            <Tooltip>
              <TooltipTrigger>
                <span className="flex items-center gap-0.5 text-xs bg-pink-100 dark:bg-pink-900/30 px-1.5 py-0.5 rounded">
                  <FaFemale className="text-pink-600 dark:text-pink-400" /> {sisters}
                </span>
              </TooltipTrigger>
              <TooltipContent>{sisters} hermana{sisters > 1 ? 's' : ''}</TooltipContent>
            </Tooltip>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "favoriteSubject",
    header: () => (
      <div className="flex items-center gap-2">
        <HiOutlineSparkles className="h-4 w-4 text-violet-500" />
        <span>Materia Favorita</span>
      </div>
    ),
    cell: ({ row }) => {
      const subject = row.original.favoriteSubject
      if (!subject) {
        return <span className="text-gray-400 text-sm">No indicado</span>
      }
      
      return (
        <Badge variant="outline" className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800">
          <FiStar className="w-3 h-3 mr-1" />
          {subject}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => {
      const student = row.original
      const activeEnrollment = student.enrollments?.find(e => e.status === 'active')
      const isActive = activeEnrollment?.status === 'active'
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-9 w-9 p-0 hover:bg-primary/10 rounded-lg transition-all duration-200"
            >
              <span className="sr-only">Abrir menú</span>
              <FiMoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={() => console.log("Ver", student.id)}
              className="cursor-pointer"
            >
              <FiEye className="mr-2 h-4 w-4" />
              <span>Ver detalles</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => console.log("Editar", student.id)}
              className="cursor-pointer"
            >
              <FiEdit className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isActive ? (
              <DropdownMenuItem
                onClick={() => console.log("Desactivar", student.id)}
                className="text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
              >
                <CgPlayListRemove className="mr-2 h-4 w-4" />
                <span>Desactivar estudiante</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => console.log("Activar", student.id)}
                className="text-green-600 focus:bg-green-50 dark:focus:bg-green-900/20 cursor-pointer"
              >
                <FiActivity className="mr-2 h-4 w-4" />
                <span>Activar estudiante</span>
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
    pageSize: 10,
  })

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
  })

  return (
    <div className="space-y-4">
      {/* Header con controles de paginación superiores */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mostrando
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-9 w-[70px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              de {data.length} estudiantes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-gray-200 dark:border-gray-700"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <FiChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-gray-200 dark:border-gray-700"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <FiChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center min-w-[100px] px-3 text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-gray-200 dark:border-gray-700"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <FiChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-gray-200 dark:border-gray-700"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <FiChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla con diseño mejorado */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow 
                key={headerGroup.id}
                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 border-b border-gray-200 dark:border-gray-700"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id}
                      className="text-gray-700 dark:text-gray-300 font-semibold"
                    >
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
              table.getRowModel().rows.map((row, index) => {
                const activeEnrollment = row.original.enrollments?.find(e => e.status === 'active')
                const isActive = activeEnrollment?.status === 'active'
                
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200",
                      !isActive && "opacity-60",
                      index % 2 === 0 && "bg-gray-50/30 dark:bg-gray-900/30"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id}
                        className="py-3"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                    <FiUsers className="h-8 w-8 opacity-50" />
                    <p>No hay estudiantes registrados</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer con información de paginación */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
          </span>
          {" - "}
          <span className="font-medium text-gray-900 dark:text-white">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              data.length
            )}
          </span>
          {" de "}
          <span className="font-medium text-gray-900 dark:text-white">
            {data.length}
          </span>
          {" estudiantes"}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Ir a página:
          </span>
          <Select
            value={`${table.getState().pagination.pageIndex + 1}`}
            onValueChange={(value) => {
              const page = Number(value) - 1
              table.setPageIndex(page)
            }}
          >
            <SelectTrigger className="h-9 w-[70px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: table.getPageCount() }, (_, i) => (
                <SelectItem key={i + 1} value={`${i + 1}`}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}