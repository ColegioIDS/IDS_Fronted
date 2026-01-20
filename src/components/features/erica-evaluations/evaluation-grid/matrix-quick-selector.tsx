// src/components/features/erica-evaluations/evaluation-grid/matrix-quick-selector.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useEricaColorsContext } from '@/context/EricaColorsContext';
import { EricaDimension, EricaState } from '@/types/erica-evaluations';
import { DIMENSION_ORDER } from '../utils/evaluation-helpers';
import { Grid3x3 } from 'lucide-react';

interface MatrixQuickSelectorProps {
  enrollmentId: number;
  studentName: string;
  currentEvaluations: Record<EricaDimension, EricaState | null>;
  onApply: (enrollmentId: number, dimension: EricaDimension, state: EricaState) => void;
}

const STATES: { code: EricaState }[] = [
  { code: 'E' },
  { code: 'B' },
  { code: 'P' },
  { code: 'C' },
  { code: 'N' },
];

export default function MatrixQuickSelector({
  enrollmentId,
  studentName,
  currentEvaluations,
  onApply,
}: MatrixQuickSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { getState } = useEricaColorsContext();

  const dimensionCodeMap: Record<string, string> = {
    EJECUTA: 'E',
    RETIENE: 'R',
    INTERPRETA: 'I',
    CONOCE: 'C',
    APLICA: 'A',
  };

  const handleStateClick = (dimension: EricaDimension, state: EricaState) => {
    onApply(enrollmentId, dimension, state);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-xs"
        title="Matriz rápida de evaluación"
        onClick={() => setIsOpen(true)}
      >
        <Grid3x3 className="w-4 h-4 mr-1" />
        Matriz
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Matriz de Evaluación Rápida</DialogTitle>
            <DialogDescription>
              {studentName} - Selecciona el estado para cada dimensión
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left font-semibold text-sm">
                    Dimensión
                  </th>
                  {STATES.map(({ code }) => (
                    <th
                      key={code}
                      className="border p-3 text-center font-semibold text-sm"
                    >
                      {code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIMENSION_ORDER.map(dimension => {
                  const currentState = currentEvaluations[dimension];
                  return (
                    <tr key={dimension} className="hover:bg-gray-50">
                      <td className="border p-3 font-semibold text-sm bg-gray-50">
                        <div>{dimensionCodeMap[dimension]} - {dimension}</div>
                      </td>
                      {STATES.map(({ code }) => {
                        const stateObj = getState(code);
                        const bgColor = stateObj?.hexColor || '#ccc';
                        const isSelected = currentState === code;

                        return (
                          <td key={code} className="border p-1 text-center">
                            <Button
                              size="sm"
                              className={`w-full text-white font-semibold text-sm ${
                                isSelected ? 'ring-2 ring-black' : ''
                              }`}
                              style={{
                                backgroundColor: bgColor,
                                opacity: isSelected ? 1 : 0.6,
                              }}
                              onClick={() => handleStateClick(dimension, code)}
                            >
                              {code}
                            </Button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-gray-500 mt-3">
            Los estados actualmente seleccionados aparecen con borde oscuro
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
