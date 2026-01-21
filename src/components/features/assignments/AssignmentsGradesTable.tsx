'use client';

import { useState } from 'react';
import { Loader2, AlertCircle, BookOpen, Target, Award, ChevronsUpDown, ArrowUpDown, Type } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStudentSubmissions } from '@/hooks/useStudentSubmissions';
import { Badge } from '@/components/ui/badge';

interface AssignmentsGradesTableProps {
  courseId?: number;
  bimesterId?: number;
  sectionId?: number;
}

export const AssignmentsGradesTable = ({
  courseId,
  bimesterId,
  sectionId,
}: AssignmentsGradesTableProps) => {
  const [sortField, setSortField] = useState<'givenNames' | 'lastNames'>('lastNames');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [nameFormat, setNameFormat] = useState<'lastNames-givenNames' | 'givenNames-lastNames'>('lastNames-givenNames');
  
  const { data, loading, error } = useStudentSubmissions({
    courseId,
    bimesterId,
    sectionId,
    enabled: !!courseId && !!bimesterId,
  });

  if (!courseId || !bimesterId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-3" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Selecciona un curso y bimestre para ver las calificaciones
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
            Cargando calificaciones...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data || data.students.length === 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900/20 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-12 text-center">
        <Target className="mx-auto w-10 h-10 text-slate-400 dark:text-slate-600 mb-3" />
        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
          No hay estudiantes con calificaciones
        </p>
        <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
          Asigna tareas y califica para ver los resultados aquí
        </p>
      </div>
    );
  }

  // Obtener todas las tareas únicas
  const allAssignments = data.students[0]?.assignmentSubmissions || [];

  // ✅ Aplicar ordenamiento a los estudiantes
  const sortedStudents = [...data.students].sort((a, b) => {
    let aValue = sortField === 'givenNames' 
      ? a.student.givenNames 
      : a.student.lastNames;
    let bValue = sortField === 'givenNames' 
      ? b.student.givenNames 
      : b.student.lastNames;
    
    const comparison = aValue.localeCompare(bValue, 'es', { sensitivity: 'base' });
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="space-y-4">
      {/* Filtros de Ordenamiento - Minimalista */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
        {/* Encabezado */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <ChevronsUpDown className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Ordenar Estudiantes
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Formato de Nombre */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Formato
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setNameFormat('lastNames-givenNames')}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${
                  nameFormat === 'lastNames-givenNames'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Apellido, Nombre
              </button>
              <button
                onClick={() => setNameFormat('givenNames-lastNames')}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${
                  nameFormat === 'givenNames-lastNames'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Nombre, Apellido
              </button>
            </div>
          </div>

          {/* Campo de Ordenamiento */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Ordenar Por
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortField('lastNames')}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${
                  sortField === 'lastNames'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Apellido
              </button>
              <button
                onClick={() => setSortField('givenNames')}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${
                  sortField === 'givenNames'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Nombre
              </button>
            </div>
          </div>

          {/* Orden Ascendente/Descendente */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Dirección
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortOrder('asc')}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${
                  sortOrder === 'asc'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                A-Z ↑
              </button>
              <button
                onClick={() => setSortOrder('desc')}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${
                  sortOrder === 'desc'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Z-A ↓
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Calificaciones */}
      <div className="border border-slate-300 dark:border-slate-600 rounded-xl overflow-x-auto">
      <Table>
        <TableHeader className="sticky top-0 z-20">
          <TableRow className="bg-white dark:bg-slate-950 border-b-2 border-slate-300 dark:border-slate-700">
            <TableHead className="font-bold text-slate-800 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-950 z-30 py-4 px-6">
              Estudiante
            </TableHead>
            {allAssignments.map((assignment) => (
              <TableHead
                key={assignment.assignmentId}
                className="text-center font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-700 py-4 px-3"
              >
                <div className="whitespace-nowrap flex flex-col items-center gap-1">
                  <span className="text-xs">{assignment.assignmentTitle}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({assignment.maxScore})
                  </span>
                </div>
              </TableHead>
            ))}
            <TableHead className="text-center font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-700 py-4 px-3">
              <div className="flex items-center justify-center gap-2">
                <Award className="w-4 h-4" />
                <span>TOTAL</span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStudents.map((student) => (
            <TableRow
              key={student.enrollmentId}
              className="hover:bg-slate-50 dark:hover:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 transition-colors"
            >
              <TableCell className="font-medium text-slate-900 dark:text-slate-100 sticky left-0 bg-white dark:bg-slate-950 z-10 border-r border-slate-200 dark:border-slate-700 py-4 px-6">
                <div className="flex flex-col">
                  <p className="font-bold text-base text-slate-900 dark:text-slate-50">
                    {nameFormat === 'lastNames-givenNames'
                      ? `${student.student.lastNames}, ${student.student.givenNames}`
                      : `${student.student.givenNames} ${student.student.lastNames}`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                    {student.student.codeSIRE}
                  </p>
                </div>
              </TableCell>
              {student.assignmentSubmissions.map((submission) => (
                <TableCell
                  key={submission.assignmentId}
                  className="text-center bg-white dark:bg-slate-950 border-l border-slate-100 dark:border-slate-800 py-4 px-3"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-bold text-lg text-slate-800 dark:text-slate-200">
                      {submission.score.toFixed(2)}
                    </span>
                    {submission.isGraded ? (
                      <Badge
                        variant="outline"
                        className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      >
                        ✓
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      >
                        —
                      </Badge>
                    )}
                  </div>
                </TableCell>
              ))}
              <TableCell className="text-center bg-slate-50 dark:bg-slate-900/40 border-l border-slate-200 dark:border-slate-700 py-4 px-3 font-semibold">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">
                    {student.totalScore.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    / {student.maxPossibleScore}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </div>
  );
};
