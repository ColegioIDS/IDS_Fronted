/**
 * Componente AssignmentsListTable
 * Tabla con todas las tareas y opciones para verlas y calificar
 */

'use client';

import { FC, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  CheckCircle,
  PencilIcon,
  Trash2,
  Loader2,
  AlertCircle,
  FileText,
  MoreVertical,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAssignmentsList } from '@/hooks/useAssignmentsList';
import { AssignmentDetailsDialog } from './AssignmentDetailsDialog';
import { SubmissionsDialog } from './SubmissionsDialog';

interface Assignment {
  id: number;
  title: string;
  description?: string | null;
  courseId: number;
  bimesterId?: number;
  courseName?: string;
  bimesterName?: string;
  dueDate: string | Date;
  maxScore: number;
  createdAt: string | Date;
  course?: {
    name: string;
    code: string;
  };
  bimester?: {
    name: string;
    number: number;
  };
}

interface AssignmentsListTableProps {
  courseId?: number;
  bimesterId?: number;
  sectionId?: number;
}

export const AssignmentsListTable: FC<AssignmentsListTableProps> = ({
  courseId,
  bimesterId,
  sectionId,
}) => {
  const { assignments, loading, error } = useAssignmentsList({
    courseId,
    bimesterId,
    limit: 100,
    enabled: !!courseId && !!bimesterId,
  });
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmissionsDialogOpen, setIsSubmissionsDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center">
        <FileText className="mx-auto w-10 h-10 text-gray-400 dark:text-gray-600 mb-3" />
        <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">No hay tareas disponibles</p>
        <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Crea una nueva tarea para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* TARJETAS EN LUGAR DE TABLA */}
      <div className="grid gap-3">
        {assignments.map((assignment, index) => (
          <div
            key={assignment.id}
            className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-4">
              {/* CONTENIDO PRINCIPAL */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  {/* NÚMERO DE TAREA */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center mt-0.5">
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  
                  {/* TÍTULO Y DESCRIPCIÓN */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {assignment.title}
                    </h3>
                    {assignment.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                        {assignment.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* META INFORMACIÓN */}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {/* FECHA */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400"></div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {format(new Date(assignment.dueDate), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>

                  {/* PUNTUACIÓN */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50">
                      {assignment.maxScore} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors"
                    title="Ver detalles"
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-md transition-colors"
                    title="Calificar entregas"
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setIsSubmissionsDialogOpen(true);
                    }}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md transition-colors"
                    title="Eliminar"
                    onClick={() => {
                      toast.error('Función de eliminación próximamente', {
                        description: 'Esta funcionalidad estará disponible en breve'
                      });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* INDICADOR VISUAL EN ESTADO NORMAL */}
                <div className="text-gray-300 dark:text-gray-700 group-hover:hidden">
                  <MoreVertical className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DIALOG DE DETALLES */}
      <AssignmentDetailsDialog
        assignment={selectedAssignment}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      {/* DIALOG DE ENTREGAS */}
      {selectedAssignment && (
        <SubmissionsDialog
          open={isSubmissionsDialogOpen}
          onOpenChange={setIsSubmissionsDialogOpen}
          assignmentId={selectedAssignment.id}
          assignmentTitle={selectedAssignment.title}
          dueDate={new Date(selectedAssignment.dueDate)}
          maxScore={selectedAssignment.maxScore}
          courseId={courseId || selectedAssignment.courseId}
          sectionId={sectionId || 0}
        />
      )}
    </div>
  );
};
