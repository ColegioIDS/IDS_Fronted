/**
 * Componente AssignmentsListTable
 * Tabla con todas las tareas y opciones para verlas y calificar
 */

'use client';

import { FC, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Eye,
  CheckCircle,
  PencilIcon,
  Trash2,
  Loader2,
  AlertCircle,
  FileText,
  MoreVertical,
  Edit,
  X,
  CalendarIcon,
  Save,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAssignmentsList } from '@/hooks/useAssignmentsList';
import { usePermissions } from '@/hooks/usePermissions';
import { SUBMISSIONS_PERMISSIONS, ASSIGNMENTS_PERMISSIONS } from '@/constants/modules-permissions/assignments';
import { AssignmentDetailsDialog } from './AssignmentDetailsDialog';
import { SubmissionsDialog } from './SubmissionsDialog';
import { assignmentsService } from '@/services/assignments.service';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

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
  onRefreshReady?: (refetch: () => Promise<void>) => void;
}

export const AssignmentsListTable: FC<AssignmentsListTableProps> = ({
  courseId,
  bimesterId,
  sectionId,
  onRefreshReady,
}) => {
  const { assignments, loading, error, refetch } = useAssignmentsList({
    courseId,
    bimesterId,
    limit: 100,
    enabled: !!courseId && !!bimesterId,
  });
  
  // Notificar al padre cuando el refetch está listo
  useEffect(() => {
    if (onRefreshReady && refetch) {
      onRefreshReady(refetch);
    }
  }, [refetch, onRefreshReady]);
  
  const { can } = usePermissions();
  const canReadSubmissions = can.do(SUBMISSIONS_PERMISSIONS.READ.module, SUBMISSIONS_PERMISSIONS.READ.action);
  const canDeleteAssignment = can.do(ASSIGNMENTS_PERMISSIONS.DELETE.module, ASSIGNMENTS_PERMISSIONS.DELETE.action);
  const canUpdateAssignment = can.do(ASSIGNMENTS_PERMISSIONS.UPDATE.module, ASSIGNMENTS_PERMISSIONS.UPDATE.action);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmissionsDialogOpen, setIsSubmissionsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    maxScore: 0,
  });
  const [isEditLoading, setIsEditLoading] = useState(false);

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
                {/* BOTONES VISIBLES EN DESKTOP - OCULTOS EN MOBILE */}
                <div className="hidden sm:flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

                  {canUpdateAssignment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-md transition-colors"
                      title="Editar tarea"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setEditFormData({
                          title: assignment.title,
                          description: assignment.description || '',
                          dueDate: new Date(assignment.dueDate),
                          maxScore: assignment.maxScore,
                        });
                        setIsEditMode(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {canReadSubmissions && (
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
                  )}
                  
                  {canDeleteAssignment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md transition-colors"
                      title="Eliminar"
                      onClick={() => {
                        setAssignmentToDelete(assignment);
                        setIsDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* MENÚ DESPLEGABLE EN MOBILE */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2 dark:bg-gray-950 dark:border-gray-800">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalles
                      </Button>

                      {canUpdateAssignment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setEditFormData({
                              title: assignment.title,
                              description: assignment.description || '',
                              dueDate: new Date(assignment.dueDate),
                              maxScore: assignment.maxScore,
                            });
                            setIsEditMode(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      )}
                      
                      {canReadSubmissions && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setIsSubmissionsDialogOpen(true);
                          }}
                        >
                          <PencilIcon className="w-4 h-4 mr-2" />
                          Calificar
                        </Button>
                      )}
                      
                      {canDeleteAssignment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                          onClick={() => {
                            setAssignmentToDelete(assignment);
                            setIsDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
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
        canUpdate={canUpdateAssignment}
        onEdit={(assignment) => {
          setSelectedAssignment(assignment);
          setIsEditMode(true);
        }}
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

      {/* DIALOG DE EDICIÓN */}
      {selectedAssignment && (
        <Dialog open={isEditMode} onOpenChange={(open) => {
          setIsEditMode(open);
          if (!open) {
            setSelectedAssignment(null);
          }
        }}>
          <DialogContent className="max-w-2xl dark:bg-gray-950 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Editar Tarea
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    Actualiza los detalles de <span className="font-medium text-gray-900 dark:text-gray-100">{selectedAssignment.title}</span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* TÍTULO */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Título<span className="text-red-500">*</span>
                </label>
                <Input
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  placeholder="Ej: Evaluación de Capítulo 3"
                  disabled={isEditLoading}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              {/* DESCRIPCIÓN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  placeholder="Detalles de la tarea (opcional)"
                  rows={3}
                  disabled={isEditLoading}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              {/* FECHA Y PUNTAJE EN GRID */}
              <div className="grid grid-cols-2 gap-3">
                {/* FECHA DE ENTREGA */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Fecha Entrega<span className="text-red-500">*</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        disabled={isEditLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(editFormData.dueDate, 'dd/MM/yyyy', { locale: es })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={editFormData.dueDate}
                        onSelect={(date) => date && setEditFormData({...editFormData, dueDate: date})}
                        disabled={(date) => {
                          // Bloquear fechas anteriores a hoy
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today || isEditLoading;
                        }}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* PUNTAJE MÁXIMO */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Puntaje Máx<span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={editFormData.maxScore || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditFormData({...editFormData, maxScore: val === '' ? 0 : Math.min(parseInt(val), 20)});
                    }}
                    disabled={isEditLoading}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* INFORMACIÓN DE LA TAREA ACTUAL */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/40">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">
                      Estado Actual
                    </p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100 mt-1">
                      {new Date(editFormData.dueDate) < new Date() ? 'Vencida' : 'Activa'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">
                      Última Actualización
                    </p>
                    <p className="text-sm text-blue-900 dark:text-blue-100 mt-1">
                      {selectedAssignment.createdAt && !isNaN(new Date(selectedAssignment.createdAt).getTime())
                        ? format(new Date(selectedAssignment.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })
                        : 'Fecha no disponible'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER CON BOTONES */}
            <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setIsEditMode(false)}
                disabled={isEditLoading}
                className="dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (!editFormData.title.trim()) {
                      toast.error('El título es requerido');
                      return;
                    }

                    setIsEditLoading(true);
                    
                    const payload = {
                      title: editFormData.title,
                      description: editFormData.description,
                      dueDate: editFormData.dueDate,
                      maxScore: editFormData.maxScore,
                    };

                    await assignmentsService.updateAssignment(selectedAssignment.id, payload);
                    
                    toast.success('Tarea actualizada exitosamente');
                    setIsEditMode(false);
                    
                    // Refrescar la lista de tareas
                    await refetch();
                  } catch (err) {
                    const errorMsg = err instanceof Error ? err.message : 'Error al actualizar';
                    toast.error(errorMsg);
                  } finally {
                    setIsEditLoading(false);
                  }
                }}
                disabled={isEditLoading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-700 dark:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600"
              >
                {isEditLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* CONFIRM DIALOG PARA ELIMINAR TAREA */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Eliminar Tarea"
        description={
          assignmentToDelete ? `¿Estás seguro de que deseas eliminar la tarea "${assignmentToDelete.title}"? Esta acción no se puede deshacer.` : undefined
        }
        actionLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={async () => {
          if (!assignmentToDelete) return;
          
          setIsDeleting(true);
          try {
            await assignmentsService.deleteAssignment(assignmentToDelete.id);
            toast.success('Tarea eliminada exitosamente');
            setIsDeleteConfirmOpen(false);
            setAssignmentToDelete(null);
            // Refrescar la lista
            await refetch();
          } catch (error: any) {
            console.error('Error al eliminar:', error);
            toast.error('Error al eliminar la tarea', {
              description: error.message || 'Intenta de nuevo'
            });
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </div>
  );
};
