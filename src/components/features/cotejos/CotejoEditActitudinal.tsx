'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useUpdateActitudinal } from '@/hooks/useCotejos';
import { useCotejosErrorToast } from '@/hooks/useCotejosErrorToast';
import { CotejoResponse } from '@/types/cotejos.types';
import { toast } from 'sonner';

interface CotejoEditActitudinalProps {
  cotejo: CotejoResponse;
  onSuccess: () => void;
}

/**
 * Componente para editar la puntuación actitudinal (0-20 pts)
 */
export const CotejoEditActitudinal = ({
  cotejo,
  onSuccess,
}: CotejoEditActitudinalProps) => {
  const [score, setScore] = useState(cotejo.actitudinalScore ?? 0);
  const [feedback, setFeedback] = useState(cotejo.feedback ?? '');
  
  const { mutate: updateActitudinal, loading, error } = useUpdateActitudinal();
  const { showError } = useCotejosErrorToast();

  const handleSliderChange = (value: number[]) => {
    setScore(value[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (score < 0 || score > 20) {
      toast.error('La puntuación debe estar entre 0 y 20');
      return;
    }

    try {
      await updateActitudinal(cotejo.id, score, feedback || undefined);
      toast.success('Puntuación actitudinal actualizada');
      onSuccess();
    } catch (error: any) {
      showError(error?.errorCode, error?.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Descripción */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Componente de Comportamiento (ACTITUDINAL)
        </p>
        <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
          Ingresa la puntuación de comportamiento y disciplina del estudiante (0-20 pts)
        </p>
      </div>

      {/* Puntuación con Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Puntuación</label>
          <span className="text-2xl font-bold text-blue-600">{score.toFixed(2)}</span>
        </div>
        <Slider
          value={[score]}
          onValueChange={handleSliderChange}
          min={0}
          max={20}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>Máximo: 20 pts</span>
        </div>
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Comentarios (Opcional)</label>
        <Textarea
          placeholder="Ej: Excelente comportamiento en clase, participa activamente, respetuoso con sus compañeros..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          maxLength={500}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {feedback.length}/500 caracteres
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-2 justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? 'Guardando...' : 'Guardar Actitudinal'}
        </Button>
      </div>
    </form>
  );
};
