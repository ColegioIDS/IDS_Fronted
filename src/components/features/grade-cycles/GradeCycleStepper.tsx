// src/components/features/grade-cycles/GradeCycleStepper.tsx

'use client';

import React from 'react';
import { Check, Circle, ArrowRight } from 'lucide-react';

export interface Step {
  id: number;
  title: string;
  description: string;
}

interface GradeCycleStepperProps {
  steps: Step[];
  currentStep: number;
}

/**
 * 🎯 Stepper moderno para wizard de configuración - Diseño profesional
 */
export function GradeCycleStepper({ steps, currentStep }: GradeCycleStepperProps) {
  return (
    <div className="w-full py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Línea de progreso de fondo */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 rounded-full" />

          {/* Línea de progreso activa */}
          <div
            className="absolute top-8 left-0 h-1 bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-700 ease-out shadow-lg shadow-indigo-500/30"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />

          {/* Steps */}
          {steps.map((step, index) => {
            const isCompleted = index + 1 < currentStep;
            const isCurrent = index + 1 === currentStep;
            const isUpcoming = index + 1 > currentStep;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center relative z-10 flex-1"
                style={{ maxWidth: '200px' }}
              >
                {/* Step circle con animación */}
                <div className="relative">
                  <div
                    className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center text-base font-bold
                      border-3 transition-all duration-500 shadow-lg
                      ${
                        isCompleted
                          ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-500 dark:border-indigo-400 text-white scale-100 shadow-indigo-500/50'
                          : isCurrent
                          ? 'bg-white dark:bg-gray-950 border-4 border-indigo-500 text-indigo-700 dark:text-indigo-400 scale-110 shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-100 dark:ring-indigo-950/50'
                          : 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600 scale-95'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <div className="relative">
                        <Check className="w-8 h-8 animate-in zoom-in-50 duration-300" strokeWidth={3} />
                      </div>
                    ) : (
                      <span className="text-xl">{step.id}</span>
                    )}
                  </div>

                  {/* Pulso de animación para paso actual */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-2xl bg-indigo-500 animate-ping opacity-20" />
                  )}
                </div>

                {/* Step info */}
                <div className="mt-5 text-center w-full px-2">
                  <p
                    className={`text-sm font-bold transition-colors duration-300 ${
                      isCurrent
                        ? 'text-indigo-700 dark:text-indigo-400'
                        : isCompleted
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className={`text-xs mt-1.5 transition-colors duration-300 ${
                    isCurrent
                      ? 'text-indigo-600 dark:text-indigo-500 font-medium'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>

                {/* Indicador de estado */}
                {isCompleted && (
                  <div className="mt-2">
                    <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-300 dark:border-emerald-800">
                      Completado
                    </div>
                  </div>
                )}
                {isCurrent && (
                  <div className="mt-2">
                    <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-semibold rounded-full border border-indigo-300 dark:border-indigo-800 animate-pulse">
                      En progreso
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress percentage */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="flex-1 max-w-md bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{
                width: `${(currentStep / steps.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tabular-nums min-w-[60px]">
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
