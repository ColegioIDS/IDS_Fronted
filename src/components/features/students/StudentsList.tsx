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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  searchFilter?: string;
  enrollmentFilter?: 'all' | 'enrolled' | 'not-enrolled';
}

export const StudentsList: React.FC<StudentListProps> = ({
  onSelectStudent,
  onViewStudent,
  onEdit,
  onDelete,
  onCreateNew,
  onStatsUpdate,
  searchFilter = '',
  enrollmentFilter = 'all',
}) => {
  const router = useRouter();
  const scopeFilter = useStudentScope();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchFilter);
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
        search: search || searchFilter || undefined,
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
  }, [page, limit, search, sortBy, sortOrder, enrollmentFilter]);

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

  const getInitials = (givenNames: string, lastNames: string) => {
    const given = givenNames?.split(' ')[0]?.[0] || '';
    const last = lastNames?.split(' ')[0]?.[0] || '';
    return `${given}${last}`.toUpperCase();
  };

  const calculateAge = (birthDate: Date | string | undefined) => {
    if (!birthDate) return '-';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  const isEnrolled = (student: Student) => {
    return student.enrollments && student.enrollments.length > 0;
  };

  const filteredStudents = students.filter(student => {
    if (enrollmentFilter === 'enrolled') return isEnrolled(student);
    if (enrollmentFilter === 'not-enrolled') return !isEnrolled(student);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Scope Information Badge */}
      {(scopeFilter.scope === 'SECTION' || scopeFilter.scope === 'GRADE') && (
        <Alert className="border-blue-200/50 bg-gradient-to-r from-blue-50 to-blue-50/50 dark:border-blue-800/50 dark:from-blue-950/30 dark:to-blue-950/20">
          <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300 font-medium flex items-center gap-2">
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o código SIRE..."
            value={search || searchFilter}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50"
          />
        </div>

        {/* Ordenar por */}
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="h-10 border-slate-200 dark:border-slate-700">
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
          <SelectTrigger className="h-10 border-slate-200 dark:border-slate-700">
            <SelectValue placeholder="Orden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascendente ↑</SelectItem>
            <SelectItem value="desc">Descendente ↓</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabla Mejorada */}
      <Card className="border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 border-b border-slate-200/50 dark:border-slate-700/50 pb-4">
          <div>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-lg">Estudiantes Registrados</span>
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Total: <span className="font-bold text-slate-900 dark:text-white">{total}</span> estudiante{total !== 1 ? 's' : ''} • Mostrando: <span className="font-bold text-slate-900 dark:text-white">{filteredStudents.length}</span>
            </p>
          </div>
          {onCreateNew && (
            <Button onClick={onCreateNew} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2">
              <Plus className="h-4 w-4" />
              Nuevo
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">Cargando estudiantes...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">No hay estudiantes registrados</p>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Comienza agregando un nuevo estudiante</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                    <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Estudiante</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Código SIRE</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Edad</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Ciclo / Grado</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Estado</TableHead>
                    <TableHead className="text-right text-slate-700 dark:text-slate-300 font-bold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      className="border-slate-200 dark:border-slate-700/50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent dark:hover:from-blue-950/30 dark:hover:to-transparent transition-colors"
                    >
                      {/* Nombre con Avatar */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-blue-200 dark:border-blue-800">
                            <AvatarImage src={student.pictures?.[0]?.url} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-700 dark:text-blue-300 font-bold text-sm">
                              {getInitials(student.givenNames, student.lastNames)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                              {student.givenNames} {student.lastNames}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {student.gender === 'Masculino' ? 'Masculino' : 'Femenino'}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Código SIRE */}
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
                          {student.codeSIRE}
                        </Badge>
                      </TableCell>

                      {/* Edad */}
                      <TableCell className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                        {calculateAge(student.birthDate)}
                      </TableCell>

                      {/* Ciclo / Grado */}
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {student.enrollments?.[0]?.section?.grade?.name || '-'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {student.enrollments?.[0]?.cycle?.name || 'Sin ciclo'}
                          </p>
                        </div>
                      </TableCell>

                      {/* Estado */}
                      <TableCell>
                        {isEnrolled(student) ? (
                          <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Inscrito
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 items-center">
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
                            className="hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          >
                            <Eye className="h-4 w-4" />
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
                            className="hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          {/* Delete Button - Only for ALL scope */}
                          {scopeFilter.scope === 'ALL' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(student)}
                              title="Eliminar"
                              className="hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <div
                              title="No tienes permisos para eliminar estudiantes"
                              className="text-slate-300 dark:text-slate-600 w-9 h-9 flex items-center justify-center"
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

      {/* Paginación - Siempre visible */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-lg">
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Mostrando <span className="font-bold text-slate-900 dark:text-white">{students.length === 0 ? 0 : (page - 1) * limit + 1}</span> a <span className="font-bold text-slate-900 dark:text-white">{Math.min(page * limit, total)}</span> de <span className="font-bold text-slate-900 dark:text-white">{total}</span> registros
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Registros por página */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Por página:</span>
            <Select value={limit.toString()} onValueChange={(value) => {
              setLimit(parseInt(value));
              setPage(1);
            }}>
              <SelectTrigger className="w-[100px] h-9 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Navegación - Solo si hay múltiples páginas */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-1 text-sm font-bold text-slate-900 dark:text-white min-w-[60px] text-center">
                {page} / {totalPages}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
