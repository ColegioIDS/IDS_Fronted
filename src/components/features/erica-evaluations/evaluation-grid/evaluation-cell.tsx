// src/components/erica-evaluations/evaluation-grid/evaluation-cell.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { MessageSquare, Save, X } from 'lucide-react';

// Components
import ScaleSelector from './scale-selector';

// Types
interface Category {
  id: number;
  code: string;
  name: string;
  order: number;
}

interface Scale {
  id: number;
  code: string;
  name: string;
  numericValue: number;
  order: number;
}

interface ExistingEvaluation {
  id: number;
  scaleCode: string;
  scaleName: string;
  points: number;
  notes?: string;
  evaluatedAt: Date;
  createdAt: Date;
}

interface PendingChange {
  enrollmentId: number;
  categoryId: number;
  scaleCode: string;
  notes?: string;
}

interface EvaluationCellProps {
  enrollmentId: number;
  category: Category;
  scales: Scale[];
  existingEvaluation: ExistingEvaluation | null;
  pendingChange: PendingChange | undefined;
  onEvaluationChange: (
    enrollmentId: number,
    categoryId: number,
    scaleCode: string,
    notes?: string
  ) => void;
}

// ==================== COMPONENTE ====================
export default function EvaluationCell({
  enrollmentId,
  category,
  scales,
  existingEvaluation,
  pendingChange,
  onEvaluationChange
}: EvaluationCellProps) {

  // ========== ESTADO LOCAL ==========
  const [showNotesPopover, setShowNotesPopover] = useState(false);
  const [tempNotes, setTempNotes] = useState('');

  // ========== COMPUTED VALUES ==========
  
  // Obtener el valor actual (pendiente o existente)
  const currentScaleCode = pendingChange?.scaleCode || existingEvaluation?.scaleCode || '';
  const currentNotes = pendingChange?.notes || existingEvaluation?.notes || '';
  
  // Obtener la escala actual
  const currentScale = scales.find(scale => scale.code === currentScaleCode);
  
  // Estado de la celda
  const hasEvaluation = currentScaleCode !== '';
  const hasPendingChange = !!pendingChange;
  const hasNotes = currentNotes.trim() !== '';

  // Color de la celda basado en la escala
  const getCellColor = (scaleCode: string) => {
    switch (scaleCode) {
      case 'E': return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200';
      case 'B': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200';
      case 'P': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200';
      case 'C': return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-200';
      case 'N': return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400';
    }
  };

  // ========== FUNCIONES ==========
  
  const handleScaleChange = useCallback((scaleCode: string) => {
    onEvaluationChange(enrollmentId, category.id, scaleCode, currentNotes);
  }, [enrollmentId, category.id, currentNotes, onEvaluationChange]);

  const handleNotesOpen = useCallback(() => {
    setTempNotes(currentNotes);
    setShowNotesPopover(true);
  }, [currentNotes]);

  const handleNotesSave = useCallback(() => {
    onEvaluationChange(enrollmentId, category.id, currentScaleCode, tempNotes);
    setShowNotesPopover(false);
  }, [enrollmentId, category.id, currentScaleCode, tempNotes, onEvaluationChange]);

  const handleNotesCancel = useCallback(() => {
    setTempNotes(currentNotes);
    setShowNotesPopover(false);
  }, [currentNotes]);

  const handleClearEvaluation = useCallback(() => {
    onEvaluationChange(enrollmentId, category.id, '', '');
  }, [enrollmentId, category.id, onEvaluationChange]);

  // ========== RENDER ==========
  return (
    <div className="relative">
      {/* ========== CELDA PRINCIPAL ========== */}
      <div className={`
        relative border-2 rounded-lg p-3 transition-all duration-200 min-h-[80px]
        ${hasEvaluation 
          ? getCellColor(currentScaleCode) 
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
        ${hasPendingChange ? 'ring-2 ring-amber-400 ring-opacity-50' : ''}
      `}>
        
        {/* Indicador de cambio pendiente */}
        {hasPendingChange && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white dark:border-gray-900"></div>
        )}
        
        {/* Contenido de la evaluación */}
        {hasEvaluation ? (
          <div className="space-y-2">
            {/* Escala seleccionada */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-sm font-bold">
                {currentScaleCode}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearEvaluation}
                className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Nombre de la escala y puntos */}
            <div className="text-xs">
              <div className="font-medium">{currentScale?.name}</div>
              <div className="text-xs opacity-75">
                {currentScale?.numericValue} puntos
              </div>
            </div>
            
            {/* Indicador de notas */}
            {hasNotes && (
              <div className="flex items-center gap-1 text-xs opacity-75">
                <MessageSquare className="h-3 w-3" />
                <span>Con notas</span>
              </div>
            )}
          </div>
        ) : (
          /* Estado sin evaluación */
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
            <div className="text-center">
              <div className="text-xs font-medium">Sin evaluar</div>
              <div className="text-xs mt-1">Click para calificar</div>
            </div>
          </div>
        )}
      </div>

      {/* ========== SELECTOR DE ESCALA ========== */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
        <ScaleSelector
          scales={scales}
          selectedScale={currentScaleCode}
          onScaleSelect={handleScaleChange}
        />
      </div>

      {/* ========== POPOVER DE NOTAS ========== */}
      <div className="absolute bottom-0 right-0 z-10">
        <Popover open={showNotesPopover} onOpenChange={setShowNotesPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotesOpen}
              className={`
                h-6 w-6 p-0 rounded-full
                ${hasNotes 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notas para {category.name}
                </Label>
                <Textarea
                  id="notes"
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="Observaciones adicionales..."
                  className="min-h-[80px] resize-none"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNotesCancel}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleNotesSave}
                  className="flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  Guardar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}