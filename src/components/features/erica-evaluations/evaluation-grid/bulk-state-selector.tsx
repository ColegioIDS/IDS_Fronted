// src/components/features/erica-evaluations/evaluation-grid/bulk-state-selector.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { EricaState, EricaDimension, STATE_LABELS } from '@/types/erica-evaluations';
import { useEricaColorsContext } from '@/context/EricaColorsContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

interface BulkStateSelectorProps {
  enrollmentId: number;
  studentName: string;
  dimensions: EricaDimension[];
  onApplyState: (enrollmentId: number, dimension: EricaDimension, state: EricaState) => void;
}

/**
 * Selector para aplicar el mismo estado a todas las dimensiones de un estudiante
 */
export default function BulkStateSelector({
  enrollmentId,
  studentName,
  dimensions,
  onApplyState,
}: BulkStateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { getState } = useEricaColorsContext();
  
  const states: EricaState[] = ['E', 'B', 'P', 'C', 'N'];

  const handleApplyState = (state: EricaState) => {
    // Aplicar el estado a todas las dimensiones
    dimensions.forEach(dimension => {
      onApplyState(enrollmentId, dimension, state);
    });
    setIsOpen(false);
  };

  const getStateColor = (state: EricaState) => {
    const stateObj = getState(state);
    return stateObj?.hexColor || '#999999';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2 gap-1"
          title="Aplicar el mismo estado a todas las dimensiones"
        >
          <Wand2 className="h-3.5 w-3.5" />
          Aplicar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start" side="right">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold">Aplicar a todas las dimensiones</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{studentName}</p>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {states.map((state) => {
              const hexColor = getStateColor(state);
              const label = STATE_LABELS[state];
              
              return (
                <button
                  key={state}
                  onClick={() => handleApplyState(state)}
                  style={{
                    backgroundColor: `${hexColor}20`,
                    borderColor: hexColor,
                    borderWidth: '1px',
                    color: hexColor,
                  }}
                  className="
                    w-full px-3 py-2 rounded-md text-sm font-medium
                    transition-all duration-75 text-left
                    hover:brightness-110 active:scale-95
                  "
                >
                  <span className="font-bold">{state}</span> - {label}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
