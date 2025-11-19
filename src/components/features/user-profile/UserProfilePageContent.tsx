'use client';

import React from 'react';
import { UserProfileForm } from './UserProfileForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { updateUserProfileSchema } from '@/schemas/user-profile.schema';
import { useUserProfile } from '@/hooks/user-profile';

interface UserProfilePageContentProps {
  userId?: number;
}

export function UserProfilePageContent({
  userId,
}: UserProfilePageContentProps) {
  const { profile, isLoading, error, updateProfile, isUpdating } = useUserProfile();

  // Manejar actualización del perfil
  const handleProfileUpdate = async (
    updateData: z.infer<typeof updateUserProfileSchema>
  ) => {
    await updateProfile(updateData);
  };

  // Estado de carga
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="border-2 dark:border-gray-800 rounded-lg p-6 space-y-6">
          <Skeleton className="h-6 w-48 mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra tu información personal y configuración de cuenta
          </p>
        </div>

        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Estado normal
  if (!profile) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          No se encontró información del perfil
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <UserProfileForm
      profile={profile}
      onSubmit={handleProfileUpdate}
      isLoading={isUpdating}
    />
  );
}
