import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    await axios.post(`${API_BASE_URL}/api/cloudinary/delete`, { publicId });
  } catch (error: any) {
    const message =
      error.response?.data?.message || 'Error al eliminar la imagen';
    throw new Error(message);
  }
}