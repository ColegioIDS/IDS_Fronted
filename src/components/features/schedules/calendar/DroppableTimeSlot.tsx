// src/components/features/schedules/calendar/DroppableTimeSlot.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    console.log('Eliminando schedule:', scheduleId, 'del slot:', day, timeSlot.label);
    onScheduleDelete(scheduleId);
  }, [onScheduleDelete, day, timeSlot.label]);

  const handleScheduleEdit = useCallback((schedule: Schedule | TempSchedule) => {
    console.log('Editando schedule:', schedule.id, 'del slot:', day, timeSlot.label);
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
          isDark
            ? "bg-gradient-to-br from-gray-800 to-gray-750 border-gray-700"
            : "bg-gradient-to-br from-gray-100 to-gray-50 border-gray-300"
        )}
      >
        <div className={cn(
          "text-sm font-medium text-center",
          isDark ? "text-gray-400" : "text-gray-600"
        )}>
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
        "min-h-[80px] p-2 border transition-all relative",
        isHovered && !isFull && (isDark
          ? "bg-blue-900/30 border-blue-600 border-dashed border-2"
          : "bg-blue-50 border-blue-400 border-dashed border-2"
        ),
        !isHovered && (isDark
          ? hasSchedules 
            ? "bg-gray-750 border-gray-700 hover:bg-gray-700"
            : "bg-gray-800 border-gray-700 hover:bg-gray-750"
          : hasSchedules
            ? "bg-white border-gray-300 hover:bg-gray-50"
            : "bg-gray-50 border-gray-200 hover:bg-white"
        ),
        isFull && isHovered && (isDark
          ? "bg-red-900/20 border-red-700 border-2"
          : "bg-red-50 border-red-300 border-2"
        )
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
    >
      <div className="space-y-1">
        {schedules.map((schedule) => (
          <DraggableSchedule
            key={`${schedule.id}-${day}-${timeSlot.start}-${timeSlot.end}`}
            schedule={schedule}
            onEdit={handleScheduleEdit}
            onDelete={handleScheduleDelete}
            isTemp={('isPending' in schedule) ? (schedule as TempSchedule).isPending : false}
          />
        ))}

        {/* Drop indicator */}
        {schedules.length === 0 && isHovered && !isFull && (
          <div className={cn(
            "flex items-center justify-center h-12 text-sm animate-pulse",
            isDark ? "text-blue-400" : "text-blue-600"
          )}>
            <Plus className="h-4 w-4 mr-1" />
            <span>Soltar aquí</span>
          </div>
        )}

        {/* Full slot indicator */}
        {isFull && isHovered && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-sm font-medium",
            isDark ? "text-red-400" : "text-red-600"
          )}>
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>Slot ocupado</span>
          </div>
        )}

        {/* Multiple schedules badge */}
        {schedules.length > 1 && (
          <div className="absolute top-1 right-1">
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] h-4 px-1",
                isDark
                  ? "bg-yellow-900/70 text-yellow-300 border-yellow-800"
                  : "bg-yellow-100 text-yellow-800 border-yellow-300"
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
