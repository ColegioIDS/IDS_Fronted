'use client';

import React from 'react';
import { Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ValidationPhase, AttendanceValidationResult } from '@/hooks/useAttendanceValidationPhases';

interface ValidationStatusProps {
  validation: AttendanceValidationResult | null;
  isValidating?: boolean;
}

/**
 * Componente que muestra el estado de validación de las 13 fases
 * Indica qué fase pasó, falló o está en progreso
 */
export default function ValidationStatus({
  validation,
  isValidating = false,
}: ValidationStatusProps) {
  if (!validation) {
    return null;
  }

  const passedPhases = validation.phases.filter(p => p.passed).length;
  const totalPhases = validation.phases.length;
  const progress = (passedPhases / totalPhases) * 100;

  const getPhaseIcon = (phase: ValidationPhase) => {
    if (phase.passed) {
      return <Check className="h-5 w-5 text-green-600 dark:text-green-400" />;
    }
    return <X className="h-5 w-5 text-red-600 dark:text-red-400" />;
  };

  const getPhaseColor = (phase: ValidationPhase) => {
    if (phase.passed) {
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
    }
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
  };

  return (
    <div className="w-full space-y-4">
      {/* Resumen */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Validación del Registro
        </h3>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {passedPhases} de {totalPhases} fases
        </span>
      </div>

      {/* Barra de progreso */}
      <Progress value={progress} className="h-2" />

      {/* Lista de errores (si hay) */}
      {validation.errors.length > 0 && (
        <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
            <div className="font-semibold mb-1">Errores de validación:</div>
            <ul className="list-disc list-inside space-y-1">
              {validation.errors.map((error, idx) => (
                <li key={idx} className="text-xs">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Advertencias (si hay) */}
      {validation.warnings.length > 0 && (
        <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200 text-sm">
            <div className="font-semibold mb-1">Advertencias:</div>
            <ul className="list-disc list-inside space-y-1">
              {validation.warnings.map((warning, idx) => (
                <li key={idx} className="text-xs">
                  {warning}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Detalles de fases */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {validation.phases.map((phase, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border-2 ${getPhaseColor(phase)} transition-colors`}
          >
            <div className="flex items-center gap-3">
              {isValidating && !phase.passed && idx === validation.phases.findIndex(p => !p.passed) ? (
                <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
              ) : (
                getPhaseIcon(phase)
              )}
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  FASE {phase.phase}: {phase.name}
                </div>
                {phase.error && (
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {phase.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado final */}
      {!isValidating && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          {validation.valid ? (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200 text-sm font-semibold">
                ✓ Todas las validaciones pasaron. ¡Listo para registrar!
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700">
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200 text-sm font-semibold">
                ✗ No se puede registrar. Revisa los errores arriba.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
