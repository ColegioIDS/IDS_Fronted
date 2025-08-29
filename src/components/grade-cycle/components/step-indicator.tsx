// ==========================================
// src/components/grade-cycle/components/step-indicator.tsx
// ==========================================

"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, Lock } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  steps: {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
}

export default function StepIndicator({ currentStep, completedSteps, steps }: StepIndicatorProps) {
  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepCurrent = (stepId: number) => currentStep === stepId;
  const isStepAccessible = (stepId: number) => stepId <= currentStep || isStepCompleted(stepId);

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                isStepCompleted(step.id)
                  ? "bg-green-600 border-green-600 text-white"
                  : isStepCurrent(step.id)
                  ? "bg-blue-600 border-blue-600 text-white"
                  : isStepAccessible(step.id)
                  ? "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600"
              )}
            >
              {isStepCompleted(step.id) ? (
                <CheckCircle className="h-5 w-5" />
              ) : isStepAccessible(step.id) ? (
                step.icon
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </div>
            
            <div className="text-center mt-2">
              <p
                className={cn(
                  "text-sm font-medium",
                  isStepCompleted(step.id) || isStepCurrent(step.id)
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {step.description}
              </p>
            </div>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-4 transition-all duration-200",
                isStepCompleted(step.id)
                  ? "bg-green-600"
                  : "bg-gray-200 dark:bg-gray-700"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}