import { useState, useEffect, useCallback } from 'react';
import { userProfileService } from '@/services/user-profile.service';
import { UpdateUserProfileDto } from '@/schemas/user-profile.schema';
import { UserProfile } from '@/components/features/user-profile';

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: UpdateUserProfileDto) => Promise<void>;
}

export function useUserProfile(): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar perfil
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userProfileService.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el perfil');
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar perfil
  const updateProfile = useCallback(
    async (updateData: UpdateUserProfileDto) => {
      try {
        setIsUpdating(true);
        setError(null);
        const updatedProfile = await userProfileService.updateProfile(updateData);
        setProfile(updatedProfile);
      } catch (err: any) {
        const errorMessage = err.message || 'Error al actualizar el perfil';
        setError(errorMessage);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  // Cargar perfil al montar
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    isUpdating,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}
