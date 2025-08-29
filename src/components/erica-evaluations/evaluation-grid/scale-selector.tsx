// src/components/erica-evaluations/evaluation-grid/scale-selector.tsx
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

// Types
interface Scale {
  id: number;
  code: string;
  name: string;
  numericValue: number;
  order: number;
}

interface ScaleSelectorProps {
  scales: Scale[];
  selectedScale: string;
  onScaleSelect: (scaleCode: string) => void;
}

// ==================== COMPONENTE ====================
export default function ScaleSelector({
  scales,
  selectedScale,
  onScaleSelect
}: ScaleSelectorProps) {

  // ========== FUNCIONES ==========
  
  const getScaleButtonStyle = (scaleCode: string, isSelected: boolean) => {
    const baseStyle = "h-full w-full text-xs font-bold transition-all duration-150";
    
    if (isSelected) {
      switch (scaleCode) {
        case 'E': return `${baseStyle} bg-green-500 text-white border-green-600 shadow-md`;
        case 'B': return `${baseStyle} bg-blue-500 text-white border-blue-600 shadow-md`;
        case 'P': return `${baseStyle} bg-yellow-500 text-white border-yellow-600 shadow-md`;
        case 'C': return `${baseStyle} bg-orange-500 text-white border-orange-600 shadow-md`;
        case 'N': return `${baseStyle} bg-red-500 text-white border-red-600 shadow-md`;
        default: return `${baseStyle} bg-gray-500 text-white border-gray-600 shadow-md`;
      }
    }

    // Estilos para estados no seleccionados con hover
    switch (scaleCode) {
      case 'E': return `${baseStyle} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50`;
      case 'B': return `${baseStyle} bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50`;
      case 'P': return `${baseStyle} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-900/50`;
      case 'C': return `${baseStyle} bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700 hover:bg-orange-200 dark:hover:bg-orange-900/50`;
      case 'N': return `${baseStyle} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50`;
      default: return `${baseStyle} bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700`;
    }
  };

  // ========== RENDER ==========
  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-lg p-1">
      <div className="grid grid-cols-5 gap-1 h-full">
        {scales
          .sort((a, b) => a.order - b.order)
          .map((scale) => {
            const isSelected = selectedScale === scale.code;
            
            return (
              <Button
                key={scale.id}
                onClick={() => onScaleSelect(scale.code)}
                className={getScaleButtonStyle(scale.code, isSelected)}
                title={`${scale.name} (${scale.numericValue} puntos)`}
                variant="ghost"
              >
                <div className="text-center">
                  <div className="font-bold text-sm">{scale.code}</div>
                  <div className="text-xs opacity-80 mt-0.5">
                    {scale.numericValue}
                  </div>
                </div>
              </Button>
            );
          })
        }
      </div>
      
      {/* Indicador de instrucción */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
        Click para evaluar
      </div>
    </div>
  );
}