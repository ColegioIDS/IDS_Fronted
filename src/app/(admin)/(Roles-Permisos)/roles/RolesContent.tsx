// src/app/roles/page.tsx
"use client";
import dynamic from 'next/dynamic';
import { RoleProvider, useRoleContext } from '@/context/RoleContext';

const RolesTable = dynamic(() => import('@/components/roles'), {
  loading: () => <p>Cargando tabla...</p>,
});

export default function RolesPage() {
  return (
    <RoleProvider>
      <RolesContent />
    </RoleProvider>
  );
}

function RolesContent() {
  const { roles, isLoading, error } = useRoleContext();

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // roles ya es RoleTableRow[] gracias al contexto
  return <RolesTable initialData={roles} />;
}