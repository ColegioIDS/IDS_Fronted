// src/components/features/erica-evaluations/evaluation-grid/dimension-evaluation-cell.tsx
"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { MessageSquare, Save, X, Trash2 } from 'lucide-react';

import StateSelector from './state-selector';
import StateSelectorDropdown from './state-selector-dropdown';
import { useStateSelectorMode } from '@/context/StateSelectorContext';
import { useActiveSelector } from '@/context/ActiveSelectorContext';
import { useEricaColorsContext } from '@/context/EricaColorsContext';
import {
  EricaDimension,
  EricaState,
  DimensionEvaluation,
  STATE_LABELS,
  STATE_POINTS,
} from '@/types/erica-evaluations';
import {
  getStateBackgroundColor,
  getStateTextColor,
  getStateBorderColor,
  DIMENSION_SHORT_LABELS,
} from '../utils/evaluation-helpers';

interface PendingChange {
  enrollmentId: number;
  dimension: EricaDimension;
  state: EricaState;
  notes?: string | null;
}

interface DimensionEvaluationCellProps {
  enrollmentId: number;
  dimension: EricaDimension;
  existingEvaluation: DimensionEvaluation | null;
  pendingChange?: PendingChange;
  onEvaluationChange: (
    enrollmentId: number,
    dimension: EricaDimension,
    state: EricaState,
    notes?: string | null
  ) => void;
  onClearEvaluation?: (enrollmentId: number, dimension: EricaDimension) => void;
  disabled?: boolean;
}

export default function DimensionEvaluationCell({
  enrollmentId,
  dimension,
  existingEvaluation,
  pendingChange,
  onEvaluationChange,
  onClearEvaluation,
  disabled = false,
}: DimensionEvaluationCellProps) {
  
  const { mode } = useStateSelectorMode();
  const { activeSelector, setActiveSelector } = useActiveSelector();
  const { getState } = useEricaColorsContext();
  const selectorId = `${enrollmentId}-${dimension}`;
  const isThisSelectorActive = activeSelector === selectorId;
  
  const [showNotesPopover, setShowNotesPopover] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  // Valor actual (pendiente tiene prioridad sobre existente)
  const currentState = pendingChange?.state ?? existingEvaluation?.state ?? null;
  const currentNotes = pendingChange?.notes ?? existingEvaluation?.notes ?? '';
  const currentPoints = currentState ? STATE_POINTS[currentState] : null;
  const hasPendingChange = !!pendingChange;
  const hasEvaluation = currentState !== null;

  // Obtener color dinámico del estado
  const stateColorObj = useMemo(() => {
    if (!currentState) return null;
    return getState(currentState);
  }, [currentState, getState]);

  // Manejar selección de estado
  const handleStateSelect = useCallback((state: EricaState) => {
    onEvaluationChange(enrollmentId, dimension, state, currentNotes || null);
    setActiveSelector(null);
  }, [enrollmentId, dimension, currentNotes, onEvaluationChange, setActiveSelector]);

  // Manejar limpieza
  const handleClear = useCallback(() => {
    if (onClearEvaluation) {
      onClearEvaluation(enrollmentId, dimension);
    }
    setActiveSelector(null);
  }, [enrollmentId, dimension, onClearEvaluation, setActiveSelector]);

  // Manejar apertura de notas
  const handleOpenNotes = useCallback(() => {
    setTempNotes(currentNotes || '');
    setShowNotesPopover(true);
  }, [currentNotes]);

  // Guardar notas
  const handleSaveNotes = useCallback(() => {
    if (currentState) {
      onEvaluationChange(enrollmentId, dimension, currentState, tempNotes || null);
    }
    setShowNotesPopover(false);
  }, [enrollmentId, dimension, currentState, tempNotes, onEvaluationChange]);

  // Cancelar notas
  const handleCancelNotes = useCallback(() => {
    setTempNotes('');
    setShowNotesPopover(false);
  }, []);

  // Estilo de la celda basado en el estado
  const getCellStyle = () => {
    if (!hasEvaluation) {
      return {
        backgroundColor: '#f3f4f6',
        borderColor: '#e5e7eb',
        borderWidth: '1px',
      };
    }
    
    const bgColor = stateColorObj?.hexColor || '#999999';
    const borderColor = hasPendingChange ? '#b45309' : bgColor;
    const borderStyle = hasPendingChange ? 'dashed' : 'solid';
    
    return {
      backgroundColor: `${bgColor}20`, // 20% opacity
      borderColor: borderColor,
      borderWidth: hasPendingChange ? '2px' : '1px',
      borderStyle: borderStyle,
    };
  };

  return (
    <div
      style={{
        ...getCellStyle(),
        borderRadius: '0.375rem',
        transition: 'all 150ms',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: isHovered ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
      }}
      className="relative h-12 w-24"
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        // Ya no cerramos al salir del mouse, solo con click en la celda
      }}
      onClick={() => {
        if (!disabled && !showNotesPopover) {
          setActiveSelector(isThisSelectorActive ? null : selectorId);
        }
      }}
    >
      {/* Contenido de la celda */}
      {hasEvaluation ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div 
              className="font-bold text-lg"
              style={{ color: stateColorObj?.hexColor || '#000000' }}
            >
              {currentState}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {currentPoints?.toFixed(2)}
            </div>
          </div>
          
          {/* Indicador de notas */}
          {currentNotes && (
            <MessageSquare 
              className="absolute top-1 right-1 h-3 w-3 text-gray-400" 
            />
          )}
          
          {/* Indicador de cambio pendiente */}
          {hasPendingChange && (
            <div className="absolute top-1 left-1">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-400 dark:text-gray-500 text-sm">—</span>
        </div>
      )}

      {/* Selector de estado (aparece al hover/click) */}
      {isThisSelectorActive && !disabled && (
        mode === 'popover' ? (
          <StateSelector
            selectedState={currentState}
            onStateSelect={handleStateSelect}
            onClear={hasEvaluation ? handleClear : undefined}
            showPoints={true}
            size="sm"
          />
        ) : (
          <StateSelectorDropdown
            selectedState={currentState}
            onStateSelect={handleStateSelect}
            onClear={hasEvaluation ? handleClear : undefined}
            onClose={() => setActiveSelector(null)}
          />
        )
      )}

      {/* Popover de notas */}
      {hasEvaluation && !isThisSelectorActive && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-20" style={{ visibility: isHovered || showNotesPopover ? 'visible' : 'hidden' }}>
          <Popover open={showNotesPopover} onOpenChange={(open) => {
            // Solo cierra si el usuario hace click en cerrar/guardar, no automáticamente
            if (!open) {
              // Prevenir cierre automático al hacer click fuera
              return;
            }
            setShowNotesPopover(open);
          }}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenNotes();
                }}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Notas
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">
                    Notas para {DIMENSION_SHORT_LABELS[dimension]}
                  </Label>
                  <p className="text-xs text-gray-500">
                    Estado: {STATE_LABELS[currentState!]} ({currentPoints})
                  </p>
                </div>
                <Textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="Agregar observaciones..."
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelNotes}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Guardar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
