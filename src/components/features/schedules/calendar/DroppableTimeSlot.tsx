// src/components/features/schedules/calendar/DroppableTimeSlot.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Schedule, DayOfWeek, TimeSlot, DragItem, TempSchedule } from "@/types/schedules.types";
import { DraggableSchedule } from "@/components/features/schedules/draggable";
import { useDragManager } from "@/hooks/useDragManager";
import { Badge } from "@/components/ui/badge";

interface DroppableTimeSlotProps {
  day: DayOfWeek;
  timeSlot: TimeSlot;
  schedules: (Schedule | TempSchedule)[];
  onDrop: (item: DragItem, day: DayOfWeek, timeSlot: TimeSlot) => void;
  onScheduleEdit: (schedule: Schedule | TempSchedule) => void;
  onScheduleDelete: (id: string | number) => void;
  isBreakTime?: boolean;
}

export function DroppableTimeSlot({
  day,
  timeSlot,
  schedules,
  onDrop,
  onScheduleEdit,
  onScheduleDelete,
  isBreakTime = false
}: DroppableTimeSlotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const { getDragState } = useDragManager();

  const isRecreation = isBreakTime ||
    (timeSlot.label?.includes("RECREO") || timeSlot.label?.includes("ALMUERZO"));

  const handleMouseEnter = useCallback(() => {
    const dragState = getDragState();
    if (dragState.isDragging && !isRecreation) {
      setIsHovered(true);
    }
  }, [isRecreation, getDragState]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleMouseUp = useCallback(() => {
    const dragState = getDragState();
    if (dragState.isDragging && dragState.dragItem && isHovered && !isRecreation) {
      onDrop(dragState.dragItem, day, timeSlot);
      setIsHovered(false);
    }
  }, [day, timeSlot, isHovered, isRecreation, onDrop, getDragState]);

  const handleScheduleDelete = useCallback((scheduleId: string | number) => {
    onScheduleDelete(scheduleId);
  }, [onScheduleDelete, day, timeSlot.label]);

  const handleScheduleEdit = useCallback((schedule: Schedule | TempSchedule) => {
    onScheduleEdit(schedule);
  }, [onScheduleEdit, day, timeSlot.label]);

  // Recreation time slot
  if (isRecreation) {
    return (
      <div
        ref={dropRef}
        className={cn(
          "min-h-[80px] p-2 border transition-all",
          "flex items-center justify-center",
          "bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-750 border-gray-300 dark:border-gray-700"
        )}
      >
        <div className="text-sm font-medium text-center text-gray-600 dark:text-gray-400">
          {timeSlot.label}
        </div>
      </div>
    );
  }

  // Check if slot has schedules
  const hasSchedules = schedules.length > 0;
  const isFull = schedules.length >= 1; // Only allow 1 schedule per slot

  // Normal time slot
  return (
    <div
      ref={dropRef}
      className={cn(
        "min-h-[80px] p-2.5 border-2 transition-all relative rounded-lg",
        "overflow-hidden max-w-full w-full",
        isHovered && !isFull && (
          "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 border-dashed border-2"
        ),
        !isHovered && (hasSchedules
          ? "bg-white dark:bg-gray-750 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-750"
        ),
        isFull && isHovered && (
          "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 border-2"
        )
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
    >
      <div className="space-y-1 overflow-hidden max-w-full w-full">
        {schedules.map((schedule) => (
          <div key={`${schedule.id}-${day}-${timeSlot.start}-${timeSlot.end}`} className="max-w-full w-full overflow-hidden">
            <DraggableSchedule
              schedule={schedule}
              onEdit={handleScheduleEdit}
              onDelete={handleScheduleDelete}
              isTemp={('isPending' in schedule) ? (schedule as TempSchedule).isPending : false}
            />
          </div>
        ))}

        {/* Drop indicator */}
        {schedules.length === 0 && isHovered && !isFull && (
          <div className={cn(
            "flex flex-col items-center justify-center h-12 text-xs font-medium animate-pulse gap-1",
            "text-blue-600 dark:text-blue-400"
          )}>
            <Plus className="h-4 w-4" />
            <span>Soltar curso aquí</span>
          </div>
        )}

        {/* Full slot indicator */}
        {isFull && isHovered && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-500/10 dark:bg-red-500/5 text-xs font-semibold text-red-600 dark:text-red-400 rounded-md backdrop-blur-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Este slot ya está ocupado</span>
          </div>
        )}

        {/* Multiple schedules badge */}
        {schedules.length > 1 && (
          <div className="absolute top-1 right-1">
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] h-4 px-1 bg-yellow-100 dark:bg-yellow-900/70 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800"
              )}
            >
              ⚠️ {schedules.length} clases
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
