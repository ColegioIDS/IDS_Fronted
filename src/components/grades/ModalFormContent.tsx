"use client";

import { SideModal } from '@/components/ui/drawer/side-modal';
import { GradeForm } from './FormGrades';
import { useGradeContext } from '@/context/GradeContext';
import { toast } from 'react-toastify';
import { useAutoClearError } from '@/hooks/useAutoClearError';
import { Grade, GradeFormValues } from '@/types/grades';

interface GradeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGrade?: Grade | null; // Propiedad correctamente definida
}

const GradeFormModal = ({
  isOpen,
  onClose,
  editingGrade,
}: GradeFormModalProps) => {
  const { createGrade, updateGrade, isSubmitting } = useGradeContext();
  const { error: serverError, setError: setServerError, clearError } = useAutoClearError(6000);

  const handleClose = () => {
    clearError();
    onClose();
  };

  const onSubmit = async (values: GradeFormValues) => {
    clearError();
    
    try {
      const result = editingGrade?.id 
        ? await updateGrade(editingGrade.id, values)
        : await createGrade(values);

      if (result && !result.success) {
        setServerError({
          message: result.message || 'Error de validación',
          details: result.details || []
        });
        return;
      }

      toast.success(editingGrade?.id ? 'Grado actualizado' : 'Grado creado');
      handleClose();
    } catch (error: any) {
      const errorData = error?.response?.data || error;
      setServerError({
        message: errorData.message || 'Error al procesar la solicitud',
        details: errorData.details || []
      });

      if (!errorData.details?.length) {
        toast.error(errorData.message);
      }
    }
  };

  return (
    <SideModal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 h-full">
        <h2 className="text-xl font-bold mb-6">
          {editingGrade?.id ? 'Editar Grado' : 'Crear Nuevo Grado'}
        </h2>

        <GradeForm
          onSubmit={onSubmit}
          isLoading={isSubmitting}
          defaultValues={editingGrade ? {
            name: editingGrade.name,
            level: editingGrade.level,
            order: editingGrade.order,
            isActive: editingGrade.isActive,
          } : undefined}
          serverError={serverError}
        />
      </div>
    </SideModal>
  );
};

export default GradeFormModal;