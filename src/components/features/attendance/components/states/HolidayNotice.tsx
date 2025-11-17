'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
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
    <Alert className="bg-amber-50 border-2 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 shadow-md">
      <Calendar className="h-5 w-5 text-amber-700 dark:text-amber-300" />
      <AlertDescription className="ml-2">
        <p className="font-bold text-amber-800 dark:text-amber-200 mb-1">
          {reason}
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          <strong className="capitalize">{dateStr}</strong>. Los registros de asistencia no se pueden modificar en esta fecha.
        </p>
      </AlertDescription>
    </Alert>
  );
}
