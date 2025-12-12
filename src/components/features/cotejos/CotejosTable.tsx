'use client';

import { useMemo, useState } from 'react';
import { Loader2, Eye, EyeOff, BookOpen, Target, BarChart3, Brain, Award } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CotejosRowActions } from './CotejosRowActions';
import { CotejoResponse } from '@/types/cotejos.types';

interface CotejosTableProps {
  cotejos: CotejoResponse[];
  total: number;
  loading: boolean;
  onCotejoUpdate: () => void;
}

/**
 * Tabla que muestra todos los cotejos de una sección y curso
 */
export const CotejosTable = ({
  cotejos,
  total,
  loading,
  onCotejoUpdate,
}: CotejosTableProps) => {
  const [selectedCotejo, setSelectedCotejo] = useState<CotejoResponse | null>(null);
  const [showAssignments, setShowAssignments] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completado';
      case 'DRAFT':
        return 'Borrador';
      case 'SUBMITTED':
        return 'Enviado';
      default:
        return status;
    }
  };

  const studentName = (cot: CotejoResponse) => {
    const student = cot.enrollment?.student;
    if (!student) return 'Desconocido';
    return `${student.givenNames} ${student.lastNames}`;
  };

  // Obtener lista única de tareas ordenadas por ID
  const uniqueAssignments = useMemo(() => {
    const assignmentMap = new Map();
    cotejos.forEach((cotejo) => {
      cotejo.assignmentSubmissions?.forEach((submission) => {
        if (!assignmentMap.has(submission.assignmentId)) {
          assignmentMap.set(submission.assignmentId, {
            id: submission.assignmentId,
            title: submission.assignmentTitle,
            maxScore: submission.maxScore,
          });
        }
      });
    });
    return Array.from(assignmentMap.values()).sort((a, b) => a.id - b.id);
  }, [cotejos]);

  // Obtener calificación de una tarea para un cotejo
  const getAssignmentScore = (cotejo: CotejoResponse, assignmentId: number) => {
    const submission = cotejo.assignmentSubmissions?.find(
      (sub) => sub.assignmentId === assignmentId
    );
    if (!submission) return null;
    return submission.score !== null ? submission.score : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Cargando cotejos...</span>
      </div>
    );
  }

  if (!cotejos || cotejos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No hay cotejos disponibles</p>
        <p className="text-xs text-muted-foreground mt-1">
          Selecciona una sección y curso para ver los cotejos
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Toggle para mostrar detalles de tareas */}
      <div className="flex items-center justify-between mb-6 p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          {showAssignments ? (
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          )}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {showAssignments ? 'Detalles de tareas visibles' : 'Mostrar detalles de tareas'}
          </span>
        </div>
        <button
          onClick={() => setShowAssignments(!showAssignments)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all ${ 
            showAssignments
              ? 'bg-blue-600 shadow-md'
              : 'bg-slate-300 dark:bg-slate-600 shadow-sm'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all shadow-sm ${
              showAssignments ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/30">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Estudiante</TableHead>
              {showAssignments &&
                uniqueAssignments.map((assignment) => (
                  <TableHead
                    key={assignment.id}
                    className="text-center font-semibold text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/20 border-l border-slate-200 dark:border-slate-700"
                  >
                    <div className="whitespace-nowrap flex flex-col items-center gap-1">
                      <span className="text-xs">{assignment.title}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">({assignment.maxScore})</span>
                    </div>
                  </TableHead>
                ))}
              <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300 bg-green-50 dark:bg-green-950/20 border-l border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>ERICA</span>
                </div>
              </TableHead>
              <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/20 border-l border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>TAREAS</span>
                </div>
              </TableHead>
              <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-950/20 border-l border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>ACTITUD</span>
                </div>
              </TableHead>
              <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300 bg-purple-50 dark:bg-purple-950/20 border-l border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-1">
                  <Brain className="w-4 h-4" />
                  <span>DECLA</span>
                </div>
              </TableHead>
              <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>TOTAL</span>
                </div>
              </TableHead>
              <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Estado</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cotejos.map((cotejo) => (
              <TableRow key={cotejo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 border-b border-slate-200 dark:border-slate-700">
                {/* Estudiante */}
                <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                  <div className="flex flex-col">
                    <p className="font-semibold">{studentName(cotejo)}</p>
                    {cotejo.enrollment?.student?.codeSIRE && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {cotejo.enrollment.student.codeSIRE}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Columnas de tareas dinámicas */}
                {showAssignments &&
                  uniqueAssignments.map((assignment) => {
                    const score = getAssignmentScore(cotejo, assignment.id);
                    return (
                      <TableCell
                        key={assignment.id}
                        className="text-center bg-amber-50/60 dark:bg-amber-950/20 border-l border-slate-200 dark:border-slate-700"
                      >
                        {score !== null ? (
                          <span className="font-semibold text-amber-900 dark:text-amber-100">
                            {score.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">—</span>
                        )}
                      </TableCell>
                    );
                  })}

                {/* ERICA */}
                <TableCell className="text-center bg-green-50/60 dark:bg-green-950/20 border-l border-slate-200 dark:border-slate-700">
                  {cotejo.ericaScore !== null ? (
                    <span className="font-bold text-green-700 dark:text-green-100">
                      {cotejo.ericaScore.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600">—</span>
                  )}
                </TableCell>

                {/* TAREAS */}
                <TableCell className="text-center bg-amber-50/60 dark:bg-amber-950/20 border-l border-slate-200 dark:border-slate-700">
                  {cotejo.tasksScore !== null ? (
                    <span className="font-bold text-amber-700 dark:text-amber-100">
                      {cotejo.tasksScore.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600">—</span>
                  )}
                </TableCell>

                {/* ACTITUDINAL */}
                <TableCell className="text-center bg-blue-50/60 dark:bg-blue-950/20 border-l border-slate-200 dark:border-slate-700">
                  {cotejo.actitudinalScore !== null ? (
                    <span className="font-bold text-blue-700 dark:text-blue-100">
                      {cotejo.actitudinalScore.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600">—</span>
                  )}
                </TableCell>

                {/* DECLARATIVO */}
                <TableCell className="text-center bg-purple-50/60 dark:bg-purple-950/20 border-l border-slate-200 dark:border-slate-700">
                  {cotejo.declarativoScore !== null ? (
                    <span className="font-bold text-purple-700 dark:text-purple-100">
                      {cotejo.declarativoScore.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600">—</span>
                  )}
                </TableCell>

                {/* TOTAL */}
                <TableCell className="text-center bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
                  {cotejo.totalScore !== null ? (
                    <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      {cotejo.totalScore.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600">—</span>
                  )}
                </TableCell>

                {/* Estado */}
                <TableCell className="text-center">
                  <Badge className={getStatusColor(cotejo.status)}>
                    {getStatusLabel(cotejo.status)}
                  </Badge>
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right">
                  <CotejosRowActions
                    cotejo={cotejo}
                    onUpdate={onCotejoUpdate}
                    onSelectForDelete={() => setSelectedCotejo(cotejo)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer con contador */}
      <div className="text-sm text-muted-foreground px-2">
        Total: {total} cotejos
      </div>
    </>
  );
};
