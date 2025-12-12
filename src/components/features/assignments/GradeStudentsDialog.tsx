/**
 * Componente GradeStudentsDialog
 * Modal para calificar estudiantes directamente sin entregas
 */

'use client';

import { FC, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X,
  Loader2,
  AlertCircle,
  Save,
  Search,
  Users,
  CheckCircle2,
  Clock,
  Target,
  FileText,
  Award,
  TrendingUp,
  Edit2,
} from 'lucide-react';
import { toast } from 'sonner';
import { assignmentsService } from '@/services/assignments.service';
import { Badge } from '@/components/ui/badge';

interface Student {
  enrollmentId: number;
  studentId: number;
  givenNames: string;
  lastNames: string;
  email?: string;
}

interface StudentGrade {
  enrollmentId: number;
  score: number;
  feedback?: string;
}

interface GradeStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: number;
  assignmentTitle: string;
  maxScore: number;
  sectionId: number;
}

export const GradeStudentsDialog: FC<GradeStudentsDialogProps> = ({
  open,
  onOpenChange,
  assignmentId,
  assignmentTitle,
  maxScore,
  sectionId,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [grades, setGrades] = useState<Record<number, StudentGrade>>({});
  const [savedGrades, setSavedGrades] = useState<Record<number, StudentGrade>>({});
  const [editingMode, setEditingMode] = useState<Set<number>>(new Set());
  const [statistics, setStatistics] = useState<{
    total: number;
    graded: number;
    ungraded: number;
    averageScore: number;
  }>({ total: 0, graded: 0, ungraded: 0, averageScore: 0 });
  // Cargar estudiantes y calificaciones guardadas del curso
  useEffect(() => {
    if (!open || !sectionId) return;

    const fetchStudentsAndGrades = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar estudiantes
        const studentsResponse = await assignmentsService.getSectionStudents(sectionId, 'active');
        setStudents(
          studentsResponse.students.map((item) => ({
            enrollmentId: item.enrollmentId,
            studentId: item.student.id,
            givenNames: item.student.givenNames,
            lastNames: item.student.lastNames,
            email: item.student.email,
          }))
        );
        
        // Cargar calificaciones ya guardadas
        const gradesResponse = await assignmentsService.getAssignmentGrades(assignmentId);
        
        // Convertir array de calificaciones a mapa por enrollmentId
        const gradesMap: Record<number, StudentGrade> = {};
        gradesResponse.grades.forEach((grade) => {
          gradesMap[grade.enrollmentId] = {
            enrollmentId: grade.enrollmentId,
            score: grade.score,
            feedback: grade.feedback,
          };
        });
        
        setSavedGrades(gradesMap);
        setStatistics({
          total: gradesResponse.statistics.total,
          graded: gradesResponse.statistics.graded,
          ungraded: gradesResponse.statistics.ungraded,
          averageScore: gradesResponse.statistics.averageScore,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar datos';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndGrades();
  }, [open, sectionId, assignmentId]);

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.givenNames} ${student.lastNames}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const toggleEditMode = (enrollmentId: number) => {
    setEditingMode((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(enrollmentId)) {
        newSet.delete(enrollmentId);
      } else {
        newSet.add(enrollmentId);
      }
      return newSet;
    });
  };

  const isGradeSaved = (enrollmentId: number) => savedGrades[enrollmentId]?.score !== undefined;
  const isEditingGrade = (enrollmentId: number) => editingMode.has(enrollmentId);
  const isInputDisabled = (enrollmentId: number) => isGradeSaved(enrollmentId) && !isEditingGrade(enrollmentId);

  const handleScoreChange = (enrollmentId: number, score: string) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > maxScore) return;

    setGrades((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        enrollmentId,
        score: numScore,
      },
    }));
  };

  const handleFeedbackChange = (enrollmentId: number, feedback: string) => {
    if (feedback.length > 500) return;

    setGrades((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        enrollmentId,
        feedback,
      },
    }));
  };

  const handleSaveGrades = async () => {
    try {
      setSaving(true);
      const gradesToSave = Object.values(grades).filter((g) => g.score !== undefined);

      if (gradesToSave.length === 0) {
        toast.error('Por favor ingresa al menos una calificación');
        return;
      }

      // Guardar calificaciones en lote
      const result = await assignmentsService.batchGradeStudents(
        assignmentId,
        gradesToSave
      );

      toast.success(
        `Calificaciones guardadas: ${result.successCount} exitosa${result.successCount > 1 ? 's' : ''}`
      );

      // Marcar calificaciones como guardadas
      setSavedGrades((prev) => ({
        ...prev,
        ...Object.fromEntries(
          gradesToSave.map((g) => [g.enrollmentId, g])
        ),
      }));

      // Resetear estado de edición
      setGrades({});
      setEditingMode(new Set());
      
      // Cerrar el dialog después de un pequeño delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al guardar calificaciones';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mb-8 flex h-[calc(100vh-2rem)] min-w-[calc(100vw-2rem)] flex-col justify-between gap-0 p-0 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
        {/* Título oculto para accesibilidad */}
        <DialogTitle className="sr-only">Calificar estudiantes - {assignmentTitle}</DialogTitle>
        
        <ScrollArea className="flex flex-col overflow-hidden">
          {/* HEADER */}
          <div className="border-b border-gray-200 dark:border-gray-800 px-6 pt-6 pb-4 flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {assignmentTitle}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Califica a los estudiantes de forma directa
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* ESTADÍSTICAS */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Estudiantes</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{students.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Calificados</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{statistics.graded}</p>
              </div>
              <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Máximo</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{maxScore}</p>
              </div>
              <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Promedio</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {statistics.graded > 0 ? statistics.averageScore.toFixed(2) : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* CONTENIDO */}
          <div className="p-6 space-y-6 flex-1">
            {/* BUSCADOR */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                Buscar estudiante
              </label>
              <Input
                placeholder="Escribe nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* ALERTA SI NO HAY ESTUDIANTES */}
            {!loading && students.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No hay estudiantes disponibles en este curso
                </AlertDescription>
              </Alert>
            )}

            {/* ESTADO DE CARGA */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            )}

            {/* ERROR */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* LISTA DE ESTUDIANTES */}
            {!loading && filteredStudents.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <TrendingUp className="h-4 w-4" />
                  {filteredStudents.length} estudiante(s) encontrado(s)
                </div>
                {filteredStudents.map((student, idx) => (
                  <div
                    key={student.enrollmentId}
                    className={`p-4 border rounded-lg space-y-4 transition-colors ${
                      isGradeSaved(student.enrollmentId)
                        ? 'border-green-200 dark:border-green-800/40 bg-green-50/30 dark:bg-green-900/10'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/30 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    {/* HEADER DEL ESTUDIANTE */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600">
                          <span className="text-xs font-bold text-white">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {student.givenNames} {student.lastNames}
                          </h4>
                          {student.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {student.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 flex items-center gap-2">
                        {isGradeSaved(student.enrollmentId) && (
                          <>
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Guardado
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleEditMode(student.enrollmentId)}
                              className="h-8 px-2 text-xs border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 flex items-center gap-1"
                            >
                              {isEditingGrade(student.enrollmentId) ? (
                                <>
                                  <X className="h-3.5 w-3.5" />
                                  Cancelar
                                </>
                              ) : (
                                <>
                                  <Edit2 className="h-3.5 w-3.5" />
                                  Editar
                                </>
                              )}
                            </Button>
                          </>
                        )}
                        {(grades[student.enrollmentId]?.score !== undefined || isGradeSaved(student.enrollmentId)) && (
                          <Badge className="ml-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {grades[student.enrollmentId]?.score ?? savedGrades[student.enrollmentId]?.score}/{maxScore}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* INPUTS */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {/* PUNTUACIÓN */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Target className="h-3.5 w-3.5 text-orange-500" />
                          Puntuación (0 - {maxScore})
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max={maxScore}
                          step="0.5"
                          placeholder="0"
                          value={
                            isEditingGrade(student.enrollmentId)
                              ? grades[student.enrollmentId]?.score ?? ''
                              : grades[student.enrollmentId]?.score ?? savedGrades[student.enrollmentId]?.score ?? ''
                          }
                          onChange={(e) => handleScoreChange(student.enrollmentId, e.target.value)}
                          disabled={isInputDisabled(student.enrollmentId)}
                          className={`border-gray-300 dark:border-gray-700 transition-colors ${
                            isInputDisabled(student.enrollmentId)
                              ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50'
                              : 'focus:ring-orange-500 focus:border-orange-500'
                          }`}
                        />
                      </div>

                      {/* FEEDBACK */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-blue-500" />
                          Comentario ({(isEditingGrade(student.enrollmentId) ? grades[student.enrollmentId]?.feedback?.length || 0 : savedGrades[student.enrollmentId]?.feedback?.length || 0)}/500)
                        </label>
                        <Textarea
                          placeholder="Escribe feedback..."
                          maxLength={500}
                          value={
                            isEditingGrade(student.enrollmentId)
                              ? grades[student.enrollmentId]?.feedback ?? ''
                              : grades[student.enrollmentId]?.feedback ?? savedGrades[student.enrollmentId]?.feedback ?? ''
                          }
                          onChange={(e) => handleFeedbackChange(student.enrollmentId, e.target.value)}
                          disabled={isInputDisabled(student.enrollmentId)}
                          className={`mt-1 h-24 resize-none border-gray-300 dark:border-gray-700 transition-colors text-sm ${
                            isInputDisabled(student.enrollmentId)
                              ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50'
                              : 'focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* PROGRESO */}
                    {(grades[student.enrollmentId]?.score !== undefined || isGradeSaved(student.enrollmentId)) && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {Math.round(
                              ((isEditingGrade(student.enrollmentId)
                                ? grades[student.enrollmentId]?.score
                                : grades[student.enrollmentId]?.score ?? savedGrades[student.enrollmentId]?.score) / maxScore) * 100
                            )}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all"
                            style={{
                              width: `${Math.min(
                                ((isEditingGrade(student.enrollmentId)
                                  ? grades[student.enrollmentId]?.score
                                  : grades[student.enrollmentId]?.score ?? savedGrades[student.enrollmentId]?.score) / maxScore) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredStudents.length === 0 && students.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No se encontraron estudiantes
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* FOOTER */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-950/30 flex justify-between items-center flex-shrink-0">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {statistics.graded > 0 || Object.keys(grades).length > 0 ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>
                  <span className="font-semibold text-green-600">{statistics.graded}</span> de{' '}
                  <span className="font-semibold">{students.length}</span> estudiantes calificados
                  {Object.keys(grades).length > 0 && (
                    <span className="ml-1 text-blue-600">
                      (+{Object.keys(grades).length} pendiente{Object.keys(grades).length > 1 ? 's' : ''})
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>Selecciona estudiantes para calificar</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleSaveGrades}
            disabled={saving || Object.keys(grades).length === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Calificaciones
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
