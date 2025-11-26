'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Trash2,
  AlertCircle,
  Loader2,
  Plus,
  Lock,
} from 'lucide-react';
import { studentsService } from '@/services/students.service';
import { Student } from '@/types/students.types';
import { toast } from 'sonner';
import { useStudentScope } from '@/hooks/useStudentScope';

interface StudentListProps {
  onSelectStudent?: (student: Student) => void;
  onViewStudent?: (student: Student) => void;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onCreateNew?: () => void;
  onStatsUpdate?: (students: Student[], total: number) => void;
}

export const StudentsList: React.FC<StudentListProps> = ({
  onSelectStudent,
  onViewStudent,
  onEdit,
  onDelete,
  onCreateNew,
  onStatsUpdate,
}) => {
  const router = useRouter();
  const scopeFilter = useStudentScope();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'givenNames' | 'lastNames' | 'codeSIRE' | 'createdAt'>('givenNames');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Cargar estudiantes con filtro de scope
  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams: any = {
        page,
        limit,
        search: search || undefined,
        sortBy,
        sortOrder,
      };

      // Aplicar filtros de scope basados en el rol del usuario
      if (scopeFilter.scope === 'GRADE' && scopeFilter.gradeId) {
        queryParams.gradeId = scopeFilter.gradeId;
      } else if (scopeFilter.scope === 'SECTION' && scopeFilter.sectionId) {
        queryParams.sectionId = scopeFilter.sectionId;
      }
      // Si scope === 'ALL', no agregar filtros (ver todos los estudiantes)
      
      const result = await studentsService.getStudents(queryParams);

      setStudents(result.data);
      setTotalPages(result.meta.totalPages);
      setTotal(result.meta.total);
      
      // Llamar al callback de actualización de stats
      if (onStatsUpdate) {
        onStatsUpdate(result.data, result.meta.total);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar estudiantes';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [page, limit, search, sortBy, sortOrder]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (student: Student) => {
    // Validar permisos basados en scope
    if (scopeFilter.scope === 'SECTION' && scopeFilter.sectionId) {
      const studentSection = student.enrollments?.[0]?.sectionId;
      if (studentSection !== scopeFilter.sectionId) {
        toast.error('No tienes permisos para eliminar estudiantes de otras secciones');
        return;
      }
    } else if (scopeFilter.scope === 'GRADE' && scopeFilter.gradeId) {
      const studentGrade = student.enrollments?.[0]?.gradeId;
      if (studentGrade !== scopeFilter.gradeId) {
        toast.error('No tienes permisos para eliminar estudiantes de otros grados');
        return;
      }
    }
    // Si scope === 'ALL', permitir eliminación sin restricciones

    if (!confirm(`¿Eliminar a ${student.givenNames} ${student.lastNames}?`)) {
      return;
    }

    try {
      if (!student.id) {
        toast.error('ID de estudiante no válido');
        return;
      }
      await studentsService.deleteStudent(student.id);
      toast.success('Estudiante eliminado correctamente');
      loadStudents();
      onDelete?.(student);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar estudiante');
    }
  };

  return (
    <div className="space-y-6">
      {/* Scope Information Badge */}
      {(scopeFilter.scope === 'SECTION' || scopeFilter.scope === 'GRADE') && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
          <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            {scopeFilter.scope === 'SECTION'
              ? 'Tu acceso está limitado a los estudiantes de tu sección'
              : 'Tu acceso está limitado a los estudiantes de tu grado'}
          </AlertDescription>
        </Alert>
      )}

      {/* Header con búsqueda y controles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o código SIRE..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Ordenar por */}
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="givenNames">Nombre</SelectItem>
            <SelectItem value="lastNames">Apellido</SelectItem>
            <SelectItem value="codeSIRE">Código SIRE</SelectItem>
            <SelectItem value="createdAt">Fecha Creación</SelectItem>
          </SelectContent>
        </Select>

        {/* Orden ascendente/descendente */}
        <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Orden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascendente</SelectItem>
            <SelectItem value="desc">Descendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabla */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Estudiantes Registrados
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total: {total} estudiante{total !== 1 ? 's' : ''}
            </p>
          </div>
          {onCreateNew && (
            <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Estudiante
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No hay estudiantes registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableHead className="text-gray-700 dark:text-gray-300">Código SIRE</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Nombre Completo</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Edad</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Ciclo</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Grado</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Sección</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-300">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow
                      key={student.id}
                      className="border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                    >
                      <TableCell className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {student.codeSIRE}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        {student.givenNames} {student.lastNames}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {(() => {
                          if (!student.birthDate) return '-';
                          const birthDate = new Date(student.birthDate);
                          const today = new Date();
                          const age = today.getFullYear() - birthDate.getFullYear();
                          return `${age} años`;
                        })()}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {student.enrollments?.[0]?.cycle?.name || '-'}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {student.enrollments?.[0]?.section?.grade?.name || '-'}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {student.enrollments?.[0]?.section?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 items-center">
                          {/* Scope Indicator */}
                          {(scopeFilter.scope === 'SECTION' || scopeFilter.scope === 'GRADE') && (
                            <div
                              title={
                                scopeFilter.scope === 'SECTION'
                                  ? 'Acceso limitado a la sección'
                                  : 'Acceso limitado al grado'
                              }
                              className="text-gray-500 dark:text-gray-400"
                            >
                              <Lock className="h-3.5 w-3.5" />
                            </div>
                          )}

                          {/* View Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (student.id) {
                                router.push(`/students/${student.id}`);
                              } else {
                                onViewStudent?.(student) || onSelectStudent?.(student);
                              }
                            }}
                            title="Ver detalles"
                            className="hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          >
                            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </Button>

                          {/* Edit Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (student.id) {
                                router.push(`/students/${student.id}/edit`);
                              }
                            }}
                            title="Editar"
                            className="hover:bg-amber-100 dark:hover:bg-amber-900/30"
                          >
                            <Edit2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </Button>

                          {/* Delete Button - Only for ALL scope */}
                          {scopeFilter.scope === 'ALL' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(student)}
                              title="Eliminar"
                              className="hover:bg-red-100 dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </Button>
                          ) : (
                            <div
                              title="No tienes permisos para eliminar estudiantes"
                              className="text-gray-300 dark:text-gray-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total}
          </div>
          <div className="flex items-center gap-2">
            {/* Registros por página */}
            <Select value={limit.toString()} onValueChange={(value) => {
              setLimit(parseInt(value));
              setPage(1);
            }}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>

            {/* Navegación */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="border-gray-300 dark:border-gray-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
              {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="border-gray-300 dark:border-gray-600"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
