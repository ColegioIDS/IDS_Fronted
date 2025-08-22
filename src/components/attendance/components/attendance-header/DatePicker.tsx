// src/components/attendance/components/attendance-header/DatePicker.tsx
"use client";

import { useState, useMemo } from 'react';
import { format, addDays, subDays, isWeekend, isSameDay, isWithinInterval, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertTriangle, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCurrentBimester } from '@/context/newBimesterContext';
import { useAcademicWeekContext } from '@/context/AcademicWeeksContext';

interface Holiday {
  id: number;
  date: Date | string;
  description: string;
  isRecovered: boolean;
}

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  holidays: Holiday[];
}

export default function DatePicker({ 
  selectedDate, 
  onDateChange, 
  holidays 
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 🔄 Obtener bimestre activo y semanas académicas
  const { bimester: activeBimester } = useCurrentBimester();
  const { weeks: academicWeeks, isLoading: loadingWeeks } = useAcademicWeekContext();

  // 🛠️ Función auxiliar para manejar fechas UTC correctamente
  const parseUTCDate = (dateString: string | Date) => {
    if (dateString instanceof Date) return dateString;
    
    // Para fechas ISO UTC, crear fecha local sin conversión de timezone
    const date = new Date(dateString);
    const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return utc;
  };

  // 📅 Filtrar semanas académicas del bimestre activo
  const currentBimesterWeeks = useMemo(() => {
    if (!activeBimester || !academicWeeks.length) return [];
    
    return academicWeeks.filter((week: any) => 
      week.bimesterId === activeBimester.id
    );
  }, [academicWeeks, activeBimester]);

  // 📊 Calcular rango de fechas permitidas
  const allowedDateRange = useMemo(() => {
    if (!currentBimesterWeeks.length) {
      // Si no hay semanas, usar fechas del bimestre
      if (activeBimester?.startDate && activeBimester?.endDate) {
        return {
          start: startOfDay(parseUTCDate(activeBimester.startDate)),
          end: startOfDay(parseUTCDate(activeBimester.endDate))
        };
      }
      return null;
    }

    // Usar el rango de las semanas académicas - CORREGIDO con parseUTCDate
    const allDates = currentBimesterWeeks.flatMap((week: any) => [
      parseUTCDate(week.startDate),
      parseUTCDate(week.endDate)
    ]);

    const calculatedRange = {
      start: startOfDay(new Date(Math.min(...allDates.map((d: Date) => d.getTime())))),
      end: startOfDay(new Date(Math.max(...allDates.map((d: Date) => d.getTime()))))
    };

    // 🔍 DEBUG - Agregar console.log temporal
    console.log('🔍 Debug Date Range CORREGIDO:', {
      bimesterId: activeBimester?.id,
      weeksCount: currentBimesterWeeks.length,
      weeks: currentBimesterWeeks.map((w: any) => ({
        number: w.number,
        startOriginal: w.startDate,
        endOriginal: w.endDate,
        startCorrected: parseUTCDate(w.startDate).toLocaleDateString(),
        endCorrected: parseUTCDate(w.endDate).toLocaleDateString(),
        // Verificar específicamente el viernes
        isFridayWeek: w.number === 7,
        fridayDate: w.number === 7 ? parseUTCDate(w.endDate).toLocaleDateString() : null
      })),
      calculatedStart: calculatedRange.start.toLocaleDateString(),
      calculatedEnd: calculatedRange.end.toLocaleDateString(),
      holidays: holidays.map((h: any) => ({
        date: parseUTCDate(h.date).toLocaleDateString(),
        description: h.description,
        originalDate: h.date,
        correctedDate: parseUTCDate(h.date)
      }))
    });

    return calculatedRange;
  }, [currentBimesterWeeks, activeBimester, holidays]);

  // 🎯 Verificar si una fecha está permitida
  const isDateAllowed = (date: Date) => {
    if (!allowedDateRange) return false;
    
    const dateToCheck = startOfDay(date);
    
    // Verificar que esté dentro del rango general
    const isInRange = isWithinInterval(dateToCheck, {
      start: allowedDateRange.start,
      end: allowedDateRange.end
    });

    if (!isInRange) return false;

    // Si tenemos semanas académicas, verificar que esté dentro de alguna semana
    if (currentBimesterWeeks.length > 0) {
      const isInWeek = currentBimesterWeeks.some((week: any) => {
        const weekStart = startOfDay(parseUTCDate(week.startDate));
        const weekEnd = startOfDay(parseUTCDate(week.endDate));
        
        return isWithinInterval(dateToCheck, {
          start: weekStart,
          end: weekEnd
        });
      });
      
      // 🔍 DEBUG - Log para fecha específica (22 de agosto)
      if (dateToCheck.getDate() === 22 && dateToCheck.getMonth() === 7) { // 22 de agosto
        console.log('🔍 Debug Aug 22 CORREGIDO:', {
          dateToCheck: dateToCheck.toLocaleDateString(),
          isInRange,
          isInWeek,
          weeks: currentBimesterWeeks.map((w: any) => ({
            number: w.number,
            start: parseUTCDate(w.startDate).toLocaleDateString(),
            end: parseUTCDate(w.endDate).toLocaleDateString(),
            includes: isWithinInterval(dateToCheck, {
              start: startOfDay(parseUTCDate(w.startDate)),
              end: startOfDay(parseUTCDate(w.endDate))
            })
          }))
        });
      }
      
      return isInWeek;
    }

    return true;
  };

  // 🎉 Verificar si una fecha es día festivo - CORREGIDO
  const isHoliday = (date: Date) => {
    return holidays.some((holiday: any) => {
      const holidayDate = parseUTCDate(holiday.date);
      return isSameDay(holidayDate, date);
    });
  };

  // 🎉 Obtener información del día festivo - CORREGIDO
  const getHolidayInfo = (date: Date) => {
    return holidays.find((holiday: any) => {
      const holidayDate = parseUTCDate(holiday.date);
      return isSameDay(holidayDate, date);
    });
  };

  // 📅 Verificar si es fin de semana
  const isWeekendDay = (date: Date) => {
    return isWeekend(date);
  };

  // 🔍 Obtener la semana académica de una fecha
  const getAcademicWeekForDate = (date: Date) => {
    return currentBimesterWeeks.find((week: any) => 
      isWithinInterval(startOfDay(date), {
        start: startOfDay(parseUTCDate(week.startDate)),
        end: startOfDay(parseUTCDate(week.endDate))
      })
    );
  };

  // 🎯 Navegación de fechas (solo días permitidos)
  const goToPreviousDay = () => {
    let date = subDays(selectedDate, 1);
    let attempts = 0;
    
    // Buscar el día permitido anterior (máximo 30 intentos)
    while (!isDateAllowed(date) && attempts < 30) {
      date = subDays(date, 1);
      attempts++;
    }
    
    if (isDateAllowed(date)) {
      onDateChange(date);
    }
  };

  const goToNextDay = () => {
    let date = addDays(selectedDate, 1);
    let attempts = 0;
    
    // Buscar el próximo día permitido (máximo 30 intentos)
    while (!isDateAllowed(date) && attempts < 30) {
      date = addDays(date, 1);
      attempts++;
    }
    
    if (isDateAllowed(date)) {
      onDateChange(date);
    }
  };

  // 📚 Ir al último/próximo día hábil dentro del rango permitido
  const goToLastSchoolDay = () => {
    let date = subDays(selectedDate, 1);
    let attempts = 0;
    
    // Buscar el último día que sea permitido, no fin de semana ni festivo
    while ((!isDateAllowed(date) || isWeekendDay(date) || isHoliday(date)) && attempts < 30) {
      date = subDays(date, 1);
      attempts++;
    }
    
    if (isDateAllowed(date) && !isWeekendDay(date) && !isHoliday(date)) {
      onDateChange(date);
    }
  };

  const goToNextSchoolDay = () => {
    let date = addDays(selectedDate, 1);
    let attempts = 0;
    
    // Buscar el próximo día que sea permitido, no fin de semana ni festivo
    while ((!isDateAllowed(date) || isWeekendDay(date) || isHoliday(date)) && attempts < 30) {
      date = addDays(date, 1);
      attempts++;
    }
    
    if (isDateAllowed(date) && !isWeekendDay(date) && !isHoliday(date)) {
      onDateChange(date);
    }
  };

  // 🏷️ Obtener información del día seleccionado
  const selectedDateInfo = {
    isHoliday: isHoliday(selectedDate),
    isWeekend: isWeekendDay(selectedDate),
    isAllowed: isDateAllowed(selectedDate),
    holiday: getHolidayInfo(selectedDate),
    academicWeek: getAcademicWeekForDate(selectedDate),
    isSchoolDay: isDateAllowed(selectedDate) && !isHoliday(selectedDate) && !isWeekendDay(selectedDate)
  };

  // ⚠️ Deshabilitar fechas no permitidas
  const isDateDisabled = (date: Date) => {
    return !isDateAllowed(date);
  };

  if (loadingWeeks) {
    return (
      <div className="space-y-2">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* ℹ️ Información del bimestre activo */}
      {activeBimester && (
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded p-2">
          📖 <strong>{activeBimester.name}</strong>
          {currentBimesterWeeks.length > 0 && (
            <span className="ml-2">• {currentBimesterWeeks.length} semanas académicas</span>
          )}
        </div>
      )}

      {/* 🎯 Controles de navegación */}
      <div className="flex items-center space-x-2">
        {/* ⬅️ Día anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousDay}
          className="p-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* 📅 Selector principal */}
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
              <div className="flex items-center space-x-2 flex-1">
                <span>
                  {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </span>
                
                {/* 🏷️ Badges indicadores */}
                <div className="flex items-center space-x-1">
                  {selectedDateInfo.isHoliday && (
                    <Badge variant="destructive" className="text-xs">
                      🔴 Festivo
                    </Badge>
                  )}
                  
                  {selectedDateInfo.isWeekend && !selectedDateInfo.isHoliday && (
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      📅 Fin de semana
                    </Badge>
                  )}
                  
                  {selectedDateInfo.isSchoolDay && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                      📚 Día lectivo
                    </Badge>
                  )}

                  {selectedDateInfo.academicWeek && (
                    <Badge variant="outline" className="text-xs">
                      📖 Semana {selectedDateInfo.academicWeek.number}
                    </Badge>
                  )}
                </div>
              </div>
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                Seleccionar Fecha
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Solo fechas del {activeBimester?.name || 'bimestre activo'}
              </p>
              {currentBimesterWeeks.length > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  📖 Limitado a semanas académicas programadas
                </p>
              )}
            </div>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date && isDateAllowed(date)) {
                  onDateChange(date);
                  setIsOpen(false);
                }
              }}
              disabled={isDateDisabled}
              initialFocus
              locale={es}
              className="rounded-md"
              modifiers={{
                holiday: (date) => {
                  const result = isHoliday(date) && isDateAllowed(date);
                  // DEBUG para días festivos
                  if (result) {
                    console.log('🔴 Holiday Found:', date.toLocaleDateString());
                  }
                  return result;
                },
                schoolDay: (date) => {
                  const result = isDateAllowed(date) && !isWeekendDay(date) && !isHoliday(date);
                  // DEBUG para días lectivos
                  if (result && date.getDate() >= 18 && date.getDate() <= 22 && date.getMonth() === 7) {
                    console.log('🟢 School Day Found:', date.toLocaleDateString());
                  }
                  return result;
                },
                weekend: (date) => isWeekendDay(date) && isDateAllowed(date)
              }}
              modifiersClassNames={{
                holiday: "bg-red-200 text-red-900 font-bold hover:bg-red-300 dark:bg-red-900/30 dark:text-red-100",
                schoolDay: "bg-green-100 text-green-900 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-100",
                weekend: "text-gray-400 hover:bg-gray-100 dark:text-gray-600 dark:hover:bg-gray-800"
              }}
            />
            
            {/* 📊 Legend */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-100 dark:bg-red-900/20 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Día festivo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Fin de semana</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-100 dark:bg-green-900/20 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Día lectivo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded opacity-50"></div>
                  <span className="text-gray-600 dark:text-gray-400">No disponible</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* ➡️ Día siguiente */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextDay}
          className="p-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 📚 Atajos para días hábiles */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToLastSchoolDay}
          className="text-xs"
        >
          ⬅️ Último día hábil
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextSchoolDay}
          className="text-xs"
        >
          Próximo día hábil ➡️
        </Button>
      </div>

      {/* ℹ️ Información de la semana académica */}
      {selectedDateInfo.academicWeek && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Semana {selectedDateInfo.academicWeek.number} - {activeBimester?.name}
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {format(parseUTCDate(selectedDateInfo.academicWeek.startDate), "dd MMM", { locale: es })} - {format(parseUTCDate(selectedDateInfo.academicWeek.endDate), "dd MMM yyyy", { locale: es })}
              </p>
              {selectedDateInfo.academicWeek.objectives && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  📋 {selectedDateInfo.academicWeek.objectives}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ Información adicional del día festivo */}
      {selectedDateInfo.holiday && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <CalendarIcon className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900 dark:text-red-100">
                {selectedDateInfo.holiday.description}
              </h4>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                {selectedDateInfo.holiday.isRecovered 
                  ? "Día de recuperación - Se tomarán clases normalmente" 
                  : "No hay clases programadas"
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ Advertencia fin de semana */}
      {selectedDateInfo.isWeekend && !selectedDateInfo.isHoliday && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Fin de semana - Generalmente no hay clases
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ Advertencia fecha fuera de rango */}
      {!selectedDateInfo.isAllowed && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                Fecha fuera del bimestre activo
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}