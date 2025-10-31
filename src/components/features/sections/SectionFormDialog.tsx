// src/components/features/sections/SectionFormDialog.tsx

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SectionForm } from './SectionForm';
import type { Section, CreateSectionDto, UpdateSectionDto } from '@/types/sections.types';

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSectionDto | UpdateSectionDto) => void | Promise<void>;
  section?: Section;
  mode: 'create' | 'edit';
  isLoading?: boolean;
  grades?: Array<{ id: number; name: string; level: string }>;
  teachers?: Array<{ id: number; givenNames: string; lastNames: string }>;
}

/**
 * 📝 Diálogo para crear/editar secciones
 */
export function SectionFormDialog({
  open,
  onOpenChange,
  onSubmit,
  section,
  mode,
  isLoading = false,
  grades = [],
  teachers = [],
}: SectionFormDialogProps) {
  const handleSubmit = async (data: CreateSectionDto | UpdateSectionDto) => {
    await onSubmit(data);
  };

  const defaultValues = section ? {
    name: section.name,
    capacity: section.capacity,
    gradeId: section.gradeId,
    teacherId: section.teacherId,
  } : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? '✨ Nueva Sección' : '✏️ Editar Sección'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {mode === 'create'
              ? 'Completa los datos para crear una nueva sección'
              : 'Modifica los datos de la sección'}
          </DialogDescription>
        </DialogHeader>

        <SectionForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
          mode={mode}
          grades={grades}
          teachers={teachers}
          currentEnrollments={section?._count?.enrollments}
        />
      </DialogContent>
    </Dialog>
  );
}
