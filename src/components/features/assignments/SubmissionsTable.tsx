/**
 * Componente SubmissionsTable
 * Tabla para ver todas las entregas de una tarea
 */

'use client';

import { FC, useEffect, useState } from 'react';
import { assignmentsService } from '@/services/assignments.service';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Clock,
  PencilIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { GradeSubmissionModal } from './GradeSubmissionModal';

interface Submission {
  id: number;
  assignmentId: number;
  studentId: number;
  score?: number;
  feedback?: string;
  attachmentUrl?: string;
  notes?: string;
  submittedAt?: Date;
  createdAt: Date;
  student?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  enrollment?: {
    id: number;
    student: {
      id: number;
      givenNames: string;
      lastNames: string;
    };
  };
  isLate?: boolean;
}

interface SubmissionsTableProps {
  assignmentId: number;
  assignmentTitle: string;
  dueDate: Date;
  maxScore: number;
}

export const SubmissionsTable: FC<SubmissionsTableProps> = ({
  assignmentId,
  assignmentTitle,
  dueDate,
  maxScore,
}) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Helper para obtener el nombre del estudiante con fallbacks
  const getStudentName = (submission: Submission): string => {
    if (submission.student?.givenNames && submission.student?.lastNames) {
      return `${submission.student.givenNames} ${submission.student.lastNames}`;
    }
    if (submission.enrollment?.student?.givenNames && submission.enrollment?.student?.lastNames) {
      return `${submission.enrollment.student.givenNames} ${submission.enrollment.student.lastNames}`;
    }
    return `Estudiante #${submission.studentId}`;
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await assignmentsService.listSubmissionsByAssignment(assignmentId);
        setSubmissions(response?.submissions || []);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Error al cargar entregas';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchSubmissions();
    }
  }, [assignmentId]);

  const handleGradeSuccess = async () => {
    // Refetch submissions después de calificar
    try {
      const response = await assignmentsService.listSubmissionsByAssignment(assignmentId);
      setSubmissions(response?.submissions || []);
    } catch (err) {
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">
            Cargando entregas...
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

  if (submissions.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center">
        <FileText className="mx-auto w-10 h-10 text-gray-400 dark:text-gray-600 mb-3" />
        <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">
          Sin entregas aún
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
          Los estudiantes aún no han entregado esta tarea
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* INFORMACIÓN DE LA TAREA */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/40">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">
              Total Entregas
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
              {submissions.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">
              Calificadas
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
              {submissions.filter(s => s.score !== undefined && s.score !== null).length}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">
              Pendientes
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
              {submissions.filter(s => s.score === undefined || s.score === null).length}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">
              Máx. Puntaje
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
              {maxScore} pts
            </p>
          </div>
        </div>
      </div>

      {/* TABLA DE ENTREGAS */}
      <div className="space-y-3">
        {submissions.map((submission, index) => (
          <div
            key={submission.id}
            className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-4">
              {/* CONTENIDO PRINCIPAL */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  {/* NÚMERO */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>

                  {/* INFORMACIÓN DEL ESTUDIANTE */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {getStudentName(submission)}
                    </h3>
                    {submission.submittedAt && (
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Entregado:{' '}
                          {format(new Date(submission.submittedAt), 'dd/MM/yyyy HH:mm', {
                            locale: es,
                          })}
                        </p>
                        {submission.isLate && (
                          <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800">
                            Entrega Tardía
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* NOTAS/FEEDBACK */}
                {submission.notes && (
                  <div className="mt-2 ml-11 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-700 dark:text-gray-300">
                    <p className="font-medium mb-1">Notas del estudiante:</p>
                    <p>{submission.notes}</p>
                  </div>
                )}
              </div>

              {/* PUNTUACIÓN Y ACCIONES */}
              <div className="flex items-center gap-4 flex-shrink-0">
                {/* PUNTUACIÓN */}
                <div className="text-right">
                  {submission.score !== undefined && submission.score !== null ? (
                    <div className="flex flex-col items-end">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {submission.score}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        / {maxScore} pts
                      </p>
                      {submission.feedback && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-xs line-clamp-2">
                          {submission.feedback}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">
                        Pendiente
                      </Badge>
                    </div>
                  )}
                </div>

                {/* BOTONES */}
                <div className="flex gap-2">
                  {submission.attachmentUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors"
                      title="Descargar"
                      onClick={() => {
                        window.open(submission.attachmentUrl, '_blank');
                        toast.success('Descargando archivo...');
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-md transition-colors"
                    title="Ver detalles"
                    onClick={() => {
                      // TODO: Implementar detalles de entrega
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-md transition-colors"
                    title="Calificar"
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setIsGradeModalOpen(true);
                    }}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* GRADE SUBMISSION MODAL */}
      {selectedSubmission && (
        <GradeSubmissionModal
          isOpen={isGradeModalOpen}
          onOpenChange={setIsGradeModalOpen}
          submission={selectedSubmission}
          maxScore={maxScore}
          onSuccess={handleGradeSuccess}
        />
      )}
    </div>
  );
};
