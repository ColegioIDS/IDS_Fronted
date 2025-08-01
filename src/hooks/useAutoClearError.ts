// hooks/useAutoClearError.ts
import { useState, useEffect } from 'react';

export function useAutoClearError(timeout = 5000) {
  const [error, setError] = useState<{
    message: string;
    details: string[];
  } | null>(null);

  // Limpieza automática después del timeout
  useEffect(() => {
    if (error && timeout) {
      const timer = setTimeout(() => setError(null), timeout);
      return () => clearTimeout(timer);
    }
  }, [error, timeout]);

  return { error, setError, clearError: () => setError(null) };
}