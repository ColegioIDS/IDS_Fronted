// components/schedules/calendar/ScheduleGrid.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Schedule, DayOfWeek } from "@/types/schedules";
import type { TimeSlot, DragItem, TempSchedule, ScheduleChange } from "@/types/schedules.types";
import { DroppableTimeSlot } from "./DroppableTimeSlot";
import { DEFAULT_TIME_SLOTS, ALL_DAYS_OF_WEEK } from "@/types/schedules.types";

interface ScheduleGridProps {
  scheduleGrid: { [key: string]: (Schedule | TempSchedule)[] };
  pendingChanges: ScheduleChange[];
  timeSlots?: TimeSlot[]; // NUEVO: timeSlots dinámicos
  workingDays?: typeof ALL_DAYS_OF_WEEK[0][]; // NUEVO: días dinámicos
  onDrop: (item: DragItem, day: DayOfWeek, timeSlot: TimeSlot) => void;
  onScheduleEdit: (schedule: Schedule | TempSchedule) => void;
  onScheduleDelete: (id: string | number) => void;
}

export function ScheduleGrid({
  scheduleGrid,
  pendingChanges,
  timeSlots,
  workingDays,
  onDrop,
  onScheduleEdit,
  onScheduleDelete
}: ScheduleGridProps) {
  // Usar timeSlots dinámicos o fallback a default
  const currentTimeSlots = timeSlots || DEFAULT_TIME_SLOTS;
  
  // Usar días dinámicos o fallback a Lun-Vie
  const currentWorkingDays = workingDays || ALL_DAYS_OF_WEEK.slice(0, 5);

  console.log('🟢 ScheduleGrid renderizando con:', {
    timeSlots: currentTimeSlots.length,
    workingDays: currentWorkingDays.map(d => d.shortLabel).join(', '),
    scheduleGridKeys: Object.keys(scheduleGrid).length
  });

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Encabezado con días de la semana - DINÁMICO */}
            <div className={`grid border-b bg-gradient-to-r from-gray-50 to-gray-100`} 
                 style={{ gridTemplateColumns: `120px repeat(${currentWorkingDays.length}, 1fr)` }}>
              <div className="p-4 font-semibold text-gray-700 border-r flex items-center justify-center">
                <span className="text-sm uppercase tracking-wide">Horario</span>
              </div>
              {currentWorkingDays.map((day, index) => (
                <div
                  key={day.value}
                  className={`p-4 font-semibold text-center border-r ${
                    index === currentWorkingDays.length - 1 ? '' : 'border-r'
                  }`}
                >
                  <div className="text-gray-800 font-bold">{day.shortLabel}</div>
                  <div className="text-xs font-normal text-gray-500 mt-1">
                    {day.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Filas de horarios - DINÁMICAS */}
            {currentTimeSlots.map((timeSlot, index) => {
              const isBreakTime = timeSlot.isBreak || 
                                 timeSlot.label.includes("RECREO") || 
                                 timeSlot.label.includes("ALMUERZO");
              
              return (
                <div 
                  key={`${timeSlot.start}-${timeSlot.end}`}
                  className={`grid border-b last:border-b-0 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                  style={{ gridTemplateColumns: `120px repeat(${currentWorkingDays.length}, 1fr)` }}
                >
                  {/* Columna de horario */}
                  <div className={`
                    p-3 text-sm font-medium border-r flex items-center justify-center
                    ${isBreakTime 
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600' 
                      : 'text-gray-700 bg-white'
                    }
                  `}>
                    <div className="text-center">
                      <div className="font-mono text-xs">
                        {!isBreakTime && (
                          <>
                            <span className="block">{timeSlot.start}</span>
                            <span className="text-gray-400">-</span>
                            <span className="block">{timeSlot.end}</span>
                          </>
                        )}
                        {isBreakTime && (
                          <span className="font-sans font-semibold text-gray-500">
                            {timeSlot.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Celdas de horario para cada día - DINÁMICAS */}
                  {currentWorkingDays.map((day, dayIndex) => {
                    const key = `${day.value}-${timeSlot.start}`;
                    let daySchedules = scheduleGrid[key] || [];
                    
                    // Filtrar horarios eliminados
                    daySchedules = daySchedules.filter(schedule => {
                      const deleteChange = pendingChanges.find(
                        change => change.action === 'delete' && change.schedule.id === schedule.id
                      );
                      return !deleteChange;
                    });
                    
                    // Aplicar cambios de actualización
                    daySchedules = daySchedules.map(schedule => {
                      const updateChange = pendingChanges.find(
                        change => change.action === 'update' && change.schedule.id === schedule.id
                      );
                      if (updateChange && 
                          updateChange.schedule.dayOfWeek === day.value && 
                          updateChange.schedule.startTime === timeSlot.start) {
                        return updateChange.schedule as Schedule;
                      }
                      return schedule;
                    });
                    
                    return (
                      <DroppableTimeSlot
                        key={`${day.value}-${timeSlot.start}-${timeSlot.end}`}
                        day={day.value as DayOfWeek}
                        timeSlot={timeSlot}
                        schedules={daySchedules}
                        onDrop={onDrop}
                        onScheduleEdit={onScheduleEdit}
                        onScheduleDelete={onScheduleDelete}
                        isBreakTime={isBreakTime}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer con información de configuración */}
        {(timeSlots || workingDays) && (
          <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-600">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <span>📅 <strong>{currentWorkingDays.length}</strong> días laborales</span>
                <span>⏰ <strong>{currentTimeSlots.length}</strong> slots de tiempo</span>
                <span>📚 <strong>{currentTimeSlots.filter(s => !s.isBreak).length}</strong> períodos de clase</span>
                <span>☕ <strong>{currentTimeSlots.filter(s => s.isBreak).length}</strong> recreos</span>
              </div>
              <div className="text-green-600 font-medium">
                ✅ Configuración personalizada
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}