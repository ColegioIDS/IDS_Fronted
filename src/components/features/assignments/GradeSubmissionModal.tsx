/**
 * Componente GradeSubmissionModal
 * Sheet (sidebar) para calificar una entrega específica
 */

'use client';

import { FC, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Award,
  FileText,
  Download,
  X,
} from 'lucide-react';
import { assignmentsService } from '@/services/assignments.service';
import { toast } from 'sonner';

interface Submission {
  id: number;
  assignmentId: number;
  studentId: number;
  score?: number;
  feedback?: string;
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
}

interface GradeSubmissionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Submission | null;
  maxScore: number;
  onSuccess?: () => void;
}

export const GradeSubmissionModal: FC<GradeSubmissionModalProps> = ({
  isOpen,
  onOpenChange,
  submission,
  maxScore,
  onSuccess,
}) => {
  const [score, setScore] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!submission) return null;

  // Helper para obtener el nombre del estudiante con fallbacks
  const getStudentName = (): string => {
    if (submission.student?.givenNames && submission.student?.lastNames) {
      return `${submission.student.givenNames} ${submission.student.lastNames}`;
    }
    if (submission.enrollment?.student?.givenNames && submission.enrollment?.student?.lastNames) {
      return `${submission.enrollment.student.givenNames} ${submission.enrollment.student.lastNames}`;
    }
    return `Estudiante #${submission.studentId}`;
  };

  const studentName = getStudentName();

  // Validación de score
  const scoreNum = parseFloat(score);
  const isValidScore =
    score !== '' &&
    !isNaN(scoreNum) &&
    scoreNum >= 0 &&
    scoreNum <= maxScore;

  const handleSubmit = async () => {
    if (!isValidScore) {
      setError(`La puntuación debe estar entre 0 y ${maxScore}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await assignmentsService.gradeSubmission(
        submission.assignmentId,
        submission.id,
        {
          score: scoreNum,
          feedback: feedback.trim() || undefined,
        }
      );

      toast.success('Entrega calificada exitosamente', {
        description: `${studentName} - ${scoreNum}/${maxScore} pts`,
      });

      // Reset form
      setScore('');
      setFeedback('');

      // Close modal
      onOpenChange(false);

      // Callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al calificar';
      setError(errorMsg);
      toast.error('Error al calificar', {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setScore('');
    setFeedback('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 p-0 flex flex-col overflow-hidden sm:max-w-full" showClose={false}>
        <SheetHeader className="border-b border-gray-200 dark:border-gray-800 p-6 pb-4 flex-shrink-0">
          <SheetTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Calificar entrega
          </SheetTitle>
          <SheetDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Asigna una puntuación y feedback para esta entrega
          </SheetDescription>
        </SheetHeader>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* INFORMACIÓN DEL ESTUDIANTE */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {studentName}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  ID: {submission.studentId}
                </p>
              </div>
            </div>
          </div>

          {/* PUNTUACIÓN ACTUAL (si ya está calificada) */}
          {submission.score !== undefined && submission.score !== null && (
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-200 ml-2">
                Esta entrega ya tiene calificación: <strong>{submission.score}/{maxScore} pts</strong>
                {submission.feedback && (
                  <p className="mt-1 text-xs italic">
                    Feedback anterior: "{submission.feedback}"
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* FORM */}
          <div className="space-y-4">
            {/* SCORE INPUT */}
            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 block">
                Puntuación
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max={maxScore}
                  step="0.5"
                  placeholder="0"
                  value={score}
                  onChange={(e) => {
                    setScore(e.target.value);
                    setError(null);
                  }}
                  disabled={loading}
                  className="dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 pr-12"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>/</span>
                  <span className="font-semibold">{maxScore}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ingresa un valor entre 0 y {maxScore}
              </p>

              {/* Visual indicator */}
              {isValidScore && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 transition-all duration-300"
                      style={{ width: `${(scoreNum / maxScore) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                    {((scoreNum / maxScore) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>

            {/* FEEDBACK TEXTAREA */}
            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 block">
                Comentarios / Feedback (opcional)
              </label>
              <Textarea
                placeholder="Escribe aquí tus comentarios, sugerencias o retroalimentación para el estudiante..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={loading}
                rows={4}
                className="dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {feedback.length} / 500 caracteres
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* INFO FOOTER */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Award className="w-3 h-3" />
              Puntuación máxima: <strong>{maxScore} pts</strong>
            </p>
          </div>
        </div>

        {/* FOOTER CON BOTONES */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValidScore || loading}
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Calificar
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
