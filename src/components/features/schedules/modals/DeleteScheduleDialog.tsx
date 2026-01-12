// src/components/features/schedules/modals/DeleteScheduleDialog.tsx
"use client";

import { useState } from "react";
import { Loader2, Trash2, Clock, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Schedule, TempSchedule } from "@/types/schedules.types";

interface DeleteScheduleDialogProps {
  isOpen: boolean;
  schedule: Schedule | TempSchedule | null;
  isDeleting?: boolean;
  onDeleteNow: () => Promise<void>;
  onMarkForDeletion: () => void;
  onCancel: () => void;
}

export function DeleteScheduleDialog({
  isOpen,
  schedule,
  isDeleting = false,
  onDeleteNow,
  onMarkForDeletion,
  onCancel,
}: DeleteScheduleDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!schedule) return null;

  const courseData = (schedule as any).courseAssignment?.course;
  const teacherData = (schedule as any).courseAssignment?.teacher;
  
  const getTeacherName = () => {
    if (!teacherData) return "Sin profesor";
    if ('name' in teacherData && teacherData.name) {
      return teacherData.name;
    }
    if ('givenNames' in teacherData && 'lastNames' in teacherData) {
      return `${teacherData.givenNames} ${teacherData.lastNames}`;
    }
    return "Sin profesor";
  };

  const handleDeleteNow = async () => {
    setIsProcessing(true);
    try {
      await onDeleteNow();
    } finally {
      setIsProcessing(false);
    }
  };

  const isTemp = ('isPending' in schedule);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-lg">
              ¿Eliminar horario?
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription asChild>
          <div className="space-y-4">
            {/* Course Info Card */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
              {/* Course Name */}
              <div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Curso
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {courseData?.name || "Sin curso asignado"}
                </div>
              </div>

              {/* Teacher Name */}
              <div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Profesor
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {getTeacherName()}
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {schedule.startTime} - {schedule.endTime}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            {isTemp && (
              <Badge className="w-full justify-center py-2 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700 text-xs">
                ⏳ Este horario aún no ha sido guardado
              </Badge>
            )}

            {/* Info Message */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Elige cómo deseas proceder con la eliminación de este horario.
            </div>
          </div>
        </AlertDialogDescription>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-6">
          {/* Mark for Deletion Button */}
          <Button
            variant="outline"
            onClick={() => {
              onMarkForDeletion();
              onCancel();
            }}
            disabled={isProcessing}
            className="w-full border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400"
          >
            <Clock className="h-4 w-4 mr-2" />
            Marcar para eliminar después
          </Button>

          {/* Delete Now Button */}
          <Button
            variant="destructive"
            onClick={handleDeleteNow}
            disabled={isProcessing || isDeleting}
            className="w-full"
          >
            {isProcessing || isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar ahora
              </>
            )}
          </Button>

          {/* Cancel Button */}
          <AlertDialogCancel className="w-full">
            Cancelar
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
