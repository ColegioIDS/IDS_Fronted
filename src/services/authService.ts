// src/services/authService.ts
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import {LoginCredentials} from '@/types/signin';

export const singnin = async (credentials: LoginCredentials) => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/signin`, credentials, {
        withCredentials: true,
    });
    console.log('Response from signin:', response.data);
    return response.data;

}

export const signout = async () => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/signout`, {}, {
        withCredentials: true,
    });
    console.log('Response from signout:', response.data);
    return response.data;
}

export const verifySession = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
            withCredentials: true,
        });
        console.log('Response from verifySession:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error verifying session:', error);
        throw error;
    }
}
