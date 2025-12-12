'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useUpdateDeclarativo } from '@/hooks/useCotejos';
import { useCotejosErrorToast } from '@/hooks/useCotejosErrorToast';
import { CotejoResponse } from '@/types/cotejos.types';
import { toast } from 'sonner';

interface CotejoEditDeclarativoProps {
  cotejo: CotejoResponse;
  onSuccess: () => void;
}

/**
 * Componente para editar la puntuación declarativa (0-30 pts)
 */
export const CotejoEditDeclarativo = ({
  cotejo,
  onSuccess,
}: CotejoEditDeclarativoProps) => {
  const [score, setScore] = useState(cotejo.declarativoScore ?? 0);
  const [feedback, setFeedback] = useState(cotejo.feedback ?? '');
  
  const { mutate: updateDeclarativo, loading, error } = useUpdateDeclarativo();
  const { showError } = useCotejosErrorToast();

  const handleSliderChange = (value: number[]) => {
    setScore(value[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (score < 0 || score > 30) {
      toast.error('La puntuación debe estar entre 0 y 30');
      return;
    }

    try {
      await updateDeclarativo(cotejo.id, score, feedback || undefined);
      toast.success('Puntuación declarativa actualizada');
      onSuccess();
    } catch (error: any) {
      showError(error?.errorCode, error?.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Descripción */}
      <div className="p-3 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
        <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
          Componente de Conocimiento (DECLARATIVO)
        </p>
        <p className="text-xs text-purple-800 dark:text-purple-200 mt-1">
          Ingresa la puntuación de dominio conceptual y conocimientos del estudiante (0-30 pts)
        </p>
      </div>

      {/* Puntuación con Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Puntuación</label>
          <span className="text-2xl font-bold text-purple-600">{score.toFixed(2)}</span>
        </div>
        <Slider
          value={[score]}
          onValueChange={handleSliderChange}
          min={0}
          max={30}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>Máximo: 30 pts</span>
        </div>
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Comentarios (Opcional)</label>
        <Textarea
          placeholder="Ej: Excelente dominio de conceptos, resuelve problemas complejos, demuestra creatividad en aplicaciones..."
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
          {loading ? 'Guardando...' : 'Guardar Declarativo'}
        </Button>
      </div>
    </form>
  );
};
