'use client';

import { Loader2, AlertCircle, BookOpen, Target, Award } from 'lucide-react';
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
  const { data, loading, error } = useStudentSubmissions({
    courseId,
    bimesterId,
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

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/30">
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 sticky left-0 bg-slate-50 dark:bg-slate-900/30 z-10">
              Estudiante
            </TableHead>
            {allAssignments.map((assignment) => (
              <TableHead
                key={assignment.assignmentId}
                className="text-center font-semibold text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/20 border-l border-slate-200 dark:border-slate-700"
              >
                <div className="whitespace-nowrap flex flex-col items-center gap-1">
                  <span className="text-xs">{assignment.assignmentTitle}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({assignment.maxScore})
                  </span>
                </div>
              </TableHead>
            ))}
            <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-center gap-1">
                <Award className="w-4 h-4" />
                <span>TOTAL</span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.students.map((student) => (
            <TableRow
              key={student.enrollmentId}
              className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 border-b border-slate-200 dark:border-slate-700"
            >
              <TableCell className="font-medium text-slate-900 dark:text-slate-100 sticky left-0 bg-white dark:bg-slate-950/50 z-10 border-r border-slate-200 dark:border-slate-700">
                <div className="flex flex-col">
                  <p className="font-semibold">
                    {student.student.givenNames} {student.student.lastNames}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {student.student.codeSIRE}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {student.section.name}
                    </Badge>
                  </div>
                </div>
              </TableCell>
              {student.assignmentSubmissions.map((submission) => (
                <TableCell
                  key={submission.assignmentId}
                  className="text-center bg-amber-50/60 dark:bg-amber-950/20 border-l border-slate-200 dark:border-slate-700"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-amber-700 dark:text-amber-100">
                      {submission.score.toFixed(2)}
                    </span>
                    {submission.isGraded ? (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
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
              <TableCell className="text-center bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
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
  );
};
