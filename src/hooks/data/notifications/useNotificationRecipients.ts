// src/hooks/data/notifications/useNotificationRecipients.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationsService } from '@/services/notifications.service';

export interface Role {
  id: number;
  name: string;
  roleType: string;
  description?: string;
}

export interface User {
  id: number;
  givenNames: string;
  lastNames: string;
  email: string;
  role?: {
    roleType: string;
    name: string;
  };
}

export interface UsersByRoleGroup {
  roleType: string;
  roleName: string;
  users: User[];
}

export interface RolesResponse {
  total: number;
  roles: Role[];
}

export interface UsersByRoleResponse {
  totalUsers: number;
  groupedByRole: Record<string, UsersByRoleGroup>;
}

interface UseNotificationRecipientsReturn {
  roles: Role[];
  usersByRole: Record<string, UsersByRoleGroup>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useNotificationRecipients(): UseNotificationRecipientsReturn {
  const [roles, setRoles] = useState<Role[]>([]);
  const [usersByRole, setUsersByRole] = useState<Record<string, UsersByRoleGroup>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [rolesData, usersData] = await Promise.all([
        notificationsService.getRoles(),
        notificationsService.getUsersByRole(),
      ]);

      if (process.env.NODE_ENV === 'development') {
        console.log('📋 Roles data:', rolesData);
        console.log('👥 Users data:', usersData);
      }

      setRoles(rolesData.roles || []);
      
      // Convertir array byRole a objeto indexado por roleType
      const grouped: Record<string, UsersByRoleGroup> = {};
      
      // Intentar múltiples formas de acceder a los datos
      const byRoleArray = usersData.byRole || usersData.groupedByRole;
      
      if (byRoleArray && Array.isArray(byRoleArray)) {
        byRoleArray.forEach((group: any) => {
          grouped[group.roleType] = {
            roleType: group.roleType,
            roleName: group.roleName,
            users: group.users || [],
          };
        });
      } else if (byRoleArray && typeof byRoleArray === 'object') {
        // Si ya es un objeto
        Object.entries(byRoleArray).forEach(([key, value]: [string, any]) => {
          if (value.users || value.roleType) {
            grouped[value.roleType || key] = value;
          }
        });
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Grouped users:', grouped);
        console.log('📊 Total grupos:', Object.keys(grouped).length);
      }
      
      setUsersByRole(grouped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(message);
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error loading notification recipients:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    roles,
    usersByRole,
    isLoading,
    error,
    refresh: loadData,
  };
}
