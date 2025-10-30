// src/components/features/academic-weeks/AcademicWeekFormDialog.tsx

'use client';

import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AcademicWeekForm } from './AcademicWeekForm';
import { AcademicWeek } from '@/types/academic-week.types';

interface AcademicWeekFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: AcademicWeek | null;
  isSubmitting?: boolean;
  availableCycles: Array<{ id: number; name: string }>;
  availableBimesters: Array<{ id: number; name: string; number: number }>;
  bimesterDateRange?: { startDate: string; endDate: string } | null;
}

/**
 * 📝 Diálogo contenedor para el formulario de Academic Weeks
 * 
 * Wrapper que contiene el formulario en un diálogo modal
 */
export function AcademicWeekFormDialog({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  isSubmitting = false,
  availableCycles,
  availableBimesters,
  bimesterDateRange,
}: AcademicWeekFormDialogProps) {
  const title = mode === 'create' ? 'Crear Semana Académica' : 'Editar Semana Académica';
  const description =
    mode === 'create'
      ? 'Completa la información para crear una nueva semana académica.'
      : 'Modifica la información de la semana académica.';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <AcademicWeekForm
            initialData={initialData ? {
              cycleId: (initialData as any).cycleId,
              bimesterId: (initialData as any).bimesterId,
              weekNumber: initialData.weekNumber,
              weekType: initialData.weekType,
              name: initialData.name,
              startDate: new Date(initialData.startDate),
              endDate: new Date(initialData.endDate),
              year: initialData.year,
              month: initialData.month,
              notes: initialData.notes,
              isActive: initialData.isActive,
            } : undefined}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
            mode={mode}
            availableCycles={availableCycles}
            availableBimesters={availableBimesters}
            bimesterDateRange={bimesterDateRange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AcademicWeekFormDialog;
