'use client';

import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGenerateCotejo, useStudents } from '@/hooks/useCotejos';
import { useCotejosErrorToast } from '@/hooks/useCotejosErrorToast';
import { CascadeResponse } from '@/types/cotejos.types';
import { CotejosErrorAlert } from './CotejosErrorAlert';
import { getErrorMessage } from '@/constants/cotejos';
import { toast } from 'sonner';

interface CotejoFormProps {
  cascade: CascadeResponse;
  filters: {
    cycleId: number | null;
    bimesterId: number | null;
    gradeId: number | null;
    sectionId: number | null;
    courseId: number | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Formulario para generar un nuevo cotejo
 */
export const CotejoForm = ({
  cascade,
  filters,
  onSuccess,
  onCancel,
}: CotejoFormProps) => {
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showError, setShowError] = useState(false);
  
  const { mutate: generateCotejo, loading } = useGenerateCotejo();
  const { students: allStudents, loading: studentsLoading, error: studentsError } = useStudents('active');
  const { showError: showErrorToast } = useCotejosErrorToast();

  // Filtrar estudiantes por sección seleccionada
  const students = useMemo(() => {
    if (!filters.sectionId || !allStudents || allStudents.length === 0) {
      return [];
    }

    return allStudents.filter((s) => s.section.id === filters.sectionId);
  }, [allStudents, filters.sectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEnrollmentId || !filters.courseId || !filters.bimesterId || !filters.cycleId) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      await generateCotejo(
        selectedEnrollmentId,
        filters.courseId,
        filters.bimesterId,
        filters.cycleId,
        feedback || undefined,
      );
      toast.success('Cotejo generado exitosamente');
      setShowError(false);
      onSuccess();
    } catch (error: any) {
      const errorCode = error?.errorCode;
      const message = getErrorMessage(errorCode) || error?.message || 'Error al generar el cotejo';
      showErrorToast(errorCode, message);
      setShowError(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert */}
      {showError && (
        <CotejosErrorAlert
          onDismiss={() => setShowError(false)}
          showDetail={true}
        />
      )}

      {/* Estudiante Error */}
      {studentsError && (
        <CotejosErrorAlert
          errorCode={studentsError.code}
          message={studentsError.message}
          detail={studentsError.detail}
          onDismiss={() => {}}
          showDetail={true}
        />
      )}

      {/* Estudiante */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Estudiante *</label>
        <Select value={selectedEnrollmentId?.toString() ?? ''} onValueChange={(v) => setSelectedEnrollmentId(parseInt(v))}>
          <SelectTrigger disabled={studentsLoading || students.length === 0}>
            <SelectValue placeholder={studentsLoading ? "Cargando estudiantes..." : "Seleccionar estudiante"} />
          </SelectTrigger>
          <SelectContent>
            {students && students.length > 0 ? (
              students.map((student) => (
                <SelectItem key={student.enrollment.id} value={student.enrollment.id.toString()}>
                  {student.student.fullName || `${student.student.givenNames} ${student.student.lastNames}`} ({student.student.codeSIRE})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                {studentsLoading ? "Cargando..." : "No hay estudiantes disponibles"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Comentarios (Opcional)</label>
        <Textarea
          placeholder="Ingresa comentarios generales sobre el desempeño..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          maxLength={500}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          {feedback.length}/500 caracteres
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !selectedEnrollmentId || studentsLoading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? 'Generando...' : 'Generar Cotejo'}
        </Button>
      </div>
    </form>
  );
};
