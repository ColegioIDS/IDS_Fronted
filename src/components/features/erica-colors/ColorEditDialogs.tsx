'use client';

import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/feedback/ConfirmDialog';
import { EricaDimension, EricaState } from '@/types/erica-colors.types';

interface ColorEditDialogsProps {
  editingDimension: EricaDimension | null;
  editingState: EricaState | null;
  newColor: string;
  showConfirm: boolean;
  updating: boolean;
  confirmType: 'dimension' | 'state';
  onNewColorChange: (color: string) => void;
  onShowConfirmChange: (show: boolean) => void;
  onEditingDimensionChange: (dimension: EricaDimension | null) => void;
  onEditingStateChange: (state: EricaState | null) => void;
  onConfirmUpdate: () => Promise<void>;
}

export const ColorEditDialogs: React.FC<ColorEditDialogsProps> = ({
  editingDimension,
  editingState,
  newColor,
  showConfirm,
  updating,
  confirmType,
  onNewColorChange,
  onShowConfirmChange,
  onEditingDimensionChange,
  onEditingStateChange,
  onConfirmUpdate,
}) => {
  const isOpen = editingDimension !== null || editingState !== null;

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      onEditingDimensionChange(null);
      onEditingStateChange(null);
      onShowConfirmChange(false);
    }
  };

  const handleConfirmClose = (open: boolean) => {
    if (!open) {
      onShowConfirmChange(false);
    }
  };

  return (
    <>
      {/* Color Picker Dialog */}
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-sm bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-foreground">Seleccionar Color</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {confirmType === 'dimension'
                ? 'Elige un nuevo color para la dimensión'
                : 'Elige un nuevo color para el estado'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                style={{ backgroundColor: newColor }}
              />
              <input
                type="color"
                value={newColor}
                onChange={(e) => onNewColorChange(e.target.value)}
                className="w-full h-12 cursor-pointer rounded-lg border-0"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Valor:</span>
              <code className="text-sm font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-foreground border border-slate-200 dark:border-slate-800">
                {newColor.toUpperCase()}
              </code>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  onEditingDimensionChange(null);
                  onEditingStateChange(null);
                  onShowConfirmChange(false);
                }}
                disabled={updating}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => onShowConfirmChange(true)}
                disabled={updating}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Siguiente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={handleConfirmClose}
        title="Confirmar Cambio de Color"
        description={
          confirmType === 'dimension'
            ? `¿Deseas cambiar el color de la dimensión a ${newColor.toUpperCase()}?`
            : `¿Deseas cambiar el color del estado a ${newColor.toUpperCase()}?`
        }
        confirmText="Actualizar"
        cancelText="Volver"
        type="info"
        isLoading={updating}
        onConfirm={onConfirmUpdate}
      />
    </>
  );
};
