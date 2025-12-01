import { useState, useEffect, useCallback } from 'react';
import { userProfileService } from '@/services/user-profile.service';
import { UpdateUserProfileDto } from '@/schemas/user-profile.schema';
import { UserProfile } from '@/components/features/user-profile';
import { useAuth } from '@/context/AuthContext';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

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
  const { isAuthenticated } = useAuth(); // ✅ Esperar autenticación

  // Cargar perfil
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userProfileService.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el perfil');
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

        let processedData = { ...updateData };

        // 📸 Si hay profilePicture (File), subirlo a Cloudinary
        if (updateData.profilePicture instanceof File) {
          try {
            const cloudinaryResponse = await uploadImageToCloudinary(
              updateData.profilePicture,
              'user-profiles'
            );

            // ✅ Reemplazar el File con el objeto de Cloudinary
            processedData.profilePicture = {
              url: cloudinaryResponse.url,
              publicId: cloudinaryResponse.publicId,
              description: 'Foto de perfil',
            } as any;
          } catch (err: any) {
            throw new Error(`Error al subir imagen: ${err.message}`);
          }
        }

        const updatedProfile = await userProfileService.updateProfile(processedData);
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

  // ✅ SOLO cargar perfil si el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchProfile]);

  return {
    profile,
    isLoading,
    isUpdating,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}
