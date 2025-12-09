// src/components/erica-evaluations/evaluation-grid/evaluation-dropdown.tsx
"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Scale {
  id: number;
  code: string;
  name: string;
  numericValue: number;
  order: number;
}

interface EvaluationDropdownProps {
  scales: Scale[];
  value?: string;
  onChange: (scaleCode: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function EvaluationDropdown({
  scales,
  value,
  onChange,
  disabled = false,
  placeholder = "Seleccionar"
}: EvaluationDropdownProps) {

  const getScaleBadgeColor = (code: string) => {
    switch (code) {
      case 'E': return 'bg-green-100 text-green-800 border-green-300';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'P': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'C': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'N': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const selectedScale = scales.find(scale => scale.code === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full h-10">
        <SelectValue placeholder={placeholder}>
          {selectedScale && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`text-xs font-medium ${getScaleBadgeColor(selectedScale.code)}`}
              >
                {selectedScale.code}
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {selectedScale.name}
              </span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {scales
          .sort((a, b) => b.numericValue - a.numericValue) // Ordenar de mayor a menor valor
          .map((scale) => (
            <SelectItem key={scale.id} value={scale.code}>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${getScaleBadgeColor(scale.code)}`}
                >
                  {scale.code}
                </Badge>
                <span className="text-sm">{scale.name}</span>
                <span className="text-xs text-gray-500 ml-auto">
                  ({scale.numericValue} pts)
                </span>
              </div>
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}