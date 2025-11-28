// src/types/password-reset.types.ts

export interface PasswordRecoveryFormData {
  email: string;
}

export interface PasswordResetFormData {
  password: string;
  confirmPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetPayload {
  token: string;
  password: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: {
      id: string;
      email: string;
      name: string;
    };
  };
}
