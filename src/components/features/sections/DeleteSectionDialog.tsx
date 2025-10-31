// src/components/features/sections/DeleteSectionDialog.tsx

'use client';

import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
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
import type { Section } from '@/types/sections.types';

interface DeleteSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  section: Section | null;
  isLoading?: boolean;
}

/**
 * 🗑️ Diálogo de confirmación para eliminar sección
 */
export function DeleteSectionDialog({
  open,
  onOpenChange,
  onConfirm,
  section,
  isLoading = false,
}: DeleteSectionDialogProps) {
  if (!section) return null;

  const enrollments = section._count?.enrollments || 0;
  const courseAssignments = section._count?.courseAssignments || 0;
  const schedules = section._count?.schedules || 0;

  const hasDependencies = 
    enrollments > 0 || 
    courseAssignments > 0 || 
    schedules > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <Trash2 className="h-5 w-5" />
            Eliminar Sección
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-2">
            {/* Información de la sección */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Sección: <span className="font-bold">{section.name}</span>
              </p>
              {section.grade && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Grado: {section.grade.name} - {section.grade.level}
                </p>
              )}
            </div>

            {/* Advertencia de dependencias */}
            {hasDependencies ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">
                      ⚠️ Esta sección tiene datos relacionados
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      No se puede eliminar porque tiene:
                    </p>
                  </div>
                </div>

                {/* Lista de dependencias */}
                <ul className="space-y-2 pl-4">
                  {enrollments > 0 && (
                    <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span>
                      <span className="font-bold">{enrollments}</span> estudiante(s) inscrito(s)
                    </li>
                  )}
                  {courseAssignments > 0 && (
                    <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span>
                      <span className="font-bold">{courseAssignments}</span> curso(s) asignado(s)
                    </li>
                  )}
                  {schedules > 0 && (
                    <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span>
                      <span className="font-bold">{schedules}</span> horario(s) configurado(s)
                    </li>
                  )}
                </ul>

                {/* Sugerencias */}
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2">
                    💡 Sugerencias:
                  </p>
                  <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
                    {enrollments > 0 && <li>• Reasigna los estudiantes a otra sección</li>}
                    {courseAssignments > 0 && <li>• Elimina o reasigna los cursos asociados</li>}
                    {schedules > 0 && <li>• Elimina los horarios configurados</li>}
                    <li>• Considera desactivar la sección en lugar de eliminarla</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  ¿Estás seguro de que deseas eliminar esta sección?
                </p>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    ⚠️ Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (!hasDependencies) {
                onConfirm();
              }
            }}
            disabled={isLoading || hasDependencies}
            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
          >
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
