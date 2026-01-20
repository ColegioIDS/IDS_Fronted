// src/components/features/schedules/calendar/ScheduleGrid.tsx
"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, BookOpen, Coffee, CheckCircle2, Clock3 } from "lucide-react";
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
  timeSlotsByDay?: Record<number, TimeSlot[]>;
  workingDays?: number[];
  courseAssignments: CourseAssignment[];
  onDrop?: (item: DragItem, day: DayOfWeek, timeSlot: TimeSlot) => void;
  onScheduleUpdate?: (updatedTempSchedules: TempSchedule[], changes: ScheduleChange[]) => void;
  onScheduleClick?: (schedule: Schedule | TempSchedule) => void;
  onScheduleDelete?: (schedule: Schedule | TempSchedule) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  markedForDeletionIds?: Set<string | number>;
}

export function ScheduleGrid({
  schedules,
  tempSchedules,
  timeSlots,
  timeSlotsByDay,
  workingDays,
  courseAssignments,
  onDrop,
  onScheduleUpdate,
  onScheduleClick,
  onScheduleDelete,
  canEdit = true,
  canDelete = true,
  markedForDeletionIds = new Set(),
}: ScheduleGridProps) {
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

  // Calculate which time slots to show
  // If we have timeSlotsByDay, we need to get the union of all time slots across all days
  const slotsToRender = useMemo(() => {
    if (!timeSlotsByDay || Object.keys(timeSlotsByDay).length === 0) {
      // Fall back to currentTimeSlots
      console.log('[ScheduleGrid] Using currentTimeSlots (no per-day slots available)');
      return currentTimeSlots;
    }

    console.log('[ScheduleGrid] Using timeSlotsByDay for rendering');
    
    // Get unique time slots across all days
    const uniqueSlots = new Map<string, TimeSlot>();
    
    Object.values(timeSlotsByDay).forEach(daySlots => {
      daySlots.forEach(slot => {
        const key = `${slot.start}-${slot.end}`;
        if (!uniqueSlots.has(key)) {
          uniqueSlots.set(key, slot);
        }
      });
    });

    // Convert back to array, preserving time order
    const sortedSlots = Array.from(uniqueSlots.values()).sort((a, b) => {
      const [aHour, aMin] = a.start.split(':').map(Number);
      const [bHour, bMin] = b.start.split(':').map(Number);
      return (aHour * 60 + aMin) - (bHour * 60 + bMin);
    });

    console.log('[ScheduleGrid] Merged slots from all days:', sortedSlots);
    return sortedSlots;
  }, [timeSlotsByDay, currentTimeSlots]);

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
    
    // Add saved schedules (filter out undefined)
    schedules
      .filter((schedule): schedule is Schedule => schedule !== undefined && schedule !== null)
      .forEach(schedule => {
        const key = `${schedule.dayOfWeek}-${schedule.startTime}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(enrichSchedule(schedule));
      });
    
    // Add temp schedules (filter out undefined)
    tempSchedules
      .filter((schedule): schedule is TempSchedule => schedule !== undefined && schedule !== null)
      .forEach(schedule => {
        const key = `${schedule.dayOfWeek}-${schedule.startTime}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(enrichSchedule(schedule));
      });
    
    return grid;
  }, [schedules, tempSchedules, courseAssignments]);

  // Count courses per day
  const coursesPerDay = useMemo(() => {
    const counts: { [key: number]: number } = {};
    
    currentWorkingDays.forEach(day => {
      counts[day.value] = 0;
    });
    
    // Count all schedules for each day
    [...schedules, ...tempSchedules].forEach(schedule => {
      if (counts.hasOwnProperty(schedule.dayOfWeek)) {
        counts[schedule.dayOfWeek]++;
      }
    });
    
    return counts;
  }, [schedules, tempSchedules, currentWorkingDays]);

  // Count unique courses per day
  const uniqueCoursesPerDay = useMemo(() => {
    const uniqueCourses: { [key: number]: Set<number> } = {};
    
    currentWorkingDays.forEach(day => {
      uniqueCourses[day.value] = new Set();
    });
    
    // Count unique courseAssignmentIds for each day
    [...schedules, ...tempSchedules].forEach(schedule => {
      if (uniqueCourses.hasOwnProperty(schedule.dayOfWeek)) {
        uniqueCourses[schedule.dayOfWeek].add(schedule.courseAssignmentId);
      }
    });
    
    // Convert sets to counts
    const counts: { [key: number]: number } = {};
    Object.entries(uniqueCourses).forEach(([day, courses]) => {
      counts[Number(day)] = courses.size;
    });
    
    return counts;
  }, [schedules, tempSchedules, currentWorkingDays]);

  // Handle schedule actions
  const handleScheduleEdit = (schedule: Schedule | TempSchedule) => {
    if (onScheduleClick) {
      onScheduleClick(schedule);
    }
  };

  const handleScheduleDelete = (schedule: Schedule | TempSchedule) => {
    if (!canDelete) return;
    
    // Llama el callback con el schedule completo
    onScheduleDelete?.(schedule);
  };

 

  return (
    <Card className="backdrop-blur-sm border-0 shadow-xl bg-white/95 dark:bg-gray-800/95">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]" style={{ minWidth: '100%' }}>
            {/* Header */}
            <div className="grid border-b-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 border-blue-200 dark:border-gray-700 sticky top-0 z-20" 
                 style={{ gridTemplateColumns: `120px repeat(${currentWorkingDays.length}, minmax(0, 1fr))` }}>
              <div className="p-4 font-semibold border-r flex items-center justify-center text-blue-900 dark:text-blue-300 border-blue-200 dark:border-gray-700 bg-blue-100/40 dark:bg-blue-900/20 sticky left-0 z-30">
                <span className="text-xs uppercase tracking-widest font-bold text-blue-900 dark:text-blue-300">⏰ Horario</span>
              </div>
              {currentWorkingDays.map((day, index) => (
                <div
                  key={day.value}
                  className={`p-4 font-semibold text-center transition-colors ${
                    index !== currentWorkingDays.length - 1 
                      ? 'border-r border-blue-200 dark:border-gray-700'
                      : ''
                  } hover:bg-blue-50/50 dark:hover:bg-gray-700/50`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-blue-900 dark:text-blue-200 font-bold">
                      {day.shortLabel}
                    </span>
                    {coursesPerDay[day.value] > 0 && (
                      <div className="flex gap-1.5">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50" title="Total de clases">
                          {coursesPerDay[day.value]}
                        </span>
                        {uniqueCoursesPerDay[day.value] > 0 && uniqueCoursesPerDay[day.value] !== coursesPerDay[day.value] && (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50" title="Cursos únicos">
                            {uniqueCoursesPerDay[day.value]}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-normal mt-1 text-gray-500 dark:text-gray-400">
                    {day.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Rows */}
            {slotsToRender.map((timeSlot: TimeSlot, index: number) => {
              // Calculate isBreakTime for the TIME SLOT itself (from slotsToRender)
              const slotIsBreakTime = (timeSlot.isBreak === true) ||
                                     (timeSlot.label?.includes("RECREO") ?? false) ||
                                     (timeSlot.label?.includes("ALMUERZO") ?? false);
              
              return (
                <div 
                  key={`${timeSlot.start}-${timeSlot.end}`}
                  className={`grid border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                    index % 2 === 0 
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-gray-50/50 dark:bg-gray-750'
                  }`}
                  style={{ gridTemplateColumns: `120px repeat(${currentWorkingDays.length}, minmax(0, 1fr))` }}
                >
                  {/* Time column */}
                  <div className={`
                    p-3 text-sm font-medium border-r flex items-center justify-center
                    border-gray-200 dark:border-gray-700 sticky left-0 z-10
                    ${slotIsBreakTime 
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-400' 
                      : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800'
                    }
                  `}>
                    <div className="text-center text-gray-700 dark:text-gray-300">
                      <div className="font-mono text-xs text-gray-600 dark:text-gray-400">
                        {!slotIsBreakTime && (
                          <>
                            <span className="block">{timeSlot.start}</span>
                            <span className="text-gray-400 dark:text-gray-600">-</span>
                            <span className="block">{timeSlot.end}</span>
                          </>
                        )}
                        {slotIsBreakTime && (
                          <>
                            <span className="block">{timeSlot.start}</span>
                            <span className="text-gray-400 dark:text-gray-600">-</span>
                            <span className="block">{timeSlot.end}</span>
                            <span className="block font-sans font-semibold text-gray-500 dark:text-gray-400 mt-1">
                              {timeSlot.label}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Time slots for each day */}
                  {currentWorkingDays.map((day) => {
                    // Check if this timeSlot exists for this specific day
                    const daySlots = timeSlotsByDay?.[day.value];
                    const daySlot = daySlots?.find(s => s.start === timeSlot.start && s.end === timeSlot.end);
                    
                    // Calculate if THIS SLOT is a break FOR THIS DAY
                    const isBreakTimeForDay = daySlot?.isBreak ?? slotIsBreakTime;
                    
                    // If timeSlotsByDay is defined but:
                    // 1. This slot doesn't exist for this day, OR
                    // 2. The slot type differs (e.g., it's a break in slotsToRender but not in this day)
                    if (timeSlotsByDay && Object.keys(timeSlotsByDay).length > 0) {
                      // If slot doesn't exist for this day at all
                      if (!daySlot) {
                        // Only show empty if it's a break - otherwise show as available class
                        if (slotIsBreakTime) {
                          // It's a break only in some days, not in this day - show empty
                          console.log(`[ScheduleGrid] Slot ${timeSlot.start}-${timeSlot.end} is break but not in day ${day.value}`);
                          return (
                            <div
                              key={`${day.value}-${timeSlot.start}-${timeSlot.end}-empty`}
                              className="p-2 border-r border-gray-200 dark:border-gray-700"
                            />
                          );
                        } else {
                          // It's a class/activity only in some days
                          // For other days, create a virtual slot so it can receive drops
                          const virtualSlot: TimeSlot = {
                            start: timeSlot.start,
                            end: timeSlot.end,
                            label: `${timeSlot.start} - ${timeSlot.end}`,
                            isBreak: false,
                          };
                          const key = `${day.value}-${virtualSlot.start}`;
                          const daySchedules = scheduleGrid[key] || [];
                          
                          console.log(`[ScheduleGrid] Slot ${timeSlot.start}-${timeSlot.end} is activity/class only in some days, showing as available in day ${day.value}`);
                          return (
                            <DroppableTimeSlot
                              key={`${day.value}-${virtualSlot.start}-${virtualSlot.end}`}
                              day={day.value as DayOfWeek}
                              timeSlot={virtualSlot}
                              schedules={daySchedules}
                              onDrop={onDrop || (() => {})}
                              onScheduleEdit={handleScheduleEdit}
                              onScheduleDelete={handleScheduleDelete}
                              isBreakTime={false}
                              markedForDeletionIds={markedForDeletionIds}
                            />
                          );
                        }
                      }
                      
                      // If it's a break in slotsToRender but NOT a break in this day, show as available class
                      if (slotIsBreakTime && !daySlot.isBreak) {
                        console.log(`[ScheduleGrid] Slot ${timeSlot.start}-${timeSlot.end} is break in slotsToRender but class in day ${day.value} - showing as available`);
                        
                        // Create a virtual slot with class properties instead of break properties
                        const virtualClassSlot: TimeSlot = {
                          start: timeSlot.start,
                          end: timeSlot.end,
                          label: `${timeSlot.start} - ${timeSlot.end}`,
                          isBreak: false,
                        };
                        
                        const key = `${day.value}-${virtualClassSlot.start}`;
                        const daySchedules = scheduleGrid[key] || [];
                        
                        return (
                          <DroppableTimeSlot
                            key={`${day.value}-${virtualClassSlot.start}-${virtualClassSlot.end}`}
                            day={day.value as DayOfWeek}
                            timeSlot={virtualClassSlot}
                            schedules={daySchedules}
                            onDrop={onDrop || (() => {})}
                            onScheduleEdit={handleScheduleEdit}
                            onScheduleDelete={handleScheduleDelete}
                            isBreakTime={false}
                            markedForDeletionIds={markedForDeletionIds}
                          />
                        );
                      }
                      
                      // If it's NOT a break in slotsToRender but IS a break in this day, show the break
                      if (!slotIsBreakTime && daySlot.isBreak) {
                        console.log(`[ScheduleGrid] Slot ${timeSlot.start}-${timeSlot.end} is class in slotsToRender but break in day ${day.value}`);
                        // Use the day's slot properties instead
                        const key = `${day.value}-${daySlot.start}`;
                        const daySchedules = scheduleGrid[key] || [];
                        
                        return (
                          <DroppableTimeSlot
                            key={`${day.value}-${daySlot.start}-${daySlot.end}`}
                            day={day.value as DayOfWeek}
                            timeSlot={daySlot}
                            schedules={daySchedules}
                            onDrop={onDrop || (() => {})}
                            onScheduleEdit={handleScheduleEdit}
                            onScheduleDelete={handleScheduleDelete}
                            isBreakTime={true}
                            markedForDeletionIds={markedForDeletionIds}
                          />
                        );
                      }
                    }
                    
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
                        isBreakTime={isBreakTimeForDay}
                        markedForDeletionIds={markedForDeletionIds}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t-2 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 border-blue-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
                <Calendar className="h-4 w-4" />
                <span><strong>{currentWorkingDays.length}</strong> días</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold">
                <Clock className="h-4 w-4" />
                <span><strong>{slotsToRender.length}</strong> slots</span>
              </div>
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-semibold">
                <BookOpen className="h-4 w-4" />
                <span><strong>{slotsToRender.filter(s => !s.isBreak).length}</strong> clases</span>
              </div>
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold">
                <Coffee className="h-4 w-4" />
                <span><strong>{slotsToRender.filter(s => s.isBreak).length}</strong> recreos</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span><strong>{schedules.length}</strong> guardados</span>
              </div>
              {tempSchedules.length > 0 && (
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <Clock3 className="h-4 w-4" />
                  <span><strong>{tempSchedules.length}</strong> temporales</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
