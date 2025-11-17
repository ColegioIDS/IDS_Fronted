'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = 'No hay datos disponibles' }: EmptyStateProps) {
  return (
    <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-md">
      <CardContent className="py-16 flex justify-center items-center">
        <div className="text-center space-y-4">
          <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/50 mx-auto w-fit border-2 border-slate-200 dark:border-slate-700">
            <Users className="h-16 w-16 text-slate-400 dark:text-slate-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
              {message}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Seleccione los filtros correspondientes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
