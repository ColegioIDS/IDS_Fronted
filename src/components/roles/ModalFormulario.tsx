// src/components/roles/ModalFormulario.tsx
import { useState } from 'react';
import { SideModal } from '@/components/ui/drawer/side-modal';
import { RoleForm } from './RoleForm';
import { RoleFormValues } from '@/schemas/role';
import { useRoleContext } from "@/context/RoleContext";
import { toast } from 'react-toastify';

interface FormularioRolModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: RoleFormValues | null;
  roleId?: string | null; 
}

const FormularioRolModal = ({ isOpen, onClose, defaultValues, roleId }: FormularioRolModalProps) => {
const { createRole, updateRole, isSaving } = useRoleContext();

  const [formError, setFormError] = useState<{
    message: string;
    details?: string[];
  } | null>(null);

  // Función para manejar el submit del formulario


 const handleSubmit = async (values: RoleFormValues) => {
  try {
    if (roleId) {
      await updateRole(roleId, values);
      toast.success("Rol actualizado correctamente");
    } else {
      await createRole(values);
      toast.success("Rol creado exitosamente");
    }

    setFormError(null);
    onClose();
  } catch (error: any) {
    const message = error?.message || "Ocurrió un error";
    const details = error?.details || error?.response?.data?.details || [];
    setFormError({ message, details });
  }
};



  return (


    <SideModal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 h-full">

    {roleId ? (
        <h2 className="text-xl font-bold mb-6">Editar Rol</h2>
    ):(
        <h2 className="text-xl font-bold mb-6">Crear Rol</h2>
    )}
     
     
       


        <RoleForm
          onSubmit={handleSubmit}
          isLoading={isSaving}
          defaultValues={defaultValues || { name: '', description: '', isActive: true }}
          serverError={formError}
        />
      </div>
    </SideModal>
  );
};

export default FormularioRolModal;


