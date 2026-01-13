'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { NoPermissionsAssigned } from '@/components/shared/permissions/NoPermissionsAssigned';
import DashboardDocente from './roles/DashboardDocente';
import DashboardCoordinador from './roles/DashboardCoordinador';
import DashboardAdministrador from './roles/DashboardAdministrador';

const ROLE_COMPONENTS: Record<string, React.ComponentType<any>> = {
  TEACHER: DashboardDocente,
  COORDINATOR: DashboardCoordinador,
  ADMIN: DashboardAdministrador,
};

export default function DashboardRouter() {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return <NoPermissionsAssigned />;
  }

  // Usar roleType en lugar de name
  const roleType = (role as any).roleType || role.name;
  const RoleComponent = ROLE_COMPONENTS[roleType];

  if (!RoleComponent) {
    return <NoPermissionsAssigned />;
  }

  return <RoleComponent />;
}
