'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function LoadingState() {
  return (
    <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-md">
      <CardContent className="py-16 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-950/30 shadow-lg">
            <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-base text-slate-900 dark:text-slate-100 font-bold mb-1">
              Cargando asistencias...
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Por favor espere
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
