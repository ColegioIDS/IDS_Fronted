// src/app/(admin)/(Roles-Permisos)/roles/RolesPage.tsx
"use client";
import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { toast } from 'react-toastify';
import Breadcrumb from '@/components/common/Breadcrumb';
import { SiAwsorganizations } from "react-icons/si";
import { RoleProvider, useRoleContext } from '@/context/RoleContext';
import { useState } from 'react';
import { FaPlus } from "react-icons/fa";

import { Button } from '@/components/ui/button';

// Importamos el componente de FormularioRolModal
import FormularioRolModal from '@/components/roles/ModalFormulario';

// Importamos los componentes dinámicamente
const RolesTable = dynamic(() => import('@/components/roles'), {
  loading: () => <ProfileSkeleton type="meta" />,
  ssr: false
});

export default function RolesPage() {
  return (
    <RoleProvider>
      <RolesPageContent />
    </RoleProvider>
  );
}

function RolesPageContent() {
  const { isLoading, error, roles } = useRoleContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) return <ProfileSkeleton type="full" />;
  if (error) {
    toast.error(error.message);
    return <div>Error al cargar los roles</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb
        pageTitle="Roles"
        icon={<SiAwsorganizations />}
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Roles", href: "/roles" },
        ]}
      />

      <div className="flex justify-end items-end mb-6">
  <Button onClick={() => setIsModalOpen(true)}>
    <FaPlus />
    Crear Nuevo Rol
  </Button>
</div>


      <div className="space-y-6">
        {/* Pasamos los datos iniciales al componente RolesTable */}
        <RolesTable  />
      </div>

      {/* Usamos el nuevo componente FormularioRolModal */}
      <FormularioRolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
