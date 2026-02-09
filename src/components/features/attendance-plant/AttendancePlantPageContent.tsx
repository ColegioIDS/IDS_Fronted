'use client';

/**
 * ====================================================================
 * ATTENDANCE PLANT PAGE CONTENT
 * ====================================================================
 */

import { useState } from 'react';
import { AttendancePlantCascadeSelector } from './AttendancePlantCascadeSelector';
import { SectionStudentsTable } from './SectionStudentsTable';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Selection {
  gradeId?: number;
  sectionId?: number;
  gradeName?: string;
  sectionName?: string;
}

export function AttendancePlantPageContent() {
  const [selection, setSelection] = useState<Selection>({});
  const [cycleId] = useState(3); // Ciclo 2026 (obtenido del cascade data)
  const [bimesterId] = useState(6); // Primer bimestre (obtenido del cascade data)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const dateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  return (
    <div className="space-y-8">
      {/* SELECTOR DE CASCADA */}
      <AttendancePlantCascadeSelector onSelectionChange={setSelection} />

      {/* DATE PICKER - Se muestra solo si hay grado y sección seleccionados */}
      {selection.gradeId && selection.sectionId && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Selecciona la fecha para registrar asistencia
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-2 border-slate-200 h-12 rounded-xl hover:bg-slate-50"
                  >
                    <CalendarIcon className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0" />
                    <span className="text-slate-900 font-medium">
                      {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: es }) : 'Seleccionar fecha'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) =>
                      date > new Date() || date < new Date('2026-01-05')
                    }
                    locale={es}
                    className="rounded-lg"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-slate-500 mt-2">
                Solo semanas académicas activas disponibles
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TABLA DE ESTUDIANTES - Se muestra solo si hay grado y sección seleccionados */}
      {selection.gradeId && selection.sectionId && (
        <SectionStudentsTable
          date={dateString}
          cycleId={cycleId}
          bimesterId={bimesterId}
          gradeId={selection.gradeId}
          sectionId={selection.sectionId}
          gradeName={selection.gradeName || ''}
          sectionName={selection.sectionName || ''}
        />
      )}
    </div>
  );
}
