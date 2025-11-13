'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  useAttendanceConfig,
  formatDateISO,
} from '@/hooks/attendance-hooks';

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
  const [isOpen, setIsOpen] = useState(false);
  const { getHolidayByDate, error } = useAttendanceConfig();

  const handlePreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateChange(previousDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getWeekendIndicator = (date: Date) => {
    const day = date.getDay();
    if (day === 0 || day === 6) {
      return (
        <Badge
          variant="secondary"
          className="text-xs bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 absolute -bottom-1 -right-1 w-5 h-5 p-0 flex items-center justify-center"
          title="Fin de semana"
        >
          📅
        </Badge>
      );
    }
    return null;
  };

  // Mostrar error si existe
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const displayDate = format(selectedDate, "d 'de' MMMM 'de' yyyy", {
    locale: es,
  });
  const dateISO = formatDateISO(selectedDate);
  const selectedDateHoliday = getHolidayByDate(dateISO);

  return (
    <div className="space-y-3">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground',
              disabled && 'opacity-50 cursor-not-allowed',
              selectedDateHoliday && 'border-orange-300 bg-orange-50 dark:bg-orange-900/10'
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayDate}
            {selectedDateHoliday && (
              <span className="ml-auto text-xs text-orange-600">
                {selectedDateHoliday.name}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onDateChange(date);
                setIsOpen(false);
              }
            }}
            disabled={disabled}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>

      {/* Controles de navegación */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreviousDay}
          disabled={disabled}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          disabled={disabled}
          className="flex-1"
        >
          Hoy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextDay}
          disabled={disabled}
          className="flex-1"
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Indicador de día festivo */}
      {selectedDateHoliday && (
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            ⚠️ {selectedDateHoliday.name} - No hay asistencia
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
