// components/ErrorManager.tsx
import { useEffect, ReactNode } from 'react';

interface ErrorManagerProps {
  error: { message: string; details: string[] } | null;
  onClear: () => void;
  timeout?: number;
  children: ReactNode;
}

export const ErrorManager = ({
  error,
  onClear,
  timeout = 5000,
  children
}: ErrorManagerProps) => {
  useEffect(() => {
    if (error && timeout) {
      const timer = setTimeout(onClear, timeout);
      return () => clearTimeout(timer);
    }
  }, [error, timeout, onClear]);

  return <>{children}</>;
};