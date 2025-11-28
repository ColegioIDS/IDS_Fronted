// src/components/features/students/QuickTestDataButton.tsx
'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { generateStudentMockData } from '@/utils/generate-student-mock-data';
import { RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Botón para llenar el formulario con datos aleatorios para testing
 * Esto es SOLO para desarrollo, debe ser removido en producción
 */
export const QuickTestDataButton: React.FC = () => {
  const { setValue, getValues } = useFormContext();
  const [open, setOpen] = React.useState(false);

  const handleFillMockData = async () => {
    try {
      const mockData = generateStudentMockData();

      // Obtener enrollment actual para usar valores reales
      const currentEnrollment = getValues('enrollment');

      // Llenar todos los campos excepto enrollment (que debe ser seleccionado manualmente)
      Object.entries(mockData).forEach(([key, value]) => {
        if (key === 'enrollment') {
          // Mantener el enrollment actual si existen valores válidos
          if (currentEnrollment?.cycleId && currentEnrollment?.gradeId && currentEnrollment?.sectionId) {
            return; // No sobrescribir enrollment
          }
        }
        setValue(key, value);
      });


      setOpen(false);
    } catch (error) {
      alert('Error al generar datos');
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Llenar con datos de prueba
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Generar Datos de Prueba</AlertDialogTitle>
            <AlertDialogDescription>
              Esto llenará el formulario con datos aleatorios. Los datos actuales serán sobrescritos.
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm">
                <strong>Nota:</strong> Después de llenar los datos, deberás seleccionar manualmente:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Ciclo Escolar</li>
                  <li>Grado</li>
                  <li>Sección</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleFillMockData}>
              Generar datos
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
