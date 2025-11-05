// src/components/features/course-assignments/components/bulk-save-actions.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
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
    <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <div>
          <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
            Hay cambios sin guardar
          </p>
          <p className="text-xs text-orange-700 dark:text-orange-300">
            {modifiedCount} asignación{modifiedCount !== 1 ? 'es' : ''} modificada{modifiedCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={isSubmitting}
          className="border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400 dark:disabled:bg-green-800"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
