'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = 'No hay datos disponibles' }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-700" />
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
