/**
 * Componente AssignmentsForm
 * Formulario completo para crear tareas
 * Integra cascada + detalles de la tarea + tabla de tareas
 */

'use client';

import { FC, useState } from 'react';
import { useAssignmentsList } from '@/hooks/useAssignmentsList';
import { AssignmentsCascadeForm } from './AssignmentsCascadeForm';
import { CreateAssignmentForm } from './CreateAssignmentForm';
import { AssignmentsListTable } from './AssignmentsListTable';
import { ClipboardList, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type FormStep = 'cascade' | 'details';

interface AssignmentsFormProps {
  onSuccess?: () => void;
}

export const AssignmentsForm: FC<AssignmentsFormProps> = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('cascade');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<{
    gradeId: number;
    sectionId: number;
    courseId: number;
    bimesterId: number;
    gradeName: string;
    sectionName: string;
    courseName: string;
    bimesterName: string;
  } | null>(null);

  // Usar el hook para obtener las tareas y puntuación
  const { totalScore, remainingPoints } = useAssignmentsList({
    courseId: selectedData?.courseId,
    bimesterId: selectedData?.bimesterId,
    limit: 100,
    enabled: !!selectedData,
  });

  const handleCascadeComplete = (data: {
    gradeId: number;
    sectionId: number;
    courseId: number;
    bimesterId: number;
    gradeName: string;
    sectionName: string;
    courseName: string;
    bimesterName: string;
  }) => {
    setSelectedData(data);
    setCurrentStep('details');
  };

  const handleCascadeError = (error: string) => {
    console.error('Error en cascada:', error);
  };

  const handleDetailsSuccess = () => {
    setCurrentStep('cascade');
    setSelectedData(null);
    setIsCreateDialogOpen(false);
    if (onSuccess) onSuccess();
  };

  const handleBack = () => {
    setCurrentStep('cascade');
    setSelectedData(null);
  };

  const handleOpenCreateDialog = () => {
    if (selectedData) {
      setIsCreateDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* PASOS */}
      <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-full font-semibold text-sm transition ${
            currentStep === 'cascade'
              ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          1
        </div>
        <div className={`h-1 flex-1 transition ${
          currentStep === 'details' 
            ? 'bg-blue-600 dark:bg-blue-500' 
            : 'bg-gray-300 dark:bg-gray-700'
        }`} />
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-full font-semibold text-sm transition ${
            currentStep === 'details'
              ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          2
        </div>
      </div>

      {/* TÍTULOS DE PASO */}
      <div className="text-center">
        {currentStep === 'cascade' ? (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Seleccionar Contexto</h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
              Elige donde crear la tarea
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Crear Tarea y Gestionar</h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
              Crea nuevas tareas y gestiona las existentes
            </p>
          </div>
        )}
      </div>

      {/* CONTENIDO */}
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
        {currentStep === 'cascade' ? (
          <AssignmentsCascadeForm
            onComplete={handleCascadeComplete}
            onError={handleCascadeError}
          />
        ) : selectedData ? (
          <div className="space-y-4">
            {/* BOTÓN PARA CREAR NUEVA TAREA */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Tareas del Curso
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Gestiona todas las tareas del curso
                </p>
              </div>
              <Button
                onClick={handleOpenCreateDialog}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Tarea
              </Button>
            </div>

            {/* TABLA DE TAREAS */}
            <div>
              <ClipboardList className="w-5 h-5 text-slate-600 dark:text-slate-400 mb-3" />
              <AssignmentsListTable
                courseId={selectedData.courseId}
                bimesterId={selectedData.bimesterId}
                sectionId={selectedData.sectionId}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* DIALOG PARA CREAR TAREA */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Nueva Tarea
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Completa los detalles para crear una nueva tarea
            </DialogDescription>
          </DialogHeader>
          {selectedData && (
            <CreateAssignmentForm
              cascadeData={selectedData}
              onSuccess={handleDetailsSuccess}
              onBack={() => setIsCreateDialogOpen(false)}
              totalExistingScore={totalScore}
              remainingPoints={remainingPoints}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
