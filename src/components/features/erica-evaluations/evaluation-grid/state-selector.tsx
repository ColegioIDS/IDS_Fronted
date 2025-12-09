// src/components/features/erica-evaluations/evaluation-grid/state-selector.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { EricaState, STATE_POINTS, STATE_LABELS } from '@/types/erica-evaluations';
import { useEricaColorsContext } from '@/context/EricaColorsContext';
import { getStateButtonClasses, STATE_ORDER } from '../utils/evaluation-helpers';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface StateSelectorProps {
  selectedState: EricaState | null;
  onStateSelect: (state: EricaState) => void;
  onClear?: () => void;
  showPoints?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

/**
 * Selector de estados ERICA (E, B, P, C, N)
 * Usa Popover para mostrarse sobre la celda
 */
export default function StateSelector({
  selectedState,
  onStateSelect,
  onClear,
  showPoints = true,
  size = 'md',
  disabled = false,
}: StateSelectorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { getState } = useEricaColorsContext();

  const handleStateClick = (state: EricaState) => {
    if (disabled) return;
    
    if (selectedState === state && onClear) {
      onClear();
    } else {
      onStateSelect(state);
    }
  };

  const getButtonStyles = (state: EricaState, isSelected: boolean) => {
    const stateObj = getState(state);
    if (!stateObj) return {};

    const bgColor = stateObj.hexColor;
    
    if (isSelected) {
      return {
        backgroundColor: bgColor,
        color: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      };
    }

    return {
      backgroundColor: `${bgColor}20`, // 20% opacity
      color: bgColor,
      borderWidth: '1px',
      borderColor: bgColor,
    };
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="absolute inset-0" />
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3 border-2 border-gray-300 dark:border-gray-600" 
        align="center" 
        side="top"
      >
        <div className="grid grid-cols-5 gap-2">
          {STATE_ORDER.map((state) => {
            const isSelected = selectedState === state;
            const points = STATE_POINTS[state];
            const label = STATE_LABELS[state];
            
            return (
              <button
                key={state}
                onClick={() => handleStateClick(state)}
                style={{
                  ...getButtonStyles(state, isSelected),
                  borderRadius: '0.375rem',
                  transition: 'all 75ms',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                  width: '40px',
                  height: '40px',
                }}
                className="hover:shadow-md active:scale-95"
                disabled={disabled}
              >
                <span style={{ fontSize: '1.125rem' }}>{state}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
