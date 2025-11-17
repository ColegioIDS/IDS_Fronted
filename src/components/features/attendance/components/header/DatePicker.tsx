'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useAttendanceUtils } from '@/hooks/attendance-hooks';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  disabled?: boolean;
}

export default function DatePicker({
  selectedDate,
  onDateChange,
  disabled = false,
}: DatePickerProps) {
  const { formatDateISO } = useAttendanceUtils();

  const dateDisplay = selectedDate.toLocaleDateString('es-ES', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-auto"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {dateDisplay}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              onDateChange(date);
            }
          }}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
