// src/components/features/courses/DeleteCourseDialog.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { Course } from '@/types/courses';
import { toast } from 'sonner';
import { coursesService } from '@/services/courses.service';

interface DeleteCourseDialogProps {
  course: Course;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteCourseDialog({ course, open, onClose, onSuccess }: DeleteCourseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await coursesService.deleteCourse(course.id);
      toast.success('Curso eliminado exitosamente');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el curso');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Eliminar Curso
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            ¿Estás seguro que deseas eliminar este curso?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Course info */}
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {course.name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Código: <span className="font-medium">{course.code}</span>
            </p>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-gray-100">Nota:</strong> Esta acción marcará el curso como inactivo. Los horarios y asignaciones asociadas seguirán existiendo pero el curso no estará disponible.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
