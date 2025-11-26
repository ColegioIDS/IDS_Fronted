// src/components/features/course-grades/DeleteCourseGradeDialog.tsx
'use client';

import React, { useState } from 'react';
import { CourseGradeDetail } from '@/types/course-grades.types';
import { courseGradesService } from '@/services/course-grades.service';
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
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteCourseGradeDialogProps {
  courseGrade: CourseGradeDetail | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteCourseGradeDialog({
  courseGrade,
  open,
  onClose,
  onSuccess,
}: DeleteCourseGradeDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!courseGrade) return null;

  const handleDelete = async () => {
    setLoading(true);

    try {
      await courseGradesService.deleteCourseGrade(courseGrade.id);
      toast.success('Asignación eliminada exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la asignación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <AlertDialogTitle className="text-center text-xl text-gray-900 dark:text-gray-100">
            ¿Eliminar esta asignación?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-gray-600 dark:text-gray-400">
            Esta acción no se puede deshacer. La asignación será eliminada permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Assignment Details */}
        <div className="my-4 space-y-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Curso</p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              [{courseGrade.course.code}] {courseGrade.course.name}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Grado</p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {courseGrade.grade.name} ({courseGrade.grade.level})
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipo</p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {courseGrade.isCore ? 'Curso Núcleo' : 'Curso Electivo'}
            </p>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel 
            disabled={loading}
            className="border-gray-300 dark:border-gray-600"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar Asignación'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
