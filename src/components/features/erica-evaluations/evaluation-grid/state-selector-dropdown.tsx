"use client";

import React, { useRef, useEffect, useState } from 'react';
import { EricaState, STATE_POINTS, STATE_LABELS } from '@/types/erica-evaluations';
import { STATE_ORDER } from '../utils/evaluation-helpers';
import { Check } from 'lucide-react';

interface StateSelectorDropdownProps {
  selectedState: EricaState | null;
  onStateSelect: (state: EricaState) => void;
  onClear?: () => void;
  onClose?: () => void;
  disabled?: boolean;
}

/**
 * Selector de estados ERICA como lista vertical (dropdown personalizado)
 */
export default function StateSelectorDropdown({
  selectedState,
  onStateSelect,
  onClear,
  onClose,
  disabled = false,
}: StateSelectorDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isAbove, setIsAbove] = useState(false);

  useEffect(() => {
    if (containerRef.current?.parentElement) {
      const rect = containerRef.current.parentElement.getBoundingClientRect();
      const dropdownHeight = 240; // max-h-60 en píxeles (aprox 16 * 15)
      const dropdownWidth = 96; // w-24 en píxeles
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spacing = 8;
      
      // Determinar si mostrar arriba o abajo
      const showAbove = spaceBelow < dropdownHeight + spacing && spaceAbove > dropdownHeight + spacing;
      setIsAbove(showAbove);
      
      const newTop = showAbove 
        ? rect.top - dropdownHeight - spacing
        : rect.bottom + spacing;
      
      // Calcular posición horizontal con ajuste para mantener dentro de la pantalla
      let newLeft = rect.left + rect.width / 2;
      const rightEdge = newLeft + dropdownWidth / 2;
      const leftEdge = newLeft - dropdownWidth / 2;
      
      if (rightEdge > window.innerWidth - 8) {
        newLeft = window.innerWidth - dropdownWidth / 2 - 8;
      }
      if (leftEdge < 8) {
        newLeft = dropdownWidth / 2 + 8;
      }
      
      setPosition({
        top: Math.max(8, Math.min(newTop, window.innerHeight - dropdownHeight - 8)),
        left: newLeft,
      });
    }

    // Cerrar dropdown al hacer click fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleStateClick = (state: EricaState) => {
    if (disabled) return;
    
    if (selectedState === state && onClear) {
      onClear();
    } else {
      onStateSelect(state);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed z-50 pointer-events-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 shadow-xl overflow-hidden w-24">
        <ul className="py-1 max-h-60 overflow-y-auto">
          {STATE_ORDER.map((state, index) => {
            const isSelected = selectedState === state;
            const points = STATE_POINTS[state];
            const label = STATE_LABELS[state];
            
            return (
              <li key={state}>
                <button
                  onClick={() => handleStateClick(state)}
                  className={`
                    w-full px-3 py-2 text-center flex items-center justify-center gap-2
                    transition-colors duration-75 text-sm font-bold
                    ${isSelected 
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${index !== STATE_ORDER.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}
                  `}
                  disabled={disabled}
                >
                  <span>{state}</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 flex-shrink-0" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
