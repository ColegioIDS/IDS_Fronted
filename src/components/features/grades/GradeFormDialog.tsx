// src/components/features/grades/GradeFormDialog.tsx

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Grade, CreateGradeDto } from '@/types/grades.types';
import { GradeForm } from './GradeForm';

interface GradeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: Grade | null;
  onSubmit: (data: CreateGradeDto) => Promise<void>;
  isSubmitting?: boolean;
  mode: 'create' | 'edit';
  suggestedOrder?: number;
}

/**
 * 📝 Dialog para crear/editar grados
 */
export function GradeFormDialog({
  open,
  onOpenChange,
  grade,
  onSubmit,
  isSubmitting = false,
  mode,
  suggestedOrder,
}: GradeFormDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (data: CreateGradeDto) => {
    await onSubmit(data);
    // El componente padre cerrará el dialog después del éxito
  };

  const initialData =
    mode === 'edit' && grade
      ? {
          id: grade.id,
          name: grade.name,
          level: grade.level,
          order: grade.order,
          isActive: grade.isActive,
        }
      : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {mode === 'create' ? 'Agregar Grado' : 'Editar Grado'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {mode === 'create'
              ? 'Complete el formulario para registrar un nuevo grado'
              : 'Modifique los campos necesarios y guarde los cambios'}
          </DialogDescription>
        </DialogHeader>

        <GradeForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          mode={mode}
          suggestedOrder={suggestedOrder}
        />
      </DialogContent>
    </Dialog>
  );
}

export default GradeFormDialog;
