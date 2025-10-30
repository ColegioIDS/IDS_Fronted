// src/components/form/DatePickerWithPresets.tsx

'use client';

import * as React from 'react';
import { format, addDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// ============================================
// INTERFACES
// ============================================

interface DatePickerWithPresetsProps {
  date?: Date;
  onDateChange: (date: Date) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  disabledMessage?: string;
}

// ============================================
// PRESETS
// ============================================

const getPresets = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [
    {
      label: 'Hoy',
      value: today,
    },
    {
      label: 'Mañana',
      value: addDays(today, 1),
    },
    {
      label: 'En 7 días',
      value: addDays(today, 7),
    },
    {
      label: 'Este mes',
      value: startOfMonth(today),
    },
    {
      label: 'Fin de mes',
      value: endOfMonth(today),
    },
    {
      label: 'Este año',
      value: startOfYear(today),
    },
    {
      label: 'Fin de año',
      value: endOfYear(today),
    },
  ];
};

// ============================================
// COMPONENTE
// ============================================

/**
 * 🎯 DatePickerWithPresets - Datepicker flotante con presets
 *
 * Características:
 * - Popover flotante (no atrapado en modales)
 * - Presets rápidos (Hoy, Mañana, Este mes, etc)
 * - Función de deshabilitación personalizada
 * - Dark mode compatible
 * - Totalmente responsive
 * - Compatible con shadcn/ui
 */
export function DatePickerWithPresets({
  date,
  onDateChange,
  placeholder = 'Selecciona una fecha',
  disabled = () => false,
  disabledMessage = 'Esta fecha no está disponible',
}: DatePickerWithPresetsProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date) => {
    if (!disabled(selectedDate)) {
      onDateChange(selectedDate);
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(new Date());
    setOpen(false);
  };

  const presets = getPresets().filter((preset) => !disabled(preset.value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal gap-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          type="button"
        >
          <CalendarIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <span className={date ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
            {date ? format(date, 'dd/MM/yyyy') : placeholder}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg z-50"
        align="start"
        side="bottom"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex gap-2 p-3">
          {/* ============================================ */}
          {/* CALENDARIO */}
          {/* ============================================ */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={(day) => {
              if (day && !disabled(day)) {
                handleSelect(day);
              }
            }}
            disabled={disabled}
            initialFocus
            className="border-none p-0"
          />

          {/* ============================================ */}
          {/* PRESETS */}
          {/* ============================================ */}
          {presets.length > 0 && (
            <div className="border-l border-gray-200 dark:border-gray-700 pl-3 flex flex-col gap-1 min-w-[120px]">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(preset.value);
                  }}
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="justify-start text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {preset.label}
                </Button>
              ))}

              {/* Separador */}
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

              {/* Limpiar */}
              {date && (
                <Button
                  onClick={handleClear}
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="justify-start text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DatePickerWithPresets;