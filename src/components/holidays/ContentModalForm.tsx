// src\components\holidays\ContentModalForm.tsx
import { useState } from 'react';
import { SideModal } from '@/components/ui/drawer/side-modal';
import { HolidayForm } from './HolidayForm';
import { HolidayFormData } from '@/schemas/holiday.schema';
import { useHolidayContext } from '@/context/HolidayContext';
import { toast } from 'react-toastify';
import { useAutoClearError } from '@/hooks/useAutoClearError';

interface HolidayModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: Partial<HolidayFormData> | null;
  holidayId?: string | number | null;
  bimesters: {
    id: number;
    name: string;
  }[]; // Required for holiday creation/editing
}

export const HolidayModalForm = ({
  isOpen,
  onClose,
  defaultValues,
  holidayId,
  bimesters,
}: HolidayModalFormProps) => {
  const { createHoliday, updateHoliday, isSubmitting } = useHolidayContext();
  
  // Custom hook for error handling
  const { error: serverError, setError: setServerError, clearError } = useAutoClearError(6000);

  const handleClose = () => {
    clearError(); // Clear error on close
    onClose();
  };

  const onSubmit = async (values: HolidayFormData) => {
    clearError(); // Clear previous errors
    
    try {
      let result;
      if (holidayId) {
        result = await updateHoliday(Number(holidayId), values);
      } else {
        result = await createHoliday(values);
      }

      // Check if response contains an error
      if (result && !result.success) {
        setServerError({
          message: result.message || 'Error de validación',
          details: result.details || []
        });
        return;
      }

      toast.success(holidayId ? 'Feriado actualizado' : 'Feriado creado');
      handleClose();
    } catch (error: any) {
      console.error('Error completo:', error);
      
      // Improved error handling
      const errorData = error?.response?.data || error;
      const backendError = {
        message: errorData.message || 'Error al procesar la solicitud',
        details: errorData.details || []
      };

      setServerError(backendError);
      
      // Show toast only if there are no specific details
      if (backendError.details.length === 0) {
        toast.error(backendError.message);
      }
    }
  };

  console.log("default values", defaultValues)

  return (
    <SideModal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 h-full">
        <h2 className="text-xl font-bold mb-6">
          {holidayId ? 'Editar Feriado' : 'Crear Feriado'}
        </h2>

        <HolidayForm
          onSubmit={onSubmit}
          isLoading={isSubmitting}
          defaultValues={
            defaultValues || {
              bimesterId: 0,
              date: new Date(),
              description: '',
              isRecovered: false
            }
          }
          serverError={serverError}
          bimesters={bimesters}
        />
      </div>
    </SideModal>
  );
};

