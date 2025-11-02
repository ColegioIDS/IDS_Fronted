// src/components/features/grade-cycles/GradeCycleWizard.tsx

'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GradeCycleStepper } from './GradeCycleStepper';
import { Step1SelectCycle } from './Step1SelectCycle';
import { Step2SelectGrades } from './Step2SelectGrades';
import { Step3Confirm } from './Step3Confirm';
import { gradeCyclesService } from '@/services/grade-cycles.service';
import type { AvailableGrade, AvailableCycle } from '@/types/grade-cycles.types';

interface GradeCycleWizardProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const steps = [
  { id: 1, title: 'Seleccionar Ciclo', description: 'Elige el ciclo escolar' },
  { id: 2, title: 'Seleccionar Grados', description: 'Selecciona los grados' },
  { id: 3, title: 'Confirmar', description: 'Revisa y guarda' },
];

/**
 * Wizard principal para configuración de ciclos-grados
 * Usa SOLO los helpers de grade-cycles (sin otros hooks/services)
 */
export function GradeCycleWizard({ onSuccess, onCancel }: GradeCycleWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCycle, setSelectedCycle] = useState<AvailableCycle | null>(null);
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [availableGrades, setAvailableGrades] = useState<AvailableGrade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handler para Step1: Seleccionar ciclo
  const handleCycleSelect = (cycle: AvailableCycle) => {
    setSelectedCycle(cycle);
  };

  const handleStep1Next = async () => {
    if (!selectedCycle) {
      setError('Debe seleccionar un ciclo');
      return;
    }
    setError(null);
    
    // Cargar grados disponibles para este ciclo
    try {
      setIsLoadingGrades(true);
      const grades = await gradeCyclesService.getAvailableGradesForCycle(
        selectedCycle.id
      );
      setAvailableGrades(grades);
      setIsLoadingGrades(false);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || 'Error al cargar grados');
      setIsLoadingGrades(false);
    }
  };

  // Handler para Step2: Seleccionar grados
  const handleGradesSelect = (gradeIds: string[]) => {
    setSelectedGradeIds(gradeIds);
  };

  const handleStep2Next = () => {
    if (selectedGradeIds.length === 0) {
      setError('Debe seleccionar al menos un grado');
      return;
    }
    setError(null);
    setCurrentStep(3);
  };

  // Paso 3: Confirmar y guardar
  const handleConfirm = async () => {
    if (!selectedCycle || selectedGradeIds.length === 0) {
      setError('Debe seleccionar un ciclo y al menos un grado');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Convertir string[] a number[]
      const numericGradeIds = selectedGradeIds.map(id => parseInt(id, 10));

      const response = await gradeCyclesService.bulkCreate({
        cycleId: selectedCycle.id,
        gradeIds: numericGradeIds,
      });

      // Llamar callback de éxito
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err) {
      console.error('Error saving grade-cycles:', err);
      setError(
        err instanceof Error ? err.message : 'Error al guardar la configuración'
      );
      setIsSubmitting(false);
    }
  };

  // Navegación
  const handleStep2Previous = () => {
    setError(null);
    setCurrentStep(1);
  };

  const handleStep3Previous = () => {
    setError(null);
    setCurrentStep(2);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Stepper */}
      <GradeCycleStepper steps={steps} currentStep={currentStep} />

      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300 font-semibold">{error}</p>
        </div>
      )}

      {/* Contenido del paso actual */}
      <Card className="border-2 border-gray-200 dark:border-gray-800">
        <CardContent className="p-8">
          {currentStep === 1 && (
            <Step1SelectCycle
              selectedCycle={selectedCycle}
              onSelect={handleCycleSelect}
              onNext={handleStep1Next}
            />
          )}

          {currentStep === 2 && selectedCycle && (
            <Step2SelectGrades
              cycle={selectedCycle}
              selectedGradeIds={selectedGradeIds}
              onSelect={handleGradesSelect}
              onBack={handleStep2Previous}
              onNext={handleStep2Next}
            />
          )}

          {currentStep === 3 && selectedCycle && (
            <Step3Confirm
              cycle={selectedCycle}
              gradeIds={selectedGradeIds}
              grades={availableGrades}
              isLoading={isLoadingGrades}
              onBack={handleStep3Previous}
              onConfirm={handleConfirm}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
