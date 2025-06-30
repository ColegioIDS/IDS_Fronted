// src/services/authService.ts
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const signin = async (credentials: LoginCredentials) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/signin`, credentials, {
    withCredentials: true,
  });
  return response.data.user;
};

export const logout = async () => {
  await axios.post(`${API_BASE_URL}/api/auth/signout`, {}, {
    withCredentials: true,
  });
};

export const verifySession = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
      withCredentials: true,
    });
    console.log('verifySession response in services:', response.data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};