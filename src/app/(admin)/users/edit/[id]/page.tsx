// src/app/(admin)/users/edit/[id]/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import { UserForm } from '@/components/users/UserForm';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { UserProvider, useUserContext } from '@/context/UserContext';

export default function EditUserPageWrapper() {
  return (
    <UserProvider isEditMode={true}>
      <EditUserPageInner />
    </UserProvider>
  );
}

function EditUserPageInner() {
  const { loadUserById, form, isLoadingUsers, userLoaded } = useUserContext();
  const { id } = useParams();
  const userId = Number(id);
  const router = useRouter();

  useEffect(() => {
    if (isNaN(userId)) {
      router.push('/not-found'); // O usa notFound()
      return;
    }

    loadUserById(userId);
  }, [userId]);


if (!userLoaded ) {
  return <div>Cargando datos del usuario...</div>;
}
  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb
        pageTitle="Editar Usuario"
        icon={<i className="fas fa-user-edit" />}
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Usuarios", href: "/users" },
        ]}
      />
      <UserForm isEditMode userId={userId} />
    </div>
  );
}
