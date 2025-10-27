// src/utils/handleApiError.ts
import { toast } from 'sonner';

export function handleApiError(error: any, defaultMessage = 'Error inesperado') {
  let message = defaultMessage;
  let details: string[] = [];

  if (error.response?.data) {
    const data = error.response.data;
    message = data.message || message;
    details = Array.isArray(data.details) ? data.details : [];
  } else if (error.message) {
    message = error.message;
  }

  toast.error(message);
  return { message, details };
}
