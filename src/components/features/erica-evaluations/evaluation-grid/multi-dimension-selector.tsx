// src/components/features/erica-evaluations/evaluation-grid/multi-dimension-selector.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckSquare2, Square } from 'lucide-react';
import { useEricaColorsContext } from '@/context/EricaColorsContext';
import { EricaDimension, EricaState } from '@/types/erica-evaluations';
import { DIMENSION_ORDER } from '../utils/evaluation-helpers';

interface MultiDimensionSelectorProps {
  enrollmentId: number;
  studentName: string;
  selectedDimensions: Set<EricaDimension>;
  onDimensionsChange: (dimensions: Set<EricaDimension>) => void;
  onApply: (dimensions: EricaDimension[], state: EricaState) => void;
}

export default function MultiDimensionSelector({
  enrollmentId,
  studentName,
  selectedDimensions,
  onDimensionsChange,
  onApply,
}: MultiDimensionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<EricaState | null>(null);
  const { getState } = useEricaColorsContext();

  const toggleDimension = (dimension: EricaDimension) => {
    const newSelected = new Set(selectedDimensions);
    if (newSelected.has(dimension)) {
      newSelected.delete(dimension);
    } else {
      newSelected.add(dimension);
    }
    onDimensionsChange(newSelected);
  };

  const toggleAll = () => {
    if (selectedDimensions.size === DIMENSION_ORDER.length) {
      onDimensionsChange(new Set());
    } else {
      onDimensionsChange(new Set(DIMENSION_ORDER));
    }
  };

  const handleApply = (state: EricaState) => {
    if (selectedDimensions.size === 0) return;
    onApply(Array.from(selectedDimensions), state);
    setSelectedState(state);
    setIsOpen(false);
  };

  const dimensionCodeMap: Record<string, string> = {
    EJECUTA: 'E',
    RETIENE: 'R',
    INTERPRETA: 'I',
    CONOCE: 'C',
    AMPLIA: 'A',
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          title="Seleccionar múltiples dimensiones"
        >
          <CheckSquare2 className="w-4 h-4 mr-1" />
          {selectedDimensions.size > 0 ? `${selectedDimensions.size} sel.` : 'Seleccionar'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold mb-2">Selecciona dimensiones</h4>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs mb-2 w-full"
              onClick={toggleAll}
            >
              {selectedDimensions.size === DIMENSION_ORDER.length
                ? 'Deseleccionar todo'
                : 'Seleccionar todo'}
            </Button>
          </div>

          <div className="space-y-2">
            {DIMENSION_ORDER.map(dimension => {
              const isSelected = selectedDimensions.has(dimension);
              return (
                <div key={dimension} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dim-${dimension}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleDimension(dimension)}
                  />
                  <Label
                    htmlFor={`dim-${dimension}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    <span className="font-semibold">{dimensionCodeMap[dimension]}</span>
                    {' - '}
                    <span>{dimension}</span>
                  </Label>
                </div>
              );
            })}
          </div>

          {selectedDimensions.size > 0 && (
            <>
              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold mb-2">Aplicar estado</h4>
                <div className="grid grid-cols-5 gap-2">
                  {['E', 'B', 'P', 'C', 'N'].map(code => {
                    const state = code as EricaState;
                    const stateObj = getState(state);
                    const bgColor = stateObj?.hexColor || '#ccc';

                    return (
                      <Button
                        key={code}
                        size="sm"
                        className="text-white font-semibold text-sm"
                        style={{ backgroundColor: bgColor }}
                        onClick={() => handleApply(state)}
                      >
                        {code}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
