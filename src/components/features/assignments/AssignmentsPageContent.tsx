'use client';

import { useState, useCallback } from 'react';
import { AssignmentsCascadeForm } from './AssignmentsCascadeForm';
import { AssignmentsListTable } from './AssignmentsListTable';
import { AssignmentsGradesTable } from './AssignmentsGradesTable';
import { CreateAssignmentForm } from './CreateAssignmentForm';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAssignmentsList } from '@/hooks/useAssignmentsList';
import { usePermissions } from '@/hooks/usePermissions';
import { ASSIGNMENTS_PERMISSIONS, SUBMISSIONS_PERMISSIONS } from '@/constants/modules-permissions/assignments';

export function AssignmentsPageContent() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'grades'>('tasks');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [onRefreshTable, setOnRefreshTable] = useState<(() => Promise<void>) | undefined>(undefined);
  const { can } = usePermissions();
  
  const handleRefreshReady = useCallback((refetchFn: () => Promise<void>) => {
    setOnRefreshTable(() => refetchFn);
  }, []);
  
  const canCreate = can.do(
    ASSIGNMENTS_PERMISSIONS.CREATE.module,
    ASSIGNMENTS_PERMISSIONS.CREATE.action
  );

  const canReadSubmissions = can.do(
    SUBMISSIONS_PERMISSIONS.READ.module,
    SUBMISSIONS_PERMISSIONS.READ.action
  );

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

  const { totalScore, remainingPoints, refetch } = useAssignmentsList({
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
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* SECCIÓN: CREAR Y GESTIONAR TAREAS */}
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Crear y Gestionar Tareas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Asigna nuevas tareas a tus estudiantes y gestiona las existentes
          </p>
        </div>

        {/* PASOS */}
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto mb-8">
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-full font-semibold text-sm transition ${
              !selectedData
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            1
          </div>
          <div
            className={`h-1 flex-1 transition ${
              selectedData ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          />
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-full font-semibold text-sm transition ${
              selectedData
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            2
          </div>
        </div>

        {/* TÍTULOS DE PASO */}
        <div className="text-center mb-8">
          {!selectedData ? (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Seleccionar Contexto
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                Elige dónde crear la tarea
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Crear Tarea y Gestionar
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                Crea nuevas tareas y gestiona las existentes
              </p>
            </div>
          )}
        </div>

        {/* FORMULARIO DE CASCADA - SOLO CUANDO NO HAY SELECCIÓN */}
        {!selectedData && (
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
            <AssignmentsCascadeForm
              onComplete={handleCascadeComplete}
              onError={(error) => console.error('Error en cascada:', error)}
            />
          </div>
        )}
      </div>

      {/* TABS: TAREAS Y CALIFICACIONES - SOLO SE MUESTRAN SI HAY SELECCIÓN */}
      {selectedData && (
        <div className="space-y-6">
          {/* HEADER CON INFORMACIÓN SELECCIONADA */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Seleccionado: <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedData.gradeName} • {selectedData.sectionName} • {selectedData.courseName}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedData(null)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Cambiar
              </button>
            </div>
          </div>

          {/* NAVEGACIÓN DE TABS */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'tasks'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Tareas del Curso
              </button>
              <button
                onClick={() => setActiveTab('grades')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'grades'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Calificaciones
              </button>
            </div>
          </div>

          {/* CONTENIDO DEL TAB */}
          <div className="space-y-4">
            {/* BOTÓN CREAR TAREA - SOLO EN TAB DE TAREAS Y SI TIENE PERMISOS */}
            {activeTab === 'tasks' && canCreate && (
              <div className="flex justify-end">
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Tarea
                </Button>
              </div>
            )}

            {/* TABLA DE TAREAS */}
            {activeTab === 'tasks' && (
              <AssignmentsListTable
                courseId={selectedData.courseId}
                bimesterId={selectedData.bimesterId}
                sectionId={selectedData.sectionId}
                onRefreshReady={handleRefreshReady}
              />
            )}

            {/* TABLA DE CALIFICACIONES */}
            {activeTab === 'grades' && canReadSubmissions && (
              <AssignmentsGradesTable
                courseId={selectedData.courseId}
                bimesterId={selectedData.bimesterId}
                sectionId={selectedData.sectionId}
              />
            )}

            {/* MENSAJE SIN PERMISOS */}
            {activeTab === 'grades' && !canReadSubmissions && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-lg p-6 text-center">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">No tienes permisos para ver las calificaciones</p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">Contacta con tu administrador para solicitar acceso</p>
              </div>
            )}
          </div>
        </div>
      )}

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
              onSuccess={handleCreateSuccess}
              onBack={() => setIsCreateDialogOpen(false)}
              totalExistingScore={totalScore}
              remainingPoints={remainingPoints}
              onCreateSuccess={onRefreshTable}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
