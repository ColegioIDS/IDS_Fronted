'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorStateProps {
  error: string;
  retry?: () => void;
}

export default function ErrorState({ error, retry }: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex justify-between items-center">
          <span>{error}</span>
          {retry && (
            <button
              onClick={retry}
              className="ml-4 px-3 py-1 text-sm bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 rounded"
            >
              Reintentar
            </button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
