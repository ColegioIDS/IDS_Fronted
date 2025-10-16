// components/course-grade/CourseGradeTable.tsx
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  BookOpen, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  GraduationCap,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search
} from 'lucide-react';
import { CourseGradeWithRelations } from '@/types/course-grade.types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

interface CourseGradeTableProps {
  data: CourseGradeWithRelations[];
  loading?: boolean;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

/**
 * Enhanced table component with pagination and improved visual design
 * Features: sorting, selection, actions, pagination, loading states, permissions, dark mode
 */
export function CourseGradeTable({
  data,
  loading = false,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}: CourseGradeTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CourseGradeWithRelations | 'course.name' | 'grade.name';
    direction: 'asc' | 'desc';
  } | null>(null);

  // ✅ Permisos
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission('course-grade', 'update');
  const canDelete = hasPermission('course-grade', 'delete');

  const handleSelectAll = (checked: boolean) => {
    if (!canDelete) return; // Solo permitir selección si puede eliminar
    onSelectionChange(checked ? data.map(item => item.id) : []);
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (!canDelete) return; // Solo permitir selección si puede eliminar
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: key as any, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortConfig.key) {
      case 'course.name':
        aValue = a.course.name;
        bValue = b.course.name;
        break;
      case 'grade.name':
        aValue = a.grade.name;
        bValue = b.grade.name;
        break;
      default:
        aValue = a[sortConfig.key as keyof CourseGradeWithRelations];
        bValue = b[sortConfig.key as keyof CourseGradeWithRelations];
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Kinder': 'bg-pink-100 dark:bg-pink-950/30 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800',
      'Preescolar': 'bg-pink-100 dark:bg-pink-950/30 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800',
      'Primaria': 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      'Secundaria': 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
      'Bachillerato': 'bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    };
    return colors[level] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  };

  // Pagination component
  const PaginationControls = () => {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
      <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Mostrando</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{startItem}</span>
          <span>a</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{endItem}</span>
          <span>de</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{totalItems}</span>
          <span>resultados</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="shadow-sm border-gray-300 dark:border-gray-600"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="shadow-sm border-gray-300 dark:border-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 p-0 shadow-sm ${
                    currentPage === pageNum 
                      ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="shadow-sm border-gray-300 dark:border-gray-600"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="shadow-sm border-gray-300 dark:border-gray-600"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4 bg-gray-200 dark:bg-gray-700" />
              </TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Curso</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Grado</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Tipo</TableHead>
              <TableHead className="w-20 text-gray-700 dark:text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: pageSize }).map((_, i) => (
              <TableRow key={i} className="border-b border-gray-100 dark:border-gray-800">
                <TableCell>
                  <Skeleton className="h-4 w-4 bg-gray-200 dark:bg-gray-700" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700" />
                      <Skeleton className="h-3 w-16 bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-5 w-20 bg-gray-200 dark:bg-gray-700" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16 bg-gray-200 dark:bg-gray-700" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationControls />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No hay relaciones</h3>
          <p className="mb-6 mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-sm">
            No se encontraron relaciones curso-grado que coincidan con los filtros aplicados.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="border-gray-300 dark:border-gray-600"
          >
            Refrescar página
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
              <TableHead className="w-12">
                {/* ✅ Solo mostrar checkbox si tiene permiso de eliminar */}
                {canDelete && (
                  <Checkbox
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onCheckedChange={handleSelectAll}
                  />
                )}
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 lg:px-3 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold text-gray-700 dark:text-gray-300"
                  onClick={() => handleSort('course.name')}
                >
                  Curso
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 lg:px-3 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold text-gray-700 dark:text-gray-300"
                  onClick={() => handleSort('grade.name')}
                >
                  Grado
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Tipo</TableHead>
              <TableHead className="w-20 font-semibold text-gray-700 dark:text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow 
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800"
              >
                <TableCell>
                  {/* ✅ Solo mostrar checkbox si tiene permiso de eliminar */}
                  {canDelete && (
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={(checked) => 
                        handleSelectItem(item.id, checked as boolean)
                      }
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold text-white shadow-sm border-2 border-white dark:border-gray-800"
                      style={{ 
                        backgroundColor: item.course.color || '#6366f1' 
                      }}
                    >
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {item.course.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {item.course.code}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {item.grade.name}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs mt-1 ${getLevelColor(item.grade.level)}`}
                      >
                        {item.grade.level}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={item.isCore ? "default" : "secondary"}
                    className={item.isCore 
                      ? "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" 
                      : "bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    }
                  >
                    {item.isCore ? 'Principal' : 'Electiva'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {/* ✅ Solo mostrar menú si tiene algún permiso */}
                  {(canUpdate || canDelete) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {canUpdate && (
                          <DropdownMenuItem 
                            onClick={() => onEdit(item.id)}
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar relación
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem 
                            onClick={() => setDeleteId(item.id)}
                            className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar relación
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {totalPages > 1 && <PaginationControls />}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              ¿Eliminar relación?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Esta acción no se puede deshacer. Se eliminará permanentemente la 
              relación entre el curso y el grado seleccionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 dark:border-gray-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}