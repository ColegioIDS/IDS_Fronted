import { useState } from 'react';
import { SideModal } from '@/components/ui/drawer/side-modal';
import { CycleForm } from './CycleForm';
import { SchoolCycleFormValues } from '@/schemas/SchoolCycle';
import { useCyclesContext } from '@/context/CyclesContext';
import { toast } from 'react-toastify';
import { useAutoClearError } from '@/hooks/useAutoClearError';

interface FormularioCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: SchoolCycleFormValues | null;
  cycleId?: string | number | null;
}

const ModalFormularioCycle = ({
  isOpen,
  onClose,
  defaultValues,
  cycleId,
}: FormularioCycleModalProps) => {
  const { createCycle, updateCycle, isSubmitting } = useCyclesContext();
  
  // Usamos el hook personalizado para manejo de errores
  const { error: serverError, setError: setServerError, clearError } = useAutoClearError(6000);

  const handleClose = () => {
    clearError(); // Limpiamos el error al cerrar
    onClose();
  };

  const onSubmit = async (values: SchoolCycleFormValues) => {
    clearError(); // Limpiamos errores previos
    
    try {
      let result;
      if (cycleId) {
        result = await updateCycle(Number(cycleId), values);
      } else {
        result = await createCycle(values);
      }

      // Verifica si la respuesta contiene un error
      if (result && !result.success) {
        setServerError({
          message: result.message || 'Error de validación',
          details: result.details || []
        });
        return;
      }

      toast.success(cycleId ? 'Ciclo actualizado' : 'Ciclo creado');
      handleClose(); // Usamos handleClose en lugar de onClose directo
    } catch (error: any) {
      console.error('Error completo:', error);
      
      // Manejo mejorado de errores
      const errorData = error?.response?.data || error;
      const backendError = {
        message: errorData.message || 'Error al procesar la solicitud',
        details: errorData.details || []
      };

      setServerError(backendError);
      
      // Mostrar toast solo si no hay detalles específicos
      if (backendError.details.length === 0) {
        toast.error(backendError.message);
      }
    }
  };

  return (
    <SideModal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 h-full">
        <h2 className="text-xl font-bold mb-6">
          {cycleId ? 'Editar Ciclo Escolar' : 'Crear Ciclo Escolar'}
        </h2>

        <CycleForm
          onSubmit={onSubmit}
          isLoading={isSubmitting}
          defaultValues={
            defaultValues || {
              name: '',
              startDate: new Date(),
              endDate: new Date(),
              isActive: false,
              isClosed: false,
            }
          }
          serverError={serverError}
        />
      </div>
    </SideModal>
  );
};

export default ModalFormularioCycle;