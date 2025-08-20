// src/components/grades/GradeTable.tsx
'use client';
import { useState } from 'react';
import { Grade, GradeFilters } from '@/types/grades';
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
import { Card, CardContent } from '@/components/ui/card';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  BookOpen,
  GraduationCap,
  Baby,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface GradeTableProps {
  grades: Grade[];
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => Promise<{ success: boolean; message?: string }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onFilterChange: (filters: GradeFilters) => void;
}

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'Kinder':
      return <Baby className="h-4 w-4 text-pink-500" />;
    case 'Primaria':
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    case 'Secundaria':
      return <GraduationCap className="h-4 w-4 text-purple-500" />;
    default:
      return <BookOpen className="h-4 w-4 text-gray-500" />;
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Kinder':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'Primaria':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Secundaria':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function GradeTable({
  grades,
  loading,
  onEdit,
  onDelete,
  meta,
  onFilterChange
}: GradeTableProps) {
  const [deleteGradeId, setDeleteGradeId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteGradeId) return;
    
    setIsDeleting(true);
    try {
      await onDelete(deleteGradeId);
      setDeleteGradeId(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    onFilterChange({ page: newPage, limit: meta.limit });
  };

  if (loading && grades.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="font-semibold text-gray-900">Grado</TableHead>
                <TableHead className="font-semibold text-gray-900">Nivel</TableHead>
                <TableHead className="font-semibold text-gray-900">Orden</TableHead>
                <TableHead className="font-semibold text-gray-900">Estado</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                      <p>No hay grados registrados</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                grades.map((grade) => (
                  <TableRow key={grade.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {getLevelIcon(grade.level)}
                        <span className="text-gray-900">{grade.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getLevelColor(grade.level)} font-medium`}
                      >
                        {grade.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {grade.order}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={grade.isActive ? "default" : "secondary"}
                        className={grade.isActive 
                          ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" 
                          : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                        }
                      >
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          grade.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        {grade.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => onEdit(grade.id)}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <Edit className="h-4 w-4 text-blue-500" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <Eye className="h-4 w-4 text-green-500" />
                            <span>Ver detalles</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteGradeId(grade.id)}
                            className="flex items-center space-x-2 cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginación */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((meta.page - 1) * meta.limit) + 1} - {Math.min(meta.page * meta.limit, meta.total)} de {meta.total} grados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page === 1}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </Button>
            
            <div className="flex items-center space-x-1">
              {[...Array(meta.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isCurrentPage = pageNum === meta.page;
                
                return (
                  <Button
                    key={pageNum}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 p-0 ${
                      isCurrentPage 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'hover:bg-gray-100'
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
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page === meta.totalPages}
              className="flex items-center space-x-1"
            >
              <span>Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!deleteGradeId} onOpenChange={() => setDeleteGradeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              <span>Confirmar eliminación</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este grado? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}