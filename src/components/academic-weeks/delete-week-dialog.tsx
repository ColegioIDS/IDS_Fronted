// components/academic-weeks/delete-week-dialog.tsx
"use client";

import React from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAcademicWeekActions } from '@/context/AcademicWeeksContext';
import { AcademicWeek } from '@/types/academic-week.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DeleteWeekDialogProps {
  week: AcademicWeek;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteWeekDialog({ week, open, onOpenChange }: DeleteWeekDialogProps) {
  const { deleteWeek, isDeleting } = useAcademicWeekActions();

  const handleDelete = async () => {
    try {
      await deleteWeek(week.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting week:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Semana Académica
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              ¿Estás seguro de que deseas eliminar la <strong>Semana {week.number}</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1 text-sm">
              <p><strong>Bimestre:</strong> {week.bimester?.name}</p>
              <p><strong>Período:</strong> {format(new Date(week.startDate), 'dd MMM', { locale: es })} - {format(new Date(week.endDate), 'dd MMM yyyy', { locale: es })}</p>
              {week.objectives && (
                <p><strong>Objetivos:</strong> {week.objectives.substring(0, 100)}{week.objectives.length > 100 ? '...' : ''}</p>
              )}
            </div>
            <p className="text-red-600 font-medium">
              Esta acción no se puede deshacer.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}