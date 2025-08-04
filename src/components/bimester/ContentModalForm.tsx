import { useState } from 'react';
import { SideModal } from '@/components/ui/drawer/side-modal';
import { BimesterForm } from './bimesterForm';
import { BimesterFormData } from '@/schemas/bimester.schema';
import { useBimesterContext } from '@/context/BimesterContext';
import { toast } from 'react-toastify';
import { useAutoClearError } from '@/hooks/useAutoClearError';

interface BimesterModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: Partial<BimesterFormData> | null;
  bimesterId?: string | number | null;
  cycleId: number; // Requerido para crear/editar bimestres
}

const BimesterModalForm = ({
  isOpen,
  onClose,
  defaultValues,
  bimesterId,
  cycleId,
}: BimesterModalFormProps) => {
  const { createBimester, updateBimester, isSubmitting } = useBimesterContext();
  console.log(cycleId, "ciclo en form")
  
  // Usamos el hook personalizado para manejo de errores
  const { error: serverError, setError: setServerError, clearError } = useAutoClearError(6000);

  const handleClose = () => {
    clearError(); // Limpiamos el error al cerrar
    onClose();
  };

  const onSubmit = async (values: BimesterFormData) => {
    clearError(); // Limpiamos errores previos
    
    try {
      let result;
      if (bimesterId) {
        result = await updateBimester(Number(bimesterId), values);
      } else {
        // Aseguramos que el cycleId esté incluido en los valores
        const payload = { ...values, cycleId };
        console.log("payload", payload)
        result = await createBimester(payload);
      }

      // Verifica si la respuesta contiene un error
      if (result && !result.success) {
        setServerError({
          message: result.message || 'Error de validación',
          details: result.details || []
        });
        return;
      }

      //toast.success(bimesterId ? 'Bimestre actualizado' : 'Bimestre creado');
      handleClose();
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
          {bimesterId ? 'Editar Bimestre' : 'Crear Bimestre'}
        </h2>

        <BimesterForm
          onSubmit={onSubmit}
          isLoading={isSubmitting}
          defaultValues={
            defaultValues || {
              name: '',
              number: 1,
              startDate: new Date(),
              endDate: new Date(),
              isActive: false,
              weeksCount: 8,
            }
          }
          serverError={serverError}
        />
      </div>
    </SideModal>
  );
};

export default BimesterModalForm;