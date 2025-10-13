// src/components/cycles/datatable.tsx
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
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { SchoolCycle } from "@/types/SchoolCycle"
import { formatDate } from "@/utils/date"
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Power,
  PowerOff,
  Lock,
  Unlock,
  Search,
  Plus,
  RefreshCw,
} from "lucide-react"

// Importamos los hooks del context
import {
  useSchoolCycleContext,
  useSchoolCycleActions,
  useSchoolCycleStats
} from '@/context/SchoolCycleContext'
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useAuth } from '@/context/AuthContext';


interface CycleDataTableProps {
  onEdit?: (cycle: SchoolCycle) => void;
  onView?: (cycle: SchoolCycle) => void;
  onDelete?: (cycle: SchoolCycle) => void;
  onCreate?: () => void;
  // Props opcionales para personalización
  showActions?: boolean;
  showToolbar?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  title?: string;
}

// Función para obtener las columnas con todas las acciones integradas
export const getColumns = (
  onEdit?: (cycle: SchoolCycle) => void,
  onView?: (cycle: SchoolCycle) => void,
  onDelete?: (cycle: SchoolCycle) => void,
  onToggleActive?: (cycle: SchoolCycle) => void,
  onToggleClosed?: (cycle: SchoolCycle) => void,
  showActions: boolean = true
): ColumnDef<SchoolCycle>[] => {
  const columns: ColumnDef<SchoolCycle>[] = [
    {
      accessorKey: "name",
      header: "Ciclo Escolar",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold">{row.original.name}</p>
            <p className="text-sm text-muted-foreground">ID: {row.original.id}</p>
          </div>
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "period",
      header: "Período Académico",
      cell: ({ row }) => {
        const startDate = new Date(row.original.startDate);
        const endDate = new Date(row.original.endDate);
        const now = new Date();

        // Calculamos si está en curso
        const isCurrentPeriod = startDate <= now && now <= endDate;
        const daysDiff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{formatDate(row.original.startDate)}</p>
            <p className="text-sm">hasta {formatDate(row.original.endDate)}</p>
            {isCurrentPeriod && (
              <p className="text-xs text-blue-600 font-medium">
                {daysDiff > 0 ? `${daysDiff} días restantes` : 'Último día'}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const cycle = row.original;
        const now = new Date();
        const startDate = new Date(cycle.startDate);
        const endDate = new Date(cycle.endDate);

        // Determinamos el estado temporal
        let temporalStatus = "future";
        if (startDate <= now && now <= endDate) temporalStatus = "current";
        else if (endDate < now) temporalStatus = "past";

        return (
          <div className="flex gap-2 flex-wrap">
            {/* Estado activo */}
            {cycle.isActive ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 shadow-sm">
                <CheckCircle className="h-3 w-3 mr-1" />
                Activo
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                <XCircle className="h-3 w-3 mr-1" />
                Inactivo
              </Badge>
            )}

            {/* Estado cerrado */}
            {cycle.isClosed && (
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                <Lock className="h-3 w-3 mr-1" />
                Cerrado
              </Badge>
            )}

            {/* Estado temporal */}
            {temporalStatus === "current" && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                En curso
              </Badge>
            )}
            {temporalStatus === "future" && (
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                Próximo
              </Badge>
            )}
            {temporalStatus === "past" && (
              <Badge variant="outline">
                Finalizado
              </Badge>
            )}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const { isActive = false, isClosed = false } = row.original;
        if (value === "active") return isActive;
        if (value === "inactive") return !isActive;
        if (value === "closed") return isClosed;
        if (value === "open") return !isClosed;
        return true;
      },

    },
    {
      accessorKey: "createdAt",
      header: "Fecha de Creación",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {row.original.createdAt ? formatDate(row.original.createdAt) : "—"}
          </span>
        </div>
      ),
    },
  ];

  // Solo agregamos la columna de acciones si showActions es true
  if (showActions) {
    columns.push({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const cycle = row.original;
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
                  <DropdownMenuItem onClick={() => onView(cycle)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalles
                  </DropdownMenuItem>
                )}

                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(cycle)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {onToggleActive && (
                  <DropdownMenuItem onClick={() => onToggleActive(cycle)}>
                    {cycle.isActive ? (
                      <>
                        <PowerOff className="h-4 w-4 mr-2" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4 mr-2" />
                        Activar
                      </>
                    )}
                  </DropdownMenuItem>
                )}

                {onToggleClosed && (
                  <DropdownMenuItem onClick={() => onToggleClosed(cycle)}>
                    {cycle.isClosed ? (
                      <>
                        <Unlock className="h-4 w-4 mr-2" />
                        Abrir
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Cerrar
                      </>
                    )}
                  </DropdownMenuItem>
                )}

                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:bg-red-50 focus:text-red-600"
                      onClick={() => onDelete(cycle)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    });
  }

  return columns;
};

export function CycleDataTable({
  onEdit,
  onView,
  onDelete,
  onCreate,
  showActions = true,
  showToolbar = true,
  showSearch = true,
  showPagination = true,
  pageSize = 10,
  title = "Ciclos Escolares"
}: CycleDataTableProps) {

  // Hooks del context
  const {
    cycles,
    isLoading,
    refetchAll
  } = useSchoolCycleContext();

  const {
    updateCycle,
    isUpdating
  } = useSchoolCycleActions();

  const stats = useSchoolCycleStats();

  const { hasPermission } = useAuth();
  const canActivate = hasPermission('school-cycle', 'activate');
  const canUpdate = hasPermission('school-cycle', 'update');
  const canDelete = hasPermission('school-cycle', 'delete');

  // Estados locales
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // Estado para confirmación de eliminación
  const [cycleToDelete, setCycleToDelete] = useState<SchoolCycle | null>(null);

  // Funciones para manejar acciones
 

    const handleToggleActive = async (cycle: SchoolCycle) => {
    if (!canActivate) {
      toast.error('No tienes permiso para activar/desactivar ciclos');
      return;
    }
    
    try {
      await updateCycle(cycle.id, {
        name: cycle.name,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        isActive: !cycle.isActive,
        isClosed: cycle.isClosed || false,
      });
      
      toast.success(
        `Ciclo ${!cycle.isActive ? 'activado' : 'desactivado'} correctamente`
      );
    } catch (error) {
      toast.error('Error al cambiar estado del ciclo');
      console.error(error);
    }
  };

  const handleToggleClosed = async (cycle: SchoolCycle) => {
    if (!canUpdate) {
      toast.error('No tienes permiso para cerrar/abrir ciclos');
      return;
    }
    
    try {
      await updateCycle(cycle.id, {
        name: cycle.name,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        isActive: cycle.isActive,
        isClosed: !(cycle.isClosed || false),
      });
      
      toast.success(
        `Ciclo ${!(cycle.isClosed || false) ? 'cerrado' : 'abierto'} correctamente`
      );
    } catch (error) {
      toast.error('Error al cambiar estado de cierre del ciclo');
      console.error(error);
    }
  };

  const handleDelete = (cycle: SchoolCycle) => {
    setCycleToDelete(cycle);
  };

  const confirmDelete = () => {
    if (cycleToDelete && onDelete) {
      onDelete(cycleToDelete);
      setCycleToDelete(null);
    }
  };

  // Configuración de columnas
 const columns = getColumns(
    canUpdate && onEdit ? onEdit : undefined,
    onView,
    canDelete && onDelete ? handleDelete : undefined,
    canActivate ? handleToggleActive : undefined,
    canUpdate ? handleToggleClosed : undefined,
    showActions
  );


  // Configuración de la tabla
  const table = useReactTable({
    data: cycles,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando ciclos escolares...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {stats.totalCycles} ciclos total • {stats.activeCycles} activos •
              {stats.currentCycles} en curso
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refetchAll}
              disabled={isUpdating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            {onCreate && (
              <Button onClick={onCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Ciclo
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Filtros */}
      {showSearch && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ciclos..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
              <SelectItem value="closed">Cerrados</SelectItem>
              <SelectItem value="open">Abiertos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Advertencia de múltiples ciclos activos */}
      {stats.hasMultipleActive && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm">
            ⚠️ Advertencia: Hay múltiples ciclos activos. Se recomienda tener solo uno activo.
          </p>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-md border">
        {/* Paginación superior */}
        {showPagination && (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Filas por página</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
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
        )}

        {/* Contenido de la tabla */}
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
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">No hay ciclos escolares</p>
                      <p className="text-sm text-muted-foreground">
                        {globalFilter ? 'No se encontraron resultados para tu búsqueda' : 'Comienza creando tu primer ciclo escolar'}
                      </p>
                    </div>
                    {onCreate && !globalFilter && (
                      <Button onClick={onCreate} className="mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Ciclo
                      </Button>
                    )}
                  </div>
                </TableCell>

              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Paginación inferior */}
        {showPagination && table.getRowModel().rows.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Mostrando {pagination.pageIndex * pagination.pageSize + 1}-
              {Math.min((pagination.pageIndex + 1) * pagination.pageSize, cycles.length)} de {cycles.length} ciclos
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
        )}
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!cycleToDelete} onOpenChange={() => setCycleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el ciclo escolar "{cycleToDelete?.name}".
              No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}