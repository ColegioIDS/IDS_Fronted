'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function LoadingState() {
  return (
    <Card>
      <CardContent className="py-12 flex justify-center items-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Cargando registros de asistencia...</p>
        </div>
      </CardContent>
    </Card>
  );
}
