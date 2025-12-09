// src/components/features/erica-evaluations/evaluation-grid/header-bulk-selector.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useEricaColorsContext } from '@/context/EricaColorsContext';
import { EricaDimension, EricaState } from '@/types/erica-evaluations';
import { DIMENSION_ORDER } from '../utils/evaluation-helpers';
import { Zap } from 'lucide-react';

interface HeaderBulkSelectorProps {
  onApplyToAll: (state: EricaState) => void;
  disabled?: boolean;
}

export default function HeaderBulkSelector({
  onApplyToAll,
  disabled = false,
}: HeaderBulkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { getState } = useEricaColorsContext();

  const handleApply = (state: EricaState) => {
    onApplyToAll(state);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="text-xs"
          title="Aplicar estado a todos los estudiantes en todas las dimensiones"
        >
          <Zap className="w-4 h-4 mr-1" />
          Todos
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="start">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">
            Aplicar a todos los estudiantes
          </h4>
          <p className="text-xs text-gray-600">
            Selecciona un estado para aplicarlo a todas las dimensiones de todos los estudiantes
          </p>

          <div className="grid grid-cols-5 gap-2">
            {['E', 'B', 'P', 'C', 'N'].map(code => {
              const state = code as EricaState;
              const stateObj = getState(state);
              const bgColor = stateObj?.hexColor || '#ccc';

              return (
                <Button
                  key={code}
                  size="sm"
                  className="text-white font-semibold text-sm w-full"
                  style={{ backgroundColor: bgColor }}
                  onClick={() => handleApply(state)}
                >
                  {code}
                </Button>
              );
            })}
          </div>

          <div className="border-t pt-2 mt-2">
            <p className="text-xs text-amber-600 font-semibold">
              ⚠️ Esta acción es irreversible hasta guardar
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
