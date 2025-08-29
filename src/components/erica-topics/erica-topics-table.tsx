// components/erica-topics/erica-topics-table.tsx
"use client";

import { useState } from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings2, 
  Trash2, 
  CheckCircle, 
  Clock,
  Eye,
  Edit,
  Copy
} from "lucide-react";
import { createColumns } from "./columns";
import { useEricaTopicsList, useEricaTopicsForm } from "@/context/EricaTopicsContext";
import { EricaTopicsForm } from "./erica-topics-form";
import { Dialog } from "@/components/ui/dialog";

export function EricaTopicsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  
  // Estados para modals y acciones
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<number | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  const {
    topics,
    meta,
    loading,
    error,
    handleDelete,
    handleBulkDelete,
    handleMarkComplete,
    handleBulkMarkComplete
  } = useEricaTopicsList();

  const { startEdit, startDuplicate } = useEricaTopicsForm();

  // Handlers para acciones de columnas
  const handleView = (id: number) => {
    // TODO: Implementar vista de detalles
    console.log("Ver detalles del topic:", id);
  };

  const handleEdit = (id: number) => {
    setEditingTopicId(id);
    setIsFormOpen(true);
    startEdit(id);
  };

  const handleDuplicate = (id: number) => {
    setEditingTopicId(id);
    setIsFormOpen(true);
    startDuplicate(id);
  };

  const handleDeleteClick = (id: number) => {
    setTopicToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (topicToDelete) {
      await handleDelete(topicToDelete);
      setDeleteConfirmOpen(false);
      setTopicToDelete(null);
    }
  };

  const handleToggleComplete = async (id: number, isCompleted: boolean) => {
    await handleMarkComplete(id, isCompleted);
  };

  // Crear columnas con handlers
  const columns = createColumns(
    handleView,
    handleEdit,
    handleDuplicate,
    handleDeleteClick,
    handleToggleComplete
  );

  const table = useReactTable({
    data: topics,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Acciones masivas
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map(row => row.original.id);

  const handleBulkDeleteClick = () => {
    if (selectedIds.length > 0) {
      setBulkDeleteConfirmOpen(true);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length > 0) {
      await handleBulkDelete(selectedIds);
      setBulkDeleteConfirmOpen(false);
      setRowSelection({});
    }
  };

  const handleBulkMarkCompleted = async () => {
    if (selectedIds.length > 0) {
      await handleBulkMarkComplete(selectedIds, true);
      setRowSelection({});
    }
  };

  const handleBulkMarkPending = async () => {
    if (selectedIds.length > 0) {
      await handleBulkMarkComplete(selectedIds, false);
      setRowSelection({});
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTopicId(null);
  };

  if (loading && topics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-muted-foreground">Cargando temas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600 dark:text-red-400">
        <p>Error al cargar los temas: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Selector de columnas */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Settings2 className="mr-2 h-4 w-4" />
                Columnas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Acciones masivas */}
        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-sm">
              {selectedIds.length} seleccionados
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkMarkCompleted}
              className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Completar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkMarkPending}
              className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Clock className="mr-2 h-4 w-4" />
              Pendiente
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDeleteClick}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="rounded-md border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50 dark:bg-gray-900/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
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
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se encontraron temas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {selectedIds.length > 0 && (
            <span>{selectedIds.length} de </span>
          )}
          {table.getFilteredRowModel().rows.length} resultado(s) total.
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modal de formulario */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <EricaTopicsForm 
          open={isFormOpen} 
          onClose={handleCloseForm}
          topicId={editingTopicId || undefined}
        />
      </Dialog>

      {/* Dialog de confirmación - Eliminar individual */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tema?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El tema y todas sus evaluaciones
              asociadas serán eliminadas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmación - Eliminar múltiples */}
      <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {selectedIds.length} temas?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los {selectedIds.length} temas seleccionados
              y todas sus evaluaciones asociadas serán eliminadas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Eliminar {selectedIds.length} temas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}