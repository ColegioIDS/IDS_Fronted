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

 

  return (
    <Card className="backdrop-blur-sm border-0 shadow-xl overflow-hidden bg-white/95 dark:bg-gray-800/95">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]" style={{ minWidth: '100%' }}>
            {/* Header */}
            <div className="grid border-b-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 border-blue-200 dark:border-gray-700" 
                 style={{ gridTemplateColumns: `120px repeat(${currentWorkingDays.length}, minmax(0, 1fr))` }}>
              <div className="p-4 font-semibold border-r flex items-center justify-center text-blue-900 dark:text-blue-300 border-blue-200 dark:border-gray-700 bg-blue-100/40 dark:bg-blue-900/20">
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
            {currentTimeSlots.map((timeSlot: TimeSlot, index: number) => {
              const isBreakTime = (timeSlot.isBreak === true) ||
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
                    border-gray-200 dark:border-gray-700
                    ${isBreakTime 
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-400' 
                      : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800'
                    }
                  `}>
                    <div className="text-center text-gray-700 dark:text-gray-300">
                      <div className="font-mono text-xs text-gray-600 dark:text-gray-400">
                        {!isBreakTime && (
                          <>
                            <span className="block">{timeSlot.start}</span>
                            <span className="text-gray-400 dark:text-gray-600">-</span>
                            <span className="block">{timeSlot.end}</span>
                          </>
                        )}
                        {isBreakTime && (
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
        <div className="px-4 py-4 border-t-2 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 border-blue-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
                <Calendar className="h-4 w-4" />
                <span><strong>{currentWorkingDays.length}</strong> días</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold">
                <Clock className="h-4 w-4" />
                <span><strong>{currentTimeSlots.length}</strong> slots</span>
              </div>
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-semibold">
                <BookOpen className="h-4 w-4" />
                <span><strong>{currentTimeSlots.filter(s => !s.isBreak).length}</strong> clases</span>
              </div>
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold">
                <Coffee className="h-4 w-4" />
                <span><strong>{currentTimeSlots.filter(s => s.isBreak).length}</strong> recreos</span>
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
