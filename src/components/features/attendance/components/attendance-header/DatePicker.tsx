'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useHolidaysData } from '@/hooks/attendance';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePicker({
  selectedDate,
  onDateChange,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { holidays, error, isHoliday, getHolidayInfo } = useHolidaysData();

  // Verificar si es fin de semana
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Domingo o Sábado
  };

  // Obtener ícono/badge para una fecha
  const getDateBadge = (date: Date) => {
    if (isHoliday(date)) {
      const holidayInfo = getHolidayInfo(date);
      return (
        <Badge 
          variant="outline" 
          className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 absolute -bottom-1 -right-1 w-5 h-5 p-0 flex items-center justify-center"
          title={holidayInfo?.name || 'Día Festivo'}
        >
          🎉
        </Badge>
      );
    }
    if (isWeekend(date)) {
      return (
        <Badge 
          variant="outline" 
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

  const displayDate = format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es });
  const selectedDateHoliday = getHolidayInfo(selectedDate);

  return (
    <div className="space-y-3">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayDate}
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
            disabled={(date) => {
              // Deshabilitar fechas muy antiguas o futuras (ej: hace 2 años o en 2 años)
              const twoYearsAgo = new Date();
              twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
              
              const twoYearsAhead = new Date();
              twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);
              
              return date < twoYearsAgo || date > twoYearsAhead;
            }}
            initialFocus
          />
          
          {/* Leyenda de símbolos */}
          <div className="border-t p-3 space-y-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span>🎉</span>
              <span>Día Festivo</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📅</span>
              <span>Fin de semana</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Mostrar información si es día festivo */}
      {selectedDateHoliday && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Día Festivo:</strong> {selectedDateHoliday.name}
            {selectedDateHoliday.isRecovered && (
              <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                Día Recuperado
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Mostrar información si es fin de semana */}
      {isWeekend(selectedDate) && !selectedDateHoliday && (
        <Alert className="border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800">
          <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <AlertDescription className="text-gray-800 dark:text-gray-200">
            Este es un fin de semana. Los registros de asistencia generalmente no aplican.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
