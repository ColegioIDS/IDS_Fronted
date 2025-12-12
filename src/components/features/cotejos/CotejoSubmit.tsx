'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useSubmitCotejo } from '@/hooks/useCotejos';
import { useCotejosErrorToast } from '@/hooks/useCotejosErrorToast';
import { CotejoResponse } from '@/types/cotejos.types';
import { toast } from 'sonner';

interface CotejoSubmitProps {
  cotejo: CotejoResponse;
  onSuccess: () => void;
}

/**
 * Componente para finalizar un cotejo
 * Calcula el total y cambia estado a COMPLETED
 */
export const CotejoSubmit = ({ cotejo, onSuccess }: CotejoSubmitProps) => {
  const [feedback, setFeedback] = useState(cotejo.feedback ?? '');
  const { mutate: submitCotejo, loading, error } = useSubmitCotejo();
  const { showError } = useCotejosErrorToast();

  const calculateTotal = () => {
    const erica = cotejo.ericaScore ?? 0;
    const tasks = cotejo.tasksScore ?? 0;
    const actitudinal = cotejo.actitudinalScore ?? 0;
    const declarativo = cotejo.declarativoScore ?? 0;
    return erica + tasks + actitudinal + declarativo;
  };

  const total = calculateTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (total > 100) {
      toast.error('La puntuación total no puede exceder 100 puntos');
      return;
    }

    try {
      await submitCotejo(cotejo.id, feedback || undefined);
      toast.success('Cotejo finalizado exitosamente');
      onSuccess();
    } catch (error: any) {
      showError(error?.errorCode, error?.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resumen final */}
      <div className="space-y-4">
        {/* Desglose de componentes */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-xs font-medium text-green-700 dark:text-green-200">ERICA</p>
            <p className="text-xl font-bold text-green-900 dark:text-green-100">
              {cotejo.ericaScore?.toFixed(2) ?? 0}
            </p>
            <p className="text-xs text-green-600 dark:text-green-300">/ 40 pts</p>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-200">TAREAS</p>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
              {cotejo.tasksScore?.toFixed(2) ?? 0}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300">/ 20 pts</p>
          </div>

          <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-xs font-medium text-orange-700 dark:text-orange-200">ACTITUDINAL</p>
            <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
              {cotejo.actitudinalScore?.toFixed(2) ?? 0}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-300">/ 20 pts</p>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
            <p className="text-xs font-medium text-purple-700 dark:text-purple-200">DECLARATIVO</p>
            <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
              {cotejo.declarativoScore?.toFixed(2) ?? 0}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-300">/ 30 pts</p>
          </div>
        </div>

        {/* Total */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-200">Puntuación Total</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-300">Suma de todos los componentes</p>
            </div>
            <div className="text-right">
              <p className={`text-4xl font-bold ${total <= 100 ? 'text-indigo-900 dark:text-indigo-100' : 'text-red-900 dark:text-red-100'}`}>
                {total.toFixed(2)}
              </p>
              <p className="text-sm text-indigo-600 dark:text-indigo-300">/ 100 pts</p>
            </div>
          </div>
          {total > 100 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
              ⚠️ El total excede los 100 puntos. Revisa las puntuaciones.
            </p>
          )}
        </div>
      </div>

      {/* Comentarios finales */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Cierre de Bimestre (Opcional)</label>
        <Textarea
          placeholder="Comentarios finales sobre el desempeño general del estudiante en el bimestre..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          maxLength={500}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {feedback.length}/500 caracteres
        </p>
      </div>

      {/* Info */}
      <div className="p-3 bg-muted rounded-lg">
        <p className="text-xs font-medium text-muted-foreground">
          Al finalizar, el cotejo cambiará a estado COMPLETED y no podrá ser editado nuevamente
          desde aquí.
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-2 justify-end">
        <Button type="submit" disabled={loading || total > 100}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? 'Finalizando...' : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Finalizar Cotejo
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
