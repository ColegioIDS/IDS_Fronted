// src/components/features/schedules/calendar/ScheduleGrid.tsx
"use client";

import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import type { Schedule, DayOfWeek, TimeSlot, DragItem, TempSchedule, ScheduleChange } from "@/types/schedules.types";
import { DroppableTimeSlot } from "@/components/features/schedules/calendar/DroppableTimeSlot";
import { DEFAULT_TIME_SLOTS, ALL_DAYS_OF_WEEK, type DayObject } from "@/types/schedules.types";

interface ScheduleGridProps {
  scheduleGrid: { [key: string]: (Schedule | TempSchedule)[] };
  pendingChanges: ScheduleChange[];
  timeSlots?: TimeSlot[];
  workingDays?: DayObject[];
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const currentTimeSlots = timeSlots || DEFAULT_TIME_SLOTS;
  const currentWorkingDays = workingDays || ALL_DAYS_OF_WEEK.slice(0, 5);

  console.log('🟢 ScheduleGrid renderizando con:', {
    timeSlots: currentTimeSlots.length,
    workingDays: currentWorkingDays.map(d => d.shortLabel).join(', '),
    scheduleGridKeys: Object.keys(scheduleGrid).length
  });

  return (
    <Card className={`backdrop-blur-sm border-0 shadow-xl overflow-hidden ${
      isDark ? 'bg-gray-800/95' : 'bg-white/95'
    }`}>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header */}
            <div className={`grid border-b ${
              isDark 
                ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-700' 
                : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
            }`} 
                 style={{ gridTemplateColumns: `120px repeat(${currentWorkingDays.length}, 1fr)` }}>
              <div className={`p-4 font-semibold border-r flex items-center justify-center ${
                isDark 
                  ? 'text-gray-300 border-gray-700' 
                  : 'text-gray-700 border-gray-200'
              }`}>
                <span className="text-sm uppercase tracking-wide">Horario</span>
              </div>
              {currentWorkingDays.map((day, index) => (
                <div
                  key={day.value}
                  className={`p-4 font-semibold text-center ${
                    index !== currentWorkingDays.length - 1 
                      ? isDark ? 'border-r border-gray-700' : 'border-r border-gray-200'
                      : ''
                  }`}
                >
                  <div className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                    {day.shortLabel}
                  </div>
                  <div className={`text-xs font-normal mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {day.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Rows */}
            {currentTimeSlots.map((timeSlot: TimeSlot, index: number) => {
              const isBreakTime = (timeSlot.isBreak === true) ||
                                 (timeSlot.label?.includes("RECREO") ?? false) ||
                                 (timeSlot.label?.includes("ALMUERZO") ?? false);
              
              return (
                <div 
                  key={`${timeSlot.start}-${timeSlot.end}`}
                  className={`grid ${
                    isDark 
                      ? 'border-b border-gray-700 last:border-b-0' 
                      : 'border-b last:border-b-0'
                  } ${
                    index % 2 === 0 
                      ? isDark ? 'bg-gray-800' : 'bg-white'
                      : isDark ? 'bg-gray-750' : 'bg-gray-50/50'
                  }`}
                  style={{ gridTemplateColumns: `120px repeat(${currentWorkingDays.length}, 1fr)` }}
                >
                  {/* Time column */}
                  <div className={`
                    p-3 text-sm font-medium border-r flex items-center justify-center
                    ${isDark ? 'border-gray-700' : 'border-gray-200'}
                    ${isBreakTime 
                      ? isDark 
                        ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-400' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600'
                      : isDark 
                        ? 'text-gray-300 bg-gray-800' 
                        : 'text-gray-700 bg-white'
                    }
                  `}>
                    <div className="text-center">
                      <div className="font-mono text-xs">
                        {!isBreakTime && (
                          <>
                            <span className="block">{timeSlot.start}</span>
                            <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>-</span>
                            <span className="block">{timeSlot.end}</span>
                          </>
                        )}
                        {isBreakTime && (
                          <span className={`font-sans font-semibold ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {timeSlot.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Time slots for each day */}
                  {currentWorkingDays.map((day) => {
                    const key = `${day.value}-${timeSlot.start}`;
                    let daySchedules = scheduleGrid[key] || [];
                    
                    daySchedules = daySchedules.filter(schedule => {
                      const deleteChange = pendingChanges.find(
                        change => change.action === 'delete' && change.schedule.id === schedule.id
                      );
                      return !deleteChange;
                    });
                    
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

        {/* Footer */}
        {(timeSlots || workingDays) && (
          <div className={`px-4 py-2 border-t text-xs ${
            isDark 
              ? 'bg-gray-800 border-gray-700 text-gray-400' 
              : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}>
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <span>📅 <strong>{currentWorkingDays.length}</strong> días laborales</span>
                <span>⏰ <strong>{currentTimeSlots.length}</strong> slots de tiempo</span>
                <span>📚 <strong>{currentTimeSlots.filter(s => !s.isBreak).length}</strong> períodos de clase</span>
                <span>☕ <strong>{currentTimeSlots.filter(s => s.isBreak).length}</strong> recreos</span>
              </div>
              <div className={`font-medium ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`}>
                ✅ Configuración personalizada
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
