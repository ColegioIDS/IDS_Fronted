/**
 * Componente GradesViewDialog
 * Modal para ver todas las calificaciones de una tarea
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X,
  Loader2,
  AlertCircle,
  Download,
  Eye,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { assignmentsService } from '@/services/assignments.service';

interface Grade {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail?: string;
  score: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: string;
}

interface GradesViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: number;
  assignmentTitle: string;
  maxScore: number;
}

export const GradesViewDialog: FC<GradesViewDialogProps> = ({
  open,
  onOpenChange,
  assignmentId,
  assignmentTitle,
  maxScore,
}) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!open) return;

    const fetchGrades = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Implementar endpoint para obtener calificaciones
        // const response = await assignmentsService.listGrades(assignmentId);
        // setGrades(response?.grades || []);
        setGrades([]);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar calificaciones';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [open, assignmentId]);

  const filteredGrades = grades.filter((grade) => {
    const fullName = grade.studentName.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const stats = {
    total: grades.length,
    graded: grades.filter((g) => g.score !== undefined && g.score !== null).length,
    average:
      grades.length > 0
        ? (
            grades.reduce((sum, g) => sum + (g.score || 0), 0) /
            grades.filter((g) => g.score !== undefined && g.score !== null).length
          ).toFixed(2)
        : 0,
  };

  const getScorePercentage = (score: number) => {
    return ((score / maxScore) * 100).toFixed(1);
  };

  const getGradeColor = (score: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
    if (percentage >= 80) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
    if (percentage >= 60) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800';
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
  };

  const handleExportCSV = () => {
    const csv = [
      ['Estudiante', 'Email', 'Puntuación', 'Porcentaje', 'Feedback', 'Fecha'],
      ...filteredGrades.map((g) => [
        g.studentName,
        g.studentEmail || '',
        g.score,
        `${getScorePercentage(g.score)}%`,
        g.feedback || '',
        g.gradedAt ? new Date(g.gradedAt).toLocaleDateString() : '',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calificaciones-${assignmentTitle}.csv`;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
        {/* HEADER */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-800 p-6 pb-4">
          <div className="flex-1">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Calificaciones - {assignmentTitle}
            </DialogTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Visualiza todas las calificaciones registradas
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* CONTENIDO */}
        <ScrollArea className="h-[calc(90vh-200px)]">
          <div className="p-6 space-y-4">
            {/* ESTADÍSTICAS */}
            {!loading && grades.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">TOTAL</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold">CALIFICADAS</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                    {stats.graded}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">PROMEDIO</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                    {stats.average} / {maxScore}
                  </p>
                </div>
              </div>
            )}

            {/* BUSCADOR Y EXPORTAR */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={filteredGrades.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>

            {/* ALERTA SI NO HAY CALIFICACIONES */}
            {!loading && grades.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No hay calificaciones registradas aún
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

            {/* TABLA DE CALIFICACIONES */}
            {!loading && filteredGrades.length > 0 && (
              <div className="space-y-2">
                {filteredGrades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {grade.studentName}
                      </h4>
                      {grade.studentEmail && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {grade.studentEmail}
                        </p>
                      )}
                      {grade.feedback && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                          {grade.feedback}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {grade.score}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          / {maxScore} pts
                        </p>
                      </div>

                      <Badge className={`flex-shrink-0 ${getGradeColor(grade.score)}`}>
                        {getScorePercentage(grade.score)}%
                      </Badge>

                      {grade.feedback && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0"
                          title="Ver feedback"
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredGrades.length === 0 && grades.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No se encontraron resultados
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
