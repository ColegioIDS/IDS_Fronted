// src/components/features/schedules/calendar/ScheduleGrid.tsx
"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import type { 
  Schedule, 
  DayOfWeek, 
  TimeSlot, 
  TempSchedule, 
  ScheduleChange,
  CourseAssignment,
  DragItem 
} from "@/types/schedules.types";
import { DroppableTimeSlot } from "@/components/features/schedules/calendar/DroppableTimeSlot";
import { DEFAULT_TIME_SLOTS, ALL_DAYS_OF_WEEK, type DayObject } from "@/types/schedules.types";

interface ScheduleGridProps {
  schedules: Schedule[];
  tempSchedules: TempSchedule[];
  timeSlots?: TimeSlot[];
  workingDays?: number[];
  courseAssignments: CourseAssignment[];
  onDrop?: (item: DragItem, day: DayOfWeek, timeSlot: TimeSlot) => void;
  onScheduleUpdate?: (updatedTempSchedules: TempSchedule[], changes: ScheduleChange[]) => void;
  onScheduleClick?: (schedule: Schedule | TempSchedule) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function ScheduleGrid({
  schedules,
  tempSchedules,
  timeSlots,
  workingDays,
  courseAssignments,
  onDrop,
  onScheduleUpdate,
  onScheduleClick,
  canEdit = true,
  canDelete = true,
}: ScheduleGridProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const currentTimeSlots = timeSlots || DEFAULT_TIME_SLOTS;
  
  // Convert working days from number[] to DayObject[]
  const currentWorkingDays = useMemo((): DayObject[] => {
    if (!workingDays || workingDays.length === 0) {
      return ALL_DAYS_OF_WEEK.slice(0, 5); // Default Mon-Fri
    }
    return workingDays
      .map(day => ALL_DAYS_OF_WEEK.find(d => d.value === day))
      .filter((d): d is DayObject => d !== undefined);
  }, [workingDays]);

  // Merge schedules and tempSchedules, group by day and time
  const scheduleGrid = useMemo(() => {
    const grid: { [key: string]: (Schedule | TempSchedule)[] } = {};
    
    // Helper to enrich schedule with courseAssignment data
    const enrichSchedule = (schedule: Schedule | TempSchedule) => {
      const assignment = courseAssignments.find(ca => ca.id === schedule.courseAssignmentId);
      if (assignment) {
        return {
          ...schedule,
          courseAssignment: assignment,
        };
      }
      return schedule;
    };
    
    // Add saved schedules
    schedules.forEach(schedule => {
      const key = `${schedule.dayOfWeek}-${schedule.startTime}`;
      if (!grid[key]) grid[key] = [];
      grid[key].push(enrichSchedule(schedule));
    });
    
    // Add temp schedules
    tempSchedules.forEach(schedule => {
      const key = `${schedule.dayOfWeek}-${schedule.startTime}`;
      if (!grid[key]) grid[key] = [];
      grid[key].push(enrichSchedule(schedule));
    });
    
    return grid;
  }, [schedules, tempSchedules, courseAssignments]);

  // Handle schedule actions
  const handleScheduleEdit = (schedule: Schedule | TempSchedule) => {
    if (onScheduleClick) {
      onScheduleClick(schedule);
    }
  };

  const handleScheduleDelete = (id: string | number) => {
    if (!canDelete) return;
    
    if (typeof id === 'string') {
      // It's a temp schedule
      const updatedTemp = tempSchedules.filter(s => s.id !== id);
      onScheduleUpdate?.(updatedTemp, []);
    } else {
      // It's a saved schedule - add to pending changes
      const schedule = schedules.find(s => s.id === id);
      if (schedule) {
        const change: ScheduleChange = {
          action: 'delete',
          schedule: schedule,
          originalSchedule: schedule,
        };
        onScheduleUpdate?.(tempSchedules, [change]);
      }
    }
  };

  console.log('🟢 ScheduleGrid rendering:', {
    schedules: schedules.length,
    tempSchedules: tempSchedules.length,
    timeSlots: currentTimeSlots.length,
    workingDays: currentWorkingDays.map(d => d.shortLabel).join(', '),
    courseAssignments: courseAssignments.length,
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
                    const daySchedules = scheduleGrid[key] || [];
                    
                    return (
                      <DroppableTimeSlot
                        key={`${day.value}-${timeSlot.start}-${timeSlot.end}`}
                        day={day.value as DayOfWeek}
                        timeSlot={timeSlot}
                        schedules={daySchedules}
                        onDrop={onDrop || (() => {})}
                        onScheduleEdit={handleScheduleEdit}
                        onScheduleDelete={handleScheduleDelete}
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
            <div className="flex gap-2">
              <span>✅ <strong>{schedules.length}</strong> guardados</span>
              {tempSchedules.length > 0 && (
                <span className={isDark ? 'text-orange-400' : 'text-orange-600'}>
                  ⏳ <strong>{tempSchedules.length}</strong> temporales
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
