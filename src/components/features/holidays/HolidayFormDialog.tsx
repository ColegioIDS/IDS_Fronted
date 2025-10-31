// src/components/features/holidays/HolidayFormDialog.tsx

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { HolidayForm } from './HolidayForm';
import { CreateHolidayDto, Holiday } from '@/types/holidays.types';

interface HolidayFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  holiday?: Holiday | null;
  onSubmit: (data: CreateHolidayDto) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * 🎯 Dialog envolvente para el formulario de días festivos
 */
export function HolidayFormDialog({
  open,
  onOpenChange,
  mode,
  holiday,
  onSubmit,
  isSubmitting = false,
}: HolidayFormDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (data: CreateHolidayDto) => {
    await onSubmit(data);
    // El componente padre cerrará el dialog
  };

  // Preparar datos iniciales para el formulario
  const initialData = holiday && holiday.bimester
    ? {
        id: holiday.id,
        cycleId: holiday.bimester.cycle.id,
        bimesterId: holiday.bimester.id,
        date: new Date(holiday.date),
        description: holiday.description,
        isRecovered: holiday.isRecovered,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {mode === 'create' ? 'Agregar Día Festivo' : 'Editar Día Festivo'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {mode === 'create'
              ? 'Complete el formulario para registrar un nuevo día festivo'
              : 'Modifique los campos necesarios y guarde los cambios'}
          </DialogDescription>
        </DialogHeader>

        <HolidayForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
}

export default HolidayFormDialog;
