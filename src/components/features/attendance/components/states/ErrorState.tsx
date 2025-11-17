'use client';

import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: string;
  retry?: () => void;
}

export default function ErrorState({ error, retry }: ErrorStateProps) {
  return (
    <Card className="border-2 border-red-200 dark:border-red-800 shadow-md">
      <CardContent className="py-12">
        <Alert variant="destructive" className="border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertDescription className="ml-2">
            <div className="space-y-3">
              <p className="font-semibold text-red-800 dark:text-red-200">
                {error}
              </p>
              {retry && (
                <Button
                  onClick={retry}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-2 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reintentar
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
