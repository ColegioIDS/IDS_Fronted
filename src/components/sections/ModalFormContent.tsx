// src/components/sections/ModalFormContent.tsx
"use client";

import { SideModal } from '@/components/ui/drawer/side-modal';
import { SectionForm } from './SectionForm';
import { useSectionContext } from '@/context/SectionContext';
import { toast } from 'react-toastify';
import { useAutoClearError } from '@/hooks/useAutoClearError';
import { Section, SectionFormValues } from '@/types/sections';

interface SectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSection?: Section | null;
}

const SectionFormModal = ({
  isOpen,
  onClose,
  editingSection,
}: SectionFormModalProps) => {
  const { createSection, updateSection, isSubmitting } = useSectionContext();
  const { error: serverError, setError: setServerError, clearError } = useAutoClearError(6000);

  const handleClose = () => {
    clearError();
    onClose();
  };

  const onSubmit = async (values: SectionFormValues) => {
    clearError();
    
    try {
      const result = editingSection?.id 
        ? await updateSection(editingSection.id, values)
        : await createSection(values);

      if (result && !result.success) {
        setServerError({
          message: result.message || 'Error de validación',
          details: result.details || []
        });
        return;
      }

     // toast.success(editingSection?.id ? 'Sección actualizada' : 'Sección creada');
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
          {editingSection?.id ? 'Editar Sección' : 'Crear Nueva Sección'}
        </h2>

        <SectionForm
          key={editingSection?.id || 'create'}
          onSubmit={onSubmit}
          isLoading={isSubmitting}
          serverError={serverError}
          editMode={!!editingSection?.id}
          currentSection={editingSection ? {
            name: editingSection.name,
            capacity: editingSection.capacity,
            gradeId: editingSection.gradeId,
            teacherId: editingSection.teacherId ?? null 
          } : undefined}
          onCancel={handleClose}
        />
      </div>
    </SideModal>
  );
};

export default SectionFormModal;