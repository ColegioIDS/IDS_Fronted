/**
 * Componente AssignmentDetailsDialog
 * Dialog modal para ver los detalles de una tarea
 */

'use client';

import { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  BookOpen,
  Award,
  FileText,
  X,
  Download,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Assignment {
  id: number;
  title: string;
  description?: string | null;
  courseId: number;
  courseName?: string;
  bimesterId?: number;
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

interface AssignmentDetailsDialogProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignmentDetailsDialog: FC<AssignmentDetailsDialogProps> = ({
  assignment,
  isOpen,
  onOpenChange,
}) => {
  if (!assignment) return null;

  // Validar y convertir fechas
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : new Date();
  const createdDate = assignment.createdAt ? new Date(assignment.createdAt) : new Date();
  
  // Validar que las fechas sean válidas
  const isValidDueDate = !isNaN(dueDate.getTime());
  const isValidCreatedDate = !isNaN(createdDate.getTime());
  const isOverdue = isValidDueDate && dueDate < new Date();
  
  // Extraer información del curso y bimestre
  const courseName = assignment.course?.name || assignment.courseName || 'No especificado';
  const bimesterName = assignment.bimester?.name || assignment.bimesterName || 'No especificado';
  const bimesterNumber = assignment.bimester?.number;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl dark:bg-gray-900 dark:border-gray-800">
        {/* HEADER */}
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {assignment.title}
              </DialogTitle>
              <DialogDescription className="mt-2">
                Detalles completos de la tarea
              </DialogDescription>
            </div>
            <div className="flex-shrink-0">
              {isOverdue && (
                <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800">
                  Vencida
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* CONTENIDO */}
        <div className="space-y-6 py-4">
          {/* DESCRIPCIÓN */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/40">
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Descripción de la Tarea
                </h3>
                {assignment.description ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {assignment.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Sin descripción
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* GRID DE INFORMACIÓN */}
          <div className="grid grid-cols-2 gap-4">
            {/* FECHA DE ENTREGA */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg p-4 border border-purple-200 dark:border-purple-800/40">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <p className="text-xs font-semibold text-purple-900 dark:text-purple-300 uppercase">
                  Fecha de Entrega
                </p>
              </div>
              {isValidDueDate ? (
                <>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {format(dueDate, 'dd/MM/yyyy', { locale: es })}
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                    {format(dueDate, 'EEEE', { locale: es })}
                  </p>
                </>
              ) : (
                <p className="text-sm text-purple-700 dark:text-purple-400">Fecha inválida</p>
              )}
            </div>

            {/* PUNTUACIÓN MÁXIMA */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 rounded-lg p-4 border border-amber-200 dark:border-amber-800/40">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase">
                  Puntuación Máxima
                </p>
              </div>
              <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
                {assignment.maxScore} pts
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Sobre 20 puntos del bimestre
              </p>
            </div>

            {/* FECHA DE CREACIÓN */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800/40">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase">
                  Fecha de Creación
                </p>
              </div>
              {isValidCreatedDate ? (
                <>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {format(createdDate, 'dd/MM/yyyy', { locale: es })}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    {format(createdDate, 'HH:mm', { locale: es })}
                  </p>
                </>
              ) : (
                <p className="text-sm text-blue-700 dark:text-blue-400">Fecha inválida</p>
              )}
            </div>

            {/* ESTADO */}
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-800/40">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-xs font-semibold text-green-900 dark:text-green-300 uppercase">
                  Estado
                </p>
              </div>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">
                {isOverdue ? 'Vencida' : 'Activa'}
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                {isOverdue
                  ? 'No se aceptan entregas'
                  : 'Aceptando entregas'}
              </p>
            </div>
          </div>

          {/* INFORMACIÓN ADICIONAL */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Detalles Adicionales
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Nombre del Curso:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {courseName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Bimestre:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {bimesterName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER CON BOTONES */}
        <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
          <Button
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Entregas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
