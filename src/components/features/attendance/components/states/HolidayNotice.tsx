'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HolidayNoticeProps {
  date: Date;
  reason?: string;
}

export default function HolidayNotice({ date, reason = 'Día no laborable' }: HolidayNoticeProps) {
  const dateStr = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
      <AlertCircle className="h-4 w-4 text-amber-800 dark:text-amber-200" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <strong>{dateStr}</strong> es {reason}. Los registros de asistencia no se pueden modificar.
      </AlertDescription>
    </Alert>
  );
}
