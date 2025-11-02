// src/components/features/grade-cycles/GradeCycleStepper.tsx

'use client';

import React from 'react';
import { Check } from 'lucide-react';

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
 * Stepper para wizard de configuración
 */
export function GradeCycleStepper({ steps, currentStep }: GradeCycleStepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Línea de progreso */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-lime-600 dark:bg-lime-500 transition-all duration-500"
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
            <div key={step.id} className="flex flex-col items-center relative z-10">
              {/* Step circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                  border-2 transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-lime-600 border-lime-600 text-white dark:bg-lime-500 dark:border-lime-500'
                      : isCurrent
                      ? 'bg-white dark:bg-gray-900 border-lime-600 dark:border-lime-500 text-lime-700 dark:text-lime-400 ring-4 ring-lime-100 dark:ring-lime-950/50'
                      : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Step info */}
              <div className="mt-3 text-center max-w-[120px]">
                <p
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? 'text-lime-700 dark:text-lime-300'
                      : isCompleted
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
