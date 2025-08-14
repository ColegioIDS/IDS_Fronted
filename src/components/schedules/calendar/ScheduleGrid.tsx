// components/schedules/calendar/ScheduleGrid.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Schedule, DayOfWeek } from "@/types/schedules";
import type { TimeSlot, DragItem, TempSchedule, ScheduleChange } from "@/types/schedules.types";
import { DroppableTimeSlot } from "./DroppableTimeSlot";
import { TIME_SLOTS, DAYS_OF_WEEK } from "@/types/schedules.types";

interface ScheduleGridProps {
  scheduleGrid: { [key: string]: (Schedule | TempSchedule)[] };
  pendingChanges: ScheduleChange[];
  onDrop: (item: DragItem, day: DayOfWeek, timeSlot: TimeSlot) => void;
  onScheduleEdit: (schedule: Schedule | TempSchedule) => void;
  onScheduleDelete: (id: string | number) => void;
}

export function ScheduleGrid({
  scheduleGrid,
  pendingChanges,
  onDrop,
  onScheduleEdit,
  onScheduleDelete
}: ScheduleGridProps) {
  // Días de la semana a mostrar (Lunes a Viernes)
  const weekDays = DAYS_OF_WEEK.slice(0, 5);

  console.log("aca")

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Encabezado con días de la semana */}
            <div className="grid grid-cols-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="p-4 font-semibold text-gray-700 border-r flex items-center justify-center">
                <span className="text-sm uppercase tracking-wide">Horario</span>
              </div>
              {weekDays.map((day) => (
                <div
                  key={day.value}
                  className="p-4 font-semibold text-center border-r last:border-r-0"
                >
                  <div className="text-gray-800 font-bold">{day.shortLabel}</div>
                  <div className="text-xs font-normal text-gray-500 mt-1">
                    {day.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Filas de horarios */}
            {TIME_SLOTS.map((timeSlot, index) => {
              const isBreakTime = timeSlot.label.includes("RECREO") || 
                                 timeSlot.label.includes("ALMUERZO");
              
              return (
                <div 
                  key={timeSlot.start} 
                  className={`grid grid-cols-6 border-b last:border-b-0 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
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

                  {/* Celdas de horario para cada día */}
                  {weekDays.map((day) => {
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
                        key={`${day.value}-${timeSlot.start}`}
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
      </CardContent>
    </Card>
  );
}