// src/components/features/course-assignments/components/bulk-save-actions.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertCircle, Save, RotateCcw } from 'lucide-react';

interface BulkSaveActionsProps {
  hasChanges: boolean;
  isSubmitting: boolean;
  modifiedCount: number;
  onSave: () => Promise<void>;
  onReset: () => void;
}

export default function BulkSaveActions({
  hasChanges,
  isSubmitting,
  modifiedCount,
  onSave,
  onReset
}: BulkSaveActionsProps) {
  if (!hasChanges) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950 border-2 border-orange-200 dark:border-orange-800 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
              Hay cambios sin guardar
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
              {modifiedCount} asignación{modifiedCount !== 1 ? 'es' : ''} modificada{modifiedCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                disabled={isSubmitting}
                className="border-2 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900 hover:shadow-md transition-all"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">Descartar todos los cambios pendientes</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400 dark:disabled:bg-green-800 shadow-md hover:shadow-lg transition-all"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">Guardar {modifiedCount} asignación{modifiedCount !== 1 ? 'es' : ''}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
