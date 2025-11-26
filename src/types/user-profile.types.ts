/**
 * Tipos para el módulo de perfil de usuario
 */

export interface UserProfilePicture {
  id: number;
  url: string;
  kind: 'profile_picture' | 'cover_picture' | 'other';
  description?: string;
  createdAt?: string;
}

export interface UserProfileRole {
  id: number;
  name: string;
  description?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  givenNames: string;
  lastNames: string;
  phone?: string;
  dpi: string;
  birthDate?: string;
  gender?: string;
  role?: UserProfileRole;
  pictures?: UserProfilePicture[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfilePayload {
  givenNames?: string;
  lastNames?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
}

export interface UserProfileResponse {
  data: UserProfile;
  message?: string;
}

export interface UserProfileError {
  error: {
    message: string;
    statusCode: number;
    details?: Record<string, any>;
  };
}
